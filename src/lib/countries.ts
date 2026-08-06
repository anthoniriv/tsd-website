// Países ISO 3166-1 alpha-2 (los 243 vigentes, sin códigos reservados ni
// históricos). Solo guardamos el CÓDIGO: el nombre lo resuelve `Intl.DisplayNames`
// en el idioma activo, así no hay que mantener 243 nombres × 2 idiomas.
//
// El país decide la TARIFA; el idioma es una elección aparte (un mexicano puede
// navegar en inglés y sigue pagando precio "resto del mundo").

import type { Lang, PriceTier } from "@/lib/i18n";

export const COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA",
  "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT",
  "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR",
  "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH",
  "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH",
  "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU",
  "ID", "IE", "IL", "IM", "IN", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH",
  "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT",
  "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP",
  "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI",
  "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN",
  "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE",
  "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ",
  "TC", "TD", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA",
  "UG", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "XK", "YE", "YT",
  "ZA", "ZM", "ZW"
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

const CODE_SET: ReadonlySet<string> = new Set(COUNTRY_CODES);

export function isCountryCode(value: string | null | undefined): value is CountryCode {
  return value != null && CODE_SET.has(value.toUpperCase());
}

/** Los dos únicos países con tarifa `us`; el resto del mundo va a `world`. */
const US_CAN: ReadonlySet<string> = new Set(["US", "CA"]);

export function tierForCountry(code: string | null | undefined): PriceTier {
  return code && US_CAN.has(code.toUpperCase()) ? "us" : "world";
}

/** Países hispanohablantes: solo se usa para PREseleccionar el idioma. */
const SPANISH: ReadonlySet<string> = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GQ", "GT", "HN",
  "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

export function langForCountry(code: string | null | undefined): Lang {
  return code && SPANISH.has(code.toUpperCase()) ? "es" : "en";
}

/** 🇲🇽 a partir del código: dos "regional indicator symbols". */
export function flagEmoji(code: string): string {
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** Nombre del país en el idioma activo. Cae al código si el runtime no lo conoce. */
export function countryName(code: string, lang: Lang): string {
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Lista ordenada alfabéticamente por nombre en el idioma activo. */
export function countryOptions(lang: Lang): { code: CountryCode; name: string }[] {
  const collator = new Intl.Collator(lang);
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code, lang) })).sort((a, b) =>
    collator.compare(a.name, b.name),
  );
}
