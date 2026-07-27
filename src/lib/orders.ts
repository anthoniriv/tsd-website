// Creación y consulta de pedidos. El precio SIEMPRE se recalcula aquí, en servidor,
// desde product_prices — el carrito del navegador solo aporta {id, qty}.

import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orderEmails,
  orderItems,
  orders,
  products,
  type Order,
  type OrderEmail,
  type OrderItem,
} from "@/db/schema";
import type { LocaleCode, PriceTier } from "@/lib/i18n";
import { priceMapFor } from "@/lib/pricing";
import { consumeCoupon, validateCoupon } from "@/lib/coupons";
import { getShippingSettings } from "@/lib/settings";

export type DraftLine = { id: string; qty: number };

export type OrderWithItems = Order & { items: OrderItem[] };

/** TDS-2026-0007. El sufijo sale de un contador global, no del id (que es un uuid). */
async function nextOrderNumber(): Promise<string> {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(orders);
  return `TDS-${new Date().getFullYear()}-${String(n + 1).padStart(4, "0")}`;
}

export class OrderError extends Error {}

/**
 * Crea el pedido en estado `pending`. Devuelve el pedido y sus líneas ya valoradas.
 * Valida stock y publicación: un producto agotado o despublicado corta la compra.
 */
export async function createPendingOrder(input: {
  lines: DraftLine[];
  customer: { name: string; email: string; phone?: string };
  shipping?: Order["shipping"];
  billing?: Order["billing"];
  couponCode?: string;
  locale: LocaleCode;
  tier: PriceTier;
}): Promise<OrderWithItems> {
  const clean = input.lines.filter((l) => l.qty > 0);
  if (clean.length === 0) throw new OrderError("El carrito está vacío.");

  const ids = clean.map((l) => l.id);

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      img: products.img,
      stock: products.stock,
      status: products.status,
    })
    .from(products)
    .where(sql`${products.id} = any(${sql.param(ids)}::uuid[])`);

  const prices = await priceMapFor(ids, input.tier);
  const byId = new Map(rows.map((r) => [r.id, r]));

  const items = clean.map((line) => {
    const product = byId.get(line.id);
    if (!product || product.status !== "published") {
      throw new OrderError("Un producto del carrito ya no está disponible.");
    }
    if (product.stock < line.qty) {
      throw new OrderError(`Sin stock suficiente de "${product.name.es}".`);
    }
    const unitPriceCents = prices.get(line.id);
    if (unitPriceCents == null) {
      throw new OrderError(`El producto "${product.name.es}" no tiene precio para tu región.`);
    }
    return {
      productId: product.id,
      nameSnapshot: product.name.es,
      imgSnapshot: product.img,
      unitPriceCents,
      qty: line.qty,
    };
  });

  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.qty, 0);

  // El descuento se recalcula aquí aunque el cliente ya lo hubiera visto en el carrito:
  // el navegador solo aporta el CÓDIGO. Si el cupón caducó entre medias, el checkout falla
  // en vez de cobrar de menos.
  let discountCents = 0;
  let couponCode: string | null = null;

  if (input.couponCode?.trim()) {
    const res = await validateCoupon(input.couponCode, subtotalCents);
    if (!res.ok) throw new OrderError("El cupón ya no es válido.");
    discountCents = res.discountCents;
    couponCode = res.coupon.code;
  }

  // Costo de envío global (config del panel). Snapshot en el pedido: si luego cambia,
  // este pedido conserva lo que se cobró.
  const { shippingCents } = await getShippingSettings();

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: await nextOrderNumber(),
      publicToken: crypto.randomUUID().replaceAll("-", ""),
      email: input.customer.email.trim().toLowerCase(),
      name: input.customer.name.trim(),
      phone: input.customer.phone?.trim() || null,
      shipping: input.shipping ?? null,
      billing: input.billing ?? null,
      locale: input.locale,
      tier: input.tier,
      subtotalCents,
      discountCents,
      couponCode,
      shippingCents,
      // Sin impuestos. El envío se suma; el descuento se resta (nunca por debajo de 0).
      totalCents: Math.max(subtotalCents - discountCents, 0) + shippingCents,
      status: "pending",
    })
    .returning();

  const inserted = await db
    .insert(orderItems)
    .values(items.map((i) => ({ ...i, orderId: order.id })))
    .returning();

  return { ...order, items: inserted };
}

/** Marca el pedido como pagado y descuenta stock. Idempotente: si ya estaba pagado, no repite. */
export async function markOrderPaid(
  stripeSessionId: string,
  paymentIntent: string | null,
): Promise<Order | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, stripeSessionId))
    .limit(1);

  if (!order) return null;
  // Stripe reintenta los webhooks: si ya lo procesamos, salimos sin tocar el stock.
  if (order.status !== "pending") return order;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  for (const item of items) {
    if (!item.productId) continue;
    await db
      .update(products)
      .set({ stock: sql`greatest(${products.stock} - ${item.qty}, 0)` })
      .where(eq(products.id, item.productId));
  }

  // El uso del cupón se contabiliza al PAGAR, no al aplicarlo: un carrito abandonado no
  // debe gastar un uso. Va dentro del bloque idempotente, así un reintento del webhook
  // tampoco lo cuenta dos veces.
  if (order.couponCode) await consumeCoupon(order.couponCode);

  const [updated] = await db
    .update(orders)
    .set({ status: "paid", stripePaymentIntent: paymentIntent, updatedAt: new Date() })
    .where(eq(orders.id, order.id))
    .returning();

  return updated;
}

/** Pedido + líneas por id. Lo usa el panel para poder enviar el correo de estado. */
export async function getOrderWithItems(id: string): Promise<OrderWithItems | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function getOrderByToken(token: string): Promise<OrderWithItems | null> {
  const [order] = await db.select().from(orders).where(eq(orders.publicToken, token)).limit(1);
  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function listOrders(limit = 50) {
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

/** Historial de correos enviados (o fallidos) de un pedido, más reciente primero. */
export async function listOrderEmails(orderId: string): Promise<OrderEmail[]> {
  return db
    .select()
    .from(orderEmails)
    .where(eq(orderEmails.orderId, orderId))
    .orderBy(desc(orderEmails.createdAt));
}
