// Textos de los correos, por idioma. Van aparte del diccionario de la web (`i18n.ts`)
// porque el correo tiene su propio tono y su propia estructura: no comparte pantallas.

import type { Lang } from "@/lib/i18n";
import type { Order } from "@/db/schema";

type StatusCopy = { subject: string; heading: string; body: string };

const es = {
  greeting: (name: string) => `Hola ${name},`,
  orderNo: "N.º de pedido",
  date: "Fecha",
  items: "Artículos",
  qty: "Cant.",
  subtotal: "Subtotal",
  discount: "Descuento",
  shipping: "Envío",
  freeShipping: "Gratis",
  total: "Total",
  shipTo: "Enviar a",
  billTo: "Facturar a",
  contact: "Contacto",
  trackOrder: "Ver estado del pedido",
  trackHint:
    "Guarda este enlace: es tu acceso al seguimiento del pedido, no necesitas crear una cuenta.",
  help: "¿Alguna duda? Escríbenos y te ayudamos.",

  confirmSubject: (n: string) => `Pedido ${n} confirmado · TDS`,
  confirmHeading: "¡Gracias por tu compra!",
  confirmBody:
    "Hemos recibido tu pedido y ya lo estamos preparando. Aquí tienes el detalle:",

  status: {
    paid: {
      subject: (n: string) => `Pago confirmado · Pedido ${n}`,
      heading: "Tu pago se confirmó",
      body: "Ya tenemos tu pago. En breve empezamos a preparar tu pedido.",
    },
    processing: {
      subject: (n: string) => `Preparando tu pedido ${n}`,
      heading: "Estamos preparando tu pedido",
      body: "Tu pedido está en preparación. Te avisamos en cuanto salga de nuestro almacén.",
    },
    shipped: {
      subject: (n: string) => `Tu pedido ${n} va en camino`,
      heading: "¡Tu pedido va en camino!",
      body: "Tu pedido salió de nuestro almacén en Doral, FL. Pronto lo tendrás contigo.",
    },
    delivered: {
      subject: (n: string) => `Pedido ${n} entregado`,
      heading: "Tu pedido fue entregado",
      body: "Esperamos que todo esté en orden. Si necesitas soporte con la instalación, escríbenos.",
    },
    cancelled: {
      subject: (n: string) => `Pedido ${n} cancelado`,
      heading: "Tu pedido fue cancelado",
      body: "Si no esperabas esta cancelación o necesitas ayuda, contáctanos y lo revisamos.",
    },
    pending: {
      subject: (n: string) => `Pedido ${n} pendiente de pago`,
      heading: "Tu pedido está pendiente de pago",
      body: "Aún no hemos recibido el pago de este pedido.",
    },
  } satisfies Record<Order["status"], { subject: (n: string) => string; heading: string; body: string }>,
};

const en: typeof es = {
  greeting: (name: string) => `Hi ${name},`,
  orderNo: "Order no.",
  date: "Date",
  items: "Items",
  qty: "Qty",
  subtotal: "Subtotal",
  discount: "Discount",
  shipping: "Shipping",
  freeShipping: "Free",
  total: "Total",
  shipTo: "Ship to",
  billTo: "Bill to",
  contact: "Contact",
  trackOrder: "Track your order",
  trackHint:
    "Save this link: it's your access to order tracking — no account needed.",
  help: "Questions? Write to us and we'll help.",

  confirmSubject: (n: string) => `Order ${n} confirmed · TDS`,
  confirmHeading: "Thank you for your purchase!",
  confirmBody: "We've received your order and we're getting it ready. Here's the detail:",

  status: {
    paid: {
      subject: (n: string) => `Payment confirmed · Order ${n}`,
      heading: "Your payment is confirmed",
      body: "We've got your payment. We'll start preparing your order shortly.",
    },
    processing: {
      subject: (n: string) => `Preparing your order ${n}`,
      heading: "We're preparing your order",
      body: "Your order is being prepared. We'll let you know as soon as it leaves our warehouse.",
    },
    shipped: {
      subject: (n: string) => `Your order ${n} is on its way`,
      heading: "Your order is on its way!",
      body: "Your order has left our warehouse in Doral, FL. It'll be with you soon.",
    },
    delivered: {
      subject: (n: string) => `Order ${n} delivered`,
      heading: "Your order was delivered",
      body: "We hope everything is in order. If you need help with setup, just write to us.",
    },
    cancelled: {
      subject: (n: string) => `Order ${n} cancelled`,
      heading: "Your order was cancelled",
      body: "If you weren't expecting this or need help, contact us and we'll look into it.",
    },
    pending: {
      subject: (n: string) => `Order ${n} awaiting payment`,
      heading: "Your order is awaiting payment",
      body: "We haven't received the payment for this order yet.",
    },
  },
};

export type EmailCopy = typeof es;

export function emailCopy(lang: Lang): EmailCopy {
  return lang === "en" ? en : es;
}

export type { StatusCopy };
