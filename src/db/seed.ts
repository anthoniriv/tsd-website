// Seed: vuelca el catálogo que hoy vive hardcodeado en `src/lib/products.ts` a la BD,
// de modo que tras migrar el sitio se vea EXACTAMENTE igual que antes.
//
// Los precios por tier se derivan una única vez con el factor DEMO histórico
// (us=1, latam=1.12, es=1.06). A partir de aquí son valores explícitos y el admin
// los edita a mano — el multiplicador desaparece del código.
//
//   node --env-file=.env.local node_modules/.bin/tsx src/db/seed.ts

import { hash } from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { CATALOG_SEED, JALTEST_SEED } from "./seed-data";

const SEED_TIER_FACTOR = { us: 1, latam: 1.12, es: 1.06 } as const;

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function priceRows(productId: string, baseUSD: number) {
  return (["us", "latam", "es"] as const).map((tier) => ({
    productId,
    tier,
    amountCents: Math.round(baseUSD * SEED_TIER_FACTOR[tier]) * 100,
  }));
}

async function main() {
  console.log("Limpiando catálogo…");
  await db.delete(schema.productPrices);
  await db.delete(schema.products);
  await db.delete(schema.banners);

  console.log("Insertando líneas Jaltest…");
  let sort = 0;
  for (const line of JALTEST_SEED) {
    const [row] = await db
      .insert(schema.products)
      .values({
        slug: `jaltest-${line.id}`,
        kind: "jaltest",
        accentKey: line.id,
        brand: line.brand,
        variant: line.variant,
        segment: line.segment,
        name: {
          es: `${line.brand} ${line.variant}`,
          en: `${line.brand} ${line.variant}`,
        },
        description: line.description,
        img: line.kitImg,
        vehicleImg: line.vehicleImg,
        logo: line.logo,
        stock: 10,
        status: "published",
        sort: sort++,
      })
      .returning({ id: schema.products.id });

    await db.insert(schema.productPrices).values(await priceRows(row.id, line.priceUSD));
  }

  console.log("Insertando hardware…");
  sort = 0;
  for (const item of CATALOG_SEED) {
    const [row] = await db
      .insert(schema.products)
      .values({
        slug: `${item.category}-${slugify(item.name.en)}`,
        kind: "hardware",
        category: item.category,
        sku: item.id.toUpperCase(),
        name: item.name,
        blurb: item.blurb,
        img: item.img,
        stock: 25,
        status: "published",
        sort: sort++,
      })
      .returning({ id: schema.products.id });

    await db.insert(schema.productPrices).values(await priceRows(row.id, item.priceUSD));
  }

  console.log("Insertando banners del hero…");
  await db.insert(schema.banners).values([
    { key: "home-hero", img: "/images/hero.jpg", sort: 0, active: true },
    { key: "home-hero", img: "/images/hero2.jpg", sort: 1, active: true },
  ]);

  console.log("Sembrando ajustes globales por defecto…");
  await db
    .insert(schema.appSettings)
    .values({
      id: "global",
      shippingCents: 0,
      shippingEta: { es: "3–5 días hábiles", en: "3–5 business days" },
    })
    .onConflictDoNothing();

  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (email && password) {
    console.log(`Creando admin owner ${email}…`);
    await db
      .insert(schema.adminUsers)
      .values({
        email: email.toLowerCase(),
        passwordHash: await hash(password, 12),
        name: "TDS Admin",
        role: "owner",
      })
      .onConflictDoNothing();
  } else {
    console.log("(sin ADMIN_SEED_EMAIL/PASSWORD → no se crea usuario admin)");
  }

  console.log("Seed OK.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
