import Link from "next/link";
import { and, count, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { contactRequests, orderItems, orders, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

// Estados que cuentan como venta real (un pedido `pending` aún no se ha cobrado).
const SOLD = ["paid", "processing", "shipped", "delivered"] as const;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-border-light text-text-secondary",
  paid: "bg-jt-agv/15 text-[#5f8f14]",
  processing: "bg-jt-ohw/15 text-[#8a6100]",
  shipped: "bg-brand/15 text-brand-dark",
  delivered: "bg-jt-agv/20 text-[#4d7710]",
  cancelled: "bg-jt-mhe/10 text-jt-mhe",
};

export default async function AdminHomePage() {
  const user = await requireUser();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [monthSales, [pedidosMes], recent, top, [sinLeer], [bajoStock]] = await Promise.all([
    db
      .select({ total: sum(orders.totalCents), n: count() })
      .from(orders)
      .where(and(inArray(orders.status, [...SOLD]), gte(orders.createdAt, monthStart))),

    db.select({ n: count() }).from(orders).where(eq(orders.status, "pending")),

    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),

    // Top productos: solo suma unidades de pedidos efectivamente vendidos.
    db
      .select({
        name: orderItems.nameSnapshot,
        units: sql<number>`sum(${orderItems.qty})::int`,
        revenue: sql<number>`sum(${orderItems.qty} * ${orderItems.unitPriceCents})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(inArray(orders.status, [...SOLD]))
      .groupBy(orderItems.nameSnapshot)
      .orderBy(desc(sql`sum(${orderItems.qty})`))
      .limit(5),

    db.select({ n: count() }).from(contactRequests).where(eq(contactRequests.read, false)),

    db
      .select({ n: count() })
      .from(products)
      .where(and(eq(products.status, "published"), sql`${products.stock} <= 3`)),
  ]);

  const revenue = Number(monthSales[0]?.total ?? 0);

  const cards = [
    {
      label: "Ventas del mes",
      value: formatPrice(revenue),
      hint: `${monthSales[0]?.n ?? 0} pedidos`,
      href: "/admin/pedidos",
    },
    {
      label: "Pendientes de pago",
      value: String(pedidosMes.n),
      href: "/admin/pedidos",
    },
    {
      label: "Solicitudes sin leer",
      value: String(sinLeer.n),
      href: "/admin/contacto",
    },
    {
      label: "Stock bajo",
      value: String(bajoStock.n),
      hint: "3 unidades o menos",
      href: "/admin/productos",
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-black text-text-main">Hola, {user.name.split(" ")[0]}</h1>
      <p className="mb-8 text-sm text-text-muted">Resumen del negocio.</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-border bg-white p-5 transition-colors hover:border-brand"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums text-text-main">{c.value}</p>
            {c.hint && <p className="text-xs text-text-muted">{c.hint}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
              Pedidos recientes
            </h2>
            <Link href="/admin/pedidos" className="text-xs font-bold text-brand hover:underline">
              Ver todos
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Aún no hay pedidos.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text-main">{o.orderNumber}</p>
                    <p className="truncate text-xs text-text-muted">{o.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        STATUS_STYLE[o.status],
                      )}
                    >
                      {o.status}
                    </span>
                    <span className="text-sm font-extrabold tabular-nums">
                      {formatPrice(o.totalCents)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-text-secondary">
            Productos más vendidos
          </h2>

          {top.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              Aún no hay ventas registradas.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {top.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-main">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.units} unidades</p>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold tabular-nums text-brand">
                    {formatPrice(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
