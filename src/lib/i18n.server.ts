import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  getDict,
  resolveLang,
  COUNTRY_COOKIE,
  LANG_COOKIE,
  LOCALE_COOKIE,
  type Dict,
  type Lang,
  type PriceTier,
} from "@/lib/i18n";
import { isCountryCode, tierForCountry } from "@/lib/countries";

export type LocaleData = {
  lang: Lang;
  /** País elegido (ISO alpha-2) o `null` si aún no eligió. */
  country: string | null;
  tier: PriceTier;
  dict: Dict;
};

/**
 * Estado de idioma/país del visitante. El idioma sale de `tds_lang` y el país
 * de `tds_country`; el tier se deriva del país, nunca del idioma.
 *
 * Compatibilidad: si solo existe la cookie vieja `tds_locale` se usa para el
 * idioma (en-US/en-LATAM → en). El país queda vacío y el modal vuelve a
 * preguntarlo, que es justo lo que queremos: antes no se guardaba.
 *
 * Cacheado por request. Leer cookies vuelve las rutas dinámicas: tradeoff
 * aceptado para no tener una ruta por idioma.
 */
export const getLocaleData = cache(async (): Promise<LocaleData> => {
  const store = await cookies();
  const legacy = store.get(LOCALE_COOKIE)?.value;
  const lang = resolveLang(store.get(LANG_COOKIE)?.value ?? legacy);

  const raw = store.get(COUNTRY_COOKIE)?.value?.toUpperCase();
  const country = isCountryCode(raw) ? raw : null;

  return { lang, country, tier: tierForCountry(country), dict: getDict(lang) };
});

/** ¿Ya eligió país? Si no, el layout abre el modal de bienvenida. */
export const hasChosenCountry = cache(async (): Promise<boolean> => {
  const store = await cookies();
  return isCountryCode(store.get(COUNTRY_COOKIE)?.value?.toUpperCase());
});
