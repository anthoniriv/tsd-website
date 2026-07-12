// Fuente única de precios del lado servidor. La usa el carrito (para mostrar) y el
// checkout (para cobrar) — así el importe que se muestra y el que se cobra salen
// siempre de la misma consulta.

import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { productPrices } from "@/db/schema";
import type { PriceTier } from "@/lib/i18n";

/** Mapa productId → centavos, para el tier dado. */
export async function priceMapFor(
  productIds: string[],
  tier: PriceTier,
): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();

  const rows = await db
    .select({ productId: productPrices.productId, amountCents: productPrices.amountCents })
    .from(productPrices)
    .where(and(inArray(productPrices.productId, productIds), eq(productPrices.tier, tier)));

  return new Map(rows.map((r) => [r.productId, r.amountCents]));
}
