// Rate limiting respaldado por Postgres (Neon). El contador vive en la BD, así que
// funciona aunque haya varias instancias serverless a la vez. La ventana se reinicia
// dentro del propio upsert (sin lecturas intermedias → atómico).

import "server-only";
import { headers } from "next/headers";
import { lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

export class RateLimitError extends Error {
  constructor() {
    super("Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.");
    this.name = "RateLimitError";
  }
}

/** IP del cliente. Vercel rellena y pisa `x-forwarded-for`; el primer valor es la IP real. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Incrementa el contador de `key` dentro de la ventana y lanza `RateLimitError` si se
 * supera `limit` intentos. Ocasionalmente purga filas viejas para que la tabla no crezca
 * sin límite (una fila por IP/acción).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSeconds * 1000);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart: now, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.windowStart} < ${cutoff} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${rateLimits.windowStart} < ${cutoff} then ${now} else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });

  if (row.count > limit) throw new RateLimitError();

  if (Math.random() < 0.01) {
    const dayAgo = new Date(Date.now() - 24 * 3600e3);
    await db.delete(rateLimits).where(lt(rateLimits.windowStart, dayAgo));
  }
}
