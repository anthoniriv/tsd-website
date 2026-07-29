import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getOrderWithItems, listOrderEmails } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import type { Address, OrderEmail } from "@/db/schema";
import {
  ORDER_EMAIL_KIND_LABEL,
  ORDER_EMAIL_STATUS_LABEL,
  ORDER_EMAIL_STATUS_STYLE,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
} from "@/lib/admin-labels";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { ResendEmailButton } from "@/components/admin/resend-email-button";
import { SmartImage } from "@/components/ui/smart-image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

function Meta({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
      <p className={cn("mt-0.5 text-sm text-text-secondary", strong && "font-black text-text-main")}>
        {value}
      </p>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const order = await getOrderWithItems(id);
  if (!order) notFound();

  const emails = await listOrderEmails(order.id);
  // Correos que se pueden reintentar desde aquí. El aviso interno solo si hay destinatario config.
  const RETRYABLE: OrderEmail["kind"][] = [
    "received",
    "confirmation",
    "status_update",
    "notification",
  ];

  const date = order.createdAt.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/pedidos"
            className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" /> Pedidos
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-text-main">{order.orderNumber}</h1>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold",
                ORDER_STATUS_STYLE[order.status],
              )}
            >
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/pedido/${order.publicToken}`}
            target="_blank"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <ExternalLink className="h-4 w-4" /> Página pública
          </Link>
          <Link
            href={`/pedido/${order.publicToken}/pdf`}
            target="_blank"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <FileText className="h-4 w-4" /> Boleta PDF
          </Link>
        </div>
      </header>

      <article className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="grid gap-6 border-b border-border px-7 py-6 sm:grid-cols-4">
          <Meta label="Pedido" value={order.orderNumber} strong />
          <Meta label="Fecha" value={date} />
          <Meta label="Método de pago" value="Tarjeta (Stripe)" />
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
              Cambiar estado
            </p>
            <OrderStatusSelect id={order.id} status={order.status} />
          </div>
        </div>

        <div className="grid gap-6 border-b border-border px-7 py-6 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
              Contacto
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
                Enviar a
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                <AddressBlock address={order.shipping} />
              </p>
            </div>
          )}

          {order.billing && (
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                Facturado a
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                <AddressBlock address={order.billing} />
              </p>
            </div>
          )}
        </div>

        <div className="border-b border-border px-7 py-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Correos</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Reenviar:</span>
              {RETRYABLE.map((kind) => (
                <ResendEmailButton key={kind} orderId={order.id} kind={kind} />
              ))}
            </div>
          </div>

          {emails.length === 0 ? (
            <p className="text-sm text-text-muted">
              Aún no se ha registrado ningún envío para este pedido.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {emails.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-text-main">
                    {ORDER_EMAIL_KIND_LABEL[e.kind]}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      ORDER_EMAIL_STATUS_STYLE[e.status],
                    )}
                  >
                    {ORDER_EMAIL_STATUS_LABEL[e.status]}
                  </span>
                  {e.recipient && <span className="text-text-secondary">{e.recipient}</span>}
                  <span className="ml-auto tabular-nums text-xs text-text-muted">
                    {e.createdAt.toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {e.status === "failed" && e.error && (
                    <span className="w-full text-xs text-jt-mhe">{e.error}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-7 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="pb-2 font-bold">Artículo</th>
                <th className="pb-2 text-center font-bold">Cant.</th>
                <th className="pb-2 text-right font-bold">Precio unit.</th>
                <th className="pb-2 text-right font-bold">Total</th>
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
                          wrapperClassName="h-11 w-11 shrink-0 rounded-lg bg-brand-light/15"
                          className="p-1"
                        />
                      )}
                      <span className="font-semibold text-text-main">{item.nameSnapshot}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center tabular-nums text-text-secondary">{item.qty}</td>
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
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-semibold tabular-nums">{formatPrice(order.subtotalCents)}</span>
            </div>

            {order.discountCents > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  Descuento
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
              <span className="text-text-secondary">Envío</span>
              <span className="font-semibold tabular-nums">
                {order.shippingCents > 0 ? formatPrice(order.shippingCents) : "Gratis"}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-bold text-text-main">Total</span>
              <span className="text-xl font-black tabular-nums text-brand">
                {formatPrice(order.totalCents)}
              </span>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
