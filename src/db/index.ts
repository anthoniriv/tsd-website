// Cliente Drizzle sobre Neon (driver HTTP serverless — sin pool, ideal para RSC
// y Server Actions en Fluid Compute).

import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * En preview usamos otra base a propósito: `DATABASE_URL` la gestiona la
 * integración de Neon y apunta a producción en los tres entornos, así que un
 * deployment de preview escribiría pedidos reales en la base del cliente.
 *
 * La integración es Vercel-Managed y no ofrece branching por preview desde la
 * consola de Neon, y `DATABASE_URL` es una sola variable con tres targets — no
 * se puede sobrescribir solo en preview sin borrarla para producción. De ahí
 * esta variable aparte, que solo existe en el scope Preview.
 */
const url =
  process.env.VERCEL_ENV === "preview" && process.env.PREVIEW_DATABASE_URL
    ? process.env.PREVIEW_DATABASE_URL
    : process.env.DATABASE_URL;

if (!url) {
  throw new Error("Falta DATABASE_URL. Corre `vercel env pull .env.local`.");
}

const sql = neon(url);

export const db = drizzle(sql, { schema });
export { schema };
