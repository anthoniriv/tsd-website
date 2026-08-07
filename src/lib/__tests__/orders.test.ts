// Pruebas FUNCIONALES del cálculo de importes al crear un pedido (con BD mockeada).
// El pago inicial excluye el envío; solo cobra productos menos descuentos.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { queueDb, resetDb, valuesWith } from "@/test/db-mock";

vi.mock("@/db", async () => {
  const { installDbMock } = await import("@/test/db-mock");
  return { db: installDbMock() };
});
vi.mock("@/lib/pricing", () => ({ priceMapFor: vi.fn() }));
vi.mock("@/lib/coupons", () => ({ validateCoupon: vi.fn(), consumeCoupon: vi.fn() }));

import { createPendingOrder, OrderError } from "@/lib/orders";
import { priceMapFor } from "@/lib/pricing";
import { validateCoupon } from "@/lib/coupons";

const PID = "11111111-1111-1111-1111-111111111111";

const productRow = (over: Record<string, unknown> = {}) => ({
  id: PID,
  name: { es: "Cable", en: "Cable" },
  img: "/x.png",
  stock: 5,
  status: "published",
  ...over,
});

const input = (couponCode?: string) => ({
  lines: [{ id: PID, qty: 2 }],
  customer: { name: "Ana", email: "ANA@x.com" },
  locale: "en" as const,
  tier: "us" as const,
  couponCode,
});

// Cola típica: productos → upsert del contador nº pedido → insert orders → insert items.
const happyQueue = () =>
  queueDb([productRow()], [{ value: 1 }], [{ id: "o1" }], [{ id: "i1" }]);

beforeEach(() => {
  resetDb();
  vi.mocked(priceMapFor).mockResolvedValue(new Map([[PID, 10000]]));
  vi.mocked(validateCoupon).mockReset();
});

describe("createPendingOrder — importes", () => {
  it("deja el envío por confirmar fuera del pago inicial", async () => {
    happyQueue();

    await createPendingOrder(input());

    const v = valuesWith("totalCents")!;
    expect(v.subtotalCents).toBe(20000); // 2 × 10000
    expect(v.shippingCents).toBe(0);
    expect(v.totalCents).toBe(20000);
  });

  it("aplica el descuento sin sumar envío", async () => {
    vi.mocked(validateCoupon).mockResolvedValue({
      ok: true,
      discountCents: 5000,
      coupon: { code: "SAVE" },
    } as never);
    happyQueue();

    await createPendingOrder(input("SAVE"));

    const v = valuesWith("totalCents")!;
    expect(v.discountCents).toBe(5000);
    expect(v.shippingCents).toBe(0);
    expect(v.totalCents).toBe(15000);
  });

  it("rechaza si no hay stock suficiente", async () => {
    queueDb([productRow({ stock: 1 })]);
    await expect(createPendingOrder(input())).rejects.toBeInstanceOf(OrderError);
  });
});
