import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productPrices, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();

  const prices = await db
    .select()
    .from(productPrices)
    .where(eq(productPrices.productId, id));

  return (
    <>
      <h1 className="mb-1 text-2xl font-black text-text-main">{product.name.es}</h1>
      <p className="mb-6 text-sm text-text-muted">{product.slug}</p>
      <ProductForm product={product} prices={prices} />
    </>
  );
}
