// Data estática de productos. Estructura ecommerce-ready:
// hoy alimenta la landing; mañana se mueve a API / CMS / DB sin tocar la UI.
// Precios y descripciones de catálogo son DEMO (placeholder) hasta tener data real.

export type AccentKey = "cv" | "ohw" | "agv" | "marine" | "mhe";

export const ACCENT: Record<AccentKey, { color: string; bg: string; text: string }> = {
  cv: { color: "var(--color-jt-cv)", bg: "#eef4fb", text: "text-[#2e6db4]" },
  ohw: { color: "var(--color-jt-ohw)", bg: "#fdf3e1", text: "text-[#f5a623]" },
  agv: { color: "var(--color-jt-agv)", bg: "#f0f8e8", text: "text-[#7ac143]" },
  marine: { color: "var(--color-jt-marine)", bg: "#eaf6fc", text: "text-[#4aaedb]" },
  mhe: { color: "var(--color-jt-mhe)", bg: "#fbecee", text: "text-[#b11e2f]" },
};

export type JaltestLine = {
  id: AccentKey;
  brand: "Jaltest";
  variant: string; // CV, OHW, AGV...
  segment: string; // "Commercial Vehicles"
  price: string;
  logo: string; // SVG del logo Jaltest a color
  vehicleImg?: string; // foto del vehículo (cutout); puede faltar
  kitImg: string;
  description: string[];
};

// Categorías hexagonales del header / banner.
export const CATEGORIES = [
  { label: "Off-Highway", icon: "off-highway" },
  { label: "Commercial Vehicle", icon: "truck" },
  { label: "Agriculture Vehicle", icon: "tractor" },
  { label: "Marine", icon: "ship" },
  { label: "Material Handling", icon: "forklift" },
] as const;

// Kits de cobertura (honeycomb home). Imágenes reusan cutouts de vehículos.
export const COVERAGE_KITS = [
  { label: "On-Highway", img: "/images/truck.png" },
  { label: "Off-Highway", img: "/images/veh-ohw.png" },
  { label: "Manejo de Materiales", img: "/images/kit.png" },
  { label: "Marine", img: "/images/veh-marine.png" },
  { label: "Agriculture", img: "/images/tractor.png" },
  { label: "Bundle Kit", img: "/images/veh-cv.png" },
] as const;

export const HARDWARE_KITS = [
  { label: "Tablets + Laptops", img: "/images/laptop.png" },
  { label: "Adapters + Cables", img: "/images/cable-b.png" },
  { label: "Cable Finder", img: "/images/finder-b.png" },
] as const;

export const JALTEST_LINES: JaltestLine[] = [
  {
    id: "cv",
    brand: "Jaltest",
    variant: "CV",
    segment: "Commercial Vehicles",
    price: "$8,995",
    logo: "/images/logo-cv.svg",
    vehicleImg: "/images/veh-cv.png",
    kitImg: "/images/kit.png",
    description: [
      "Jaltest CV es una solución de diagnóstico profesional diseñada para vehículos comerciales, permitiendo trabajar de forma integral en sistemas de motor, frenos, transmisión, ABS, suspensión, emisiones, carrocería y sistemas electrónicos en camiones pesados, medianos y livianos, buses, trailers y pickups. Su amplia cobertura lo convierte en una herramienta ideal para talleres, flotas y empresas de transporte que buscan maximizar productividad y reducir tiempos de inactividad.",
      "Con Jaltest CV podrás realizar funciones avanzadas como regeneraciones de DPF, actualizaciones de sistemas, cambio de parámetros, calibraciones, codificación de inyectores, pruebas bidireccionales y diagnóstico en tiempo real con guías de reparación para más de 100 marcas líderes de la industria, incluyendo Freightliner, Kenworth, Peterbilt, Volvo Trucks, International Motors, Cummins, Detroit Diesel y PACCAR.",
    ],
  },
  {
    id: "ohw",
    brand: "Jaltest",
    variant: "OHW",
    segment: "Off-Highway Vehicles",
    price: "$9,450",
    logo: "/images/logo-ohw.svg",
    vehicleImg: "/images/veh-ohw.png",
    kitImg: "/images/kit.png",
    description: [
      "Jaltest OHW es la solución de diagnóstico profesional diseñada para equipos de construcción y maquinaria pesada. Permite trabajar de forma integral en sistemas de motor, frenos, transmisión, hidráulicos y sistemas electrónicos en retroexcavadoras, cargadores frontales, excavadoras, grúas, compactadores y equipos compactos, además de motores estacionarios y plantas eléctricas.",
      "Con Jaltest OHW podrás realizar funciones avanzadas como cambio de parámetros, regeneración de DPF, codificación de inyectores, calibraciones, pruebas bidireccionales y diagnóstico en tiempo real con guías de reparación para más de 70 marcas líderes, incluyendo John Deere, Caterpillar, Komatsu, Hitachi, Cummins, Bobcat, Hyundai Construction Equipment y New Holland.",
    ],
  },
  {
    id: "agv",
    brand: "Jaltest",
    variant: "AGV",
    segment: "Agricultural Vehicles",
    price: "$8,750",
    logo: "/images/logo-agv.svg",
    vehicleImg: "/images/tractor.png",
    kitImg: "/images/kit.png",
    description: [
      "Jaltest AGV se sitúa como referente en el sector de la reparación de maquinaria agrícola por sus grandes ventajas y posibilidades a la hora de realizar diagnosis y mantenimientos de forma eficaz en tractores, cosechadoras, picadoras o vendimiadoras entre otros.",
      "Ofrece una completa cobertura que incorpora nuevas marcas, modelos y sistemas tres veces al año, lo que garantiza una constante actualización de sus capacidades.",
    ],
  },
  {
    id: "marine",
    brand: "Jaltest",
    variant: "Marine",
    segment: "Multibrand Diagnostics",
    price: "$7,900",
    logo: "/images/logo-marine.svg",
    vehicleImg: "/images/veh-marine.png",
    kitImg: "/images/kit.png",
    description: [
      "El módulo Jaltest Marine es la respuesta de Cojali a las necesidades de diagnosis específicas de la industria náutica. Está diseñado para todo tipo de embarcaciones marinas, incluyendo motos de agua, motores fueraborda e intraborda y motores estacionarios. Ofrece una solución integral multimarca para inspectores náuticos, dealers, talleres independientes y puertos deportivos, con acceso a más de 88 marcas como Volvo Penta, CAT, Yamaha o Mercury.",
      "Ofrece una completa cobertura que incorpora nuevas marcas, modelos y sistemas tres veces al año, lo que garantiza una constante actualización de sus capacidades.",
    ],
  },
  {
    id: "mhe",
    brand: "Jaltest",
    variant: "MHE",
    segment: "Material Handling",
    price: "$8,200",
    logo: "/images/logo-mhe.svg",
    vehicleImg: "/images/veh-mhe.png",
    kitImg: "/images/kit.png",
    description: [
      "Jaltest MHE es una solución de diagnóstico profesional diseñada para equipos de manejo de materiales, permitiendo trabajar de forma integral en sistemas de motor, transmisión, frenos y sistemas electrónicos en montacargas, elevadores, plataformas aéreas y equipos de almacén. Su cobertura está orientada tanto a equipos eléctricos como de combustión.",
      "Con Jaltest MHE podrás realizar funciones avanzadas como lectura y borrado de fallas, cambio de parámetros, calibraciones, pruebas bidireccionales y diagnóstico en tiempo real con guías de reparación para múltiples marcas líderes, incluyendo Hyster, Yale, Toyota Material Handling, Crown Equipment Corporation, JLG Industries, Genie y Skyjack.",
    ],
  },
];

export type HardwareItem = {
  id: string;
  name: string;
  img: string;
  price: string;
  blurb: string;
  category: "laptop" | "cable" | "finder";
};

// Catálogo DEMO de hardware (nombres, precios y descripciones placeholder).
export const LAPTOPS: HardwareItem[] = [
  {
    id: "lap-1",
    name: "Panasonic Toughbook 55",
    img: "/images/laptop.png",
    price: "$3,499",
    blurb: "Rugged 14\" semi-rugged, módulos reemplazables, Intel Core i5, batería hot-swap. Ideal para taller y campo.",
    category: "laptop",
  },
  {
    id: "lap-2",
    name: "Panasonic Toughbook 40",
    img: "/images/laptop.png",
    price: "$4,250",
    blurb: "Fully rugged 14\", certificación MIL-STD-810H, pantalla 1200 nits legible bajo sol, GPS y 4G opcional.",
    category: "laptop",
  },
  {
    id: "lap-3",
    name: "Getac B360 Rugged",
    img: "/images/laptop.png",
    price: "$3,890",
    blurb: "Fully rugged con Intel Core i7, resistente a polvo, agua y caídas. Conectividad flexible para diagnóstico.",
    category: "laptop",
  },
  {
    id: "lap-4",
    name: "Dell Latitude 7330 Rugged",
    img: "/images/laptop.png",
    price: "$4,120",
    blurb: "Ultraligera fully rugged, 13\", autonomía extendida y puertos legacy para interfaces de diagnóstico.",
    category: "laptop",
  },
];

export const CABLES: HardwareItem[] = [
  {
    id: "cab-1",
    name: "Adaptador J1939 Type II (verde)",
    img: "/images/cable-a.png",
    price: "$129",
    blurb: "Deutsch 9-pin verde a OBD-II. Compatible con camiones y buses modernos. Conector reforzado.",
    category: "cable",
  },
  {
    id: "cab-2",
    name: "Adaptador J1939 9-pin (gris)",
    img: "/images/cable-b.png",
    price: "$119",
    blurb: "Deutsch 9-pin gris a OBD-II hembra. Para vehículos comerciales pre-2016. Cable flexible apantallado.",
    category: "cable",
  },
  {
    id: "cab-3",
    name: "Adaptador OBD-II 16 pin",
    img: "/images/cable-a.png",
    price: "$99",
    blurb: "Conector estándar OBD-II de 16 vías. Diagnóstico universal para vehículos livianos y medianos.",
    category: "cable",
  },
  {
    id: "cab-4",
    name: "Adaptador J1708 6-pin",
    img: "/images/cable-b.png",
    price: "$109",
    blurb: "Deutsch 6-pin para protocolos J1708/J1587. Equipos comerciales y maquinaria legacy.",
    category: "cable",
  },
  {
    id: "cab-5",
    name: "Cable de extensión OBD",
    img: "/images/cable-a.png",
    price: "$79",
    blurb: "Extensión de 2 m macho-hembra. Acceso cómodo a puertos de difícil alcance.",
    category: "cable",
  },
  {
    id: "cab-6",
    name: "Adaptador Deutsch 9-pin OEM",
    img: "/images/cable-b.png",
    price: "$139",
    blurb: "Conector OEM de alta durabilidad para uso intensivo en flotas y talleres.",
    category: "cable",
  },
];

export const CABLE_FINDER: HardwareItem[] = [
  {
    id: "fnd-1",
    name: "Jaltest Link MDC11",
    img: "/images/finder-b.png",
    price: "$1,290",
    blurb: "Interfaz de diagnóstico inalámbrica multimarca. Bluetooth + USB, firmware actualizable.",
    category: "finder",
  },
  {
    id: "fnd-2",
    name: "Cable Finder Universal",
    img: "/images/finder-a.png",
    price: "$349",
    blurb: "Cable de identificación de pinout multivehículo. Detecta automáticamente el protocolo.",
    category: "finder",
  },
  {
    id: "fnd-3",
    name: "Jaltest MDC11 Marine",
    img: "/images/finder-b.png",
    price: "$1,390",
    blurb: "Versión marina de la interfaz MDC11. Sellado IP para entornos náuticos.",
    category: "finder",
  },
  {
    id: "fnd-4",
    name: "Cable diagnóstico extendido",
    img: "/images/finder-a.png",
    price: "$299",
    blurb: "Cable reforzado de 3 m para conexiones a distancia en maquinaria pesada.",
    category: "finder",
  },
];
