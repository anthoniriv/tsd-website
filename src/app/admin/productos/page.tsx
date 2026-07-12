import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productPrices, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { deleteProductAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { cn } from "@/lib/utils";

export default async function ProductosPage() {
  await requireUser();

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      kind: products.kind,
      category: products.category,
      name: products.name,
      status: products.status,
      stock: products.stock,
      priceUs: productPrices.amountCents,
    })
    .from(products)
    .leftJoin(
      productPrices,
      and(eq(productPrices.productId, products.id), eq(productPrices.tier, "us")),
    )
    .orderBy(asc(products.kind), asc(products.sort));

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-main">Productos</h1>
          <p className="text-sm text-text-muted">{rows.length} en el catálogo</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className={cn(buttonVariants(), "bg-brand hover:bg-brand-dark")}
        >
          Nuevo producto
        </Link>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-bg-soft text-left text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-bold">Producto</th>
              <th className="px-4 py-3 font-bold">Tipo</th>
              <th className="px-4 py-3 font-bold">Precio US</th>
              <th className="px-4 py-3 font-bold">Stock</th>
              <th className="px-4 py-3 font-bold">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-bg-soft/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="font-semibold text-text-main hover:text-brand"
                  >
                    {p.name.es}
                  </Link>
                  <p className="text-xs text-text-muted">{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{p.category ?? p.kind}</td>
                <td className="px-4 py-3 font-semibold text-text-main">
                  {p.priceUs != null ? `$${(p.priceUs / 100).toLocaleString("en-US")}` : "—"}
                </td>
                <td className="px-4 py-3 text-text-secondary">{p.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      p.status === "published"
                        ? "bg-jt-agv/15 text-[#5f8f14]"
                        : "bg-border-light text-text-secondary",
                    )}
                  >
                    {p.status === "published" ? "publicado" : "borrador"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <DeleteButton confirmText={`¿Eliminar "${p.name.es}"?`} />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
