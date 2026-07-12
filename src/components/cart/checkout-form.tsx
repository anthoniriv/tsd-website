"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { getCartItems, type CartItemView } from "@/app/(site)/cart-actions";
import { startCheckout } from "@/app/(site)/checkout/actions";
import { useCart } from "@/components/cart/cart-provider";
import type { Dict } from "@/lib/i18n";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmartImage } from "@/components/ui/smart-image";

export function CheckoutForm({
  dict,
  cartDict,
}: {
  dict: Dict["checkout"];
  cartDict: Dict["cart"];
}) {
  const { lines, count, ready } = useCart();
  const params = useSearchParams();
  const [items, setItems] = useState<CartItemView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (lines.length === 0) {
      setItems([]);
      return;
    }
    getCartItems(lines.map((l) => l.id)).then(setItems);
  }, [lines]);

  const qtyOf = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;
  const total = items.reduce((sum, i) => sum + i.priceCents * qtyOf(i.id), 0);

  if (ready && count === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-bg-soft px-6 py-16 text-center">
        <p className="text-sm text-text-secondary">{dict.empty}</p>
        <Link href="/tienda" className="mt-3 inline-block text-sm font-bold text-brand hover:underline">
          {dict.goToShop}
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    // Solo mandamos {id, qty}: el servidor pone los precios.
    const res = await startCheckout(lines, new FormData(e.currentTarget));

    if (res.url) {
      // El carrito NO se vacía aquí: si el usuario cancela el pago, lo conserva.
      // Se limpia al confirmarse el pedido, en la página de seguimiento.
      window.location.href = res.url;
      return;
    }
    setError(res.error ?? "No se pudo iniciar el pago.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {params.get("cancelado") && (
          <p className="rounded-xl bg-jt-ohw/10 px-4 py-3 text-sm font-medium text-[#8a6100]">
            {dict.cancelled}
          </p>
        )}

        <fieldset className="space-y-5 rounded-2xl border border-border bg-white p-6">
          <legend className="px-2 text-sm font-bold uppercase tracking-wide text-text-secondary">
            {dict.contactData}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">{dict.name}</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{dict.email}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{dict.phone}</Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5 rounded-2xl border border-border bg-white p-6">
          <legend className="px-2 text-sm font-bold uppercase tracking-wide text-text-secondary">
            {dict.shipping}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="line1">{dict.address}</Label>
              <Input id="line1" name="line1" autoComplete="address-line1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">{dict.city}</Label>
              <Input id="city" name="city" autoComplete="address-level2" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">{dict.state}</Label>
              <Input id="state" name="state" autoComplete="address-level1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postalCode">{dict.postalCode}</Label>
              <Input id="postalCode" name="postalCode" autoComplete="postal-code" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">{dict.country}</Label>
              <Input id="country" name="country" autoComplete="country-name" defaultValue="USA" />
            </div>
          </div>
        </fieldset>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
          {dict.summary}
        </h2>

        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <SmartImage
                src={item.img}
                alt={item.name}
                fit="contain"
                wrapperClassName="h-12 w-12 shrink-0 rounded-lg bg-brand-light/15"
                className="p-1"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-text-main">{item.name}</p>
                <p className="text-xs text-text-muted">× {qtyOf(item.id)}</p>
              </div>
              <span className="text-sm font-bold tabular-nums">
                {formatPrice(item.priceCents * qtyOf(item.id))}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-bold text-text-secondary">{cartDict.total}</span>
          <span className="text-2xl font-black tabular-nums text-text-main">
            {formatPrice(total)}
          </span>
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-jt-mhe">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending || items.length === 0}
          className="h-12 w-full rounded-full bg-brand text-sm font-bold uppercase tracking-wide hover:bg-brand-dark"
        >
          {pending ? dict.paying : `${dict.pay} ${formatPrice(total)}`}
        </Button>

        <p className="flex items-start gap-1.5 text-[11px] leading-snug text-text-muted">
          <Lock className="mt-px h-3 w-3 shrink-0" />
          {dict.secure}
        </p>
      </aside>
    </form>
  );
}
