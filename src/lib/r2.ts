// Cliente de Cloudflare R2 (S3-compatible). Firmamos URLs en el servidor y el
// navegador sube el archivo directo al bucket: así el binario nunca atraviesa una
// función serverless (que tiene límite de body y se paga por CPU activa).
//
// Se usa `aws4fetch` en vez del SDK de AWS: pesa ~6 KB contra ~2 MB, y lo único
// que necesitamos es SigV4.

import "server-only";
import { AwsClient } from "aws4fetch";

/** Falla al arrancar si falta configuración, en vez de dar un 500 opaco al subir. */
function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta ${name}. Configura R2 en las variables de entorno.`);
  return value;
}

export const R2_BUCKET = () => env("R2_BUCKET");

/** Base pública del bucket, sin barra final (dominio propio o pub-xxx.r2.dev). */
export const R2_PUBLIC_URL = () => env("R2_PUBLIC_URL").replace(/\/$/, "");

/** Endpoint S3 del bucket. R2 no tiene regiones: siempre `auto`. */
const endpoint = () => `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${R2_BUCKET()}`;

const client = () =>
  new AwsClient({
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });

/**
 * URL prefirmada para un PUT. Vence en `expiresIn` segundos (5 min por defecto):
 * suficiente para subir, y corto para que no sirva de nada si se filtra.
 *
 * El `Content-Type` va firmado, así que el navegador DEBE mandar exactamente el
 * mismo en el PUT o R2 rechaza la firma.
 */
export async function signedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const url = new URL(`${endpoint()}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expiresIn));

  const signed = await client().sign(
    new Request(url, { method: "PUT", headers: { "content-type": contentType } }),
    { aws: { signQuery: true, allHeaders: true } },
  );

  return signed.url;
}

/** URL pública final del objeto, la que se guarda en la BD. */
export function publicUrl(key: string): string {
  return `${R2_PUBLIC_URL()}/${key}`;
}
