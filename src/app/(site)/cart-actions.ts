"use server";

// El carrito del cliente solo guarda {id, qty}. Para pintarlo necesitamos nombre,
// imagen y precio: se resuelven aquí, en el servidor, con el tier del visitante.
// El importe que se cobra se vuelve a calcular en el checkout — nunca se confía en
// un precio que venga del navegador.

import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getLocaleData } from "@/lib/i18n.server";
import { priceMapFor } from "@/lib/pricing";

export type CartItemView = {
  id: string;
  slug: string;
  name: string;
  img: string;
  priceCents: number;
  stock: number;
};

export async function getCartItems(ids: string[]): Promise<CartItemView[]> {
  if (ids.length === 0) return [];

  const { lang, tier } = await getLocaleData();

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      img: products.img,
      stock: products.stock,
      status: products.status,
    })
    .from(products)
    .where(inArray(products.id, ids));

  const prices = await priceMapFor(ids, tier);

  // Filtramos los despublicados: si un producto desaparece del catálogo, deja de
  // poder comprarse aunque siga en el localStorage de alguien.
  return rows
    .filter((r) => r.status === "published")
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name[lang],
      img: r.img,
      stock: r.stock,
      priceCents: prices.get(r.id) ?? 0,
    }));
}
