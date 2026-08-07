import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, CreditCard, Package, Truck } from "lucide-react";
import { getLocaleData } from "@/lib/i18n.server";
import { getOrderByToken } from "@/lib/orders";
import { getShippingSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/products";
import type { Address, Order } from "@/db/schema";
import { CONTACT, SITE } from "@/lib/site";
import { SmartImage } from "@/components/ui/smart-image";
import { OrderPaidEffect } from "@/components/cart/order-paid-effect";
import { CheckoutSteps } from "@/components/cart/checkout-steps";
import { PrintButton } from "@/components/cart/print-button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const STATUS_STYLE: Record<Order["status"], string> = {
  pending: "bg-border-light text-text-secondary",
  paid: "bg-jt-agv/15 text-[#5f8f14]",
  processing: "bg-jt-ohw/15 text-[#8a6100]",
  shipped: "bg-brand/15 text-brand-dark",
  delivered: "bg-jt-agv/20 text-[#4d7710]",
  cancelled: "bg-jt-mhe/10 text-jt-mhe",
};

/** Los 3 hitos que ve el comprador. `pending` aún no ha alcanzado ninguno. */
const TIMELINE: { key: Order["status"]; icon: typeof Check }[] = [
  { key: "paid", icon: CreditCard },
  { key: "processing", icon: Package },
  { key: "shipped", icon: Truck },
];
const REACHED: Record<Order["status"], number> = {
  pending: 0,
  cancelled: 0,
  paid: 1,
  processing: 2,
  shipped: 3,
  delivered: 3,
};

function AddressBlock({ address }: { address: Address }) {
  const lines = [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </>
  );
}

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
  const d = dict.order;

  const order = await getOrderByToken(token);
  if (!order) notFound();

  // El ETA es informativo (config global actual); el costo es el snapshot del pedido.
  const shippingEta = (await getShippingSettings()).shippingEta?.[lang] ?? null;

  const paid = order.status !== "pending" && order.status !== "cancelled";
  const reached = REACHED[order.status];

  const date = order.createdAt.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {pago === "ok" && <OrderPaidEffect message={d.paidToast} clear={paid} />}

      <CheckoutSteps
        current={3}
        title={paid ? d.thanks : d.title}
        subtitle={paid ? `${d.thanksSub} ${order.email}` : undefined}
        dict={dict.checkout.steps}
      />

      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        {/* Boleta */}
      <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-border px-7 py-6">
          <div>
            <p className="text-lg font-black tracking-tight text-text-main">
              {SITE.name} <span className="text-brand">·</span>{" "}
              <span className="text-sm font-bold text-text-secondary">{SITE.fullName}</span>
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {CONTACT.address} · {CONTACT.city}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
              {d.receipt}
            </p>
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase",
                STATUS_STYLE[order.status],
              )}
            >
              {d.status[order.status]}
            </span>
          </div>
        </header>

        <div className="grid gap-6 border-b border-dashed border-border px-7 py-6 sm:grid-cols-3">
          <Meta label={d.orderNo} value={order.orderNumber} strong />
          <Meta label={d.placedOn} value={date} />
          <Meta label={d.paymentMethod} value={d.card} />
        </div>

        <div className="grid gap-6 border-b border-dashed border-border px-7 py-6 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
              {d.contact}
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              <span className="block font-semibold text-text-main">{order.name}</span>
              {order.email}
              {order.phone && <span className="block">{order.phone}</span>}
            </p>
          </div>

          {order.shipping && (
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                {d.shipTo}
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                <AddressBlock address={order.shipping} />
              </p>
            </div>
          )}

          {order.billing && (
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                {d.billedTo}
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                <AddressBlock address={order.billing} />
              </p>
            </div>
          )}
        </div>

        {/* Líneas */}
        <div className="px-7 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="pb-2 font-bold">{d.items}</th>
                <th className="pb-2 text-center font-bold">{d.qty}</th>
                <th className="pb-2 text-right font-bold">{d.unitPrice}</th>
                <th className="pb-2 text-right font-bold">{d.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {item.imgSnapshot && (
                        <SmartImage
                          src={item.imgSnapshot}
                          alt={item.nameSnapshot}
                          fit="contain"
                          wrapperClassName="h-11 w-11 shrink-0 rounded-lg bg-brand-light/15 print:hidden"
                          className="p-1"
                        />
                      )}
                      <span className="font-semibold text-text-main">{item.nameSnapshot}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center tabular-nums text-text-secondary">
                    {item.qty}
                  </td>
                  <td className="py-3 text-right tabular-nums text-text-secondary">
                    {formatPrice(item.unitPriceCents)}
                  </td>
                  <td className="py-3 text-right font-bold tabular-nums text-text-main">
                    {formatPrice(item.unitPriceCents * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 ml-auto max-w-xs space-y-2 border-t border-dashed border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">{d.subtotal}</span>
              <span className="font-semibold tabular-nums">
                {formatPrice(order.subtotalCents)}
              </span>
            </div>

            {order.discountCents > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  {d.discount}
                  {order.couponCode && (
                    <span className="ml-1.5 rounded bg-jt-agv/15 px-1.5 py-0.5 text-[10px] font-black uppercase text-[#5f8f14]">
                      {order.couponCode}
                    </span>
                  )}
                </span>
                <span className="font-semibold tabular-nums text-[#5f8f14]">
                  −{formatPrice(order.discountCents)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-text-secondary">{d.shipping}</span>
              <span className="font-semibold">
                {order.shippingCents > 0 ? formatPrice(order.shippingCents) : d.freeShipping}
              </span>
            </div>

            {order.shippingCents === 0 && (
              <p className="flex items-start gap-2 rounded-lg border border-brand/25 bg-brand/5 px-3 py-2.5 text-xs leading-snug text-text-secondary">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {d.shippingNotice}
              </p>
            )}

            {shippingEta && (
              <p className="text-xs text-text-muted">
                {d.estimatedDelivery}: {shippingEta}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-bold text-text-main">{d.total}</span>
              <span className="text-xl font-black tabular-nums text-brand">
                {formatPrice(order.totalCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Seguimiento */}
        {order.status !== "cancelled" && (
          <div className="border-t border-dashed border-border bg-bg-soft/50 px-7 py-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-wide text-text-muted">
              {d.timeline}
            </p>
            <ol className="flex items-center">
              {TIMELINE.map(({ key, icon: Icon }, i) => {
                const done = reached > i;
                return (
                  <li
                    key={key}
                    className={cn("flex items-center", i < TIMELINE.length - 1 && "flex-1")}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-full",
                          done ? "bg-brand text-white" : "bg-border-light text-text-muted",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-bold",
                          done ? "text-text-main" : "text-text-muted",
                        )}
                      >
                        {d.status[key]}
                      </span>
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <span
                        className={cn(
                          "mx-2 -mt-5 h-0.5 flex-1 rounded-full",
                          reached > i + 1 ? "bg-brand" : "bg-border-light",
                        )}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </article>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <p className="text-sm text-text-muted">
            {d.help}{" "}
            <Link href="/contacto" className="font-semibold text-brand hover:underline">
              {dict.nav.contact}
            </Link>
          </p>
          <PrintButton label={d.print} href={`/pedido/${token}/pdf`} />
        </div>
      </div>
    </>
  );
}

function Meta({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm text-text-secondary",
          strong && "font-black text-text-main",
        )}
      >
        {value}
      </p>
    </div>
  );
}
