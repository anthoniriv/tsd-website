import "server-only";
import { headers } from "next/headers";
import { isCountryCode } from "@/lib/countries";

/**
 * País del visitante según Vercel (`x-vercel-ip-country`, ISO alpha-2). En
 * local la cabecera no existe → `null` y el modal arranca sin preselección.
 * Es solo una sugerencia: la lista de países manda.
 */
export async function detectCountry(): Promise<string | null> {
  const store = await headers();
  const raw = store.get("x-vercel-ip-country")?.toUpperCase();
  return isCountryCode(raw) ? raw : null;
}
