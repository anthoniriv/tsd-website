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
    <>
      <CheckoutSteps
        current={1}
        title={dict.cartPage.title}
        subtitle={dict.cartPage.subtitle}
        dict={dict.checkout.steps}
      />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <CartPage dict={dict.cartPage} trust={dict.product.trust} />
      </div>
    </>
  );
}
