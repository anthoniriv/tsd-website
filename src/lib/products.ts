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
  category: "laptop" | "cable" | "finder";
};

// Kits de cobertura (honeycomb del home). Son decorativos — sin precio ni compra —
// así que siguen siendo constantes: no tiene sentido meterlos en BD.
export const COVERAGE_KITS = [
  { key: "onHighway", img: "/images/truck.png" },
  { key: "offHighway", img: "/images/veh-ohw.png" },
  { key: "materialHandling", img: "/images/kit.png" },
  { key: "marine", img: "/images/veh-marine.png" },
  { key: "agriculture", img: "/images/tractor.png" },
  { key: "bundleKit", img: "/images/veh-cv.png" },
] as const;

export const HARDWARE_KITS = [
  { key: "tabletsLaptops", img: "/images/laptop.png" },
  { key: "adaptersCables", img: "/images/cable-b.png" },
  { key: "cableFinder", img: "/images/finder-b.png" },
] as const;

/** Helper: resuelve un campo localizado al idioma dado. */
export function loc<T>(value: Localized<T>, lang: Lang): T {
  return value[lang];
}

export type { PriceTier };
