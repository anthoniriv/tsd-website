// Schema Drizzle — fuente de verdad del catálogo, pedidos y admin.
//
// Los textos localizados se guardan como JSONB `{ es, en }`, que mapea 1:1 al tipo
// `Localized<T>` de `@/lib/i18n`. Así los componentes que ya hacen `item.name[lang]`
// no cambian al pasar de data estática a BD.
//
// Dinero: siempre `*_cents` (integer, USD). Nunca float.

import type { Lang, PriceTier } from "@/lib/i18n";
import type { AccentKey } from "@/lib/products";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Alias del tipo localizado, para tipar las columnas jsonb. */
type Loc<T> = Record<Lang, T>;

export type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export const productKind = pgEnum("product_kind", ["jaltest", "hardware"]);
// `renewal` = renovación de licencia · `upgrade` = ampliación de cobertura.
export const productCategory = pgEnum("product_category", [
  "laptop",
  "cable",
  "finder",
  "renewal",
  "upgrade",
]);
export const productStatus = pgEnum("product_status", ["draft", "published"]);
// Comercialmente solo hay dos mercados: `us` (USA/Canadá) y `world` (resto).
// `latam` y `es` quedan en el enum porque los pedidos históricos los referencian
// —un pedido guarda el tier con el que se cotizó— pero la app ya no los emite.
export const priceTier = pgEnum("price_tier", ["us", "latam", "es", "world"]);
export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export const adminRole = pgEnum("admin_role", ["owner", "admin", "editor"]);
export const couponKind = pgEnum("coupon_kind", ["percent", "fixed"]);
/** Tipo de correo transaccional que se registra en `order_emails`. */
export const orderEmailKind = pgEnum("order_email_kind", [
  // Al crear el pedido, antes de pagar: "lo registramos, estamos validando el pago".
  "received",
  "confirmation",
  "status_update",
  "notification",
]);
export const orderEmailStatus = pgEnum("order_email_status", ["sent", "failed"]);

// ─────────────────────────────────────────────────────────────────────────────
// Cupones
// ─────────────────────────────────────────────────────────────────────────────

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Se guarda SIEMPRE en mayúsculas; la comparación es exacta. */
    code: text("code").notNull(),
    kind: couponKind("kind").notNull(),
    /** percent → 1..100 · fixed → centavos de descuento. */
    value: integer("value").notNull(),
    /** Compra mínima para poder aplicarlo (centavos). 0 = sin mínimo. */
    minSubtotalCents: integer("min_subtotal_cents").notNull().default(0),
    /** null = usos ilimitados. */
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("coupons_code_uniq").on(t.code)],
);

// ─────────────────────────────────────────────────────────────────────────────
// Catálogo
// ─────────────────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    kind: productKind("kind").notNull(),
    sku: text("sku"),

    // Solo hardware. Las líneas Jaltest usan `accentKey`.
    category: productCategory("category"),
    // Solo jaltest: cv | ohw | agv | marine | mhe. Es la clave del sistema de acentos.
    accentKey: text("accent_key").$type<AccentKey>(),
    brand: text("brand"),
    variant: text("variant"), // "CV", "OHW"…
    segment: text("segment"), // "Commercial Vehicles" (no localizado, va en inglés)

    name: jsonb("name").$type<Loc<string>>().notNull(),
    blurb: jsonb("blurb").$type<Loc<string>>(),
    description: jsonb("description").$type<Loc<string[]>>(), // párrafos

    img: text("img").notNull(),
    vehicleImg: text("vehicle_img"),
    logo: text("logo"),
    gallery: jsonb("gallery").$type<string[]>().notNull().default(sql`'[]'::jsonb`),

    stock: integer("stock").notNull().default(0),
    status: productStatus("status").notNull().default("published"),
    featured: boolean("featured").notNull().default(false),
    sort: integer("sort").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_uniq").on(t.slug),
    index("products_kind_status_idx").on(t.kind, t.status),
    index("products_category_idx").on(t.category),
  ],
);

/** Precio explícito por tier regional. Sin multiplicadores: el admin fija cada uno. */
export const productPrices = pgTable(
  "product_prices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tier: priceTier("tier").notNull(),
    amountCents: integer("amount_cents").notNull(),
  },
  (t) => [uniqueIndex("product_prices_product_tier_uniq").on(t.productId, t.tier)],
);

/** Slides del hero + banners editables desde el admin. */
export const banners = pgTable(
  "banners",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(), // "home-hero" | "contact" …
    img: text("img").notNull(),
    title: jsonb("title").$type<Loc<string>>(),
    subtitle: jsonb("subtitle").$type<Loc<string>>(),
    ctaLabel: jsonb("cta_label").$type<Loc<string>>(),
    ctaHref: text("cta_href"),
    sort: integer("sort").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("banners_key_sort_idx").on(t.key, t.sort)],
);

// ─────────────────────────────────────────────────────────────────────────────
// Pedidos (checkout como invitado — no hay cuentas de cliente)
// ─────────────────────────────────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull(), // legible: TDS-2026-0001
    /** Token público del link de seguimiento enviado por email. Sustituye al login. */
    publicToken: text("public_token").notNull(),

    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    shipping: jsonb("shipping").$type<Address>(),
    /** null = se facturó a la dirección de envío. */
    billing: jsonb("billing").$type<Address>(),

    locale: text("locale").$type<Lang>().notNull(), // filas antiguas traen "en-US"/"en-LATAM"
    tier: priceTier("tier").notNull(), // tier con el que se cotizó el pedido

    subtotalCents: integer("subtotal_cents").notNull(),
    /** Descuento aplicado, ya recalculado en servidor. Snapshot: si el cupón cambia
     *  después, el pedido conserva lo que realmente se descontó. */
    discountCents: integer("discount_cents").notNull().default(0),
    couponCode: text("coupon_code"),
    /** Costo de envío cobrado, snapshot de la config global al momento de comprar. */
    shippingCents: integer("shipping_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("USD"),

    status: orderStatus("status").notNull().default("pending"),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntent: text("stripe_payment_intent"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_number_uniq").on(t.orderNumber),
    uniqueIndex("orders_token_uniq").on(t.publicToken),
    index("orders_status_created_idx").on(t.status, t.createdAt),
    index("orders_stripe_session_idx").on(t.stripeSessionId),
  ],
);

/**
 * Snapshot: nombre y precio se congelan al comprar. Si el catálogo cambia (o el
 * producto se borra), el pedido histórico sigue siendo fiel.
 */
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    nameSnapshot: text("name_snapshot").notNull(),
    imgSnapshot: text("img_snapshot"),
    unitPriceCents: integer("unit_price_cents").notNull(),
    qty: integer("qty").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/**
 * Log de correos transaccionales de un pedido. Cada intento de envío (incluido un
 * reintento manual desde el admin) es una fila nueva → historial completo.
 */
export const orderEmails = pgTable(
  "order_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    kind: orderEmailKind("kind").notNull(),
    status: orderEmailStatus("status").notNull(),
    /** Destinatario efectivo (comprador o dirección interna de aviso). */
    recipient: text("recipient"),
    /** Mensaje de error de Resend cuando `status = failed`. */
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("order_emails_order_idx").on(t.orderId, t.createdAt)],
);

// ─────────────────────────────────────────────────────────────────────────────
// Ajustes globales de la tienda (fila única)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuración global editable desde el admin. Se usa como singleton: existe una
 * sola fila (`id = "global"`) que el seed crea y el panel actualiza.
 */
export const appSettings = pgTable("app_settings", {
  id: text("id").primaryKey().default("global"),
  /** Costo de envío en centavos que se suma al total y se cobra vía Stripe. */
  shippingCents: integer("shipping_cents").notNull().default(0),
  /** Tiempo estimado de entrega, localizado (ej. "3–5 días hábiles"). */
  shippingEta: jsonb("shipping_eta").$type<Loc<string>>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Bandeja de contacto
// ─────────────────────────────────────────────────────────────────────────────

export const contactRequests = pgTable(
  "contact_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    locale: text("locale").$type<Lang>().notNull(), // filas antiguas traen "en-US"/"en-LATAM"
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contact_requests_read_created_idx").on(t.read, t.createdAt)],
);

// ─────────────────────────────────────────────────────────────────────────────
// Auth del admin (sesión por cookie httpOnly; no hay cuentas de cliente)
// ─────────────────────────────────────────────────────────────────────────────

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: adminRole("role").notNull().default("editor"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("admin_users_email_uniq").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // token opaco, va en la cookie httpOnly
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/**
 * Contador atómico de los números de pedido (TDS-2026-0001). Fila única que
 * `nextOrderNumber()` incrementa con un upsert, para no repetir números bajo concurrencia.
 */
export const orderSequence = pgTable("order_sequence", {
  id: text("id").primaryKey(),
  value: integer("value").notNull().default(0),
});

/**
 * Rate limiter respaldado por la BD (funciona en serverless con varias instancias).
 * Una fila por clave (IP+acción); la ventana se reinicia dentro del propio upsert.
 */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

// ─────────────────────────────────────────────────────────────────────────────
// Relaciones
// ─────────────────────────────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ many }) => ({
  prices: many(productPrices),
}));

export const productPricesRelations = relations(productPrices, ({ one }) => ({
  product: one(products, { fields: [productPrices.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  emails: many(orderEmails),
}));

export const orderEmailsRelations = relations(orderEmails, ({ one }) => ({
  order: one(orders, { fields: [orderEmails.orderId], references: [orders.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(adminUsers, { fields: [sessions.userId], references: [adminUsers.id] }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Tipos inferidos (los consume la capa de datos y el admin)
// ─────────────────────────────────────────────────────────────────────────────

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductPrice = typeof productPrices.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderEmail = typeof orderEmails.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
export type ContactRequest = typeof contactRequests.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type OrderSequence = typeof orderSequence.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;

/** Producto con sus 3 precios ya resueltos a un mapa por tier. */
export type ProductWithPrices = Product & { prices: Record<PriceTier, number> };
