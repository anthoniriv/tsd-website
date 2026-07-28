// Sube a R2 las imágenes que hoy viven en public/images y reescribe la BD para
// que apunten a la URL pública del bucket.
//
// Idempotente: lo que ya es una URL http(s) se deja como está, así que se puede
// correr varias veces y contra varias ramas sin duplicar nada.
//
//   node --env-file=.env.local scripts/migrate-images-to-r2.mjs           (dry run)
//   node --env-file=.env.local scripts/migrate-images-to-r2.mjs --apply
//
// Por defecto usa DATABASE_URL. Para apuntar a otra base:
//   TARGET_DB_URL="postgres://…" node --env-file=.env.local scripts/… --apply

import { neon } from "@neondatabase/serverless";
import { AwsClient } from "aws4fetch";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const sql = neon(process.env.TARGET_DB_URL ?? process.env.DATABASE_URL);

const r2 = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto",
});
const BUCKET = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}`;
const PUBLIC = process.env.R2_PUBLIC_URL.replace(/\/$/, "");

const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml", avif: "image/avif" };

/** Sube una vez por archivo aunque lo compartan varios productos. */
const cache = new Map();

async function migrate(value, prefix = "catalog") {
  if (!value || /^https?:\/\//.test(value)) return value; // ya migrado o externo
  if (cache.has(value)) return cache.get(value);

  const local = path.join(process.cwd(), "public", value.replace(/^\//, ""));
  if (!existsSync(local)) {
    console.warn(`  ⚠️  no existe en public/: ${value} — se deja como está`);
    cache.set(value, value);
    return value;
  }

  const name = path.basename(value);
  const ext = name.split(".").pop().toLowerCase();
  const key = `${prefix}/${name}`;
  const url = `${PUBLIC}/${key}`;

  if (APPLY) {
    const res = await r2.fetch(`${BUCKET}/${key}`, {
      method: "PUT",
      body: await readFile(local),
      headers: { "content-type": MIME[ext] ?? "application/octet-stream" },
    });
    if (!res.ok) throw new Error(`PUT ${key} → ${res.status} ${await res.text()}`);
  }

  console.log(`  ${value}  →  ${key}`);
  cache.set(value, url);
  return url;
}

console.log(APPLY ? "APLICANDO\n" : "DRY RUN (sin --apply no se escribe nada)\n");

console.log("productos:");
for (const p of await sql`select id, slug, img, vehicle_img, gallery from products order by slug`) {
  const img = await migrate(p.img);
  const veh = await migrate(p.vehicle_img);
  const gal = [];
  for (const g of p.gallery ?? []) gal.push(await migrate(g));

  if (APPLY && (img !== p.img || veh !== p.vehicle_img || JSON.stringify(gal) !== JSON.stringify(p.gallery))) {
    await sql`update products set img = ${img}, vehicle_img = ${veh}, gallery = ${JSON.stringify(gal)}::jsonb where id = ${p.id}`;
  }
}

console.log("\nbanners:");
for (const b of await sql`select id, img from banners`) {
  const img = await migrate(b.img);
  if (APPLY && img !== b.img) await sql`update banners set img = ${img} where id = ${b.id}`;
}

// El logo del correo no puede salir del sitio: en local sería localhost y en un
// preview estaría detrás del SSO de Vercel. Vive en R2, que siempre es público.
console.log("\nlogo para los correos:");
await migrate("/images/logo-tds-black.png", "brand");

console.log(APPLY ? "\n✅ listo" : "\n(dry run — repite con --apply)");
