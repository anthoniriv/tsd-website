import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { deleteBannerAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

export default async function BannersPage() {
  await requireUser();

  const rows = await db.select().from(banners).orderBy(asc(banners.key), asc(banners.sort));

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-main">Banners</h1>
          <p className="text-sm text-text-muted">Slides del hero de la página de inicio</p>
        </div>
        <Link
          href="/admin/banners/nuevo"
          className={cn(buttonVariants(), "bg-brand hover:bg-brand-dark")}
        >
          Nuevo banner
        </Link>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {rows.map((b) => (
          <article key={b.id} className="overflow-hidden rounded-2xl border border-border bg-white">
            <Link href={`/admin/banners/${b.id}`}>
              <SmartImage src={b.img} alt={b.title?.es || "Banner"} wrapperClassName="aspect-video w-full" />
            </Link>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-main">
                  {b.title?.es || b.img}
                </p>
                <p className="text-xs text-text-muted">
                  orden {b.sort} · {b.active ? "visible" : "oculto"}
                </p>
              </div>
              <form action={deleteBannerAction}>
                <input type="hidden" name="id" value={b.id} />
                <DeleteButton confirmText="¿Eliminar este banner?" />
              </form>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
