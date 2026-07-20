import { requireUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function PedidosPage() {
  await requireUser();
  const rows = await listOrders();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Pedidos</h1>
        <p className="text-sm text-text-muted">{rows.length} en total</p>
      </header>

      <OrdersTable rows={rows} />
    </>
  );
}
