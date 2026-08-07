"use server";

// Server Actions del panel. Toda escritura pasa por aquí: valida con zod, exige rol,
// escribe en Postgres y revalida las rutas públicas que muestran esa data.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { ORDER_STATUSES } from "@/lib/admin-labels";
import {
  adminUsers,
  appSettings,
  banners,
  contactRequests,
  coupons,
  orders,
  productPrices,
  products,
} from "@/db/schema";
import { SETTINGS_ID } from "@/lib/settings";
import { hashPassword, login, logout, requireRole } from "@/lib/auth";
import { checkRateLimit, clientIp, RateLimitError } from "@/lib/rate-limit";
import {
  sendOrderConfirmation,
  sendOrderNotification,
  sendOrderReceived,
  sendOrderStatusUpdate,
} from "@/lib/email";
import { getOrderWithItems } from "@/lib/orders";
import type { OrderEmail } from "@/db/schema";

export type ActionState = { error?: string; ok?: boolean };

/** Rutas públicas que dependen del catálogo/banners. */
function revalidatePublic() {
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────────────────────────────────────────
// Sesión
// ─────────────────────────────────────────────────────────────────────────────

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1) })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { error: "Datos inválidos." };

  // Anti brute-force: límite por IP y por cuenta. El mensaje no revela cuál saltó.
  try {
    await checkRateLimit(`login:ip:${await clientIp()}`, 10, 900);
    await checkRateLimit(`login:email:${parsed.data.email.toLowerCase()}`, 5, 900);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return { error: "Demasiados intentos. Espera unos minutos." };
    }
    throw err;
  }

  const user = await login(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Email o contraseña incorrectos." };

  const next = String(formData.get("next") || "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ─────────────────────────────────────────────────────────────────────────────
// Productos
// ─────────────────────────────────────────────────────────────────────────────

const localized = z.object({ es: z.string(), en: z.string() });

const productSchema = z.object({
  id: z.uuid().optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "El slug solo admite minúsculas, números y guiones."),
  kind: z.enum(["jaltest", "hardware"]),
  category: z.enum(["laptop", "cable", "finder"]).nullable().optional(),
  sku: z.string().nullable().optional(),
  name: localized,
  blurb: localized.optional(),
  // Párrafos: se editan como textarea, un párrafo por línea en blanco.
  description: z.object({ es: z.string(), en: z.string() }).optional(),
  img: z.string().min(1, "La imagen es obligatoria."),
  // Foto del equipo del panel derecho en /producto (solo líneas Jaltest).
  vehicleImg: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["draft", "published"]),
  sort: z.coerce.number().int().min(0),
  // Precios en dólares (lo que teclea el admin); se guardan en centavos.
  priceUs: z.coerce.number().min(0),
  priceWorld: z.coerce.number().min(0),
});

function paragraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function formToProduct(formData: FormData) {
  const raw = Object.fromEntries(formData);
  return productSchema.safeParse({
    ...raw,
    name: { es: raw.name_es, en: raw.name_en },
    blurb: { es: raw.blurb_es ?? "", en: raw.blurb_en ?? "" },
    description: { es: raw.description_es ?? "", en: raw.description_en ?? "" },
    category: raw.category || null,
    sku: raw.sku || null,
  });
}

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("editor");

  const parsed = formToProduct(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  const values = {
    slug: d.slug,
    kind: d.kind,
    category: d.kind === "hardware" ? (d.category ?? null) : null,
    sku: d.sku ?? null,
    name: d.name,
    blurb: d.blurb ?? { es: "", en: "" },
    description: {
      es: paragraphs(d.description?.es ?? ""),
      en: paragraphs(d.description?.en ?? ""),
    },
    img: d.img,
    vehicleImg: d.kind === "jaltest" ? (d.vehicleImg || null) : null,
    stock: d.stock,
    status: d.status,
    sort: d.sort,
    updatedAt: new Date(),
  };

  let productId = d.id;

  try {
    if (productId) {
      await db.update(products).set(values).where(eq(products.id, productId));
    } else {
      const [row] = await db
        .insert(products)
        .values(values)
        .returning({ id: products.id });
      productId = row.id;
    }
  } catch (err) {
    if (String(err).includes("products_slug_uniq")) {
      return { error: `El slug "${d.slug}" ya existe.` };
    }
    throw err;
  }

  // Precios: upsert de los 2 tiers (USA/Canadá y resto del mundo).
  const tiers = [
    { tier: "us" as const, amountCents: Math.round(d.priceUs * 100) },
    { tier: "world" as const, amountCents: Math.round(d.priceWorld * 100) },
  ];
  for (const t of tiers) {
    await db
      .insert(productPrices)
      .values({ productId, ...t })
      .onConflictDoUpdate({
        target: [productPrices.productId, productPrices.tier],
        set: { amountCents: t.amountCents },
      });
  }

  revalidatePublic();
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function deleteProductAction(formData: FormData) {
  await requireRole("admin");
  const id = z.uuid().parse(formData.get("id"));

  await db.delete(products).where(eq(products.id, id));

  revalidatePublic();
  revalidatePath("/admin/productos");
}

// ─────────────────────────────────────────────────────────────────────────────
// Pedidos
// ─────────────────────────────────────────────────────────────────────────────

export async function updateOrderStatusAction(
  id: string,
  status: (typeof ORDER_STATUSES)[number],
): Promise<ActionState> {
  await requireRole("editor");

  const parsed = z
    .object({ id: z.uuid(), status: z.enum(ORDER_STATUSES) })
    .safeParse({ id, status });
  if (!parsed.success) return { error: "Estado inválido." };

  const [previous] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, parsed.data.id))
    .limit(1);

  await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(orders.id, parsed.data.id));

  // Solo se avisa si el estado cambió de verdad: reguardar el mismo estado no debe
  // disparar un correo al comprador.
  if (previous && previous.status !== parsed.data.status) {
    const order = await getOrderWithItems(parsed.data.id);
    if (order) await sendOrderStatusUpdate(order);
  }

  revalidatePath("/admin/pedidos");
  return { ok: true };
}

/** Reintenta manualmente un correo del pedido. Cada intento queda registrado en `order_emails`. */
export async function resendOrderEmailAction(
  id: string,
  kind: OrderEmail["kind"],
): Promise<ActionState> {
  await requireRole("editor");

  const parsed = z
    .object({
      id: z.uuid(),
      kind: z.enum(["received", "confirmation", "status_update", "notification"]),
    })
    .safeParse({ id, kind });
  if (!parsed.success) return { error: "Correo inválido." };

  const order = await getOrderWithItems(parsed.data.id);
  if (!order) return { error: "Pedido no encontrado." };

  // Reusa las mismas funciones de envío que el webhook/estado → registran la fila de log.
  const senders = {
    received: sendOrderReceived,
    confirmation: sendOrderConfirmation,
    status_update: sendOrderStatusUpdate,
    notification: sendOrderNotification,
  } as const;
  const result = await senders[parsed.data.kind](order);

  revalidatePath(`/admin/pedidos/${parsed.data.id}`);
  if (result && !result.ok) return { error: result.error ?? "No se pudo enviar el correo." };
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cupones
// ─────────────────────────────────────────────────────────────────────────────

export async function saveCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");

  const raw = Object.fromEntries(formData);
  const parsed = z
    .object({
      code: z
        .string()
        .trim()
        .min(3, "El código debe tener al menos 3 caracteres.")
        .regex(/^[A-Za-z0-9-]+$/, "Solo letras, números y guiones."),
      kind: z.enum(["percent", "fixed"]),
      value: z.coerce.number().positive("El valor debe ser mayor que cero."),
      minSubtotal: z.coerce.number().min(0),
      maxUses: z.string().optional(),
      expiresAt: z.string().optional(),
      active: z.coerce.boolean(),
    })
    .safeParse({ ...raw, active: raw.active === "on" });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const d = parsed.data;

  if (d.kind === "percent" && d.value > 100) {
    return { error: "Un descuento porcentual no puede superar el 100%." };
  }

  try {
    await db.insert(coupons).values({
      code: d.code.toUpperCase(),
      kind: d.kind,
      // percent → se guarda tal cual (1..100). fixed → el admin teclea dólares, se guardan centavos.
      value: d.kind === "percent" ? Math.round(d.value) : Math.round(d.value * 100),
      minSubtotalCents: Math.round(d.minSubtotal * 100),
      maxUses: d.maxUses ? Number(d.maxUses) : null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      active: d.active,
    });
  } catch (err) {
    if (String(err).includes("coupons_code_uniq")) {
      return { error: `El cupón "${d.code.toUpperCase()}" ya existe.` };
    }
    throw err;
  }

  revalidatePath("/admin/cupones");
  return { ok: true };
}

export async function toggleCouponAction(formData: FormData) {
  await requireRole("admin");
  const id = z.uuid().parse(formData.get("id"));
  const active = formData.get("active") === "1";

  await db.update(coupons).set({ active }).where(eq(coupons.id, id));
  revalidatePath("/admin/cupones");
}

export async function deleteCouponAction(formData: FormData) {
  await requireRole("admin");
  const id = z.uuid().parse(formData.get("id"));

  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/cupones");
}

// ─────────────────────────────────────────────────────────────────────────────
// Bandeja de contacto
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleContactReadAction(formData: FormData) {
  await requireRole("editor");

  const id = z.uuid().parse(formData.get("id"));
  const read = formData.get("read") === "1";

  await db.update(contactRequests).set({ read }).where(eq(contactRequests.id, id));

  revalidatePath("/admin/contacto");
  revalidatePath("/admin");
}

// ─────────────────────────────────────────────────────────────────────────────
// Usuarios del panel
// ─────────────────────────────────────────────────────────────────────────────

const ROLES = ["owner", "admin", "editor"] as const;

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Solo un owner reparte accesos.
  await requireRole("owner");

  const parsed = z
    .object({
      name: z.string().trim().min(2, "Ingresa un nombre."),
      email: z.email("Email no válido."),
      password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
      role: z.enum(ROLES),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const d = parsed.data;

  try {
    await db.insert(adminUsers).values({
      name: d.name,
      email: d.email.toLowerCase(),
      passwordHash: await hashPassword(d.password),
      role: d.role,
    });
  } catch (err) {
    if (String(err).includes("admin_users_email_uniq")) {
      return { error: "Ya existe un usuario con ese email." };
    }
    throw err;
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function deleteUserAction(formData: FormData) {
  const me = await requireRole("owner");
  const id = z.uuid().parse(formData.get("id"));

  // Sin esto, un owner podría dejarse fuera de su propio panel.
  if (id === me.id) throw new Error("No puedes eliminar tu propio usuario.");

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  revalidatePath("/admin/usuarios");
}

/** Cambia el rol de un usuario al vuelo (dropdown en la tabla de usuarios). */
export async function updateUserRoleAction(
  id: string,
  role: (typeof ROLES)[number],
): Promise<ActionState> {
  const me = await requireRole("owner");

  const parsed = z
    .object({ id: z.uuid(), role: z.enum(ROLES) })
    .safeParse({ id, role });
  if (!parsed.success) return { error: "Rol inválido." };

  // Nadie edita su propio rol: evita que un owner se degrade sin querer.
  if (parsed.data.id === me.id) return { error: "No puedes cambiar tu propio rol." };

  // No dejar la tienda sin ningún owner: si este era el último, se bloquea la degradación.
  if (parsed.data.role !== "owner") {
    const [target] = await db
      .select({ role: adminUsers.role })
      .from(adminUsers)
      .where(eq(adminUsers.id, parsed.data.id))
      .limit(1);
    if (target?.role === "owner") {
      const owners = await db
        .select({ id: adminUsers.id })
        .from(adminUsers)
        .where(eq(adminUsers.role, "owner"));
      if (owners.length <= 1) return { error: "Debe quedar al menos un propietario." };
    }
  }

  await db.update(adminUsers).set({ role: parsed.data.role }).where(eq(adminUsers.id, parsed.data.id));
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ajustes globales (envío)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateShippingSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");

  const parsed = z
    .object({
      etaEs: z.string().trim().optional(),
      etaEn: z.string().trim().optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const d = parsed.data;

  const shippingEta =
    d.etaEs || d.etaEn ? { es: d.etaEs ?? "", en: d.etaEn ?? "" } : null;

  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, shippingCents: 0, shippingEta, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: { shippingCents: 0, shippingEta, updatedAt: new Date() },
    });

  // El ETA aparece en checkout y seguimiento (rutas públicas dinámicas).
  revalidatePublic();
  revalidatePath("/admin/ajustes");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Banners
// ─────────────────────────────────────────────────────────────────────────────

const bannerSchema = z.object({
  id: z.uuid().optional(),
  key: z.string().min(1),
  img: z.string().min(1, "La imagen es obligatoria."),
  ctaHref: z.string().nullable().optional(),
  sort: z.coerce.number().int().min(0),
  active: z.coerce.boolean(),
});

export async function saveBannerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("editor");

  const raw = Object.fromEntries(formData);
  const parsed = bannerSchema.safeParse({
    ...raw,
    active: raw.active === "on" || raw.active === "true",
    ctaHref: raw.ctaHref || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  const values = {
    key: d.key,
    img: d.img,
    title: { es: String(raw.title_es ?? ""), en: String(raw.title_en ?? "") },
    subtitle: { es: String(raw.subtitle_es ?? ""), en: String(raw.subtitle_en ?? "") },
    ctaLabel: { es: String(raw.ctaLabel_es ?? ""), en: String(raw.ctaLabel_en ?? "") },
    ctaHref: d.ctaHref ?? null,
    sort: d.sort,
    active: d.active,
    updatedAt: new Date(),
  };

  if (d.id) {
    await db.update(banners).set(values).where(eq(banners.id, d.id));
  } else {
    await db.insert(banners).values(values);
  }

  revalidatePublic();
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function deleteBannerAction(formData: FormData) {
  await requireRole("admin");
  const id = z.uuid().parse(formData.get("id"));

  await db.delete(banners).where(eq(banners.id, id));

  revalidatePublic();
  revalidatePath("/admin/banners");
}

// ─────────────────────────────────────────────────────────────────────────────
// Acciones masivas (multi-selección)
// ─────────────────────────────────────────────────────────────────────────────

/** Valida y normaliza una lista de ids; devuelve error legible si viene vacía o mal. */
function parseIds(ids: string[]): { ids: string[] } | { error: string } {
  const parsed = z.array(z.uuid()).min(1).safeParse(ids);
  if (!parsed.success) return { error: "Selección inválida." };
  return { ids: parsed.data };
}

export async function bulkDeleteProductsAction(ids: string[]): Promise<ActionState> {
  await requireRole("admin");
  const r = parseIds(ids);
  if ("error" in r) return r;

  await db.delete(products).where(inArray(products.id, r.ids));

  revalidatePublic();
  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function bulkUpdateOrderStatusAction(
  ids: string[],
  status: (typeof ORDER_STATUSES)[number],
): Promise<ActionState> {
  await requireRole("editor");

  const parsed = z
    .object({ ids: z.array(z.uuid()).min(1), status: z.enum(ORDER_STATUSES) })
    .safeParse({ ids, status });
  if (!parsed.success) return { error: "Datos inválidos." };

  // Estado previo por pedido: solo se avisa por email a los que cambian de verdad.
  const rows = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(inArray(orders.id, parsed.data.ids));

  await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(inArray(orders.id, parsed.data.ids));

  const changed = rows.filter((o) => o.status !== parsed.data.status).map((o) => o.id);
  for (const id of changed) {
    const order = await getOrderWithItems(id);
    if (order) await sendOrderStatusUpdate(order);
  }

  revalidatePath("/admin/pedidos");
  return { ok: true };
}

export async function bulkDeleteBannersAction(ids: string[]): Promise<ActionState> {
  await requireRole("admin");
  const r = parseIds(ids);
  if ("error" in r) return r;

  await db.delete(banners).where(inArray(banners.id, r.ids));

  revalidatePublic();
  revalidatePath("/admin/banners");
  return { ok: true };
}

export async function bulkDeleteCouponsAction(ids: string[]): Promise<ActionState> {
  await requireRole("admin");
  const r = parseIds(ids);
  if ("error" in r) return r;

  await db.delete(coupons).where(inArray(coupons.id, r.ids));

  revalidatePath("/admin/cupones");
  return { ok: true };
}

export async function bulkDeleteUsersAction(ids: string[]): Promise<ActionState> {
  const me = await requireRole("owner");
  const r = parseIds(ids);
  if ("error" in r) return r;

  // Nunca borrarse a uno mismo, aunque venga en la selección.
  const targets = r.ids.filter((id) => id !== me.id);
  if (targets.length === 0) return { error: "No puedes eliminar tu propio usuario." };

  await db.delete(adminUsers).where(inArray(adminUsers.id, targets));

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
