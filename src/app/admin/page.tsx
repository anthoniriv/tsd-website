import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { banners, contactRequests, orders, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";

// Resumen provisional: las métricas de venta llegan cuando exista el checkout.
export default async function AdminHomePage() {
  const user = await requireUser();

  const [[productos], [publicados], [bannersActivos], [pedidos], [sinLeer]] = await Promise.all([
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(products).where(eq(products.status, "published")),
    db.select({ n: count() }).from(banners).where(eq(banners.active, true)),
    db.select({ n: count() }).from(orders),
    db.select({ n: count() }).from(contactRequests).where(eq(contactRequests.read, false)),
  ]);

  const cards = [
    { label: "Productos", value: productos.n, hint: `${publicados.n} publicados`, href: "/admin/productos" },
    { label: "Banners activos", value: bannersActivos.n, href: "/admin/banners" },
    { label: "Pedidos", value: pedidos.n, href: "/admin/pedidos" },
    { label: "Solicitudes sin leer", value: sinLeer.n, href: "/admin/contacto" },
  ];

  return (
    <>
      <h1 className="text-2xl font-black text-text-main">Hola, {user.name.split(" ")[0]}</h1>
      <p className="mb-8 text-sm text-text-muted">Resumen del estado del sitio.</p>

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
            <p className="mt-2 text-3xl font-black text-text-main">{c.value}</p>
            {c.hint && <p className="text-xs text-text-muted">{c.hint}</p>}
          </Link>
        ))}
      </div>
    </>
  );
}
