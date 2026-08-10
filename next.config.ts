import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// CSP sin nonces (documentado por Next): permite inline porque Next inyecta scripts de
// hidratación. Restringe origen de scripts externos, bloquea objetos, clickjacking y
// fugas del token de seguimiento vía Referer.
//
// `connect-src` abre el endpoint S3 de R2: el panel sube las imágenes con un PUT
// directo del navegador al bucket (URL prefirmada), y sin esto el navegador lo
// bloquea antes de salir — el error que se ve es de CORS, pero la causa es la CSP.
// Solo es el endpoint de escritura; las imágenes ya publicadas se sirven desde el
// dominio público y las cubre `img-src https:`.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.r2.cloudflarestorage.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src https://www.google.com https://maps.google.com;
  upgrade-insecure-requests;
`;

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader.replace(/\s{2,}/g, " ").trim() },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
