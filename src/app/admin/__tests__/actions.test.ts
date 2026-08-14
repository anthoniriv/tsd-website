// Pruebas FUNCIONALES de las Server Actions del panel (auth y BD mockeadas).
// Cubren: guardas de roles, conversión USD→centavos de envío y el enrutado del reintento.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { dbCalls, queueDb, resetDb, valuesWith } from "@/test/db-mock";

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
  sendOrderReceived: vi.fn(),
  sendOrderConfirmation: vi.fn(),
  sendOrderStatusUpdate: vi.fn(),
  sendOrderNotification: vi.fn(),
}));
vi.mock("@/lib/orders", () => ({ getOrderWithItems: vi.fn() }));

import {
  resendOrderEmailAction,
  saveSiteMediaAction,
  updateShippingSettingsAction,
  updateUserRoleAction,
} from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { getOrderWithItems } from "@/lib/orders";
import {
  sendOrderConfirmation,
  sendOrderNotification,
  sendOrderReceived,
  sendOrderStatusUpdate,
} from "@/lib/email";

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

  it("mantiene el envío por confirmar y guarda el ETA localizado", async () => {
    queueDb([]);
    const res = await updateShippingSettingsAction({}, fd({
      etaEs: "3–5 días",
      etaEn: "3–5 days",
    }));
    expect(res.ok).toBe(true);
    const v = valuesWith("shippingCents")!;
    expect(v.shippingCents).toBe(0);
    expect(v.shippingEta).toEqual({ es: "3–5 días", en: "3–5 days" });
  });

  it("deja el ETA en null si no se ingresó texto", async () => {
    queueDb([]);
    await updateShippingSettingsAction({}, fd({ etaEs: "", etaEn: "" }));
    expect(valuesWith("shippingCents")!.shippingEta).toBeNull();
  });

  it("ignora un costo legado manipulado y conserva el envío pendiente", async () => {
    queueDb([]);
    await updateShippingSettingsAction({}, fd({ shippingAmount: "99", etaEs: "", etaEn: "" }));
    expect(valuesWith("shippingCents")!.shippingCents).toBe(0);
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

  it("reenvía el acuse de recibo para kind 'received'", async () => {
    vi.mocked(getOrderWithItems).mockResolvedValue(ORDER);
    vi.mocked(sendOrderReceived).mockResolvedValue({ ok: true } as never);
    await resendOrderEmailAction(OTHER, "received");
    expect(sendOrderReceived).toHaveBeenCalledOnce();
    expect(sendOrderConfirmation).not.toHaveBeenCalled();
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

describe("saveSiteMediaAction — láminas", () => {
  const fd = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.set(k, v);
    return f;
  };

  it("guarda la imagen y la etiqueta de un slot válido", async () => {
    const res = await saveSiteMediaAction(
      {},
      fd({
        "img:line.agv.main": "https://cdn/agv.png",
        "labelEs:line.agv.main": "Cosechadoras",
        "labelEn:line.agv.main": "Combines",
      }),
    );

    expect(res.ok).toBe(true);
    expect(valuesWith("key")).toMatchObject({
      key: "line.agv.main",
      img: "https://cdn/agv.png",
      label: { es: "Cosechadoras", en: "Combines" },
    });
  });

  // Las claves las declara el diseño: una inventada desde el cliente no debe escribir.
  it("ignora claves que no existen en el diseño", async () => {
    const res = await saveSiteMediaAction({}, fd({ "img:line.hack.main": "https://cdn/x.png" }));

    expect(res.error).toBeTruthy();
    expect(valuesWith("key")).toBeUndefined();
  });

  it("guarda los 2 precios de la línea junto con la lámina", async () => {
    // Primero se resuelve el upsert de la imagen; después el select de la línea.
    queueDb([], [{ id: OTHER }]);

    const res = await saveSiteMediaAction(
      {},
      fd({
        "img:line.agv.main": "https://cdn/agv.png",
        productId: OTHER,
        priceUs: "1999.50",
        priceWorld: "2200",
      }),
    );

    expect(res.ok).toBe(true);
    const inserts = dbCalls()
      .filter((c) => c.method === "values")
      .map((c) => c.args[0] as Record<string, unknown>)
      .filter((v) => "tier" in v);
    expect(inserts).toEqual([
      { productId: OTHER, tier: "us", amountCents: 199950 },
      { productId: OTHER, tier: "world", amountCents: 220000 },
    ]);
  });

  // La lámina no es una puerta trasera para tocar el precio de cualquier producto.
  it("rechaza precios sobre un producto que no es una línea Jaltest", async () => {
    queueDb([]); // el select no encuentra línea

    const res = await saveSiteMediaAction(
      {},
      fd({
        "img:line.agv.main": "https://cdn/agv.png",
        productId: OTHER,
        priceUs: "10",
        priceWorld: "10",
      }),
    );

    expect(res.error).toBeTruthy();
    expect(valuesWith("tier")).toBeUndefined();
  });
});
