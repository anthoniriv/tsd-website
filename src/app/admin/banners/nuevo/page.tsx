import { requireUser } from "@/lib/auth";
import { BannerForm } from "@/components/admin/banner-form";

export default async function NuevoBannerPage() {
  await requireUser();

  return (
    <>
      <h1 className="mb-6 text-2xl font-black text-text-main">Nuevo banner</h1>
      <BannerForm />
    </>
  );
}
