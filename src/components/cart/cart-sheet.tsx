"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { getCartItems, type CartItemView } from "@/app/(site)/cart-actions";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/products";
import type { Dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function CartSheet({ dict }: { dict: Dict["cart"] }) {
  const { lines, count, ready, setQty, remove } = useCart();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(false);

  // Los detalles (nombre/precio/imagen) se piden al servidor al abrir el carrito, y
  // se refrescan si cambian las líneas: así el precio siempre es el del tier vigente.
  useEffect(() => {
    if (!open || lines.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCartItems(lines.map((l) => l.id))
      .then((res) => {
        if (!cancelled) setItems(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, lines]);

  const qtyOf = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;
  const subtotal = items.reduce((sum, i) => sum + i.priceCents * qtyOf(i.id), 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={dict.title}
        className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-soft hover:text-brand"
      >
        <ShoppingCart className="h-5 w-5" />
        {ready && count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{dict.title}</SheetTitle>
        </SheetHeader>

        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingCart className="h-10 w-10 text-text-muted" />
            <p className="text-sm text-text-secondary">{dict.empty}</p>
            <Link
              href="/tienda"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-brand hover:underline"
            >
              {dict.keepShopping}
            </Link>
          </div>
        ) : (
          <>
            <ul className={cn("flex-1 space-y-4 overflow-y-auto px-6", loading && "opacity-60")}>
              {items.map((item) => {
                const qty = qtyOf(item.id);
                return (
                  <li key={item.id} className="flex gap-3">
                    <SmartImage
                      src={item.img}
                      alt={item.name}
                      fit="contain"
                      wrapperClassName="h-20 w-20 shrink-0 rounded-lg bg-brand-light/15"
                      className="p-2"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-text-main">{item.name}</p>
                      <p className="text-sm font-extrabold tabular-nums text-brand">
                        {formatPrice(item.priceCents)}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            aria-label="-"
                            onClick={() => setQty(item.id, qty - 1)}
                            className="grid h-7 w-7 place-items-center text-text-secondary hover:text-brand"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-bold tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            aria-label="+"
                            disabled={qty >= item.stock}
                            onClick={() => setQty(item.id, qty + 1)}
                            className="grid h-7 w-7 place-items-center text-text-secondary hover:text-brand disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={dict.remove}
                          className="grid h-7 w-7 place-items-center rounded-md text-text-muted hover:bg-jt-mhe/10 hover:text-jt-mhe"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-border px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-text-secondary">{dict.subtotal}</span>
                <span className="text-xl font-black tabular-nums text-text-main">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark"
              >
                {dict.checkout}
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
