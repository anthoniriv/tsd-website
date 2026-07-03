"use client";

import type { HardwareItem } from "@/lib/products";
import { SmartImage } from "@/components/ui/smart-image";
import { CONTACT } from "@/lib/site";

/**
 * Card de producto reutilizable. Modela {nombre, imagen, precio, blurb} — ecommerce-ready.
 * Hoy el CTA abre WhatsApp con el pedido prellenado; mañana pasa a "Añadir al carrito".
 */
export function ProductCard({ item }: { item: HardwareItem }) {
  const openWhatsApp = () => {
    // URL absoluta de la imagen para adjuntar como referencia en el mensaje.
    const imgUrl =
      typeof window !== "undefined"
        ? new URL(item.img, window.location.origin).href
        : item.img;
    const text =
      `Hola, quiero comprar este producto:\n\n` +
      `*${item.name}*\n${item.blurb}\nPrecio: ${item.price}\n\n${imgUrl}`;
    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-brand">
      <SmartImage
        src={item.img}
        alt={item.name}
        fit="contain"
        wrapperClassName="aspect-square w-full bg-brand-light/15"
        className="p-4 transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="text-[15px] font-bold leading-snug">{item.name}</h3>
        <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">{item.blurb}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2">
          <span className="text-base font-extrabold tabular-nums text-brand">{item.price}</span>
          <button
            type="button"
            onClick={openWhatsApp}
            className="cursor-pointer whitespace-nowrap rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors group-hover:bg-brand-dark"
          >
            Solicitar precio
          </button>
        </div>
      </div>
    </article>
  );
}
