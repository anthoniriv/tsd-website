// Pruebas TÉCNICAS del dataset país/estado que alimenta el desplegable del checkout.
// Verifica la integridad de la lista mundial y el patrón de dependencia país → estados.

import { describe, expect, it } from "vitest";
import { allCountries } from "country-region-data";

describe("dataset country-region-data", () => {
  it("expone la lista mundial completa de países", () => {
    expect(allCountries.length).toBeGreaterThanOrEqual(240);
  });

  it("cada entrada tiene la forma [nombre, códigoISO, regiones[]]", () => {
    for (const [name, code, regions] of allCountries) {
      expect(typeof name).toBe("string");
      expect(code).toMatch(/^[A-Z]{2}$/);
      expect(Array.isArray(regions)).toBe(true);
    }
  });

  it("Estados Unidos incluye sus estados (Florida entre ellos)", () => {
    const us = allCountries.find((c) => c[1] === "US");
    expect(us).toBeDefined();
    const stateNames = us![2].map((r) => r[0]);
    expect(stateNames).toContain("Florida");
    expect(us![2].length).toBeGreaterThanOrEqual(50);
  });

  it("permite resolver las regiones de un país por nombre (patrón del componente)", () => {
    const regionsOf = (country: string) =>
      allCountries.find((c) => c[0] === country)?.[2] ?? [];
    expect(regionsOf("Spain").length).toBeGreaterThan(0);
    // Un país inexistente devuelve lista vacía → el componente cae a input de texto libre.
    expect(regionsOf("Wakanda")).toEqual([]);
  });
});
