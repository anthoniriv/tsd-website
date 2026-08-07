"use server";

import { after } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sendOrderReceived } from "@/lib/email";
import { getLocaleData } from "@/lib/i18n.server";
import { createPendingOrder, OrderError, type DraftLine } from "@/lib/orders";
import { getStripe, siteUrl } from "@/lib/stripe";

export type CheckoutState = { error?: string };

const address = (p: string) => ({
  [`${p}_line1`]: z.string().optional(),
  [`${p}_line2`]: z.string().optional(),
  [`${p}_city`]: z.string().optional(),
  [`${p}_state`]: z.string().optional(),
  [`${p}_postalCode`]: z.string().optional(),
  [`${p}_country`]: z.string().optional(),
});

const schema = z.object({
  name: z.string().min(2, "Ingresa tu nombre."),
  email: z.email("Email no válido."),
  phone: z.string().optional(),
  billingSame: z.string().optional(),
  ...address("ship"),
  ...address("bill"),
});

function pickAddress(d: Record<string, unknown>, p: string) {
  const a = {
    line1: d[`${p}_line1`] as string | undefined,
    line2: d[`${p}_line2`] as string | undefined,
    city: d[`${p}_city`] as string | undefined,
    state: d[`${p}_state`] as string | undefined,
    postalCode: d[`${p}_postalCode`] as string | undefined,
    country: d[`${p}_country`] as string | undefined,
  };
  return Object.values(a).some(Boolean) ? a : undefined;
}

/**
 * Crea el pedido y devuelve la URL de Stripe Checkout.
 *
 * `lines` viene del localStorage del cliente, pero solo se usan los {id, qty}: los
 * precios se leen de la BD dentro de `createPendingOrder`. Un carrito manipulado no
 * puede alterar el importe cobrado.
 */
export async function startCheckout(
  lines: DraftLine[],
  couponCode: string | null,
  formData: FormData,
): Promise<CheckoutState & { url?: string }> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data as Record<string, string | undefined>;
  const { lang, tier } = await getLocaleData();

  const shipping = pickAddress(d, "ship");
  const billingSame = d.billingSame === "on";

  let order;
  try {
    order = await createPendingOrder({
      lines,
      customer: { name: d.name!, email: d.email!, phone: d.phone },
      shipping,
      billing: billingSame ? shipping : pickAddress(d, "bill"),
      couponCode: couponCode ?? undefined,
      locale: lang,
      tier,
    });
  } catch (err) {
    if (err instanceof OrderError) return { error: err.message };
    throw err;
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: order.email,
    client_reference_id: order.id,
    line_items: order.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: "usd",
        unit_amount: i.unitPriceCents,
        product_data: { name: i.nameSnapshot },
      },
    })),
    // El descuento va como cupón de Stripe, para que la página de pago muestre el
    // desglose real (subtotal, descuento, total) en vez de un importe ya rebajado.
    discounts:
      order.discountCents > 0
        ? [
            {
              coupon: (
                await getStripe().coupons.create({
                  amount_off: order.discountCents,
                  currency: "usd",
                  duration: "once",
                  name: order.couponCode ?? "Descuento",
                })
              ).id,
            },
          ]
        : undefined,
    success_url: `${siteUrl()}/pedido/${order.publicToken}?pago=ok`,
    cancel_url: `${siteUrl()}/checkout?cancelado=1`,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });

  await db
    .update(orders)
    .set({ stripeSessionId: session.id })
    .where(eq(orders.id, order.id));

  if (!session.url) return { error: "No se pudo iniciar el pago. Intenta de nuevo." };

  // Acuse de recibo fuera del camino crítico: el comprador debe irse a pagar ya, y
  // un Resend lento —o caído— no puede retrasar ni romper el redirect. `after()`
  // lo ejecuta cuando la respuesta ya salió. Si falla, queda logueado en
  // `order_emails` como cualquier otro envío y se puede reintentar desde el panel.
  after(async () => {
    try {
      await sendOrderReceived(order);
    } catch (err) {
      console.error(`[email] acuse de recibo de ${order.orderNumber}:`, err);
    }
  });

  return { url: session.url };
}
