// Webhook de Stripe. Es la ÚNICA fuente de verdad de que un pedido está pagado:
// el redirect a success_url puede no ocurrir (el usuario cierra la pestaña), pero el
// webhook siempre llega. Por eso el stock y el email cuelgan de aquí, no del redirect.

import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems } from "@/db/schema";
import { markOrderPaid } from "@/lib/orders";
import { sendOrderConfirmation, sendOrderNotification } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe] falta STRIPE_WEBHOOK_SECRET");
    return new Response("Webhook no configurado", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Sin firma", { status: 400 });

  // El cuerpo debe leerse CRUDO: la firma se calcula sobre los bytes exactos.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("[stripe] firma inválida:", err);
    return new Response("Firma inválida", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const order = await markOrderPaid(
      session.id,
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    );

    if (!order) {
      console.error(`[stripe] sesión ${session.id} sin pedido asociado`);
      // 200 igualmente: reintentar no lo va a arreglar.
      return Response.json({ received: true });
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const full = { ...order, items };

    // Los emails no bloquean: si fallan, el pedido ya está pagado y visible en el panel.
    await Promise.all([sendOrderConfirmation(full), sendOrderNotification(full)]);
  }

  return Response.json({ received: true });
}
