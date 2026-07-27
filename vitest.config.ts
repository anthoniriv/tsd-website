import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Config de pruebas. Alias `@` → src (igual que tsconfig) y `server-only` → módulo vacío,
// para poder importar libs marcadas server-only fuera del runtime de RSC.
export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(new URL("./src/test/server-only-stub.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
