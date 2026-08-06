import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getDict, resolveLocale, LOCALE_COOKIE, type Dict, type LocaleDef } from "@/lib/i18n";

export type LocaleData = LocaleDef & { dict: Dict };

/**
 * Lee el locale actual desde la cookie `tds_locale` (seteada por el switcher del
 * header) y devuelve locale + tier + diccionario. Cacheado por request → seguro
 * de llamar en múltiples componentes server. Leer la cookie vuelve las rutas
 * dinámicas (se pierde el prerender estático): tradeoff aceptado para el switch
 * sin flash ni ruta por idioma.
 */
export const getLocaleData = cache(async (): Promise<LocaleData> => {
  const store = await cookies();
  const locale = resolveLocale(store.get(LOCALE_COOKIE)?.value);
  return { ...locale, dict: getDict(locale.lang) };
});

/**
 * ¿El visitante ya eligió región? Si no, el layout muestra el modal de
 * bienvenida: el locale decide idioma **y** tarifa, así que no queremos que
 * navegue con precios de otro mercado sin haberlo elegido.
 */
export const hasChosenLocale = cache(async (): Promise<boolean> => {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value != null;
});
