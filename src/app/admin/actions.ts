"use server";

// Server Actions del panel. Toda escritura pasa por aquí: valida con zod, exige rol,
// escribe en Postgres y revalida las rutas públicas que muestran esa data.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  adminUsers,
  banners,
  contactRequests,
  orders,
  productPrices,
  products,
} from "@/db/schema";
import { hashPassword, login, logout, requireRole } from "@/lib/auth";

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
  stock: z.coerce.number().int().min(0),
  status: z.enum(["draft", "published"]),
  sort: z.coerce.number().int().min(0),
  // Precios en dólares (lo que teclea el admin); se guardan en centavos.
  priceUs: z.coerce.number().min(0),
  priceLatam: z.coerce.number().min(0),
  priceEs: z.coerce.number().min(0),
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

  // Precios: upsert de los 3 tiers.
  const tiers = [
    { tier: "us" as const, amountCents: Math.round(d.priceUs * 100) },
    { tier: "latam" as const, amountCents: Math.round(d.priceLatam * 100) },
    { tier: "es" as const, amountCents: Math.round(d.priceEs * 100) },
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

const ORDER_STATUS = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export async function updateOrderStatusAction(
  id: string,
  status: (typeof ORDER_STATUS)[number],
): Promise<ActionState> {
  await requireRole("editor");

  const parsed = z
    .object({ id: z.uuid(), status: z.enum(ORDER_STATUS) })
    .safeParse({ id, status });
  if (!parsed.success) return { error: "Estado inválido." };

  await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(orders.id, parsed.data.id));

  revalidatePath("/admin/pedidos");
  return { ok: true };
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
