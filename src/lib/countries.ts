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

// Sin banderas emoji: Windows no las tiene (Segoe UI Emoji no incluye los
// "regional indicator symbols") y las degrada a dos letritas, que es lo que se
// veía en el selector. Para banderas de verdad haría falta un set de imágenes
// y un desplegable propio — un <option> nativo no admite imágenes.

/** Nombre del país en el idioma activo. Cae al código si el runtime no lo conoce. */
export function countryName(code: string, lang: Lang): string {
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Continentes, en el orden en que se muestran en el selector. */
export const CONTINENTS = ["americas", "europe", "asia", "africa", "oceania"] as const;

export type Continent = (typeof CONTINENTS)[number];

/** Cada país en su continente. Cubre los 243 códigos, sin solapes. */
const BY_CONTINENT: Record<Continent, readonly string[]> = {
  americas: ["AG","AI","AR","AW","BB","BL","BM","BO","BQ","BR","BS","BZ","CA","CL","CO","CR","CU","CW","DM","DO","EC","FK","GD","GF","GL","GP","GT","GY","HN","HT","JM","KN","KY","LC","MF","MQ","MS","MX","NI","PA","PE","PM","PR","PY","SR","SV","SX","TC","TT","US","UY","VC","VE","VG","VI"],
  europe: ["AD","AL","AT","AX","BA","BE","BG","BY","CH","CY","CZ","DE","DK","EE","ES","FI","FO","FR","GB","GG","GI","GR","HR","HU","IE","IM","IS","IT","JE","LI","LT","LU","LV","MC","MD","ME","MK","MT","NL","NO","PL","PT","RO","RS","RU","SE","SI","SJ","SK","SM","UA","VA","XK"],
  asia: ["AE","AF","AM","AZ","BD","BH","BN","BT","CN","GE","HK","ID","IL","IN","IQ","IR","JO","JP","KG","KH","KP","KR","KW","KZ","LA","LB","LK","MM","MN","MO","MV","MY","NP","OM","PH","PK","PS","QA","SA","SG","SY","TH","TJ","TL","TM","TR","TW","UZ","VN","YE"],
  africa: ["AO","BF","BI","BJ","BW","CD","CF","CG","CI","CM","CV","DJ","DZ","EG","EH","ER","ET","GA","GH","GM","GN","GQ","GW","KE","KM","LR","LS","LY","MA","MG","ML","MR","MU","MW","MZ","NA","NE","NG","RE","RW","SC","SD","SH","SL","SN","SO","SS","ST","SZ","TD","TG","TN","TZ","UG","YT","ZA","ZM","ZW"],
  oceania: ["AS","AU","CC","CK","CX","FJ","FM","GU","KI","MH","MP","NC","NF","NR","NU","NZ","PF","PG","PN","PW","SB","TK","TO","TV","VU","WF","WS"],
};

/** Países de un continente, ordenados por nombre en el idioma activo. */
export function countriesByContinent(
  continent: Continent,
  lang: Lang,
): { code: string; name: string }[] {
  const collator = new Intl.Collator(lang);
  return BY_CONTINENT[continent]
    .map((code) => ({ code, name: countryName(code, lang) }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

/** Lista ordenada alfabéticamente por nombre en el idioma activo. */
export function countryOptions(lang: Lang): { code: CountryCode; name: string }[] {
  const collator = new Intl.Collator(lang);
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code, lang) })).sort((a, b) =>
    collator.compare(a.name, b.name),
  );
}
