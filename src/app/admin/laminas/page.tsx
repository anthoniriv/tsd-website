import { requireUser } from "@/lib/auth";
import { getJaltestLines, getSiteMedia } from "@/lib/catalog";
import { LINE_SPECS } from "@/lib/product-specs";
import { ACCENT_KEYS, lineDefaults, MEDIA_GROUPS, type MediaDefault } from "@/lib/site-media";
import { MediaGroupForm, type SlotValue } from "@/components/admin/media-group-form";

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

  const defaults: Record<string, MediaDefault> = {};
  for (const id of ACCENT_KEYS) {
    const line = lines.find((l) => l.id === id);
    Object.assign(defaults, lineDefaults(id, LINE_SPECS[id], line?.vehicleImg));
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Láminas</h1>
        <p className="text-sm text-text-muted">
          Imágenes de la página <strong>Producto</strong>: la foto principal y las 3 de apoyo
          de cada línea Jaltest, el kit del producto y las fotos de la sección de cables.
          Las marcadas como <strong>Actual · del diseño</strong> son las que ya se ven en la
          web; sube una encima para reemplazarlas.
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
            />
          );
        })}
      </div>
    </>
  );
}
