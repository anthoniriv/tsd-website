import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { CouponsTable } from "@/components/admin/coupons-table";
import { NewCouponForm } from "@/components/admin/new-coupon-form";

export default async function CuponesPage() {
  await requireUser();

  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Cupones</h1>
        <p className="text-sm text-text-muted">
          Descuentos aplicables en el carrito. El importe se recalcula en el servidor al cobrar.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <CouponsTable rows={rows} now={Date.now()} />
        <NewCouponForm />
      </div>
    </>
  );
}
