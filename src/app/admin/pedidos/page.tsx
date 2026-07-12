import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-border-light text-text-secondary",
  paid: "bg-jt-agv/15 text-[#5f8f14]",
  processing: "bg-jt-ohw/15 text-[#8a6100]",
  shipped: "bg-brand/15 text-brand-dark",
  delivered: "bg-jt-agv/20 text-[#4d7710]",
  cancelled: "bg-jt-mhe/10 text-jt-mhe",
};

export default async function PedidosPage() {
  await requireUser();
  const rows = await listOrders();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Pedidos</h1>
        <p className="text-sm text-text-muted">{rows.length} en total</p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center text-sm text-text-secondary">
          Todavía no hay pedidos.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-bg-soft text-left text-xs uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-bold">Pedido</th>
                <th className="px-4 py-3 font-bold">Cliente</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Fecha</th>
                <th className="px-4 py-3 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-bg-soft/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/pedido/${o.publicToken}`}
                      target="_blank"
                      className="font-bold text-text-main hover:text-brand"
                    >
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-text-muted">{o.tier}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text-main">{o.name}</p>
                    <p className="text-xs text-text-muted">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 font-extrabold tabular-nums text-text-main">
                    {formatPrice(o.totalCents)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {o.createdAt.toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={cn(
                          "w-fit rounded-full px-2 py-0.5 text-xs font-bold",
                          STATUS_STYLE[o.status],
                        )}
                      >
                        {o.status}
                      </span>
                      <OrderStatusSelect id={o.id} status={o.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
