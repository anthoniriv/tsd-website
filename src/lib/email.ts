// Emails transaccionales (Resend), con la identidad gráfica de TDS.
//
// En desarrollo se usa el remitente de pruebas `onboarding@resend.dev`, que SOLO entrega
// al email dueño de la cuenta de Resend. Para producción: verificar el dominio de TDS y
// definir ORDER_FROM_EMAIL.
//
// Los correos al comprador van en SU idioma (el que tenía el sitio al comprar, guardado
// en `orders.locale`). Los avisos internos a TDS van siempre en español.

import "server-only";
import { Resend } from "resend";
import { db } from "@/db";
import { orderEmails, type Order, type OrderEmail } from "@/db/schema";

type OrderStatus = Order["status"];
import type { OrderWithItems } from "@/lib/orders";
import { resolveLocale, type Lang } from "@/lib/i18n";
import { formatPrice } from "@/lib/products";
import { siteUrl } from "@/lib/stripe";
import { emailCopy } from "@/lib/email/copy";
import { receiptFileName, renderReceiptPdf } from "@/lib/pdf/receipt";
import {
  BRAND,
  FONT,
  badge,
  button,
  emailLayout,
  heading,
  panel,
  paragraph,
} from "@/lib/email/layout";

const FROM = process.env.ORDER_FROM_EMAIL ?? "TDS · Tech Diagnostic Solutions <onboarding@resend.dev>";

/**
 * Copia de los avisos internos (pedidos y consultas). Acepta varias direcciones
 * separadas por comas. Solo aplica a los correos que van a TDS, nunca a los del
 * cliente: nadie que compra debe ver a quién más se le avisa.
 */
const NOTIFY_CC = process.env.ORDER_NOTIFY_CC?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Si no hay API key, los envíos se registran en consola en vez de romper el flujo. */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/** Colores de cada estado, alineados con los del sitio. */
const STATUS_COLOR: Record<Order["status"], { bg: string; fg: string }> = {
  pending: { bg: BRAND.bgSoft, fg: BRAND.secondary },
  paid: { bg: BRAND.greenSoft, fg: BRAND.green },
  processing: { bg: BRAND.amberSoft, fg: BRAND.amber },
  shipped: { bg: "#E4F6FD", fg: BRAND.brandDark },
  delivered: { bg: BRAND.greenSoft, fg: BRAND.green },
  cancelled: { bg: "#FBECEE", fg: BRAND.red },
};

function langOf(order: Order): Lang {
  return resolveLocale(order.locale).lang;
}

function trackUrl(order: Order): string {
  return `${siteUrl()}/pedido/${order.publicToken}`;
}

function addressHtml(a: Order["shipping"]): string {
  if (!a) return "—";
  return [
    a.line1,
    a.line2,
    [a.city, a.state].filter(Boolean).join(", "),
    a.postalCode,
    a.country,
  ]
    .filter(Boolean)
    .join("<br>");
}

/** Tabla de líneas + totales. Es el corazón de todos los correos de pedido. */
function itemsTable(order: OrderWithItems, lang: Lang): string {
  const t = emailCopy(lang);

  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-family:${FONT};font-size:14px;color:${BRAND.text}">
          <strong>${i.nameSnapshot}</strong>
          <span style="color:${BRAND.muted}"> · ${t.qty} ${i.qty}</span>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-family:${FONT};font-size:14px;font-weight:700;color:${BRAND.text};white-space:nowrap">
          ${formatPrice(i.unitPriceCents * i.qty)}
        </td>
      </tr>`,
    )
    .join("");

  const totalRow = (label: string, value: string, opts?: { big?: boolean; color?: string }) => `
      <tr>
        <td style="padding:${opts?.big ? "12px 0 0" : "8px 0 0"};font-family:${FONT};font-size:${opts?.big ? "15px" : "14px"};font-weight:${opts?.big ? "800" : "400"};color:${opts?.big ? BRAND.text : BRAND.secondary}">${label}</td>
        <td align="right" style="padding:${opts?.big ? "12px 0 0" : "8px 0 0"};font-family:${FONT};font-size:${opts?.big ? "20px" : "14px"};font-weight:800;color:${opts?.color ?? BRAND.text};white-space:nowrap">${value}</td>
      </tr>`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px">
      <tr>
        <td colspan="2" style="padding-bottom:8px;font-family:${FONT};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:${BRAND.muted};border-bottom:2px solid ${BRAND.text}">
          ${t.items}
        </td>
      </tr>
      ${rows}
      ${totalRow(t.subtotal, formatPrice(order.subtotalCents))}
      ${
        order.discountCents > 0
          ? totalRow(
              `${t.discount}${order.couponCode ? ` (${order.couponCode})` : ""}`,
              `−${formatPrice(order.discountCents)}`,
              { color: BRAND.green },
            )
          : ""
      }
      ${totalRow(
        t.shipping,
        order.shippingCents > 0 ? formatPrice(order.shippingCents) : t.freeShipping,
      )}
      ${totalRow(t.total, formatPrice(order.totalCents), { big: true, color: BRAND.brandDark })}
    </table>
    ${order.shippingCents === 0 ? paragraph(`<strong>${t.shipping}:</strong> ${t.shippingNotice}`) : ""}`;
}

/** Cabecera común: nº de pedido, fecha y estado. */
function orderMeta(order: Order, lang: Lang, statusLabel: string): string {
  const t = emailCopy(lang);
  const c = STATUS_COLOR[order.status];
  const date = order.createdAt.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${BRAND.bgSoft};border-radius:12px">
      <tr>
        <td style="padding:16px 18px;font-family:${FONT}">
          <p style="margin:0 0 2px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:${BRAND.muted}">${t.orderNo}</p>
          <p style="margin:0;font-size:18px;font-weight:900;color:${BRAND.text}">${order.orderNumber}</p>
          <p style="margin:6px 0 0;font-size:12px;color:${BRAND.muted}">${t.date}: ${date}</p>
        </td>
        <td align="right" style="padding:16px 18px">
          ${badge(statusLabel, c.bg, c.fg)}
        </td>
      </tr>
    </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Al comprador
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Acuse de recibo, antes de pagar. Se manda al crear el pedido, cuando el
 * comprador todavía está en la pasarela de Stripe: sin esto, un pago que tarda o
 * que falla lo deja sin ninguna señal de que su pedido existe.
 *
 * No lleva la boleta adjunta a propósito — todavía no hay compra que documentar.
 */
export async function sendOrderReceived(order: OrderWithItems) {
  const lang = langOf(order);
  const t = emailCopy(lang);

  const content = `
    ${heading(t.receivedHeading)}
    ${paragraph(`${t.greeting(order.name)} ${t.receivedBody}`)}
    ${orderMeta(order, lang, statusLabel(order.status, lang))}
    ${itemsTable(order, lang)}
    ${button(t.trackOrder, trackUrl(order))}
    ${paragraph(`<span style="font-size:13px;color:${BRAND.muted}">${t.receivedHint}</span>`)}
  `;

  const result = await send({
    to: order.email,
    subject: t.receivedSubject(order.orderNumber),
    html: emailLayout({
      title: t.receivedSubject(order.orderNumber),
      preheader: `${t.total}: ${formatPrice(order.totalCents)}`,
      content,
    }),
  });
  return logOrderEmail(order.id, "received", order.email, result);
}

/** Confirmación de compra: el correo más importante. Lleva el link de seguimiento. */
export async function sendOrderConfirmation(order: OrderWithItems) {
  const lang = langOf(order);
  const t = emailCopy(lang);

  const addresses = [
    order.shipping && panel(t.shipTo, addressHtml(order.shipping)),
    order.billing && panel(t.billTo, addressHtml(order.billing)),
  ]
    .filter(Boolean)
    .join("");

  const content = `
    ${heading(t.confirmHeading)}
    ${paragraph(`${t.greeting(order.name)} ${t.confirmBody}`)}
    ${orderMeta(order, lang, statusLabel(order.status, lang))}
    ${itemsTable(order, lang)}
    ${addresses}
    ${button(t.trackOrder, trackUrl(order))}
    ${paragraph(`<span style="font-size:13px;color:${BRAND.muted}">${t.trackHint}</span>`)}
  `;

  // La boleta va adjunta: el comprador la tiene aunque nunca abra el link.
  let attachments;
  try {
    const pdf = await renderReceiptPdf(order);
    attachments = [{ filename: receiptFileName(order), content: pdf.toString("base64") }];
  } catch (err) {
    // Un fallo generando el PDF no puede impedir la confirmación de una compra pagada.
    console.error(`[email] no se pudo adjuntar la boleta de ${order.orderNumber}:`, err);
  }

  const result = await send({
    to: order.email,
    subject: t.confirmSubject(order.orderNumber),
    html: emailLayout({
      title: t.confirmSubject(order.orderNumber),
      preheader: `${t.total}: ${formatPrice(order.totalCents)}`,
      content,
    }),
    attachments,
  });
  return logOrderEmail(order.id, "confirmation", order.email, result);
}

/** Aviso de cambio de estado (pagado, procesando, enviado, entregado, cancelado). */
export async function sendOrderStatusUpdate(order: OrderWithItems) {
  const lang = langOf(order);
  const t = emailCopy(lang);
  const s = t.status[order.status];

  const content = `
    ${heading(s.heading)}
    ${paragraph(`${t.greeting(order.name)} ${s.body}`)}
    ${orderMeta(order, lang, statusLabel(order.status, lang))}
    ${itemsTable(order, lang)}
    ${button(t.trackOrder, trackUrl(order))}
    ${paragraph(`<span style="font-size:13px;color:${BRAND.muted}">${t.help}</span>`)}
  `;

  const result = await send({
    to: order.email,
    subject: s.subject(order.orderNumber),
    html: emailLayout({ title: s.heading, preheader: s.body, content }),
  });
  return logOrderEmail(order.id, "status_update", order.email, result);
}

function statusLabel(status: OrderStatus, lang: Lang): string {
  const map = {
    es: {
      pending: "Pendiente de pago",
      paid: "Pagado",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    },
    en: {
      pending: "Awaiting payment",
      paid: "Paid",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  } as const;
  return map[lang][status];
}

// ─────────────────────────────────────────────────────────────────────────────
// A TDS (interno, siempre en español)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendOrderNotification(order: OrderWithItems) {
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!to) return;

  const content = `
    ${heading(`Nuevo pedido · ${formatPrice(order.totalCents)}`)}
    ${paragraph(`Entró un pedido nuevo en la tienda.`)}
    ${orderMeta(order, "es", statusLabel(order.status, "es"))}
    ${panel(
      "Cliente",
      `<strong style="color:${BRAND.text}">${order.name}</strong><br>
       <a href="mailto:${order.email}" style="color:${BRAND.brandDark};text-decoration:none">${order.email}</a>
       ${order.phone ? `<br>${order.phone}` : ""}<br>
       <span style="color:${BRAND.muted};font-size:12px">Región: ${order.locale} · tier ${order.tier}</span>`,
    )}
    ${itemsTable(order, "es")}
    ${order.shipping ? panel("Enviar a", addressHtml(order.shipping)) : ""}
    ${order.billing ? panel("Facturar a", addressHtml(order.billing)) : ""}
    ${button("Gestionar en el panel", `${siteUrl()}/admin/pedidos`)}
  `;

  const result = await send({
    to,
    cc: NOTIFY_CC,
    subject: `🛒 Nuevo pedido ${order.orderNumber} — ${formatPrice(order.totalCents)}`,
    html: emailLayout({
      title: `Nuevo pedido ${order.orderNumber}`,
      preheader: `${order.name} · ${formatPrice(order.totalCents)}`,
      content,
    }),
  });
  return logOrderEmail(order.id, "notification", to, result);
}

export async function sendContactNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!to) return;

  const content = `
    ${heading("Nueva consulta de contacto")}
    ${panel(
      "De",
      `<strong style="color:${BRAND.text}">${escapeHtml(input.name)}</strong><br>
       <a href="mailto:${escapeHtml(input.email)}" style="color:${BRAND.brandDark};text-decoration:none">${escapeHtml(input.email)}</a>`,
    )}
    ${panel("Asunto", escapeHtml(input.subject))}
    ${panel("Mensaje", escapeHtml(input.message).replace(/\n/g, "<br>"))}
    ${button("Responder", `mailto:${encodeURIComponent(input.email)}`)}
    ${paragraph(
      `<span style="font-size:13px;color:${BRAND.muted}">También queda registrada en la <a href="${siteUrl()}/admin/contacto" style="color:${BRAND.brandDark}">bandeja del panel</a>.</span>`,
    )}
  `;

  await send({
    to,
    cc: NOTIFY_CC,
    subject: `✉️ Nueva consulta: ${input.subject}`,
    html: emailLayout({
      title: `Nueva consulta: ${input.subject}`,
      preheader: `${input.name} — ${input.message.slice(0, 90)}`,
      content,
    }),
  });
}

/** Acuse de recibo al visitante que escribe por el formulario. */
export async function sendContactAck(input: { name: string; email: string; lang: Lang }) {
  const es = input.lang === "es";

  const content = `
    ${heading(es ? "Recibimos tu mensaje" : "We got your message")}
    ${paragraph(
      es
        ? `Hola ${escapeHtml(input.name)}, gracias por escribirnos. Un asesor de TDS revisará tu consulta y te responderá en las próximas horas hábiles.`
        : `Hi ${escapeHtml(input.name)}, thanks for reaching out. A TDS advisor will review your enquiry and get back to you within the next business hours.`,
    )}
    ${paragraph(
      es
        ? "Mientras tanto, puedes explorar nuestro catálogo de equipos y kits de diagnóstico Jaltest."
        : "In the meantime, feel free to browse our Jaltest diagnostic equipment and kits.",
    )}
    ${button(es ? "Ver la tienda" : "Browse the shop", `${siteUrl()}/tienda`)}
  `;

  await send({
    to: input.email,
    subject: es ? "Recibimos tu consulta · TDS" : "We received your enquiry · TDS",
    html: emailLayout({
      title: es ? "Recibimos tu consulta" : "We received your enquiry",
      preheader: es
        ? "Un asesor de TDS te responderá pronto."
        : "A TDS advisor will get back to you soon.",
      content,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

/** El contenido enviado por el visitante se interpola en HTML: hay que escaparlo. */
function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Un fallo de email NUNCA debe tumbar un pedido ya pagado: se registra y se sigue.
 *
 * Ojo: el SDK de Resend NO lanza en los errores de la API — los devuelve en `{ error }`.
 * Sin comprobarlo, un envío rechazado (dominio sin verificar, destinatario no permitido
 * en modo desarrollo) pasaría totalmente desapercibido.
 */
type SendResult = { ok: boolean; error?: string };

async function send(msg: {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}): Promise<SendResult> {
  if (!resend) {
    console.warn(`[email] sin RESEND_API_KEY — no enviado: "${msg.subject}" → ${msg.to}`);
    return { ok: false, error: "RESEND_API_KEY no configurada." };
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, ...msg });
    if (error) {
      console.error(`[email] rechazado "${msg.subject}" → ${msg.to}:`, error.message);
      return { ok: false, error: error.message };
    }
    console.info(`[email] enviado "${msg.subject}" → ${msg.to} (${data?.id})`);
    return { ok: true };
  } catch (err) {
    console.error(`[email] fallo de red al enviar "${msg.subject}" a ${msg.to}:`, err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Registra en `order_emails` el resultado de un envío. Cada intento (incluidos los
 * reintentos desde el panel) es una fila nueva → historial completo por pedido.
 * Nunca lanza: un fallo al registrar no debe tumbar el flujo de compra.
 */
async function logOrderEmail(
  orderId: string,
  kind: OrderEmail["kind"],
  recipient: string,
  result: SendResult,
): Promise<SendResult> {
  try {
    await db.insert(orderEmails).values({
      orderId,
      kind,
      recipient,
      status: result.ok ? "sent" : "failed",
      error: result.error ?? null,
    });
  } catch (err) {
    console.error(`[email] no se pudo registrar el envío (${kind}) del pedido ${orderId}:`, err);
  }
  return result;
}
