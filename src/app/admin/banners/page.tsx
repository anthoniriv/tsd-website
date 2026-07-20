import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { BannersTable } from "@/components/admin/banners-table";
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

      <BannersTable rows={rows} />
    </>
  );
}
