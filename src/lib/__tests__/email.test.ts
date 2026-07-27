// Pruebas FUNCIONALES del registro de correos en BD. Antes, `send()` tragaba los fallos;
// ahora devuelve resultado y cada envío escribe una fila en order_emails (sent/failed).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { queueDb, resetDb, valuesWith } from "@/test/db-mock";
import type { OrderWithItems } from "@/lib/orders";

vi.mock("@/db", async () => {
  const { installDbMock } = await import("@/test/db-mock");
  return { db: installDbMock() };
});
vi.mock("@/lib/stripe", () => ({ siteUrl: () => "http://test.local" }));
vi.mock("@/lib/pdf/receipt", () => ({
  renderReceiptPdf: vi.fn().mockResolvedValue(Buffer.from("pdf")),
  receiptFileName: () => "boleta.pdf",
}));
vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: { send: vi.fn().mockResolvedValue({ data: { id: "re_1" }, error: null }) },
  })),
}));

const order = (): OrderWithItems =>
  ({
    id: "22222222-2222-2222-2222-222222222222",
    orderNumber: "TDS-2026-0001",
    publicToken: "tok",
    email: "ana@x.com",
    name: "Ana",
    phone: null,
    shipping: { line1: "Calle 1", city: "Doral", state: "Florida", country: "United States" },
    billing: null,
    locale: "en-US",
    tier: "us",
    subtotalCents: 20000,
    discountCents: 0,
    couponCode: null,
    shippingCents: 1500,
    totalCents: 21500,
    currency: "USD",
    status: "paid",
    stripeSessionId: null,
    stripePaymentIntent: null,
    createdAt: new Date("2026-07-23T00:00:00Z"),
    updatedAt: new Date("2026-07-23T00:00:00Z"),
    items: [
      {
        id: "i1",
        orderId: "22222222-2222-2222-2222-222222222222",
        productId: null,
        nameSnapshot: "Cable",
        imgSnapshot: null,
        unitPriceCents: 10000,
        qty: 2,
      },
    ],
  }) as OrderWithItems;

beforeEach(() => resetDb());
afterEach(() => vi.unstubAllEnvs());

describe("sendOrderConfirmation → order_emails", () => {
  it("registra 'failed' cuando no hay RESEND_API_KEY", async () => {
    vi.resetModules();
    vi.stubEnv("RESEND_API_KEY", "");
    const email = await import("@/lib/email");
    queueDb([]); // insert del log

    const res = await email.sendOrderConfirmation(order());

    expect(res).toMatchObject({ ok: false });
    const row = valuesWith("kind")!;
    expect(row.kind).toBe("confirmation");
    expect(row.status).toBe("failed");
    expect(row.recipient).toBe("ana@x.com");
  });

  it("registra 'sent' cuando Resend acepta el envío", async () => {
    vi.resetModules();
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    const email = await import("@/lib/email");
    queueDb([]);

    const res = await email.sendOrderConfirmation(order());

    expect(res).toMatchObject({ ok: true });
    expect(valuesWith("kind")!.status).toBe("sent");
  });
});
