"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Tag } from "lucide-react";
import { getCartItems, type CartItemView } from "@/app/(site)/cart-actions";
import { applyCoupon } from "@/app/(site)/carrito/actions";
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
  cartDict: Dict["cartPage"];
}) {
  const { lines, count, ready, couponCode } = useCart();
  const params = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<CartItemView[]>([]);
  const [discountCents, setDiscountCents] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [billingSame, setBillingSame] = useState(true);

  const idsKey = lines
    .map((l) => l.id)
    .sort()
    .join(",");

  useEffect(() => {
    if (!idsKey) {
      setItems([]);
      return;
    }
    getCartItems(idsKey.split(",")).then(setItems);
  }, [idsKey]);

  // El descuento se vuelve a pedir al servidor aquí: no se arrastra desde el carrito.
  useEffect(() => {
    if (!couponCode || lines.length === 0) {
      setDiscountCents(0);
      return;
    }
    applyCoupon(couponCode, lines).then((res) => {
      setDiscountCents(res.ok ? res.discountCents : 0);
    });
  }, [couponCode, lines]);

  const qtyOf = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;
  const subtotal = items.reduce((sum, i) => sum + i.priceCents * qtyOf(i.id), 0);
  const total = Math.max(0, subtotal - discountCents);

  // Carrito vacío: no hay nada que pagar, de vuelta al paso 1.
  useEffect(() => {
    if (ready && count === 0) router.replace("/carrito");
  }, [ready, count, router]);

  if (ready && count === 0) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    // Solo {id, qty} y el CÓDIGO del cupón: el servidor pone precios y descuento.
    const res = await startCheckout(lines, couponCode, new FormData(e.currentTarget));

    if (res.url) {
      // El carrito no se vacía aquí: si cancela el pago, lo conserva. Se limpia en la
      // página del pedido, cuando la BD confirma que se pagó.
      window.location.href = res.url;
      return;
    }
    setError(res.error ?? "No se pudo iniciar el pago.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {params.get("cancelado") && (
          <p className="rounded-xl bg-jt-ohw/10 px-4 py-3 text-sm font-medium text-[#8a6100]">
            {dict.cancelled}
          </p>
        )}

        <Fieldset title={dict.contactData}>
          <Field label={dict.name} full>
            <Input name="name" required autoComplete="name" />
          </Field>
          <Field label={dict.email}>
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label={dict.phone}>
            <Input name="phone" type="tel" autoComplete="tel" />
          </Field>
        </Fieldset>

        <Fieldset title={dict.shipping}>
          <AddressFields prefix="ship" dict={dict} autoPrefix="shipping" />
        </Fieldset>

        <div className="rounded-2xl border border-border bg-white p-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-text-main">
            <input
              type="checkbox"
              name="billingSame"
              checked={billingSame}
              onChange={(e) => setBillingSame(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            {dict.billingSame}
          </label>

          {!billingSame && (
            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-5 text-sm font-bold uppercase tracking-wide text-text-secondary">
                {dict.billing}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <AddressFields prefix="bill" dict={dict} autoPrefix="billing" />
              </div>
            </div>
          )}
        </div>

        <Link
          href="/carrito"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.back}
        </Link>
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

        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">{cartDict.subtotal}</span>
            <span className="font-bold tabular-nums">{formatPrice(subtotal)}</span>
          </div>

          {discountCents > 0 && (
            <div className="flex justify-between">
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <Tag className="h-3.5 w-3.5" />
                {couponCode}
              </span>
              <span className="font-bold tabular-nums text-[#5f8f14]">
                −{formatPrice(discountCents)}
              </span>
            </div>
          )}
        </div>

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

/** Los dos bloques de dirección son idénticos salvo el prefijo de los `name`. */
function AddressFields({
  prefix,
  dict,
  autoPrefix,
}: {
  prefix: "ship" | "bill";
  dict: Dict["checkout"];
  autoPrefix: "shipping" | "billing";
}) {
  return (
    <>
      <Field label={dict.address} full>
        <Input name={`${prefix}_line1`} autoComplete={`${autoPrefix} address-line1`} />
      </Field>
      <Field label={dict.address2} full>
        <Input name={`${prefix}_line2`} autoComplete={`${autoPrefix} address-line2`} />
      </Field>
      <Field label={dict.city}>
        <Input name={`${prefix}_city`} autoComplete={`${autoPrefix} address-level2`} />
      </Field>
      <Field label={dict.state}>
        <Input name={`${prefix}_state`} autoComplete={`${autoPrefix} address-level1`} />
      </Field>
      <Field label={dict.postalCode}>
        <Input name={`${prefix}_postalCode`} autoComplete={`${autoPrefix} postal-code`} />
      </Field>
      <Field label={dict.country}>
        <Input name={`${prefix}_country`} autoComplete={`${autoPrefix} country-name`} defaultValue="USA" />
      </Field>
    </>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-border bg-white p-6">
      <legend className="px-2 text-sm font-bold uppercase tracking-wide text-text-secondary">
        {title}
      </legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
