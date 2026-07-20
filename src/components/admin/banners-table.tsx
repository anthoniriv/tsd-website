"use client";

import Link from "next/link";
import { bulkDeleteBannersAction, deleteBannerAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SmartImage } from "@/components/ui/smart-image";
import type { Banner } from "@/db/schema";
import { cn } from "@/lib/utils";

const columns: Column<Banner>[] = [
  {
    header: "Banner",
    cell: (b) => (
      <Link href={`/admin/banners/${b.id}`} className="flex items-center gap-3">
        <SmartImage
          src={b.img}
          alt={b.title?.es || "Banner"}
          fit="cover"
          wrapperClassName="h-12 w-20 shrink-0 rounded-lg border border-border"
        />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-text-main hover:text-brand">
            {b.title?.es || b.img}
          </span>
          <span className="block text-xs text-text-muted">orden {b.sort}</span>
        </span>
      </Link>
    ),
  },
  {
    header: "Estado",
    cell: (b) => (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-bold",
          b.active ? "bg-jt-agv/15 text-[#5f8f14]" : "bg-border-light text-text-secondary",
        )}
      >
        {b.active ? "visible" : "oculto"}
      </span>
    ),
  },
  {
    header: "",
    align: "right",
    cell: (b) => (
      <form action={deleteBannerAction}>
        <input type="hidden" name="id" value={b.id} />
        <DeleteButton confirmText="¿Eliminar este banner?" />
      </form>
    ),
  },
];

export function BannersTable({ rows }: { rows: Banner[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      minWidth={480}
      empty={
        <div className="rounded-2xl border border-dashed border-border bg-white">
          <p className="px-6 py-16 text-center text-sm text-text-secondary">
            Todavía no hay banners.
          </p>
        </div>
      }
      actions={[
        {
          label: "Eliminar seleccionados",
          variant: "danger",
          run: bulkDeleteBannersAction,
          confirm: (n) => `¿Eliminar ${n} banner${n > 1 ? "s" : ""}?`,
        },
      ]}
    />
  );
}
