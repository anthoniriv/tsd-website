import type { Metadata } from "next";
import { getLocaleData } from "@/lib/i18n.server";
import { CheckoutSteps } from "@/components/cart/checkout-steps";
import { CheckoutForm } from "@/components/cart/checkout-form";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleData();
  return { title: dict.checkout.title, robots: { index: false } };
}

export default async function CheckoutPage() {
  const { dict } = await getLocaleData();

  return (
    <>
      <CheckoutSteps
        current={2}
        title={dict.checkout.title}
        subtitle={dict.checkout.subtitle}
        dict={dict.checkout.steps}
      />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <CheckoutForm dict={dict.checkout} cartDict={dict.cartPage} />
      </div>
    </>
  );
}
