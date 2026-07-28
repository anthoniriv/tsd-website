// Maquetación base de los correos de TDS.
//
// Reglas del medio (no son estilísticas, son técnicas): los clientes de correo —Outlook,
// Gmail, Apple Mail— no soportan flexbox, grid, CSS externo ni clases. Todo va en TABLAS
// con estilos EN LÍNEA y ancho fijo (600 px). Toda imagen lleva `alt` con estilo, porque
// muchos clientes las bloquean por defecto.

import { CONTACT, SITE } from "@/lib/site";
import { siteUrl } from "@/lib/stripe";

/**
 * El logo se sirve desde R2, no desde el propio sitio: en local `siteUrl()` es
 * localhost y en un preview la URL está detrás del SSO de Vercel — en ambos casos
 * el buzón del destinatario ve una imagen rota. El bucket es público siempre.
 */
function logoUrl(): string {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return base ? `${base}/brand/logo-tds-black.png` : `${siteUrl()}/images/logo-tds-black.png`;
}

export const BRAND = {
  brand: "#06C5FE",
  brandDark: "#0285C9",
  text: "#102A43",
  secondary: "#486581",
  muted: "#829AB1",
  border: "#D9E2EC",
  bgSoft: "#EEF6FA",
  bg: "#F7FAFC",
  green: "#5F8F14",
  greenSoft: "#EDF7E0",
  red: "#B02A37",
  amber: "#8A6100",
  amberSoft: "#FDF3E1",
} as const;

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Botón. En email un <a> con padding es más fiable que cualquier <button>. */
export function button(label: string, href: string, color = BRAND.brand): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0">
      <tr>
        <td style="border-radius:999px;background:${color}">
          <a href="${href}" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Píldora de estado, del mismo color que la usa el sitio. */
export function badge(label: string, bg: string, color: string): string {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${bg};color:${color};font-family:${FONT};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em">${label}</span>`;
}

/**
 * Envuelve el contenido en la identidad de TDS: barra de marca, cabecera con el logo,
 * cuerpo blanco y pie con la dirección real de la empresa.
 *
 * `preheader` es el texto que la bandeja muestra junto al asunto — si no se define, el
 * cliente enseña el primer texto que encuentre, que suele quedar feo.
 */
export function emailLayout({
  title,
  preheader,
  content,
}: {
  title: string;
  preheader: string;
  content: string;
}): string {
  const url = siteUrl();

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg}">
  <!-- preheader: visible en la lista de correos, oculto al abrir -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg}">
    <tr>
      <td align="center" style="padding:32px 16px">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border}">

          <!-- Barra de marca -->
          <tr>
            <td style="height:5px;background:${BRAND.brand};line-height:5px;font-size:0">&nbsp;</td>
          </tr>

          <!-- Cabecera -->
          <tr>
            <td style="padding:28px 32px 0">
              <a href="${url}" style="text-decoration:none">
                <!-- Imagen alojada en el sitio: si el cliente bloquea imágenes queda el alt. -->
                <img src="${logoUrl()}" alt="${SITE.name} — ${SITE.fullName}" width="170" height="66" style="display:block;border:0;width:170px;height:auto;font-family:${FONT};font-size:16px;font-weight:800;color:${BRAND.text}">
              </a>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding:24px 32px 32px;font-family:${FONT};font-size:15px;line-height:1.6;color:${BRAND.secondary}">
              ${content}
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td style="padding:24px 32px;background:${BRAND.bgSoft};border-top:1px solid ${BRAND.border};font-family:${FONT};font-size:12px;line-height:1.6;color:${BRAND.muted}">
              <strong style="color:${BRAND.secondary}">${CONTACT.company}</strong><br>
              ${CONTACT.address} · ${CONTACT.city}<br>
              <a href="${url}" style="color:${BRAND.brandDark};text-decoration:none">${url.replace(/^https?:\/\//, "")}</a>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0;font-family:${FONT};font-size:11px;color:${BRAND.muted}">
          Este correo se envió automáticamente. No respondas a esta dirección.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Título de sección dentro del cuerpo. */
export function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-family:${FONT};font-size:22px;line-height:1.3;font-weight:800;color:${BRAND.text}">${text}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${BRAND.secondary}">${text}</p>`;
}

/** Bloque de datos con fondo suave (dirección, referencia de pedido…). */
export function panel(label: string, body: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:${BRAND.bgSoft};border-radius:12px">
      <tr>
        <td style="padding:16px 18px;font-family:${FONT}">
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:${BRAND.muted}">${label}</p>
          <div style="font-size:14px;line-height:1.55;color:${BRAND.secondary}">${body}</div>
        </td>
      </tr>
    </table>`;
}

export { FONT };
