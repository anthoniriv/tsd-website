// Validación de cupones. SIEMPRE en servidor: el navegador solo manda el código, nunca
// el descuento. El importe se recalcula aquí tanto al mostrar el carrito como al cobrar.

import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupons, type Coupon } from "@/db/schema";

export type CouponResult =
  | { ok: true; coupon: Coupon; discountCents: number }
  | { ok: false; reason: CouponError };

export type CouponError = "notFound" | "expired" | "exhausted" | "minSubtotal" | "inactive";

/** Descuento en centavos, acotado al subtotal (un cupón nunca deja el total en negativo). */
export function discountFor(coupon: Coupon, subtotalCents: number): number {
  const raw =
    coupon.kind === "percent"
      ? Math.round((subtotalCents * coupon.value) / 100)
      : coupon.value;

  return Math.min(raw, subtotalCents);
}

export async function validateCoupon(
  code: string,
  subtotalCents: number,
): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "notFound" };

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, normalized))
    .limit(1);

  if (!coupon) return { ok: false, reason: "notFound" };
  if (!coupon.active) return { ok: false, reason: "inactive" };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, reason: "exhausted" };
  }
  if (subtotalCents < coupon.minSubtotalCents) {
    return { ok: false, reason: "minSubtotal" };
  }

  return { ok: true, coupon, discountCents: discountFor(coupon, subtotalCents) };
}

/** Se llama cuando el pedido queda pagado, no al aplicarlo: un carrito abandonado no gasta usos. */
export async function consumeCoupon(code: string) {
  await db
    .update(coupons)
    .set({ usedCount: sql`${coupons.usedCount} + 1` })
    .where(eq(coupons.code, code.trim().toUpperCase()));
}
