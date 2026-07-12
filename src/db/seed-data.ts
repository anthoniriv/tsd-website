// Snapshot del catálogo estático original (el que vivía en `src/lib/products.ts`).
// Solo lo usa el seed. La app ya no lee de aquí.

import type { HardwareItem, JaltestLine } from "@/lib/products";

export const JALTEST_SEED: JaltestLine[] = [
  {
    id: "cv",
    brand: "Jaltest",
    variant: "CV",
    segment: "Commercial Vehicles",
    priceUSD: 8995,
    logo: "/images/logo-cv.svg",
    vehicleImg: "/images/veh-cv.png",
    kitImg: "/images/kit.png",
    description: {
      es: [
        "Jaltest CV es una solución de diagnóstico profesional diseñada para vehículos comerciales, permitiendo trabajar de forma integral en sistemas de motor, frenos, transmisión, ABS, suspensión, emisiones, carrocería y sistemas electrónicos en camiones pesados, medianos y livianos, buses, trailers y pickups. Su amplia cobertura lo convierte en una herramienta ideal para talleres, flotas y empresas de transporte que buscan maximizar productividad y reducir tiempos de inactividad.",
        "Con Jaltest CV podrás realizar funciones avanzadas como regeneraciones de DPF, actualizaciones de sistemas, cambio de parámetros, calibraciones, codificación de inyectores, pruebas bidireccionales y diagnóstico en tiempo real con guías de reparación para más de 100 marcas líderes de la industria, incluyendo Freightliner, Kenworth, Peterbilt, Volvo Trucks, International Motors, Cummins, Detroit Diesel y PACCAR.",
      ],
      en: [
        "Jaltest CV is a professional diagnostic solution built for commercial vehicles, letting you work comprehensively on engine, brakes, transmission, ABS, suspension, emissions, body and electronic systems across heavy, medium and light trucks, buses, trailers and pickups. Its broad coverage makes it an ideal tool for shops, fleets and transport companies looking to maximize productivity and reduce downtime.",
        "With Jaltest CV you can perform advanced functions such as DPF regenerations, system updates, parameter changes, calibrations, injector coding, bidirectional tests and real-time diagnostics with repair guides for over 100 leading brands, including Freightliner, Kenworth, Peterbilt, Volvo Trucks, International Motors, Cummins, Detroit Diesel and PACCAR.",
      ],
    },
  },
  {
    id: "ohw",
    brand: "Jaltest",
    variant: "OHW",
    segment: "Off-Highway Vehicles",
    priceUSD: 9450,
    logo: "/images/logo-ohw.svg",
    vehicleImg: "/images/veh-ohw.png",
    kitImg: "/images/kit.png",
    description: {
      es: [
        "Jaltest OHW es la solución de diagnóstico profesional diseñada para equipos de construcción y maquinaria pesada. Permite trabajar de forma integral en sistemas de motor, frenos, transmisión, hidráulicos y sistemas electrónicos en retroexcavadoras, cargadores frontales, excavadoras, grúas, compactadores y equipos compactos, además de motores estacionarios y plantas eléctricas.",
        "Con Jaltest OHW podrás realizar funciones avanzadas como cambio de parámetros, regeneración de DPF, codificación de inyectores, calibraciones, pruebas bidireccionales y diagnóstico en tiempo real con guías de reparación para más de 70 marcas líderes, incluyendo John Deere, Caterpillar, Komatsu, Hitachi, Cummins, Bobcat, Hyundai Construction Equipment y New Holland.",
      ],
      en: [
        "Jaltest OHW is the professional diagnostic solution built for construction equipment and heavy machinery. It lets you work comprehensively on engine, brakes, transmission, hydraulic and electronic systems across backhoes, wheel loaders, excavators, cranes, compactors and compact equipment, as well as stationary engines and generator sets.",
        "With Jaltest OHW you can perform advanced functions such as parameter changes, DPF regeneration, injector coding, calibrations, bidirectional tests and real-time diagnostics with repair guides for over 70 leading brands, including John Deere, Caterpillar, Komatsu, Hitachi, Cummins, Bobcat, Hyundai Construction Equipment and New Holland.",
      ],
    },
  },
  {
    id: "agv",
    brand: "Jaltest",
    variant: "AGV",
    segment: "Agricultural Vehicles",
    priceUSD: 8750,
    logo: "/images/logo-agv.svg",
    vehicleImg: "/images/tractor.png",
    kitImg: "/images/kit.png",
    description: {
      es: [
        "Jaltest AGV se sitúa como referente en el sector de la reparación de maquinaria agrícola por sus grandes ventajas y posibilidades a la hora de realizar diagnosis y mantenimientos de forma eficaz en tractores, cosechadoras, picadoras o vendimiadoras entre otros.",
        "Ofrece una completa cobertura que incorpora nuevas marcas, modelos y sistemas tres veces al año, lo que garantiza una constante actualización de sus capacidades.",
      ],
      en: [
        "Jaltest AGV stands as a benchmark in the agricultural machinery repair sector thanks to its major advantages and possibilities when it comes to effectively diagnosing and servicing tractors, combines, foragers and grape harvesters, among others.",
        "It offers complete coverage that adds new brands, models and systems three times a year, ensuring its capabilities are constantly updated.",
      ],
    },
  },
  {
    id: "marine",
    brand: "Jaltest",
    variant: "Marine",
    segment: "Multibrand Diagnostics",
    priceUSD: 7900,
    logo: "/images/logo-marine.svg",
    vehicleImg: "/images/veh-marine.png",
    kitImg: "/images/kit.png",
    description: {
      es: [
        "El módulo Jaltest Marine es la respuesta de Cojali a las necesidades de diagnosis específicas de la industria náutica. Está diseñado para todo tipo de embarcaciones marinas, incluyendo motos de agua, motores fueraborda e intraborda y motores estacionarios. Ofrece una solución integral multimarca para inspectores náuticos, dealers, talleres independientes y puertos deportivos, con acceso a más de 88 marcas como Volvo Penta, CAT, Yamaha o Mercury.",
        "Ofrece una completa cobertura que incorpora nuevas marcas, modelos y sistemas tres veces al año, lo que garantiza una constante actualización de sus capacidades.",
      ],
      en: [
        "The Jaltest Marine module is Cojali's answer to the specific diagnostic needs of the marine industry. It is designed for all types of watercraft, including jet skis, outboard and inboard engines and stationary engines. It offers a comprehensive multi-brand solution for marine surveyors, dealers, independent shops and marinas, with access to more than 88 brands such as Volvo Penta, CAT, Yamaha and Mercury.",
        "It offers complete coverage that adds new brands, models and systems three times a year, ensuring its capabilities are constantly updated.",
      ],
    },
  },
  {
    id: "mhe",
    brand: "Jaltest",
    variant: "MHE",
    segment: "Material Handling",
    priceUSD: 8200,
    logo: "/images/logo-mhe.svg",
    vehicleImg: "/images/veh-mhe.png",
    kitImg: "/images/kit.png",
    description: {
      es: [
        "Jaltest MHE es una solución de diagnóstico profesional diseñada para equipos de manejo de materiales, permitiendo trabajar de forma integral en sistemas de motor, transmisión, frenos y sistemas electrónicos en montacargas, elevadores, plataformas aéreas y equipos de almacén. Su cobertura está orientada tanto a equipos eléctricos como de combustión.",
        "Con Jaltest MHE podrás realizar funciones avanzadas como lectura y borrado de fallas, cambio de parámetros, calibraciones, pruebas bidireccionales y diagnóstico en tiempo real con guías de reparación para múltiples marcas líderes, incluyendo Hyster, Yale, Toyota Material Handling, Crown Equipment Corporation, JLG Industries, Genie y Skyjack.",
      ],
      en: [
        "Jaltest MHE is a professional diagnostic solution built for material-handling equipment, letting you work comprehensively on engine, transmission, brakes and electronic systems across forklifts, lifts, aerial platforms and warehouse equipment. Its coverage targets both electric and combustion equipment.",
        "With Jaltest MHE you can perform advanced functions such as fault reading and clearing, parameter changes, calibrations, bidirectional tests and real-time diagnostics with repair guides for multiple leading brands, including Hyster, Yale, Toyota Material Handling, Crown Equipment Corporation, JLG Industries, Genie and Skyjack.",
      ],
    },
  },
];

export const CATALOG_SEED: HardwareItem[] = [
  {
    id: "lap-1",
    name: { es: "Panasonic Toughbook 55", en: "Panasonic Toughbook 55" },
    img: "/images/laptop.png",
    priceUSD: 3499,
    blurb: {
      es: 'Rugged 14" semi-rugged, módulos reemplazables, Intel Core i5, batería hot-swap. Ideal para taller y campo.',
      en: 'Semi-rugged 14", swappable modules, Intel Core i5, hot-swap battery. Ideal for shop and field.',
    },
    category: "laptop",
  },
  {
    id: "lap-2",
    name: { es: "Panasonic Toughbook 40", en: "Panasonic Toughbook 40" },
    img: "/images/laptop.png",
    priceUSD: 4250,
    blurb: {
      es: 'Fully rugged 14", certificación MIL-STD-810H, pantalla 1200 nits legible bajo sol, GPS y 4G opcional.',
      en: 'Fully rugged 14", MIL-STD-810H certified, 1200-nit sunlight-readable display, optional GPS and 4G.',
    },
    category: "laptop",
  },
  {
    id: "lap-3",
    name: { es: "Getac B360 Rugged", en: "Getac B360 Rugged" },
    img: "/images/laptop.png",
    priceUSD: 3890,
    blurb: {
      es: "Fully rugged con Intel Core i7, resistente a polvo, agua y caídas. Conectividad flexible para diagnóstico.",
      en: "Fully rugged with Intel Core i7, resistant to dust, water and drops. Flexible connectivity for diagnostics.",
    },
    category: "laptop",
  },
  {
    id: "lap-4",
    name: { es: "Dell Latitude 7330 Rugged", en: "Dell Latitude 7330 Rugged" },
    img: "/images/laptop.png",
    priceUSD: 4120,
    blurb: {
      es: 'Ultraligera fully rugged, 13", autonomía extendida y puertos legacy para interfaces de diagnóstico.',
      en: 'Ultralight fully rugged, 13", extended battery life and legacy ports for diagnostic interfaces.',
    },
    category: "laptop",
  },
  {
    id: "cab-1",
    name: { es: "Adaptador J1939 Type II (verde)", en: "J1939 Type II Adapter (green)" },
    img: "/images/cable-a.png",
    priceUSD: 129,
    blurb: {
      es: "Deutsch 9-pin verde a OBD-II. Compatible con camiones y buses modernos. Conector reforzado.",
      en: "Green Deutsch 9-pin to OBD-II. Compatible with modern trucks and buses. Reinforced connector.",
    },
    category: "cable",
  },
  {
    id: "cab-2",
    name: { es: "Adaptador J1939 9-pin (gris)", en: "J1939 9-pin Adapter (gray)" },
    img: "/images/cable-b.png",
    priceUSD: 119,
    blurb: {
      es: "Deutsch 9-pin gris a OBD-II hembra. Para vehículos comerciales pre-2016. Cable flexible apantallado.",
      en: "Gray Deutsch 9-pin to female OBD-II. For pre-2016 commercial vehicles. Flexible shielded cable.",
    },
    category: "cable",
  },
  {
    id: "cab-3",
    name: { es: "Adaptador OBD-II 16 pin", en: "OBD-II 16-pin Adapter" },
    img: "/images/cable-a.png",
    priceUSD: 99,
    blurb: {
      es: "Conector estándar OBD-II de 16 vías. Diagnóstico universal para vehículos livianos y medianos.",
      en: "Standard 16-way OBD-II connector. Universal diagnostics for light and medium vehicles.",
    },
    category: "cable",
  },
  {
    id: "cab-4",
    name: { es: "Adaptador J1708 6-pin", en: "J1708 6-pin Adapter" },
    img: "/images/cable-b.png",
    priceUSD: 109,
    blurb: {
      es: "Deutsch 6-pin para protocolos J1708/J1587. Equipos comerciales y maquinaria legacy.",
      en: "Deutsch 6-pin for J1708/J1587 protocols. Commercial equipment and legacy machinery.",
    },
    category: "cable",
  },
  {
    id: "cab-5",
    name: { es: "Cable de extensión OBD", en: "OBD Extension Cable" },
    img: "/images/cable-a.png",
    priceUSD: 79,
    blurb: {
      es: "Extensión de 2 m macho-hembra. Acceso cómodo a puertos de difícil alcance.",
      en: "2 m male-to-female extension. Convenient access to hard-to-reach ports.",
    },
    category: "cable",
  },
  {
    id: "cab-6",
    name: { es: "Adaptador Deutsch 9-pin OEM", en: "OEM Deutsch 9-pin Adapter" },
    img: "/images/cable-b.png",
    priceUSD: 139,
    blurb: {
      es: "Conector OEM de alta durabilidad para uso intensivo en flotas y talleres.",
      en: "High-durability OEM connector for heavy use in fleets and shops.",
    },
    category: "cable",
  },
  {
    id: "fnd-1",
    name: { es: "Jaltest Link MDC11", en: "Jaltest Link MDC11" },
    img: "/images/finder-b.png",
    priceUSD: 1290,
    blurb: {
      es: "Interfaz de diagnóstico inalámbrica multimarca. Bluetooth + USB, firmware actualizable.",
      en: "Wireless multi-brand diagnostic interface. Bluetooth + USB, updatable firmware.",
    },
    category: "finder",
  },
  {
    id: "fnd-2",
    name: { es: "Cable Finder Universal", en: "Universal Cable Finder" },
    img: "/images/finder-a.png",
    priceUSD: 349,
    blurb: {
      es: "Cable de identificación de pinout multivehículo. Detecta automáticamente el protocolo.",
      en: "Multi-vehicle pinout identification cable. Automatically detects the protocol.",
    },
    category: "finder",
  },
  {
    id: "fnd-3",
    name: { es: "Jaltest MDC11 Marine", en: "Jaltest MDC11 Marine" },
    img: "/images/finder-b.png",
    priceUSD: 1390,
    blurb: {
      es: "Versión marina de la interfaz MDC11. Sellado IP para entornos náuticos.",
      en: "Marine version of the MDC11 interface. IP-sealed for marine environments.",
    },
    category: "finder",
  },
  {
    id: "fnd-4",
    name: { es: "Cable diagnóstico extendido", en: "Extended Diagnostic Cable" },
    img: "/images/finder-a.png",
    priceUSD: 299,
    blurb: {
      es: "Cable reforzado de 3 m para conexiones a distancia en maquinaria pesada.",
      en: "Reinforced 3 m cable for remote connections on heavy machinery.",
    },
    category: "finder",
  },
];
