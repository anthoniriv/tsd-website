import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productPrices, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getJaltestLines, getSiteMedia } from "@/lib/catalog";
import { LINE_SPECS } from "@/lib/product-specs";
import {
  ACCENT_KEYS,
  lineDefaults,
  MEDIA_GROUPS,
  RUGGED_DEFAULTS,
  SOLUTIONS_FALLBACK_IMG,
  type MediaDefault,
} from "@/lib/site-media";
import {
  MediaGroupForm,
  type LinePrices,
  type SlotValue,
} from "@/components/admin/media-group-form";

/**
 * Imágenes de las láminas institucionales de /producto. No hay altas ni bajas:
 * los huecos los define el diseño; aquí solo se reemplaza el archivo de cada uno.
 * Un hueco sin personalizar enseña —marcada como tal— la imagen que el visitante
 * está viendo hoy, que sale del diseño original.
 */
export default async function LaminasPage() {
  await requireUser();

  // El tier no altera las imágenes; se pide uno cualquiera para leer las líneas.
  const [media, lines] = await Promise.all([getSiteMedia(), getJaltestLines("us")]);

  const defaults: Record<string, MediaDefault> = {
    ...RUGGED_DEFAULTS,
    // El hexágono de cables publica hoy la foto genérica en la primera posición.
    "solutions.cables.1": { img: SOLUTIONS_FALLBACK_IMG },
  };
  for (const id of ACCENT_KEYS) {
    const line = lines.find((l) => l.id === id);
    Object.assign(defaults, lineDefaults(id, LINE_SPECS[id], line?.vehicleImg));
  }

  // Precios por tarifa de cada línea (los grupos de lámina de línea llevan el
  // `accentKey` como id). Se leen los 2 tiers de una vez: la lámina los edita.
  const priceRows = await db
    .select({
      accentKey: products.accentKey,
      productId: products.id,
      tier: productPrices.tier,
      amountCents: productPrices.amountCents,
    })
    .from(products)
    .leftJoin(productPrices, eq(productPrices.productId, products.id))
    .where(eq(products.kind, "jaltest"));

  const pricesByLine: Record<string, LinePrices> = {};
  for (const row of priceRows) {
    if (!row.accentKey) continue;
    const entry = (pricesByLine[row.accentKey] ??= {
      productId: row.productId,
      priceUs: "",
      priceWorld: "",
    });
    if (row.amountCents == null) continue;
    const dollars = String(row.amountCents / 100);
    if (row.tier === "us") entry.priceUs = dollars;
    if (row.tier === "world") entry.priceWorld = dollars;
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Láminas</h1>
        <p className="text-sm text-text-muted">
          Imágenes de la página <strong>Producto</strong>: la foto principal y las 3 de apoyo
          de cada línea Jaltest, el kit del producto y las fotos de la sección de cables.
          Las marcadas como <strong>Actual · del diseño</strong> son las que ya se ven en la
          web; sube una encima para reemplazarlas. En cada línea Jaltest se editan
          también sus dos precios (USA/Canadá y resto del mundo).
        </p>
      </header>

      <div className="space-y-6">
        {MEDIA_GROUPS.map((group) => {
          const values: Record<string, SlotValue> = Object.fromEntries(
            group.slots.map((slot) => {
              const entry = media[slot.key];
              return [
                slot.key,
                {
                  img: entry?.img ?? "",
                  labelEs: entry?.label?.es ?? "",
                  labelEn: entry?.label?.en ?? "",
                },
              ];
            }),
          );
          return (
            <MediaGroupForm
              key={group.id}
              group={group}
              values={values}
              defaults={defaults}
              prices={pricesByLine[group.id]}
            />
          );
        })}
      </div>
    </>
  );
}
