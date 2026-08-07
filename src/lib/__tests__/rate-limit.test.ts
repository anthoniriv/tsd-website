// Pruebas FUNCIONALES del rate limiter en BD: la cuenta sube con cada llamada y al
// pasar el límite lanza RateLimitError (BD mockeada).

import { beforeEach, describe, expect, it, vi } from "vitest";
import { queueDb, resetDb, dbCalls } from "@/test/db-mock";

vi.mock("@/db", async () => {
  const { installDbMock } = await import("@/test/db-mock");
  return { db: installDbMock() };
});

import { checkRateLimit, RateLimitError } from "@/lib/rate-limit";

beforeEach(() => {
  resetDb();
  vi.clearAllMocks();
});

describe("checkRateLimit", () => {
  it("permite mientras el contador no supere el límite", async () => {
    queueDb([{ count: 3 }]);
    await expect(checkRateLimit("test:1.2.3.4", 3, 600)).resolves.toBeUndefined();
  });

  it("lanza RateLimitError cuando el contador supera el límite", async () => {
    queueDb([{ count: 4 }]);
    await expect(checkRateLimit("test:1.2.3.4", 3, 600)).rejects.toBeInstanceOf(RateLimitError);
  });

  it("reutiliza la fila con un upsert sobre la clave", async () => {
    queueDb([{ count: 1 }]);
    await checkRateLimit("test:1.2.3.4", 5, 600);

    const methods = dbCalls().map((c) => c.method);
    expect(methods).toContain("insert");
    expect(methods).toContain("onConflictDoUpdate");
    expect(methods).toContain("returning");
  });
});
