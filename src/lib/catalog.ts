// Lecturas del catálogo. Server-only: mapea filas de Postgres a los tipos que la UI
// ya consumía cuando la data era estática (`JaltestLine`, `HardwareItem`).
//
// Cada función va envuelta en `react.cache` → dentro de un mismo request, varias
// llamadas (p. ej. las 3 ProductGrid de /producto) golpean la BD una sola vez.

import "server-only";
import { cache } from "react";
import { and, asc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { productPrices, products, banners } from "@/db/schema";
import type { PriceTier } from "@/lib/i18n";
import type { AccentKey, HardwareItem, JaltestLine } from "@/lib/products";

/**
 * Precio del tier pedido, como subquery escalar — evita el N+1 y el join extra.
 *
 * Las columnas van calificadas a mano (`pp.`, `products.`) a propósito: dentro de un
 * `sql` template Drizzle las emite SIN prefijo de tabla, y como `product_prices` tiene
 * su propia columna `id`, la correlación `product_id = id` se resolvería contra la
 * tabla interna en vez de contra `products` → siempre NULL.
 */
function priceFor(tier: PriceTier) {
  return sql<number>`(
    select pp.amount_cents from product_prices pp
    where pp.product_id = products.id and pp.tier = ${tier}
  )`.as("price_cents");
}

const baseCols = {
  id: products.id,
  slug: products.slug,
  sku: products.sku,
  accentKey: products.accentKey,
  brand: products.brand,
  variant: products.variant,
  segment: products.segment,
  name: products.name,
  blurb: products.blurb,
  description: products.description,
  img: products.img,
  vehicleImg: products.vehicleImg,
  logo: products.logo,
  category: products.category,
  stock: products.stock,
};

export const getJaltestLines = cache(async (tier: PriceTier): Promise<JaltestLine[]> => {
  const rows = await db
    .select({ ...baseCols, priceCents: priceFor(tier) })
    .from(products)
    .where(and(eq(products.kind, "jaltest"), eq(products.status, "published")))
    .orderBy(asc(products.sort));

  return rows.map((r) => ({
    id: r.accentKey as AccentKey,
    productId: r.id,
    brand: "Jaltest" as const,
    variant: r.variant ?? "",
    segment: r.segment ?? "",
    priceUSD: Math.round((r.priceCents ?? 0) / 100),
    priceCents: r.priceCents ?? 0,
    slug: r.slug,
    stock: r.stock,
    logo: r.logo ?? "",
    vehicleImg: r.vehicleImg ?? undefined,
    kitImg: r.img,
    description: r.description ?? { es: [], en: [] },
  }));
});

type HardwareCategory = HardwareItem["category"];

export const getHardware = cache(
  async (
    category: HardwareCategory,
    tier: PriceTier,
    limit?: number,
  ): Promise<HardwareItem[]> => {
    const q = db
      .select({ ...baseCols, priceCents: priceFor(tier) })
      .from(products)
      .where(
        and(
          eq(products.kind, "hardware"),
          eq(products.category, category),
          eq(products.status, "published"),
        ),
      )
      .orderBy(asc(products.sort));

    const rows = limit ? await q.limit(limit) : await q;
    return rows.map(toHardware);
  },
);

/**
 * Recomendaciones de la ficha: misma categoría primero; si no llenan el cupo, se completa
 * con otros productos publicados para no dejar la sección a medias.
 */
export const getRelatedProducts = cache(
  async (
    productId: string,
    category: HardwareCategory | null,
    tier: PriceTier,
    limit = 4,
  ): Promise<HardwareItem[]> => {
    const base = [
      eq(products.kind, "hardware"),
      eq(products.status, "published"),
      ne(products.id, productId),
    ];

    const sameCategory = category
      ? await db
          .select({ ...baseCols, priceCents: priceFor(tier) })
          .from(products)
          .where(and(...base, eq(products.category, category)))
          .orderBy(asc(products.sort))
          .limit(limit)
      : [];

    if (sameCategory.length >= limit) return sameCategory.map(toHardware);

    const exclude = [productId, ...sameCategory.map((r) => r.id)];
    const filler = await db
      .select({ ...baseCols, priceCents: priceFor(tier) })
      .from(products)
      .where(
        and(
          eq(products.kind, "hardware"),
          eq(products.status, "published"),
          sql`${products.id} <> all(${sql.param(exclude)}::uuid[])`,
        ),
      )
      .orderBy(asc(products.sort))
      .limit(limit - sameCategory.length);

    return [...sameCategory, ...filler].map(toHardware);
  },
);

function toHardware(r: {
  id: string;
  slug: string;
  name: Record<"es" | "en", string>;
  blurb: Record<"es" | "en", string> | null;
  img: string;
  stock: number;
  category: HardwareCategory | null;
  priceCents: number | null;
}): HardwareItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    img: r.img,
    priceUSD: Math.round((r.priceCents ?? 0) / 100),
    priceCents: r.priceCents ?? 0,
    stock: r.stock,
    blurb: r.blurb ?? { es: "", en: "" },
    category: r.category ?? "cable",
  };
}

/**
 * Buscador + filtros del catálogo. `q` busca en el nombre de AMBOS idiomas (el JSONB
 * se aplana con ->>), así el término funciona sea cual sea el locale activo.
 */
export const searchHardware = cache(
  async (opts: {
    tier: PriceTier;
    q?: string;
    category?: HardwareCategory;
    minCents?: number;
    maxCents?: number;
    inStock?: boolean;
  }): Promise<HardwareItem[]> => {
    const price = priceFor(opts.tier);
    const conds = [eq(products.kind, "hardware"), eq(products.status, "published")];

    if (opts.q?.trim()) {
      const needle = `%${opts.q.trim()}%`;
      conds.push(
        or(
          ilike(sql`${products.name} ->> 'es'`, needle),
          ilike(sql`${products.name} ->> 'en'`, needle),
          ilike(sql`coalesce(${products.blurb} ->> 'es', '')`, needle),
          ilike(sql`coalesce(${products.blurb} ->> 'en', '')`, needle),
          ilike(sql`coalesce(${products.sku}, '')`, needle),
        )!,
      );
    }
    if (opts.category) conds.push(eq(products.category, opts.category));
    if (opts.inStock) conds.push(sql`${products.stock} > 0`);

    const rows = await db
      .select({ ...baseCols, priceCents: price })
      .from(products)
      .where(and(...conds))
      .orderBy(asc(products.sort));

    // El filtro de precio se aplica en memoria: el precio es una subquery escalar y el
    // catálogo es pequeño (decenas de filas), no compensa complicar el SQL.
    return rows
      .map(toHardware)
      .filter(
        (i) =>
          (opts.minCents == null || (i.priceCents ?? 0) >= opts.minCents) &&
          (opts.maxCents == null || (i.priceCents ?? 0) <= opts.maxCents),
      );
  },
);

export const getProductBySlug = cache(async (slug: string, tier: PriceTier) => {
  const [row] = await db
    .select({ ...baseCols, kind: products.kind, priceCents: priceFor(tier) })
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "published")))
    .limit(1);

  return row ?? null;
});

/** Slides del hero del home, ordenados. */
export const getHeroBanners = cache(async () => {
  return db
    .select()
    .from(banners)
    .where(and(eq(banners.key, "home-hero"), eq(banners.active, true)))
    .orderBy(asc(banners.sort));
});
