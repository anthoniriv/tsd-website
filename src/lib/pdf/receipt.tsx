// Boleta en PDF. Se usa en dos sitios: el botón "Descargar PDF" de la página del pedido
// y el adjunto del correo de confirmación — el mismo documento en ambos, para que no
// puedan divergir.
//
// @react-pdf tiene su propio motor de estilos (un subconjunto de flexbox); NO es Tailwind
// ni CSS del navegador. Por eso los colores se repiten aquí en vez de leer los tokens.

import "server-only";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Order } from "@/db/schema";
import type { OrderWithItems } from "@/lib/orders";
import { resolveLocale } from "@/lib/i18n";
import { LOGO_TDS_BLACK } from "@/lib/pdf/logo";
import { formatPrice } from "@/lib/products";
import { CONTACT, SITE } from "@/lib/site";

const C = {
  brand: "#06C5FE",
  brandDark: "#0285C9",
  text: "#102A43",
  secondary: "#486581",
  muted: "#829AB1",
  border: "#D9E2EC",
  soft: "#EEF6FA",
  green: "#5F8F14",
} as const;

const s = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 48, fontSize: 10, color: C.secondary },
  bar: { height: 6, backgroundColor: C.brand },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: "dashed",
  },
  // El PNG mide 900×350 (≈2.57:1); fijamos el ancho y dejamos que la altura salga sola.
  logo: { width: 150 },
  address: { fontSize: 8, color: C.muted, marginTop: 10, lineHeight: 1.5 },

  docTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "right",
  },
  status: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: 700,
    color: C.green,
    textAlign: "right",
    textTransform: "uppercase",
  },

  metaRow: {
    flexDirection: "row",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: "dashed",
  },
  col: { flex: 1, paddingRight: 12 },
  label: {
    fontSize: 7,
    fontWeight: 700,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  value: { fontSize: 10, color: C.secondary, lineHeight: 1.5 },
  valueStrong: { fontSize: 12, fontWeight: 900, color: C.text },

  table: { paddingHorizontal: 40, paddingTop: 18 },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: C.text,
    paddingBottom: 5,
  },
  th: { fontSize: 7, fontWeight: 700, color: C.muted, textTransform: "uppercase" },
  tr: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cName: { flex: 1 },
  cQty: { width: 45, textAlign: "center" },
  cUnit: { width: 70, textAlign: "right" },
  cTotal: { width: 70, textAlign: "right" },
  itemName: { fontSize: 10, fontWeight: 700, color: C.text },
  cell: { fontSize: 10, color: C.secondary },
  cellBold: { fontSize: 10, fontWeight: 700, color: C.text },

  totals: { alignSelf: "flex-end", width: 220, marginTop: 14 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grand: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  grandLabel: { fontSize: 11, fontWeight: 900, color: C.text },
  grandValue: { fontSize: 16, fontWeight: 900, color: C.brandDark },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    fontSize: 8,
    color: C.muted,
    textAlign: "center",
    lineHeight: 1.6,
  },
});

const COPY = {
  es: {
    receipt: "Comprobante de compra",
    orderNo: "N.º de pedido",
    date: "Fecha",
    payment: "Método de pago",
    card: "Tarjeta (Stripe)",
    contact: "Contacto",
    shipTo: "Enviar a",
    billTo: "Facturar a",
    items: "Artículos",
    qty: "Cant.",
    unit: "Precio unit.",
    total: "Total",
    subtotal: "Subtotal",
    discount: "Descuento",
    shipping: "Envío",
    freeShipping: "Gratis",
    thanks: "Gracias por tu compra.",
    status: {
      pending: "Pendiente de pago",
      paid: "Pagado",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    },
  },
  en: {
    receipt: "Purchase receipt",
    orderNo: "Order no.",
    date: "Date",
    payment: "Payment method",
    card: "Card (Stripe)",
    contact: "Contact",
    shipTo: "Ship to",
    billTo: "Bill to",
    items: "Items",
    qty: "Qty",
    unit: "Unit price",
    total: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping",
    freeShipping: "Free",
    thanks: "Thank you for your purchase.",
    status: {
      pending: "Awaiting payment",
      paid: "Paid",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  },
} as const;

function addressLines(a: Order["shipping"]): string[] {
  if (!a) return ["—"];
  return [
    a.line1,
    a.line2,
    [a.city, a.state].filter(Boolean).join(", "),
    a.postalCode,
    a.country,
  ].filter((l): l is string => Boolean(l));
}

function Receipt({ order }: { order: OrderWithItems }) {
  const lang = resolveLocale(order.locale).lang;
  const t = COPY[lang];

  const date = order.createdAt.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document
      title={`${t.receipt} ${order.orderNumber}`}
      author={SITE.fullName}
      subject={`${t.orderNo} ${order.orderNumber}`}
    >
      <Page size="A4" style={s.page}>
        <View style={s.bar} fixed />

        <View style={s.header}>
          <View>
            <Image style={s.logo} src={LOGO_TDS_BLACK} />
            <Text style={s.address}>
              {CONTACT.company}
              {"\n"}
              {CONTACT.address}
              {"\n"}
              {CONTACT.city}
            </Text>
          </View>
          <View>
            <Text style={s.docTitle}>{t.receipt}</Text>
            <Text style={s.status}>{t.status[order.status]}</Text>
          </View>
        </View>

        <View style={s.metaRow}>
          <View style={s.col}>
            <Text style={s.label}>{t.orderNo}</Text>
            <Text style={s.valueStrong}>{order.orderNumber}</Text>
          </View>
          <View style={s.col}>
            <Text style={s.label}>{t.date}</Text>
            <Text style={s.value}>{date}</Text>
          </View>
          <View style={s.col}>
            <Text style={s.label}>{t.payment}</Text>
            <Text style={s.value}>{t.card}</Text>
          </View>
        </View>

        <View style={s.metaRow}>
          <View style={s.col}>
            <Text style={s.label}>{t.contact}</Text>
            <Text style={s.value}>{order.name}</Text>
            <Text style={s.value}>{order.email}</Text>
            {order.phone && <Text style={s.value}>{order.phone}</Text>}
          </View>
          {order.shipping && (
            <View style={s.col}>
              <Text style={s.label}>{t.shipTo}</Text>
              {addressLines(order.shipping).map((l, i) => (
                <Text key={i} style={s.value}>
                  {l}
                </Text>
              ))}
            </View>
          )}
          {order.billing && (
            <View style={s.col}>
              <Text style={s.label}>{t.billTo}</Text>
              {addressLines(order.billing).map((l, i) => (
                <Text key={i} style={s.value}>
                  {l}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.th, s.cName]}>{t.items}</Text>
            <Text style={[s.th, s.cQty]}>{t.qty}</Text>
            <Text style={[s.th, s.cUnit]}>{t.unit}</Text>
            <Text style={[s.th, s.cTotal]}>{t.total}</Text>
          </View>

          {order.items.map((item) => (
            <View key={item.id} style={s.tr} wrap={false}>
              <Text style={[s.itemName, s.cName]}>{item.nameSnapshot}</Text>
              <Text style={[s.cell, s.cQty]}>{item.qty}</Text>
              <Text style={[s.cell, s.cUnit]}>{formatPrice(item.unitPriceCents)}</Text>
              <Text style={[s.cellBold, s.cTotal]}>
                {formatPrice(item.unitPriceCents * item.qty)}
              </Text>
            </View>
          ))}

          <View style={s.totals}>
            <View style={s.totalLine}>
              <Text style={s.cell}>{t.subtotal}</Text>
              <Text style={s.cellBold}>{formatPrice(order.subtotalCents)}</Text>
            </View>

            {order.discountCents > 0 && (
              <View style={s.totalLine}>
                <Text style={s.cell}>
                  {t.discount}
                  {order.couponCode ? ` (${order.couponCode})` : ""}
                </Text>
                <Text style={[s.cellBold, { color: C.green }]}>
                  −{formatPrice(order.discountCents)}
                </Text>
              </View>
            )}

            <View style={s.totalLine}>
              <Text style={s.cell}>{t.shipping}</Text>
              <Text style={s.cellBold}>
                {order.shippingCents > 0 ? formatPrice(order.shippingCents) : t.freeShipping}
              </Text>
            </View>

            <View style={s.grand}>
              <Text style={s.grandLabel}>{t.total}</Text>
              <Text style={s.grandValue}>{formatPrice(order.totalCents)}</Text>
            </View>
          </View>
        </View>

        <Text style={s.footer} fixed>
          {t.thanks} · {CONTACT.company} · {CONTACT.city}
        </Text>
      </Page>
    </Document>
  );
}

/** Buffer del PDF. Lo consumen la ruta de descarga y el adjunto del email. */
export async function renderReceiptPdf(order: OrderWithItems): Promise<Buffer> {
  return renderToBuffer(<Receipt order={order} />);
}

export function receiptFileName(order: Order): string {
  // El orderNumber ya lleva el prefijo TDS (TDS-2026-0001).
  return `Boleta-${order.orderNumber}.pdf`;
}
