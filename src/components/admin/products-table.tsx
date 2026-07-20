"use client";

import Link from "next/link";
import { bulkDeleteProductsAction, deleteProductAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, type Column } from "@/components/admin/data-table";
import {
  PRODUCT_CATEGORY_LABEL,
  PRODUCT_KIND_LABEL,
  PRODUCT_STATUS_LABEL,
} from "@/lib/admin-labels";
import type { Product } from "@/db/schema";
import { cn } from "@/lib/utils";

export type ProductRow = {
  id: string;
  slug: string;
  kind: Product["kind"];
  category: Product["category"];
  name: Product["name"];
  status: Product["status"];
  stock: number;
  priceUs: number | null;
};

const columns: Column<ProductRow>[] = [
  {
    header: "Producto",
    cell: (p) => (
      <>
        <Link
          href={`/admin/productos/${p.id}`}
          className="font-semibold text-text-main hover:text-brand"
        >
          {p.name.es}
        </Link>
        <p className="text-xs text-text-muted">{p.slug}</p>
      </>
    ),
  },
  {
    header: "Tipo",
    cell: (p) => (
      <span className="text-text-secondary">
        {p.category ? PRODUCT_CATEGORY_LABEL[p.category] : PRODUCT_KIND_LABEL[p.kind]}
      </span>
    ),
  },
  {
    header: "Precio US",
    cell: (p) => (
      <span className="font-semibold text-text-main">
        {p.priceUs != null ? `$${(p.priceUs / 100).toLocaleString("en-US")}` : "—"}
      </span>
    ),
  },
  { header: "Stock", cell: (p) => <span className="text-text-secondary">{p.stock}</span> },
  {
    header: "Estado",
    cell: (p) => (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-bold",
          p.status === "published"
            ? "bg-jt-agv/15 text-[#5f8f14]"
            : "bg-border-light text-text-secondary",
        )}
      >
        {PRODUCT_STATUS_LABEL[p.status]}
      </span>
    ),
  },
  {
    header: "",
    align: "right",
    cell: (p) => (
      <form action={deleteProductAction}>
        <input type="hidden" name="id" value={p.id} />
        <DeleteButton confirmText={`¿Eliminar "${p.name.es}"?`} />
      </form>
    ),
  },
];

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      actions={[
        {
          label: "Eliminar seleccionados",
          variant: "danger",
          run: bulkDeleteProductsAction,
          confirm: (n) => `¿Eliminar ${n} producto${n > 1 ? "s" : ""}?`,
        },
      ]}
    />
  );
}
