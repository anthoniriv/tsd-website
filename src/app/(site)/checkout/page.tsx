import type { Metadata } from "next";
import { getLocaleData } from "@/lib/i18n.server";
import { CheckoutForm } from "@/components/cart/checkout-form";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleData();
  return { title: dict.checkout.title, robots: { index: false } };
}

export default async function CheckoutPage() {
  const { dict } = await getLocaleData();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <h1 className="mb-8 text-3xl font-black uppercase tracking-wide text-text-main">
        {dict.checkout.title}
      </h1>
      <CheckoutForm dict={dict.checkout} cartDict={dict.cart} />
    </div>
  );
}
