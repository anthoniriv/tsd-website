// Contenido de la lámina comercial de cada línea Jaltest (el diseño que mandó el
// cliente: titular, bullets de funciones, marcas compatibles y cifras).
//
// Vive en código y no en BD a propósito: es copy de marketing que cambia por
// rediseño, no por operación. Si el cliente pide editarlo desde el panel, la
// forma es mover este objeto a columnas JSONB de `products` — los tipos ya
// están pensados para eso (`Localized<T>` mapea 1:1 con lo que guarda la BD).
//
// Los recortes (`brandsImg`, `kitImg`, `vehicleImg`) salen de las láminas
// originales y se sirven desde R2: el grid de logos de fabricantes no se puede
// recrear en HTML sin los assets de cada marca.
//
// Retoques ya aplicados (docx "Retoques en diseño"):
//  · "Diagnóstico en tiempo real" → "Diagramas eléctricos" (mismo icono).
//  · "Información y guías de reparación" → "… en tu idioma".
//  · "1 año de actualizaciones" → "1 año de licencia y actualizaciones".
//  · Funciones avanzadas termina en "… y muchas más".
//  · Fuera el panel "Solicitar cotización": su lugar lo ocupan los dos CTA.

import type { Localized } from "@/lib/i18n";
import type { AccentKey } from "@/lib/products";

const R2 = "https://pub-d51770ee631f4c29836b56b7e8e01dd6.r2.dev/media";

/** Iconos disponibles para los bullets de "Funciones avanzadas". */
export type FeatureIcon =
  | "dpf"
  | "update"
  | "wiring"
  | "injector"
  | "bidirectional"
  | "manual"
  | "params"
  | "calibration"
  | "fault"
  | "actuator"
  | "config"
  | "report"
  | "realtime";

export type Feature = { icon: FeatureIcon; label: Localized<string> };

export type Stat = { value: string; label: Localized<string> };

export type LineSpec = {
  /** Titular a dos líneas: la segunda va en el color de la línea. */
  headline: Localized<[string, string]>;
  /** Párrafos de apoyo bajo el titular. */
  intro: Localized<string[]>;
  features: Feature[];
  /** Título del panel de marcas ("Compatible con más de 100 marcas líderes"). */
  brandsTitle: Localized<string>;
  brandsImg: string;
  /** Pie del panel de marcas. */
  brandsFootnote: Localized<string>;
  stats: Stat[];
  kitImg: string;
  vehicleImg: string;
  /** Etiquetas sueltas de la lámina (MHE y Marine las tienen). */
  badges?: Localized<string>[];
};

// Bullets compartidos: el docx pide que OHW/AGV/Marine/MHE usen la misma base
// que CV, con las variaciones propias de cada línea.
const F = {
  dpf: {
    icon: "dpf" as const,
    label: { es: "Regeneración de DPF", en: "DPF regeneration" },
  },
  update: {
    icon: "update" as const,
    label: { es: "Actualizaciones de sistemas", en: "System updates" },
  },
  wiring: {
    icon: "wiring" as const,
    label: { es: "Diagramas eléctricos", en: "Wiring diagrams" },
  },
  injector: {
    icon: "injector" as const,
    label: { es: "Codificación de inyectores", en: "Injector coding" },
  },
  bidirectional: {
    icon: "bidirectional" as const,
    label: { es: "Pruebas bidireccionales", en: "Bidirectional tests" },
  },
  manual: {
    icon: "manual" as const,
    label: {
      es: "Información técnica y guías de reparación en tu idioma",
      en: "Technical information and repair guides in your language",
    },
  },
  params: {
    icon: "params" as const,
    label: { es: "Cambio de parámetros", en: "Parameter changes" },
  },
  calibration: {
    icon: "calibration" as const,
    label: { es: "Calibraciones", en: "Calibrations" },
  },
  fault: {
    icon: "fault" as const,
    label: { es: "Lectura y borrado de fallas", en: "Fault reading and clearing" },
  },
  actuator: {
    icon: "actuator" as const,
    label: { es: "Pruebas de actuadores", en: "Actuator tests" },
  },
  config: {
    icon: "config" as const,
    label: { es: "Configuración de componentes", en: "Component configuration" },
  },
  report: {
    icon: "report" as const,
    label: { es: "Registro y reporte de datos", en: "Data logging and reporting" },
  },
  realtime: {
    icon: "realtime" as const,
    label: { es: "Datos en tiempo real", en: "Real-time data" },
  },
};

const UPDATES_PER_YEAR: Stat = {
  value: "3",
  label: { es: "actualizaciones al año", en: "updates per year" },
};

const GROWING_COVERAGE: Stat = {
  value: "↗",
  label: { es: "cobertura en constante crecimiento", en: "constantly growing coverage" },
};

export const LINE_SPECS: Record<AccentKey, LineSpec> = {
  cv: {
    headline: {
      es: ["Diagnóstico profesional", "para vehículos comerciales"],
      en: ["Professional diagnostics", "for commercial vehicles"],
    },
    intro: {
      es: [
        "La solución integral para camiones pesados, medianos y livianos, buses, trailers y pickups.",
        "Más cobertura, más funciones, más productividad para tu taller o flota.",
      ],
      en: [
        "The all-in-one solution for heavy, medium and light trucks, buses, trailers and pickups.",
        "More coverage, more functions, more productivity for your shop or fleet.",
      ],
    },
    features: [F.dpf, F.update, F.wiring, F.injector, F.bidirectional, F.manual, F.params, F.calibration],
    brandsTitle: {
      es: "Compatible con más de 100 marcas líderes",
      en: "Compatible with over 100 leading brands",
    },
    brandsImg: `${R2}/lamina-brands-cv-b2b88615.png`,
    brandsFootnote: { es: "Y muchos fabricantes más…", en: "And many more manufacturers…" },
    stats: [
      { value: "100+", label: { es: "marcas", en: "brands" } },
      { value: "35,000+", label: { es: "sistemas", en: "systems" } },
      UPDATES_PER_YEAR,
      GROWING_COVERAGE,
    ],
    kitImg: `${R2}/lamina-kit-cv-v2-9c6a9bac.png`,
    vehicleImg: `${R2}/lamina-veh-cv-8d6611e1.png`,
  },

  ohw: {
    headline: {
      es: ["Diagnóstico profesional para", "maquinaria de construcción y equipos pesados"],
      en: ["Professional diagnostics for", "construction machinery and heavy equipment"],
    },
    intro: {
      es: [
        "Jaltest OHW te permite trabajar de forma integral en los sistemas de motor, transmisión, hidráulicos, frenos y electrónica en retroexcavadoras, cargadores frontales, excavadoras, grúas, compactadores y equipos compactos, además de motores estacionarios y plantas eléctricas.",
        "La herramienta ideal para talleres, empresas de alquiler, contratistas y flotas.",
      ],
      en: [
        "Jaltest OHW lets you work comprehensively on engine, transmission, hydraulic, brake and electronic systems across backhoes, wheel loaders, excavators, cranes, compactors and compact equipment, as well as stationary engines and generator sets.",
        "The ideal tool for shops, rental companies, contractors and fleets.",
      ],
    },
    features: [F.params, F.dpf, F.calibration, F.injector, F.bidirectional, F.wiring, F.update, F.manual],
    brandsTitle: {
      es: "Compatible con los principales fabricantes",
      en: "Compatible with the leading manufacturers",
    },
    brandsImg: `${R2}/lamina-brands-ohw-b67a43fb.png`,
    brandsFootnote: {
      es: "Y más de 70 marcas líderes en maquinaria pesada y construcción",
      en: "And over 70 leading heavy machinery and construction brands",
    },
    stats: [
      { value: "70+", label: { es: "marcas", en: "brands" } },
      { value: "20,000+", label: { es: "sistemas", en: "systems" } },
      UPDATES_PER_YEAR,
      GROWING_COVERAGE,
    ],
    kitImg: `${R2}/lamina-kit-ohw-v2-6b7ff33d.png`,
    vehicleImg: `${R2}/lamina-veh-ohw-1de22235.png`,
  },

  agv: {
    headline: {
      es: ["Diagnóstico profesional", "para maquinaria agrícola"],
      en: ["Professional diagnostics", "for agricultural machinery"],
    },
    intro: {
      es: [
        "Diagnostica tractores, cosechadoras, pulverizadoras, picadoras y otros equipos agrícolas con una sola herramienta.",
        "Accede a funciones avanzadas, información técnica y actualizaciones continuas para mantener tu operación siempre productiva.",
      ],
      en: [
        "Diagnose tractors, combines, sprayers, foragers and other agricultural equipment with a single tool.",
        "Access advanced functions, technical information and continuous updates to keep your operation productive.",
      ],
    },
    features: [F.dpf, F.update, F.wiring, F.injector, F.bidirectional, F.manual, F.params, F.calibration],
    brandsTitle: {
      es: "Compatible con más de 70 fabricantes líderes",
      en: "Compatible with over 70 leading manufacturers",
    },
    brandsImg: `${R2}/lamina-brands-agv-34647443.png`,
    brandsFootnote: { es: "Y muchos fabricantes más…", en: "And many more manufacturers…" },
    stats: [
      { value: "70+", label: { es: "fabricantes compatibles", en: "compatible manufacturers" } },
      { value: "20,000+", label: { es: "sistemas cubiertos", en: "systems covered" } },
      UPDATES_PER_YEAR,
      GROWING_COVERAGE,
    ],
    kitImg: `${R2}/lamina-kit-agv-v2-9ea03a01.png`,
    vehicleImg: `${R2}/lamina-veh-agv-f22d5698.png`,
  },

  marine: {
    headline: {
      es: ["Diagnóstico profesional", "para la industria náutica"],
      en: ["Professional diagnostics", "for the marine industry"],
    },
    intro: {
      es: [
        "Solución multimarca diseñada para todo tipo de embarcaciones marinas y motores marinos. Incluye motores fuera de borda, motores intraborda, motos de agua y motores estacionarios.",
      ],
      en: [
        "A multi-brand solution built for all types of watercraft and marine engines: outboard engines, inboard engines, jet skis and stationary engines.",
      ],
    },
    features: [
      F.update,
      F.calibration,
      F.wiring,
      F.fault,
      F.actuator,
      F.config,
      F.realtime,
      F.manual,
      F.report,
    ],
    brandsTitle: {
      es: "Compatible con más de 88 marcas líderes",
      en: "Compatible with over 88 leading brands",
    },
    brandsImg: `${R2}/lamina-brands-marine-8b6bad06.png`,
    brandsFootnote: { es: "Y muchas marcas más…", en: "And many more brands…" },
    stats: [
      { value: "88+", label: { es: "marcas compatibles", en: "compatible brands" } },
      { value: "10,000+", label: { es: "sistemas cubiertos", en: "systems covered" } },
      UPDATES_PER_YEAR,
      GROWING_COVERAGE,
    ],
    kitImg: `${R2}/lamina-kit-marine-v2-53247f3f.png`,
    vehicleImg: `${R2}/lamina-veh-marine-08548049.png`,
    badges: [
      { es: "Solución multimarca", en: "Multi-brand solution" },
      { es: "Diagnóstico especializado", en: "Specialized diagnostics" },
      { es: "Cobertura completa", en: "Full coverage" },
    ],
  },

  mhe: {
    headline: {
      es: ["Diagnóstico profesional", "para equipos de manejo de materiales"],
      en: ["Professional diagnostics", "for material handling equipment"],
    },
    intro: {
      es: [
        "Trabaja de forma integral en montacargas, elevadores, plataformas aéreas y equipos de almacén.",
        "Diagnóstico avanzado para equipos eléctricos y de combustión.",
      ],
      en: [
        "Work comprehensively on forklifts, lifts, aerial platforms and warehouse equipment.",
        "Advanced diagnostics for both electric and combustion equipment.",
      ],
    },
    features: [
      F.fault,
      F.calibration,
      F.actuator,
      F.params,
      F.wiring,
      F.config,
      F.bidirectional,
      F.manual,
      F.report,
    ],
    brandsTitle: {
      es: "Compatible con múltiples marcas líderes",
      en: "Compatible with multiple leading brands",
    },
    brandsImg: `${R2}/lamina-brands-mhe-0456f5e8.png`,
    brandsFootnote: { es: "Y muchas marcas más…", en: "And many more brands…" },
    stats: [
      { value: "70+", label: { es: "marcas", en: "brands" } },
      {
        value: "1000s",
        label: { es: "sistemas cubiertos y en crecimiento", en: "systems covered and growing" },
      },
      UPDATES_PER_YEAR,
      GROWING_COVERAGE,
    ],
    kitImg: `${R2}/lamina-kit-mhe-v2-f5bb66ee.png`,
    vehicleImg: `${R2}/lamina-veh-mhe-7a243f17.png`,
    badges: [
      { es: "Equipos eléctricos", en: "Electric equipment" },
      { es: "Equipos de combustión", en: "Combustion equipment" },
    ],
  },
};
