// Pruebas TÉCNICAS: cada valor de los enums nuevos tiene su etiqueta/estilo en el panel.
// Si alguien añade un valor al pgEnum y olvida la etiqueta, estas pruebas fallan.

import { describe, expect, it } from "vitest";
import { adminRole, orderEmailKind, orderEmailStatus } from "@/db/schema";
import {
  ADMIN_ROLES,
  ADMIN_ROLE_LABEL,
  ORDER_EMAIL_KIND_LABEL,
  ORDER_EMAIL_STATUS_LABEL,
  ORDER_EMAIL_STATUS_STYLE,
} from "@/lib/admin-labels";

describe("etiquetas de roles", () => {
  it("cubre exactamente los valores del enum admin_role", () => {
    expect([...ADMIN_ROLES].sort()).toEqual([...adminRole.enumValues].sort());
    for (const role of adminRole.enumValues) {
      expect(ADMIN_ROLE_LABEL[role]).toBeTruthy();
    }
  });

  it("ordena los roles de mayor a menor privilegio", () => {
    expect(ADMIN_ROLES).toEqual(["owner", "admin", "editor"]);
  });
});

describe("etiquetas de correos de pedido", () => {
  it("tiene etiqueta para cada tipo de correo", () => {
    for (const kind of orderEmailKind.enumValues) {
      expect(ORDER_EMAIL_KIND_LABEL[kind]).toBeTruthy();
    }
  });

  it("tiene etiqueta y estilo para cada estado de correo", () => {
    for (const status of orderEmailStatus.enumValues) {
      expect(ORDER_EMAIL_STATUS_LABEL[status]).toBeTruthy();
      expect(ORDER_EMAIL_STATUS_STYLE[status]).toBeTruthy();
    }
  });
});
