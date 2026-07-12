"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

/** Selector de cantidad + añadir al carrito. Para la ficha de producto. */
export function AddToCart({
  id,
  name,
  stock,
  label,
  added,
  outOfStock,
  qtyLabel,
  addedToast,
}: {
  id: string;
  name: string;
  stock: number;
  label: string;
  added: string;
  outOfStock: string;
  qtyLabel: string;
  addedToast: string;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = stock <= 0;

  const onAdd = () => {
    add(id, qty);
    setJustAdded(true);
    toast.success(addedToast, { description: `${qty} × ${name}` });
    setTimeout(() => setJustAdded(false), 1800);
  };

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className="h-12 w-full cursor-not-allowed rounded-full bg-text-muted text-sm font-bold uppercase tracking-wide text-white"
      >
        {outOfStock}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-border" aria-label={qtyLabel}>
        <button
          type="button"
          aria-label="-"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid h-12 w-11 place-items-center text-text-secondary hover:text-brand"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-base font-bold tabular-nums">{qty}</span>
        <button
          type="button"
          aria-label="+"
          disabled={qty >= stock}
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          className="grid h-12 w-11 place-items-center text-text-secondary hover:text-brand disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className={cn(
          "flex h-12 flex-1 min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-wide text-white transition-colors",
          justAdded ? "bg-jt-agv" : "bg-brand hover:bg-brand-dark",
        )}
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4" /> {added}
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" /> {label}
          </>
        )}
      </button>
    </div>
  );
}
