// Emails transaccionales (Resend). En desarrollo se usa el remitente de pruebas
// `onboarding@resend.dev`, que solo entrega al email dueño de la cuenta de Resend.
// Para producción: verificar el dominio de TDS y cambiar FROM.

import "server-only";
import { Resend } from "resend";
import type { OrderWithItems } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { siteUrl } from "@/lib/stripe";

const FROM = process.env.ORDER_FROM_EMAIL ?? "TDS <onboarding@resend.dev>";

/** Si no hay API key, los envíos se registran en consola en vez de romper el flujo. */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function itemsTable(order: OrderWithItems) {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #E5EDF3">
          ${i.nameSnapshot} <span style="color:#829AB1">× ${i.qty}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #E5EDF3;text-align:right;font-weight:700">
          ${formatPrice(i.unitPriceCents * i.qty)}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows}
      <tr>
        <td style="padding:12px 0;font-weight:800">Total</td>
        <td style="padding:12px 0;text-align:right;font-weight:800;font-size:18px;color:#0285C9">
          ${formatPrice(order.totalCents)}
        </td>
      </tr>
    </table>`;
}

/** Confirmación al comprador, con el link de seguimiento (sustituye a tener cuenta). */
export async function sendOrderConfirmation(order: OrderWithItems) {
  const trackUrl = `${siteUrl()}/pedido/${order.publicToken}`;

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#102A43">
      <h1 style="font-size:22px;margin:0 0 4px">¡Gracias por tu compra, ${order.name}!</h1>
      <p style="color:#486581;margin:0 0 24px">
        Tu pedido <strong>${order.orderNumber}</strong> fue recibido y ya lo estamos procesando.
      </p>
      ${itemsTable(order)}
      <p style="margin:28px 0">
        <a href="${trackUrl}" style="background:#06C5FE;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;display:inline-block">
          Ver estado del pedido
        </a>
      </p>
      <p style="color:#829AB1;font-size:12px;margin:0">
        Guarda este enlace: es tu acceso al seguimiento del pedido.<br>
        Tech Diagnostic Solutions · Doral, FL
      </p>
    </div>`;

  await send({
    to: order.email,
    subject: `Pedido ${order.orderNumber} confirmado · TDS`,
    html,
  });
}

/** Aviso interno a TDS de que entró un pedido. */
export async function sendOrderNotification(order: OrderWithItems) {
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!to) return;

  await send({
    to,
    subject: `Nuevo pedido ${order.orderNumber} — ${formatPrice(order.totalCents)}`,
    html: `
      <div style="font-family:system-ui,sans-serif;color:#102A43">
        <h2>Nuevo pedido ${order.orderNumber}</h2>
        <p><strong>${order.name}</strong> · ${order.email} ${order.phone ? `· ${order.phone}` : ""}</p>
        <p>Región: ${order.locale} (tier ${order.tier})</p>
        ${itemsTable(order)}
        <p><a href="${siteUrl()}/admin/pedidos">Ver en el panel</a></p>
      </div>`,
  });
}

/** Aviso de nueva solicitud desde el formulario de contacto. */
export async function sendContactNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!to) return;

  await send({
    to,
    subject: `Nueva consulta: ${input.subject}`,
    html: `
      <div style="font-family:system-ui,sans-serif;color:#102A43">
        <h2>${input.subject}</h2>
        <p><strong>${input.name}</strong> · ${input.email}</p>
        <p style="white-space:pre-wrap">${input.message}</p>
        <p><a href="${siteUrl()}/admin/contacto">Ver en el panel</a></p>
      </div>`,
  });
}

/**
 * Un fallo de email NUNCA debe tumbar un pedido ya pagado: se registra y se sigue.
 * El pedido queda igualmente en el panel.
 *
 * Ojo: el SDK de Resend NO lanza en los errores de la API — los devuelve en
 * `{ error }`. Sin comprobarlo, un envío rechazado (dominio sin verificar, destinatario
 * no permitido en modo desarrollo) pasaría totalmente desapercibido.
 */
async function send(msg: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn(`[email] sin RESEND_API_KEY — no enviado: "${msg.subject}" → ${msg.to}`);
    return;
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, ...msg });
    if (error) {
      console.error(`[email] rechazado "${msg.subject}" → ${msg.to}:`, error.message);
      return;
    }
    console.info(`[email] enviado "${msg.subject}" → ${msg.to} (${data?.id})`);
  } catch (err) {
    console.error(`[email] fallo de red al enviar "${msg.subject}" a ${msg.to}:`, err);
  }
}
