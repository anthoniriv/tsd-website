import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { BannerForm } from "@/components/admin/banner-form";

export default async function EditarBannerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const [banner] = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
  if (!banner) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-black text-text-main">Editar banner</h1>
      <BannerForm banner={banner} />
    </>
  );
}
