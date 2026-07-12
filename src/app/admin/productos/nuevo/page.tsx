import { requireUser } from "@/lib/auth";
import { ProductForm } from "@/components/admin/product-form";

export default async function NuevoProductoPage() {
  await requireUser();

  return (
    <>
      <h1 className="mb-6 text-2xl font-black text-text-main">Nuevo producto</h1>
      <ProductForm />
    </>
  );
}
