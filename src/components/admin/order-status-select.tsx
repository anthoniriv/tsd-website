"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/app/admin/actions";
import type { Order } from "@/db/schema";

const STATUSES: Order["status"][] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/** Cambia el estado del pedido al vuelo. Sin botón de guardar: un select, una acción. */
export function OrderStatusSelect({ id, status }: { id: string; status: Order["status"] }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as Order["status"];
        startTransition(async () => {
          const res = await updateOrderStatusAction(id, next);
          if (res?.error) toast.error(res.error);
          else toast.success(`Pedido actualizado: ${next}`);
        });
      }}
      className="h-7 rounded-md border border-border bg-white px-2 text-xs font-semibold disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
