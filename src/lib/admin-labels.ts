import type { AdminUser, Order, OrderEmail, Product } from "@/db/schema";

/**
 * Fuente única de etiquetas y estilos para el panel admin (solo español).
 * Los valores de los `pgEnum` viven en minúsculas en la BD; aquí se traducen
 * a Title Case para mostrarlos. No importar esto en la web pública: allí las
 * etiquetas se resuelven por locale desde `i18n.ts`.
 */

/** Orden canónico de estados de pedido para selects y validación de UI. */
export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const satisfies readonly Order["status"][];

export const ORDER_STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

/** Clases del badge por estado (mismas que usaba la web pública). */
export const ORDER_STATUS_STYLE: Record<Order["status"], string> = {
  pending: "bg-border-light text-text-secondary",
  paid: "bg-jt-agv/15 text-[#5f8f14]",
  processing: "bg-jt-ohw/15 text-[#8a6100]",
  shipped: "bg-brand/15 text-brand-dark",
  delivered: "bg-jt-agv/20 text-[#4d7710]",
  cancelled: "bg-jt-mhe/10 text-jt-mhe",
};

/** Orden canónico de roles del panel (mayor → menor privilegio). */
export const ADMIN_ROLES = ["owner", "admin", "editor"] as const satisfies readonly AdminUser["role"][];

export const ADMIN_ROLE_LABEL: Record<AdminUser["role"], string> = {
  owner: "Propietario",
  admin: "Administrador",
  editor: "Editor",
};

export const ORDER_EMAIL_KIND_LABEL: Record<OrderEmail["kind"], string> = {
  received: "Pedido registrado",
  confirmation: "Confirmación de compra",
  status_update: "Cambio de estado",
  notification: "Aviso interno",
};

export const ORDER_EMAIL_STATUS_LABEL: Record<OrderEmail["status"], string> = {
  sent: "Enviado",
  failed: "Falló",
};

export const ORDER_EMAIL_STATUS_STYLE: Record<OrderEmail["status"], string> = {
  sent: "bg-jt-agv/15 text-[#5f8f14]",
  failed: "bg-jt-mhe/10 text-jt-mhe",
};

export const PRODUCT_STATUS_LABEL: Record<Product["status"], string> = {
  published: "Publicado",
  draft: "Borrador",
};

export const PRODUCT_KIND_LABEL: Record<Product["kind"], string> = {
  jaltest: "Jaltest",
  hardware: "Hardware",
};

export const PRODUCT_CATEGORY_LABEL: Record<
  NonNullable<Product["category"]>,
  string
> = {
  laptop: "Laptop",
  cable: "Cable",
  finder: "Cable finder",
  renewal: "Renovación",
  upgrade: "Ampliación de cobertura",
};
