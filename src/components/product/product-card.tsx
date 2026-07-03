"use client";

import { SmartImage } from "@/components/ui/smart-image";
import { CONTACT } from "@/lib/site";

/**
 * Card de producto reutilizable. Modela {nombre, imagen, precio, blurb} — ecommerce-ready.
 * Los strings ya vienen resueltos al idioma/tier activo desde `ProductGrid` (server).
 * Hoy el CTA abre WhatsApp con el pedido prellenado; mañana pasa a "Añadir al carrito".
 */
export function ProductCard({
  img,
  name,
  blurb,
  price,
  cta,
  waGreeting,
  priceLabel,
}: {
  img: string;
  name: string;
  blurb: string;
  price: string;
  cta: string;
  waGreeting: string;
  priceLabel: string;
}) {
  const openWhatsApp = () => {
    // URL absoluta de la imagen para adjuntar como referencia en el mensaje.
    const imgUrl =
      typeof window !== "undefined" ? new URL(img, window.location.origin).href : img;
    const text =
      `${waGreeting}\n\n` + `*${name}*\n${blurb}\n${priceLabel} ${price}\n\n${imgUrl}`;
    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-brand">
      <SmartImage
        src={img}
        alt={name}
        fit="contain"
        wrapperClassName="aspect-square w-full bg-brand-light/15"
        className="p-4 transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="text-[15px] font-bold leading-snug">{name}</h3>
        <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">{blurb}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2">
          <span className="text-base font-extrabold tabular-nums text-brand">{price}</span>
          <button
            type="button"
            onClick={openWhatsApp}
            className="cursor-pointer whitespace-nowrap rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors group-hover:bg-brand-dark"
          >
            {cta}
          </button>
        </div>
      </div>
    </article>
  );
}
