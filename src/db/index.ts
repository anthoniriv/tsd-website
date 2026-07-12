// Cliente Drizzle sobre Neon (driver HTTP serverless — sin pool, ideal para RSC
// y Server Actions en Fluid Compute).

import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL. Corre `vercel env pull .env.local`.");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
export { schema };
