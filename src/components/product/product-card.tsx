"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Card de producto. Los strings ya vienen resueltos al idioma/tier activo desde
 * `ProductGrid` (server). CTA principal: añadir al carrito. El WhatsApp, que era el
 * CTA original de la landing, se conserva como vía secundaria de consulta.
 */
export function ProductCard({
  id,
  slug,
  img,
  name,
  blurb,
  price,
  stock,
  cta,
  added,
  outOfStock,
  waCta,
  waGreeting,
  priceLabel,
  addedToast,
}: {
  id: string;
  slug: string;
  img: string;
  name: string;
  blurb: string;
  price: string;
  stock: number;
  cta: string;
  added: string;
  outOfStock: string;
  waCta: string;
  waGreeting: string;
  priceLabel: string;
  addedToast: string;
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = stock <= 0;

  const addToCart = () => {
    add(id);
    setJustAdded(true);
    toast.success(addedToast, { description: name });
    setTimeout(() => setJustAdded(false), 1600);
  };

  const openWhatsApp = () => {
    const url = buildWhatsAppUrl({ greeting: waGreeting, name, blurb, priceLabel, price, img });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-brand">
      <Link href={`/tienda/${slug}`} className="block">
        <SmartImage
          src={img}
          alt={name}
          fit="contain"
          wrapperClassName="aspect-square w-full bg-brand-light/15"
          className="p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="text-[15px] font-bold leading-snug">
          <Link href={`/tienda/${slug}`} className="hover:text-brand">
            {name}
          </Link>
        </h3>
        <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">{blurb}</p>

        <div className="mt-auto space-y-2 pt-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-extrabold tabular-nums text-brand">{price}</span>
            <button
              type="button"
              onClick={openWhatsApp}
              aria-label={waCta}
              title={waCta}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full bg-whatsapp text-white transition-colors hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
            </button>
          </div>

          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut}
            className={cn(
              "flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide text-white transition-colors",
              soldOut
                ? "cursor-not-allowed bg-text-muted"
                : justAdded
                  ? "bg-jt-agv"
                  : "bg-brand hover:bg-brand-dark",
            )}
          >
            {soldOut ? (
              outOfStock
            ) : justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" /> {added}
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" /> {cta}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
