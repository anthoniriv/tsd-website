"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

/**
 * CTA doble de cada línea Jaltest: comprar directo o agendar una demo.
 * El precio no viaja al carrito — solo `{id, qty}`; el importe lo resuelve el
 * servidor con `priceMapFor()`, igual que en `ProductCard`.
 */
export function ProductHeroActions({
  productId,
  name,
  stock,
  accentColor,
  accentInk = "#ffffff",
  outlineColor,
  demoHref,
  labels,
  className,
}: {
  productId?: string;
  name: string;
  stock: number;
  accentColor: string;
  /** Texto legible sobre `accentColor` (los acentos claros piden negro). */
  accentInk?: string;
  /** Color del botón secundario; por defecto el propio acento. */
  outlineColor?: string;
  demoHref: string;
  labels: {
    addToCart: string;
    added: string;
    outOfStock: string;
    bookDemo: string;
    addedToast: string;
  };
  className?: string;
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = stock <= 0 || !productId;

  const addToCart = () => {
    if (!productId) return;
    add(productId);
    setJustAdded(true);
    toast.success(labels.addedToast, { description: name });
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className={cn("flex flex-col items-center gap-3 sm:flex-row", className)}>
      <button
        type="button"
        onClick={addToCart}
        disabled={soldOut}
        className={cn(
          "inline-flex h-[52px] w-auto cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-7 text-[14px] font-extrabold uppercase leading-none transition-opacity hover:opacity-90 sm:w-full sm:flex-1 sm:px-6",
          soldOut && "cursor-not-allowed opacity-60"
        )}
        style={{
          backgroundColor: justAdded ? "var(--color-jt-agv)" : accentColor,
          color: justAdded ? "#ffffff" : accentInk,
        }}
      >
        {soldOut ? (
          labels.outOfStock
        ) : justAdded ? (
          <>
            <Check className="h-5 w-5" /> {labels.added}
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" /> {labels.addToCart}
          </>
        )}
      </button>

      <Link
        href={demoHref}
        className="inline-flex h-[52px] w-auto items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 bg-white px-7 text-[14px] font-extrabold uppercase leading-none transition-colors hover:bg-black/[0.03] sm:w-full sm:flex-1 sm:px-6"
        style={{ borderColor: outlineColor ?? accentColor, color: outlineColor ?? accentColor }}
      >
        <CalendarClock className="h-5 w-5" />
        {labels.bookDemo}
      </Link>
    </div>
  );
}
