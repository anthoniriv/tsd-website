// Constantes de auth sin dependencias de servidor, para que `proxy.ts` pueda
// importarlas sin arrastrar el cliente de BD (`auth.ts` es server-only).

export const SESSION_COOKIE = "tds_admin";
export const SESSION_DAYS = 7;
