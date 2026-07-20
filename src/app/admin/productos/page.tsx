import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productPrices, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { ProductsTable, type ProductRow } from "@/components/admin/products-table";
import { cn } from "@/lib/utils";

export default async function ProductosPage() {
  await requireUser();

  const rows: ProductRow[] = await db
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

      <ProductsTable rows={rows} />
    </>
  );
}
