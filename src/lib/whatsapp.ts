// Mensaje prellenado de WhatsApp. Extraído de `product-card.tsx` porque ahora lo usan
// también la ficha de producto y el CTA de "agotado".

import { CONTACT } from "@/lib/site";

export function buildWhatsAppUrl(input: {
  greeting: string;
  name: string;
  blurb?: string;
  priceLabel?: string;
  price?: string;
  img?: string;
}): string {
  // URL absoluta de la imagen, para que el mensaje la muestre como referencia.
  const imgUrl =
    input.img && typeof window !== "undefined"
      ? new URL(input.img, window.location.origin).href
      : input.img;

  // Los bloques se separan con línea en blanco; dentro de cada uno, solo lo que exista.
  const detail = [
    `*${input.name}*`,
    input.blurb,
    input.price && `${input.priceLabel ?? ""} ${input.price}`.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const text = [input.greeting, detail, imgUrl].filter(Boolean).join("\n\n");

  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}
