// Catálogo de "slots" de imagen de las láminas institucionales de /producto.
//
// El diseño define QUÉ imágenes existen (esta lista); el panel solo decide CUÁL
// archivo va en cada una. Por eso las claves son constantes de código y no filas
// que el admin pueda crear o borrar: si una lámina deja de necesitar una foto,
// se quita el slot aquí y la fila huérfana se ignora.
//
// Convención de claves: `line.<accentKey>.<slot>` y `solutions.<bloque>.<n>`.

import type { AccentKey } from "@/lib/products";

/** Un hueco de imagen editable. `ratio` es lo que se le pide al diseñador. */
export type MediaSlot = {
  key: string;
  title: string;
  hint: string;
  /** El slot lleva rótulo sobre la foto (COSECHADORAS, TRACTORES…). */
  labeled?: boolean;
  /** Tamaño recomendado, en px. Se muestra en el panel y en la guía del cliente. */
  size: string;
};

export type MediaGroup = { id: string; title: string; slots: MediaSlot[] };

const LINE_TITLES: Record<AccentKey, string> = {
  cv: "Jaltest CV — Vehículos comerciales",
  ohw: "Jaltest OHW — Maquinaria pesada",
  agv: "Jaltest AGV — Maquinaria agrícola",
  marine: "Jaltest Marine — Náutica",
  mhe: "Jaltest MHE — Manejo de materiales",
};

export const ACCENT_KEYS: AccentKey[] = ["cv", "ohw", "agv", "marine", "mhe"];

/** Los 5 slots que tiene toda línea: kit del producto + foto grande + 3 de apoyo. */
function lineSlots(id: AccentKey): MediaSlot[] {
  return [
    {
      key: `line.${id}.kit`,
      title: "Kit del producto",
      hint: "El equipo Jaltest sobre fondo transparente, bajo el texto de la lámina.",
      size: "1200 × 700 px · PNG con transparencia",
    },
    {
      key: `line.${id}.main`,
      title: "Foto principal",
      hint: "La grande del panel derecho. Se recorta en diagonal: deja aire a la izquierda.",
      labeled: true,
      size: "1400 × 900 px · JPG o PNG",
    },
    ...[1, 2, 3].map((n) => ({
      key: `line.${id}.sub${n}`,
      title: `Foto de apoyo ${n}`,
      hint: "Mini foto etiquetada bajo la principal.",
      labeled: true,
      size: "600 × 600 px · JPG o PNG",
    })),
  ];
}

export const LINE_MEDIA_GROUPS: MediaGroup[] = ACCENT_KEYS.map((id) => ({
  id,
  title: LINE_TITLES[id],
  slots: lineSlots(id),
}));

/** Las 3 fotos que rotan dentro del hexágono de la sección "Soluciones". */
export const SOLUTIONS_GROUP: MediaGroup = {
  id: "solutions-cables",
  title: "Soluciones — Cables y adaptadores",
  slots: [1, 2, 3].map((n) => ({
    key: `solutions.cables.${n}`,
    title: `Foto ${n} del hexágono`,
    hint: "Set de cables sobre fondo claro. Las 3 se alternan con fundido.",
    size: "1000 × 1000 px · PNG sobre fondo claro",
  })),
};

/** Foto que se publica en el hexágono de cables mientras no suban las suyas. */
export const SOLUTIONS_FALLBACK_IMG = "/images/cable-b.png";

const R2 = "https://pub-d51770ee631f4c29836b56b7e8e01dd6.r2.dev/media";

/** Lámina Panasonic/Dell/Getac: la foto de equipos y los 3 logos de marca. */
export const RUGGED_GROUP: MediaGroup = {
  id: "rugged",
  title: "Laptops y tablets rugged (Panasonic · Dell · Getac)",
  slots: [
    {
      key: "rugged.devices",
      title: "Equipos",
      hint: "El montaje de laptops y tablet de la cabecera de la sección.",
      size: "1900 × 800 px · PNG con transparencia",
    },
    ...["Panasonic", "Dell", "Getac"].map((brand, i) => ({
      key: `rugged.brand${i + 1}`,
      title: `Logo ${brand}`,
      hint: "Logo sobre fondo transparente, dentro de su tarjeta.",
      size: "400 × 140 px · PNG con transparencia",
    })),
  ],
};

/** Imágenes que trae la lámina Panasonic de fábrica, por slot. */
export const RUGGED_DEFAULTS: Record<string, MediaDefault> = {
  "rugged.devices": { img: `${R2}/rugged-devices-a4e81fd3.png` },
  "rugged.brand1": { img: `${R2}/logo-panasonic-bcdd119d.png` },
  "rugged.brand2": { img: `${R2}/logo-dell-abed8ab5.png` },
  "rugged.brand3": { img: `${R2}/logo-getac-7c91fe68.png` },
};

export const MEDIA_GROUPS: MediaGroup[] = [
  ...LINE_MEDIA_GROUPS,
  RUGGED_GROUP,
  SOLUTIONS_GROUP,
];

/** Todas las claves válidas, para validar en la Server Action. */
export const MEDIA_KEYS: string[] = MEDIA_GROUPS.flatMap((g) => g.slots.map((s) => s.key));

/** Lo que se publica en un slot cuando nadie lo ha personalizado. */
export type MediaDefault = { img?: string; labelEs?: string; labelEn?: string };

/**
 * Imagen y etiqueta que hoy salen en cada slot de una línea, con la MISMA
 * prioridad que usa `ProductHero`: producto → recorte original de la lámina.
 * El panel las enseña como "actual", así lo que ves en `/admin/laminas` es lo
 * que ve el visitante.
 */
export function lineDefaults(
  id: AccentKey,
  spec: {
    kitImg: string;
    vehicleImg: string;
    vehicleLabel?: Record<"es" | "en", string>;
    gallery?: { img: string; label: Record<"es" | "en", string> }[];
  },
  productVehicleImg?: string | null,
): Record<string, MediaDefault> {
  const out: Record<string, MediaDefault> = {
    [lineKey(id, "kit")]: { img: spec.kitImg },
    [lineKey(id, "main")]: {
      img: productVehicleImg || spec.vehicleImg,
      labelEs: spec.vehicleLabel?.es,
      labelEn: spec.vehicleLabel?.en,
    },
  };
  for (const [i, slot] of (["sub1", "sub2", "sub3"] as const).entries()) {
    const shot = spec.gallery?.[i];
    out[lineKey(id, slot)] = { img: shot?.img, labelEs: shot?.label.es, labelEn: shot?.label.en };
  }
  return out;
}

export type MediaEntry = { img: string; label: Record<"es" | "en", string> | null };
export type MediaMap = Record<string, MediaEntry | undefined>;

export const lineKey = (id: AccentKey, slot: "kit" | "main" | "sub1" | "sub2" | "sub3") =>
  `line.${id}.${slot}`;
