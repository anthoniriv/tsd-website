"use server";

// Aplicar cupón. El navegador manda el CÓDIGO y sus líneas; el subtotal y el descuento se
// calculan aquí. Nunca se acepta un importe que venga del cliente.

import { getLocaleData } from "@/lib/i18n.server";
import { priceMapFor } from "@/lib/pricing";
import { validateCoupon, type CouponError } from "@/lib/coupons";
import type { DraftLine } from "@/lib/orders";

export type ApplyCouponResult =
  | { ok: true; code: string; discountCents: number; label: string }
  | { ok: false; reason: CouponError };

export async function applyCoupon(
  code: string,
  lines: DraftLine[],
): Promise<ApplyCouponResult> {
  const { tier } = await getLocaleData();

  const ids = lines.filter((l) => l.qty > 0).map((l) => l.id);
  const prices = await priceMapFor(ids, tier);
  const subtotal = lines.reduce((sum, l) => sum + (prices.get(l.id) ?? 0) * l.qty, 0);

  const res = await validateCoupon(code, subtotal);
  if (!res.ok) return res;

  return {
    ok: true,
    code: res.coupon.code,
    discountCents: res.discountCents,
    // Etiqueta legible del cupón: "-15%" o "-$50".
    label:
      res.coupon.kind === "percent"
        ? `-${res.coupon.value}%`
        : `-$${(res.coupon.value / 100).toLocaleString("en-US")}`,
  };
}
