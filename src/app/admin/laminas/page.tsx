import { requireUser } from "@/lib/auth";
import { getSiteMedia } from "@/lib/catalog";
import { MEDIA_GROUPS } from "@/lib/site-media";
import { MediaGroupForm, type SlotValue } from "@/components/admin/media-group-form";

/**
 * Imágenes de las láminas institucionales de /producto. No hay altas ni bajas:
 * los huecos los define el diseño; aquí solo se reemplaza el archivo de cada uno.
 * Un hueco vacío devuelve la imagen original de la lámina.
 */
export default async function LaminasPage() {
  await requireUser();
  const media = await getSiteMedia();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Láminas</h1>
        <p className="text-sm text-text-muted">
          Imágenes de la página <strong>Producto</strong>: la foto principal y las 3 de apoyo
          de cada línea Jaltest, el kit del producto y las fotos de la sección de cables.
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
          return <MediaGroupForm key={group.id} group={group} values={values} />;
        })}
      </div>
    </>
  );
}
