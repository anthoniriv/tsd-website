"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getLocaleData } from "@/lib/i18n.server";
import { createPendingOrder, OrderError, type DraftLine } from "@/lib/orders";
import { getStripe, siteUrl } from "@/lib/stripe";

export type CheckoutState = { error?: string };

const schema = z.object({
  name: z.string().min(2, "Ingresa tu nombre."),
  email: z.email("Email no válido."),
  phone: z.string().optional(),
  line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Crea el pedido y devuelve la URL de Stripe Checkout.
 *
 * `lines` viene del localStorage del cliente, pero solo se usan los {id, qty}: los
 * precios se leen de la BD dentro de `createPendingOrder`. Un carrito manipulado no
 * puede alterar el importe cobrado.
 */
export async function startCheckout(
  lines: DraftLine[],
  formData: FormData,
): Promise<CheckoutState & { url?: string }> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;
  const { code, tier } = await getLocaleData();

  let order;
  try {
    order = await createPendingOrder({
      lines,
      customer: { name: d.name, email: d.email, phone: d.phone },
      shipping: {
        line1: d.line1,
        city: d.city,
        state: d.state,
        postalCode: d.postalCode,
        country: d.country,
      },
      locale: code,
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
    success_url: `${siteUrl()}/pedido/${order.publicToken}?pago=ok`,
    cancel_url: `${siteUrl()}/checkout?cancelado=1`,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });

  await db
    .update(orders)
    .set({ stripeSessionId: session.id })
    .where(eq(orders.id, order.id));

  if (!session.url) return { error: "No se pudo iniciar el pago. Intenta de nuevo." };
  return { url: session.url };
}
