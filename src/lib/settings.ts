// Ajustes globales de la tienda (fila única `app_settings`, id = "global").
// Hoy solo guarda la configuración de envío; el panel la edita en /admin/ajustes.

import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings, type AppSettings } from "@/db/schema";

export const SETTINGS_ID = "global";

export type ShippingSettings = {
  shippingCents: number;
  shippingEta: AppSettings["shippingEta"];
};

/**
 * Lee (o crea) la fila de ajustes. Cacheado por request. Si no existe todavía —p. ej.
 * una BD sin seed— la crea con valores por defecto (envío gratis, sin ETA).
 */
export const getSettings = cache(async (): Promise<AppSettings> => {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID))
    .limit(1);
  if (row) return row;

  const [created] = await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID })
    .onConflictDoNothing()
    .returning();
  // onConflictDoNothing puede no devolver fila si otra request la creó en paralelo.
  if (created) return created;
  const [existing] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID))
    .limit(1);
  return existing;
});

export async function getShippingSettings(): Promise<ShippingSettings> {
  const s = await getSettings();
  return { shippingCents: s.shippingCents, shippingEta: s.shippingEta };
}
