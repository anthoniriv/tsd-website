// Auth del panel admin. Sesión opaca en tabla `sessions` + cookie httpOnly.
// No hay cuentas de cliente: el checkout es de invitado y el seguimiento de pedido
// va por token en la URL. Esto existe solo para /admin.

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, sessions, type AdminUser } from "@/db/schema";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth.shared";

export { SESSION_COOKIE };

/** Jerarquía de permisos: owner ⊃ admin ⊃ editor. */
const ROLE_RANK: Record<AdminUser["role"], number> = { owner: 3, admin: 2, editor: 1 };

export function hashPassword(plain: string) {
  return hash(plain, 12);
}

/**
 * Verifica credenciales y abre sesión. Devuelve `null` si fallan — el caller no debe
 * distinguir "email inexistente" de "password incorrecta" en el mensaje al usuario.
 */
export async function login(email: string, password: string): Promise<AdminUser | null> {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.trim().toLowerCase()))
    .limit(1);

  if (!user || !(await compare(password, user.passwordHash))) return null;

  const token = crypto.randomUUID() + crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);

  await db.insert(sessions).values({ id: token, userId: user.id, expiresAt });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return user;
}

export async function logout() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  store.delete(SESSION_COOKIE);
}

/** Usuario de la sesión activa, o null. Deduplicado por request. */
export const getSession = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({ user: adminUsers })
    .from(sessions)
    .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return row?.user ?? null;
});

/** Exige sesión. Redirige a /admin/login si no la hay. Úsalo en layouts y actions. */
export async function requireUser(): Promise<AdminUser> {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  return user;
}

/** Exige un rol mínimo. Lanza si no alcanza — las Server Actions lo capturan. */
export async function requireRole(min: AdminUser["role"]): Promise<AdminUser> {
  const user = await requireUser();
  if (ROLE_RANK[user.role] < ROLE_RANK[min]) {
    throw new Error("No tienes permisos para esta acción.");
  }
  return user;
}
