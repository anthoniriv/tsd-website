"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Headset,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { getCartItems, type CartItemView } from "@/app/(site)/cart-actions";
import { applyCoupon } from "@/app/(site)/carrito/actions";
import { useCart } from "@/components/cart/cart-provider";
import type { Dict } from "@/lib/i18n";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartImage } from "@/components/ui/smart-image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CartPage({
  dict,
  trust,
}: {
  dict: Dict["cartPage"];
  trust: Dict["product"]["trust"];
}) {
  const { lines, ready, couponCode, setCouponCode, setQty, remove } = useCart();
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(true);

  // Descuento: lo calcula el servidor. Aquí solo se guarda lo que respondió.
  const [discountCents, setDiscountCents] = useState(0);
  const [couponLabel, setCouponLabel] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const idsKey = lines
    .map((l) => l.id)
    .sort()
    .join(",");

  useEffect(() => {
    if (!ready) return;
    if (!idsKey) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    getCartItems(idsKey.split(",")).then((res) => {
      if (!cancelled) {
        setItems(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [idsKey, ready]);

  const qtyOf = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;
  const subtotal = items.reduce((sum, i) => sum + i.priceCents * qtyOf(i.id), 0);
  const total = Math.max(0, subtotal - discountCents);

  /**
   * El cupón guardado se revalida cada vez que cambia el carrito: si quitas productos y
   * dejas de alcanzar el mínimo, el descuento desaparece solo. No basta con recordarlo.
   */
  useEffect(() => {
    if (!couponCode || lines.length === 0) {
      setDiscountCents(0);
      setCouponLabel(null);
      return;
    }
    let cancelled = false;
    applyCoupon(couponCode, lines).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setDiscountCents(res.discountCents);
        setCouponLabel(res.label);
      } else {
        // Dejó de ser válido con este carrito: se retira en silencio.
        setDiscountCents(0);
        setCouponLabel(null);
        setCouponCode(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [couponCode, lines, setCouponCode]);

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    const code = couponInput.trim();
    if (!code) return;

    setApplying(true);
    setCouponError(null);
    const res = await applyCoupon(code, lines);
    setApplying(false);

    if (!res.ok) {
      setCouponError(dict.couponErrors[res.reason]);
      return;
    }
    setCouponCode(res.code);
    setCouponInput("");
  }

  function removeCoupon() {
    setCouponCode(null);
    setCouponError(null);
  }

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-bg-soft px-6 py-20 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-text-muted" />
        <p className="mt-4 text-sm text-text-secondary">{dict.empty}</p>
        <Link
          href="/tienda"
          className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
        >
          {dict.goToShop}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_340px]">
      {/* Líneas */}
      <div className="space-y-4">
        {items.map((item) => {
          const qty = qtyOf(item.id);
          const lowStock = qty >= item.stock;

          return (
            <article
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border bg-white p-4"
            >
              <Link href={`/tienda/${item.slug}`} className="shrink-0">
                <SmartImage
                  src={item.img}
                  alt={item.name}
                  fit="contain"
                  wrapperClassName="h-24 w-24 rounded-xl bg-brand-light/15"
                  className="p-2"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/tienda/${item.slug}`}
                    className="text-sm font-bold text-text-main hover:text-brand"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={dict.remove}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-text-muted hover:bg-jt-mhe/10 hover:text-jt-mhe"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-0.5 text-sm text-text-muted">{formatPrice(item.priceCents)}</p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      aria-label="-"
                      onClick={() => setQty(item.id, qty - 1)}
                      className="grid h-8 w-8 place-items-center text-text-secondary hover:text-brand"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
                    <button
                      type="button"
                      aria-label="+"
                      disabled={lowStock}
                      onClick={() => setQty(item.id, qty + 1)}
                      className="grid h-8 w-8 place-items-center text-text-secondary hover:text-brand disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-lg font-black tabular-nums text-text-main">
                    {formatPrice(item.priceCents * qty)}
                  </span>
                </div>

                {lowStock && (
                  <p className="mt-2 text-xs font-semibold text-jt-ohw">
                    {dict.stockWarning.replace("{n}", String(item.stock))}
                  </p>
                )}
              </div>
            </article>
          );
        })}

        <Link
          href="/tienda"
          className="inline-block text-sm font-semibold text-text-secondary hover:text-brand"
        >
          ← {dict.keepShopping}
        </Link>
      </div>

      {/* Resumen + cupón */}
      <aside className="h-fit space-y-5 rounded-2xl border border-border bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
          {dict.summary}
        </h2>

        <div className="space-y-2 text-sm">
          <Row label={dict.subtotal} value={formatPrice(subtotal)} />

          {discountCents > 0 && (
            <Row
              label={
                <span className="inline-flex items-center gap-1.5">
                  {dict.discount}
                  <span className="rounded bg-jt-agv/15 px-1.5 py-0.5 text-[10px] font-black uppercase text-[#5f8f14]">
                    {couponCode}
                  </span>
                </span>
              }
              value={`−${formatPrice(discountCents)}`}
              accent
            />
          )}

          <Row label={dict.shippingFree} value={dict.shippingCalc} muted />
        </div>

        <p className="flex items-start gap-2 rounded-lg border border-brand/25 bg-brand/5 px-3 py-2.5 text-xs leading-snug text-text-secondary">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          {dict.shippingNotice}
        </p>

        {/* Cupón */}
        {couponCode && discountCents > 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-jt-agv/10 px-4 py-3">
            <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[#5f8f14]">
              <Tag className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {couponCode} {couponLabel && `(${couponLabel})`}
              </span>
            </span>
            <button
              type="button"
              onClick={removeCoupon}
              aria-label={dict.remove}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#5f8f14] hover:bg-jt-agv/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={onApply} className="space-y-2">
            <label htmlFor="coupon" className="text-sm font-semibold text-text-main">
              {dict.coupon}
            </label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponError(null);
                }}
                placeholder={dict.couponPlaceholder}
                className="h-10 uppercase"
                autoComplete="off"
              />
              <Button
                type="submit"
                disabled={applying || !couponInput.trim()}
                variant="outline"
                className="h-10 shrink-0 border-brand text-brand hover:bg-brand hover:text-white"
              >
                {applying ? dict.applying : dict.apply}
              </Button>
            </div>
            {couponError && (
              <p role="alert" className="text-xs font-semibold text-jt-mhe">
                {couponError}
              </p>
            )}
          </form>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-bold text-text-main">{dict.total}</span>
          <span className="text-2xl font-black tabular-nums text-text-main">
            {formatPrice(total)}
          </span>
        </div>

        <Link
          href="/checkout"
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
        >
          {dict.continue}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Refuerzo de confianza justo donde se decide la compra. */}
        <ul className="space-y-2.5 border-t border-border pt-4">
          {[
            { icon: Truck, label: trust.shipping },
            { icon: ShieldCheck, label: trust.secure },
            { icon: Headset, label: trust.support },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-xs text-text-secondary">
              <Icon className="h-4 w-4 shrink-0 text-brand" />
              {label}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  muted,
}: {
  label: React.ReactNode;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-secondary">{label}</span>
      <span
        className={cn(
          "shrink-0 font-bold tabular-nums",
          accent && "text-[#5f8f14]",
          muted ? "text-xs font-medium text-text-muted" : "text-text-main",
        )}
      >
        {value}
      </span>
    </div>
  );
}
