import "server-only";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, type LocaleCode } from "@/lib/i18n";

/**
 * Sugerencia de locale a partir del país del visitante.
 *
 * Vercel inyecta `x-vercel-ip-country` (ISO-3166 alpha-2) en cada request; en
 * local no existe y caemos al locale por defecto. Es solo una SUGERENCIA: el
 * modal de bienvenida deja elegir, y la elección manda.
 */

/** Los dos únicos países con tarifa `us`. */
const US_CAN = new Set(["US", "CA"]);

/** Países hispanohablantes → arrancan en español. */
const SPANISH = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GQ", "GT", "HN",
  "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

export async function detectCountry(): Promise<string | null> {
  const store = await headers();
  return store.get("x-vercel-ip-country")?.toUpperCase() ?? null;
}

export function localeForCountry(country: string | null): LocaleCode {
  if (!country) return DEFAULT_LOCALE;
  if (US_CAN.has(country)) return "en-US";
  if (SPANISH.has(country)) return "es";
  return "en-LATAM";
}

/** Locale sugerido para el visitante actual. */
export async function suggestedLocale(): Promise<LocaleCode> {
  return localeForCountry(await detectCountry());
}
