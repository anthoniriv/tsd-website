"use server";

// Sugerencias del buscador del header. Reusa la misma query del catálogo (busca en el
// JSONB de ambos idiomas), acotada a unos pocos resultados.

import { searchHardware } from "@/lib/catalog";
import { getLocaleData } from "@/lib/i18n.server";
import { formatPrice } from "@/lib/products";

export type Suggestion = {
  id: string;
  slug: string;
  name: string;
  img: string;
  price: string;
};

const MAX = 6;

export async function searchSuggestions(q: string): Promise<Suggestion[]> {
  const term = q.trim();
  if (term.length < 2) return [];

  const { lang, tier } = await getLocaleData();
  const items = await searchHardware({ tier, q: term });

  return items.slice(0, MAX).map((i) => ({
    id: i.id,
    slug: i.slug ?? "",
    name: i.name[lang],
    img: i.img,
    price: formatPrice(i.priceCents ?? 0),
  }));
}
