"use client";

import {
  bulkDeleteCouponsAction,
  deleteCouponAction,
  toggleCouponAction,
} from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, type Column } from "@/components/admin/data-table";
import type { Coupon } from "@/db/schema";
import { cn } from "@/lib/utils";

function buildColumns(now: number): Column<Coupon>[] {
  return [
    {
      header: "Código",
      cell: (c) => (
        <>
          <p className="font-black tracking-wide text-text-main">{c.code}</p>
          {c.minSubtotalCents > 0 && (
            <p className="text-xs text-text-muted">
              mín. ${(c.minSubtotalCents / 100).toLocaleString("en-US")}
            </p>
          )}
        </>
      ),
    },
    {
      header: "Descuento",
      cell: (c) => (
        <span className="font-bold text-brand">
          {c.kind === "percent" ? `${c.value}%` : `$${(c.value / 100).toLocaleString("en-US")}`}
        </span>
      ),
    },
    {
      header: "Usos",
      cell: (c) => (
        <span className="text-text-secondary">
          {c.usedCount}
          {c.maxUses != null && ` / ${c.maxUses}`}
        </span>
      ),
    },
    {
      header: "Estado",
      cell: (c) => {
        const expired = c.expiresAt != null && new Date(c.expiresAt).getTime() < now;
        const exhausted = c.maxUses != null && c.usedCount >= c.maxUses;
        const live = c.active && !expired && !exhausted;
        return (
          <form action={toggleCouponAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="active" value={c.active ? "0" : "1"} />
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                live ? "bg-jt-agv/15 text-[#5f8f14]" : "bg-border-light text-text-secondary",
              )}
            >
              {expired ? "caducado" : exhausted ? "agotado" : c.active ? "activo" : "inactivo"}
            </span>
            {!expired && !exhausted && (
              <button
                type="submit"
                className="text-xs font-semibold text-text-muted underline-offset-2 hover:text-brand hover:underline"
              >
                {c.active ? "desactivar" : "activar"}
              </button>
            )}
          </form>
        );
      },
    },
    {
      header: "",
      align: "right",
      cell: (c) => (
        <form action={deleteCouponAction}>
          <input type="hidden" name="id" value={c.id} />
          <DeleteButton confirmText={`¿Eliminar el cupón ${c.code}?`} />
        </form>
      ),
    },
  ];
}

export function CouponsTable({ rows, now }: { rows: Coupon[]; now: number }) {
  return (
    <DataTable
      rows={rows}
      columns={buildColumns(now)}
      minWidth={560}
      empty={
        <div className="rounded-2xl border border-border bg-white">
          <p className="px-6 py-16 text-center text-sm text-text-secondary">
            Todavía no hay cupones.
          </p>
        </div>
      }
      actions={[
        {
          label: "Eliminar seleccionados",
          variant: "danger",
          run: bulkDeleteCouponsAction,
          confirm: (n) => `¿Eliminar ${n} cupón${n > 1 ? "es" : ""}?`,
        },
      ]}
    />
  );
}
