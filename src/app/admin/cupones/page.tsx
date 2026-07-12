import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { deleteCouponAction, toggleCouponAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { NewCouponForm } from "@/components/admin/new-coupon-form";
import { cn } from "@/lib/utils";

export default async function CuponesPage() {
  await requireUser();

  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  const now = Date.now();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Cupones</h1>
        <p className="text-sm text-text-muted">
          Descuentos aplicables en el carrito. El importe se recalcula en el servidor al cobrar.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          {rows.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-text-secondary">
              Todavía no hay cupones.
            </p>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-border bg-bg-soft text-left text-xs uppercase tracking-wide text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-bold">Código</th>
                  <th className="px-4 py-3 font-bold">Descuento</th>
                  <th className="px-4 py-3 font-bold">Usos</th>
                  <th className="px-4 py-3 font-bold">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((c) => {
                  const expired = c.expiresAt != null && c.expiresAt.getTime() < now;
                  const exhausted = c.maxUses != null && c.usedCount >= c.maxUses;
                  const live = c.active && !expired && !exhausted;

                  return (
                    <tr key={c.id} className="hover:bg-bg-soft/60">
                      <td className="px-4 py-3">
                        <p className="font-black tracking-wide text-text-main">{c.code}</p>
                        {c.minSubtotalCents > 0 && (
                          <p className="text-xs text-text-muted">
                            mín. ${(c.minSubtotalCents / 100).toLocaleString("en-US")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-brand">
                        {c.kind === "percent"
                          ? `${c.value}%`
                          : `$${(c.value / 100).toLocaleString("en-US")}`}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {c.usedCount}
                        {c.maxUses != null && ` / ${c.maxUses}`}
                      </td>
                      <td className="px-4 py-3">
                        <form action={toggleCouponAction} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="active" value={c.active ? "0" : "1"} />
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-bold",
                              live
                                ? "bg-jt-agv/15 text-[#5f8f14]"
                                : "bg-border-light text-text-secondary",
                            )}
                          >
                            {expired
                              ? "caducado"
                              : exhausted
                                ? "agotado"
                                : c.active
                                  ? "activo"
                                  : "inactivo"}
                          </span>
                          {!expired && !exhausted && (
                            <button
                              type="submit"
                              className="text-xs font-semibold text-text-muted underline-offset-2 hover:text-brand hover:underline"
                            >
                              {c.active ? "desactivar" : "activar"}
                            </button>
                          )}
                        </form>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteCouponAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <DeleteButton confirmText={`¿Eliminar el cupón ${c.code}?`} />
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <NewCouponForm />
      </div>
    </>
  );
}
