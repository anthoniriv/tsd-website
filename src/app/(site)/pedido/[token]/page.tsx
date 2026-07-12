import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocaleData } from "@/lib/i18n.server";
import { getOrderByToken } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { SmartImage } from "@/components/ui/smart-image";
import { OrderPaidEffect } from "@/components/cart/order-paid-effect";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Color del badge por estado. `pending` es neutro, no rojo: aún no ha fallado nada. */
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-border-light text-text-secondary",
  paid: "bg-jt-agv/15 text-[#5f8f14]",
  processing: "bg-jt-ohw/15 text-[#8a6100]",
  shipped: "bg-brand/15 text-brand-dark",
  delivered: "bg-jt-agv/20 text-[#4d7710]",
  cancelled: "bg-jt-mhe/10 text-jt-mhe",
};

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ pago?: string }>;
}) {
  const { token } = await params;
  const { pago } = await searchParams;
  const { dict, lang } = await getLocaleData();

  const order = await getOrderByToken(token);
  if (!order) notFound();

  const paid = order.status !== "pending" && order.status !== "cancelled";

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      {/* Volvemos del pago: vaciar el carrito y avisar. Se hace en cliente porque el
          carrito vive en localStorage. */}
      {pago === "ok" && <OrderPaidEffect message={dict.order.paidToast} clear={paid} />}

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          {dict.order.title}
        </p>
        <h1 className="text-3xl font-black text-text-main">{order.orderNumber}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {dict.order.placedOn}{" "}
          {order.createdAt.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <span
          className={cn(
            "mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
            STATUS_STYLE[order.status],
          )}
        >
          {dict.order.status[order.status]}
        </span>
      </header>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-text-secondary">
          {dict.order.items}
        </h2>

        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              {item.imgSnapshot && (
                <SmartImage
                  src={item.imgSnapshot}
                  alt={item.nameSnapshot}
                  fit="contain"
                  wrapperClassName="h-14 w-14 shrink-0 rounded-lg bg-brand-light/15"
                  className="p-1.5"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text-main">{item.nameSnapshot}</p>
                <p className="text-xs text-text-muted">
                  {formatPrice(item.unitPriceCents)} × {item.qty}
                </p>
              </div>
              <span className="text-sm font-extrabold tabular-nums">
                {formatPrice(item.unitPriceCents * item.qty)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-bold text-text-secondary">{dict.order.total}</span>
          <span className="text-2xl font-black tabular-nums text-brand">
            {formatPrice(order.totalCents)}
          </span>
        </div>
      </section>
    </div>
  );
}
