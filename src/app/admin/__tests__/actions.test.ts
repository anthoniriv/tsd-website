// Pruebas FUNCIONALES de las Server Actions del panel (auth y BD mockeadas).
// Cubren: guardas de roles, conversión USD→centavos de envío y el enrutado del reintento.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { queueDb, resetDb, valuesWith } from "@/test/db-mock";

vi.mock("@/db", async () => {
  const { installDbMock } = await import("@/test/db-mock");
  return { db: installDbMock() };
});
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  requireRole: vi.fn(),
  requireUser: vi.fn(),
  hashPassword: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendOrderConfirmation: vi.fn(),
  sendOrderStatusUpdate: vi.fn(),
  sendOrderNotification: vi.fn(),
}));
vi.mock("@/lib/orders", () => ({ getOrderWithItems: vi.fn() }));

import {
  resendOrderEmailAction,
  updateShippingSettingsAction,
  updateUserRoleAction,
} from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { getOrderWithItems } from "@/lib/orders";
import { sendOrderConfirmation, sendOrderNotification, sendOrderStatusUpdate } from "@/lib/email";

// UUID v4 válidos (nibble de versión 4 y variante 8) — z.uuid() los exige.
const ME = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

beforeEach(() => {
  resetDb();
  vi.clearAllMocks();
  vi.mocked(requireRole).mockResolvedValue({ id: ME, role: "owner" } as never);
});

describe("updateUserRoleAction — guardas", () => {
  it("no deja cambiar el propio rol", async () => {
    const res = await updateUserRoleAction(ME, "admin");
    expect(res.error).toBeTruthy();
  });

  it("bloquea degradar al último owner", async () => {
    // select del rol destino (owner) + recuento de owners (=1).
    queueDb([{ role: "owner" }], [{ id: ME }]);
    const res = await updateUserRoleAction(OTHER, "editor");
    expect(res.error).toMatch(/propietario/i);
  });

  it("promueve a un usuario correctamente", async () => {
    queueDb([{ role: "editor" }], []); // select destino + update
    const res = await updateUserRoleAction(OTHER, "admin");
    expect(res.ok).toBe(true);
  });
});

describe("updateShippingSettingsAction — envío", () => {
  const fd = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.set(k, v);
    return f;
  };

  it("convierte dólares a centavos y guarda el ETA localizado", async () => {
    queueDb([]);
    const res = await updateShippingSettingsAction({}, fd({
      shippingAmount: "12.50",
      etaEs: "3–5 días",
      etaEn: "3–5 days",
    }));
    expect(res.ok).toBe(true);
    const v = valuesWith("shippingCents")!;
    expect(v.shippingCents).toBe(1250);
    expect(v.shippingEta).toEqual({ es: "3–5 días", en: "3–5 days" });
  });

  it("deja el ETA en null si no se ingresó texto", async () => {
    queueDb([]);
    await updateShippingSettingsAction({}, fd({ shippingAmount: "0", etaEs: "", etaEn: "" }));
    expect(valuesWith("shippingCents")!.shippingEta).toBeNull();
  });

  it("rechaza un costo negativo", async () => {
    const res = await updateShippingSettingsAction({}, fd({ shippingAmount: "-5" }));
    expect(res.error).toBeTruthy();
  });
});

describe("resendOrderEmailAction — enrutado", () => {
  const ORDER = { id: OTHER } as never;

  it("reenvía la confirmación con la función correcta", async () => {
    vi.mocked(requireRole).mockResolvedValue({ id: ME, role: "editor" } as never);
    vi.mocked(getOrderWithItems).mockResolvedValue(ORDER);
    vi.mocked(sendOrderConfirmation).mockResolvedValue({ ok: true } as never);

    const res = await resendOrderEmailAction(OTHER, "confirmation");

    expect(res.ok).toBe(true);
    expect(sendOrderConfirmation).toHaveBeenCalledOnce();
    expect(sendOrderStatusUpdate).not.toHaveBeenCalled();
  });

  it("usa el aviso interno para kind 'notification'", async () => {
    vi.mocked(getOrderWithItems).mockResolvedValue(ORDER);
    vi.mocked(sendOrderNotification).mockResolvedValue({ ok: true } as never);
    await resendOrderEmailAction(OTHER, "notification");
    expect(sendOrderNotification).toHaveBeenCalledOnce();
  });

  it("devuelve error si el pedido no existe", async () => {
    vi.mocked(getOrderWithItems).mockResolvedValue(null);
    const res = await resendOrderEmailAction(OTHER, "confirmation");
    expect(res.error).toBeTruthy();
  });

  it("propaga el error cuando el envío falla", async () => {
    vi.mocked(getOrderWithItems).mockResolvedValue(ORDER);
    vi.mocked(sendOrderConfirmation).mockResolvedValue({ ok: false, error: "boom" } as never);
    const res = await resendOrderEmailAction(OTHER, "confirmation");
    expect(res.error).toBe("boom");
  });

  it("rechaza un kind inválido", async () => {
    const res = await resendOrderEmailAction(OTHER, "foo" as never);
    expect(res.error).toBeTruthy();
  });
});
