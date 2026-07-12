import type { Metadata } from "next";
import { getLocaleData } from "@/lib/i18n.server";
import { CheckoutSteps } from "@/components/cart/checkout-steps";
import { CartPage } from "@/components/cart/cart-page";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleData();
  return { title: dict.cartPage.title, robots: { index: false } };
}

export default async function CarritoPage() {
  const { dict } = await getLocaleData();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <CheckoutSteps current={1} dict={dict.checkout.steps} />
      <h1 className="mb-8 text-3xl font-black uppercase tracking-wide text-text-main">
        {dict.cartPage.title}
      </h1>
      <CartPage dict={dict.cartPage} />
    </div>
  );
}
