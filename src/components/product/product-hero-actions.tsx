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
  demoHref,
  labels,
  className,
}: {
  productId?: string;
  name: string;
  stock: number;
  accentColor: string;
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
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <button
        type="button"
        onClick={addToCart}
        disabled={soldOut}
        className={cn(
          "inline-flex h-[53px] w-full cursor-pointer items-center justify-center gap-2 rounded-full px-[2.1rem] text-[1.05rem] font-extrabold uppercase leading-none text-white transition-opacity hover:opacity-90 sm:w-auto sm:min-w-[264px]",
          soldOut && "cursor-not-allowed opacity-60"
        )}
        style={{ backgroundColor: justAdded ? "var(--color-jt-agv)" : accentColor }}
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
        className="inline-flex h-[53px] w-full items-center justify-center gap-2 rounded-full border-2 bg-white px-[2.1rem] text-[1.05rem] font-extrabold uppercase leading-none transition-colors hover:bg-black/[0.03] sm:w-auto"
        style={{ borderColor: accentColor, color: accentColor }}
      >
        <CalendarClock className="h-5 w-5" />
        {labels.bookDemo}
      </Link>
    </div>
  );
}
