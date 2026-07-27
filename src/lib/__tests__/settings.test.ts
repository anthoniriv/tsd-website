// Pruebas FUNCIONALES de los ajustes globales (BD mockeada). getSettings está envuelto
// en React `cache`, por eso cada caso reinicia módulos y reimporta para evitar memoización.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { queueDb, resetDb } from "@/test/db-mock";

vi.mock("@/db", async () => {
  const { installDbMock } = await import("@/test/db-mock");
  return { db: installDbMock() };
});

beforeEach(() => resetDb());

describe("getShippingSettings", () => {
  it("mapea la fila de ajustes a { shippingCents, shippingEta }", async () => {
    vi.resetModules();
    const settings = await import("@/lib/settings");
    queueDb([
      { id: "global", shippingCents: 500, shippingEta: { es: "3–5 días", en: "3–5 days" } },
    ]);

    const res = await settings.getShippingSettings();

    expect(res.shippingCents).toBe(500);
    expect(res.shippingEta).toEqual({ es: "3–5 días", en: "3–5 days" });
  });

  it("crea la fila por defecto si aún no existe (envío gratis)", async () => {
    vi.resetModules();
    const settings = await import("@/lib/settings");
    // 1ª lectura vacía → inserta con onConflictDoNothing → devuelve la fila creada.
    queueDb([], [{ id: "global", shippingCents: 0, shippingEta: null }]);

    const res = await settings.getShippingSettings();

    expect(res.shippingCents).toBe(0);
    expect(res.shippingEta).toBeNull();
  });
});
