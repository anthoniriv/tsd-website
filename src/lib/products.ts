// Capa de acceso al catálogo. La data vive en Postgres (Neon) — ver `src/db/schema.ts`.
//
// Los TIPOS de la UI (`JaltestLine`, `HardwareItem`) se mantienen idénticos a los que
// tenía la versión estática, así los componentes que hacen `item.name[lang]` no cambian.
// Las funciones de lectura mapean fila de BD → tipo de UI, con el precio del tier ya
// resuelto a centavos.

import type { Lang, Localized, PriceTier } from "@/lib/i18n";

export type AccentKey = "cv" | "ohw" | "agv" | "marine" | "mhe";

export const ACCENT: Record<AccentKey, { color: string; bg: string; text: string }> = {
  cv: { color: "var(--color-jt-cv)", bg: "#eef4fb", text: "text-[#2e6db4]" },
  ohw: { color: "var(--color-jt-ohw)", bg: "#fdf3e1", text: "text-[#f5a623]" },
  agv: { color: "var(--color-jt-agv)", bg: "#f0f8e8", text: "text-[#7ac143]" },
  marine: { color: "var(--color-jt-marine)", bg: "#eaf6fc", text: "text-[#4aaedb]" },
  mhe: { color: "var(--color-jt-mhe)", bg: "#fbecee", text: "text-[#b11e2f]" },
};

/** Formatea centavos USD. Los precios ya vienen resueltos por tier desde la BD. */
export function formatPrice(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

export type JaltestLine = {
  id: AccentKey;
  /** id de la fila en `products` — lo que guarda el carrito. */
  productId?: string;
  brand: "Jaltest";
  variant: string; // CV, OHW, AGV…
  segment: string; // "Commercial Vehicles"
  priceUSD: number; // precio base USD (lo usa el seed; la UI usa `priceCents`)
  priceCents?: number; // precio del tier activo, resuelto en la query
  slug?: string;
  stock?: number;
  logo: string;
  vehicleImg?: string;
  kitImg: string;
  description: Localized<string[]>;
};

export type HardwareItem = {
  id: string;
  name: Localized<string>;
  img: string;
  priceUSD: number; // idem: lo usa el seed
  priceCents?: number;
  slug?: string;
  stock?: number;
  blurb: Localized<string>;
  category: "laptop" | "cable" | "finder" | "renewal" | "upgrade";
};

const R2 = "https://pub-d51770ee631f4c29836b56b7e8e01dd6.r2.dev/media";

// Kits de cobertura (honeycomb del home). Son decorativos — sin precio ni compra —
// así que siguen siendo constantes: no tiene sentido meterlos en BD.
//
// `accent` tiñe el borde del hexágono en hover; `href` lleva al bloque de la línea
// correspondiente en /producto. "Solución integral" no es una línea: cubre todas,
// así que su borde lleva un lado de cada color y su enlace va a la página entera.
export const COVERAGE_KITS = [
  {
    key: "onHighway",
    img: `${R2}/cobertura-vehiculos-comerciales-99108d04.png`,
    accent: "cv",
    href: "/producto#cv",
  },
  {
    key: "offHighway",
    img: `${R2}/cobertura-maquinaria-pesada-aa1b683d.png`,
    accent: "ohw",
    href: "/producto#ohw",
  },
  {
    key: "materialHandling",
    img: `${R2}/cobertura-manejo-materiales-cd14c322.png`,
    accent: "mhe",
    href: "/producto#mhe",
  },
  { key: "marine", img: "/images/veh-marine.png", accent: "marine", href: "/producto#marine" },
  {
    key: "agriculture",
    img: `${R2}/cobertura-agricola-c7d6e198.png`,
    accent: "agv",
    href: "/producto#agv",
  },
  {
    key: "bundleKit",
    img: `${R2}/cobertura-solucion-integral-83e3a8a8.png`,
    accent: "bundle",
    href: "/producto",
  },
] as const;

/**
 * Collage de cobertura que mandó el cliente (técnico + equipos + hexágonos de
 * línea). Subido a R2 y aún sin ubicación definitiva en la página.
 */
export const COVERAGE_COLLAGE_IMG = `${R2}/renovaciones-cobertura-jaltest-6fee44fb.png`;

// Los tres hexágonos llevan a su sección institucional de /producto, no al catálogo:
// el cliente quiere que primero se lea la solución y desde ahí se salte a la tienda.
export const HARDWARE_KITS = [
  { key: "laptops", img: "/images/laptop.png", href: "/producto#rugged" },
  { key: "tablets", img: `${R2}/hardware-tablet-jaltest-26b9afab.png`, href: "/producto#rugged" },
  { key: "cables", img: "/images/cable-b.png", href: "/producto#soluciones" },
] as const;

/** Helper: resuelve un campo localizado al idioma dado. */
export function loc<T>(value: Localized<T>, lang: Lang): T {
  return value[lang];
}

export type { PriceTier };
