"use client";

import Link from "next/link";
import { bulkUpdateOrderStatusAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/products";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LocalDate } from "@/components/admin/local-date";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  ORDER_STATUSES,
} from "@/lib/admin-labels";
import type { Order } from "@/db/schema";
import { cn } from "@/lib/utils";

const columns: Column<Order>[] = [
  {
    header: "Pedido",
    cell: (o) => (
      <>
        <Link
          href={`/admin/pedidos/${o.id}`}
          className="font-bold text-text-main hover:text-brand"
        >
          {o.orderNumber}
        </Link>
        <p className="text-xs text-text-muted">{o.tier}</p>
      </>
    ),
  },
  {
    header: "Cliente",
    cell: (o) => (
      <>
        <p className="font-semibold text-text-main">{o.name}</p>
        <p className="text-xs text-text-muted">{o.email}</p>
      </>
    ),
  },
  {
    header: "Total",
    cell: (o) => (
      <span className="font-extrabold tabular-nums text-text-main">
        {formatPrice(o.totalCents)}
      </span>
    ),
  },
  {
    header: "Fecha",
    cell: (o) => (
      <LocalDate value={o.createdAt} className="text-text-secondary" />
    ),
  },
  {
    header: "Estado",
    cell: (o) => (
      <div className="flex flex-col gap-1.5">
        <span
          className={cn(
            "w-fit rounded-full px-2 py-0.5 text-xs font-bold",
            ORDER_STATUS_STYLE[o.status],
          )}
        >
          {ORDER_STATUS_LABEL[o.status]}
        </span>
        <OrderStatusSelect id={o.id} status={o.status} />
      </div>
    ),
  },
];

export function OrdersTable({ rows }: { rows: Order[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      empty={
        <p className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center text-sm text-text-secondary">
          Todavía no hay pedidos.
        </p>
      }
      actions={[
        {
          kind: "select",
          label: "Cambiar estado",
          placeholder: "Cambiar estado…",
          options: ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] })),
          run: (ids, value) =>
            bulkUpdateOrderStatusAction(ids, value as (typeof ORDER_STATUSES)[number]),
        },
      ]}
    />
  );
}
