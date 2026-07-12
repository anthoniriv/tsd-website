// ─────────────────────────────────────────────────────────────────────────────
// i18n TDS — 3 locales (bandera en header) sobre 2 idiomas de contenido + 3 tiers
// de precio. Todo USD.
//
//   🇺🇸 en-US      → contenido inglés  · precio tier "us"
//   🌎 en-LATAM   → contenido inglés  · precio tier "latam"
//   🇪🇸 es         → contenido español · precio tier "es"
//
// Este archivo es PURO (sin next/headers) → lo importan client y server. La
// lectura del locale actual (cookie) vive en `i18n.server.ts`.
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = "en" | "es";
export type PriceTier = "us" | "latam" | "es";
export type LocaleCode = "en-US" | "en-LATAM" | "es";

export const LOCALE_COOKIE = "tds_locale";
export const DEFAULT_LOCALE: LocaleCode = "es";

export type LocaleDef = {
  code: LocaleCode;
  lang: Lang;
  tier: PriceTier;
  flag: string; // emoji (🌎 para LATAM, no existe bandera propia)
  label: string; // texto del selector
  short: string; // etiqueta compacta
};

// Orden en el que aparecen las 3 banderas del header.
export const LOCALES: LocaleDef[] = [
  { code: "en-US", lang: "en", tier: "us", flag: "🇺🇸", label: "English (USA)", short: "US" },
  { code: "en-LATAM", lang: "en", tier: "latam", flag: "🌎", label: "English (LATAM)", short: "LATAM" },
  { code: "es", lang: "es", tier: "es", flag: "🇪🇸", label: "Español", short: "ES" },
];

export function resolveLocale(code: string | undefined | null): LocaleDef {
  return LOCALES.find((l) => l.code === code) ?? LOCALES.find((l) => l.code === DEFAULT_LOCALE)!;
}

// Azúcar para datos localizados (descripciones, nombres de catálogo).
export type Localized<T> = Record<Lang, T>;

// ─────────────────────────────────────────────────────────────────────────────
// Diccionario de UI (chrome). El contenido de catálogo (descripciones de líneas
// y hardware) vive localizado en `products.ts` — fuente única de datos.
// ─────────────────────────────────────────────────────────────────────────────

const es = {
  nav: { home: "Inicio", product: "Producto", shop: "Tienda", contact: "Contáctenos" },
  header: {
    searchPlaceholder: "Buscar productos, kits, cables…",
    account: "Cuenta",
    cart: "Carrito",
    menu: "Menú",
    search: "Buscar",
    close: "Cerrar",
    requestQuote: "Solicitar una cotización",
    language: "Idioma",
  },
  comingSoon: {
    features: { search: "La búsqueda de productos", account: "Tu cuenta", cart: "El carrito de compras" },
    title: "¡Ops! Próximamente",
    bodyAfterFeature: "estará disponible muy pronto. Estamos afinando los últimos detalles de la tienda en línea.",
    bodyGeneric: "Esta función estará disponible muy pronto. Estamos afinando los últimos detalles de la tienda en línea.",
    gotIt: "Entendido",
  },
  trust: [
    { title: "Revendedor oficial", desc: "Jaltest / Cojali USA" },
    { title: "Cobertura multimarca", desc: "Comercial, off-highway, agrícola, marino y MHE" },
    { title: "Soporte local", desc: "Asistencia técnica desde Doral, FL" },
    { title: "Renovaciones", desc: "Renueva o amplía tu cobertura" },
  ],
  coverage: {
    title: "Kits de cobertura",
    titleAccent: "TDS",
    subtitle: "Cobertura multimarca lista para tu taller, por segmento.",
    labels: {
      onHighway: "On-Highway",
      offHighway: "Off-Highway",
      materialHandling: "Manejo de Materiales",
      marine: "Marine",
      agriculture: "Agriculture",
      bundleKit: "Bundle Kit",
    },
  },
  hardware: {
    title: "Laptops & Tablets para uso rudo",
    subtitle: "+ Adaptadores adicionales",
    labels: {
      tabletsLaptops: "Tablets + Laptops",
      adaptersCables: "Adapters + Cables",
      cableFinder: "Cable Finder",
    },
  },
  renovaciones: {
    title: "Renueva",
    titleAccent: "o añade más cobertura",
    watermark: "Renovaciones",
    plusCoverage: "Cobertura",
    cta: "Renovar o ampliar cobertura",
  },
  preFooter: {
    title: "¿Listo para equipar tu taller con Jaltest?",
    body: "Te ayudamos a elegir el kit y el hardware adecuados para tu flota, con soporte técnico local.",
    ctaQuote: "Solicitar una cotización",
    ctaProducts: "Ver productos",
  },
  footer: {
    contactWith: "Contacte con",
    support: "SERVICIO DE ASISTENCIA TÉCNICA PERSONAL",
    callFree: "Llame gratis:",
    writeFromContactPre: "Escríbenos desde la página de",
    writeFromContactLink: "contacto",
    follow: "Síguenos",
    followOn: "Síguenos en",
    policies: {
      refund: "Política de reembolso",
      privacy: "Política de privacidad",
      terms: "Términos del servicio",
      po: "Términos y condiciones de orden de compra",
    },
  },
  home: {
    srHeading: "TDS — Diagnóstico Jaltest para tu flota, con soporte local en Doral",
    carouselLabel: "Destacados TDS",
    slides: [
      "Soluciones de diagnóstico Jaltest para flotas",
      "Cobertura Jaltest: comercial, off-highway, agrícola, marino y MHE",
    ],
  },
  producto: {
    srHeading: "Catálogo Jaltest: kits CV, OHW, AGV, Marine y MHE, hardware rugged y accesorios",
    panasonic: {
      kicker: "Tablet y Laptop.",
      brand: "Panasonic",
      p1: "Las laptops y tablets rugged están diseñadas para soportar las condiciones más exigentes de trabajo en talleres, flotas, construcción, minería y operaciones de campo. Resistentes al polvo, agua, vibraciones, golpes y temperaturas extremas, ofrecen el rendimiento y la confiabilidad necesarios para trabajar donde una computadora convencional no sobreviviría.",
      p2: "En Tech Diagnostic Solutions no solo te ayudamos a adquirir el equipo adecuado, también te brindamos asesoría especializada para identificar la mejor opción según tu operación, presupuesto y necesidades. Trabajamos con marcas reconocidas como Panasonic Toughbook, Getac y Dell Rugged.",
      imgAlt: "Técnico usando laptop rugged",
    },
    grids: {
      tabletTitle: "Tablet",
      tabletAccent: "y Laptop.",
      cablesTitle: "Cables",
      cablesAccent: "y Adaptadores.",
      finderTitle: "Cables Finder",
    },
    renew: {
      heading: "No dejes que tu diagnóstico se quede atrás",
      sub: "Los equipos evolucionan.  Las tecnologías cambian.  Las soluciones también.",
      blockHeading: ["Los equipos evolucionan.", "Las tecnologías cambian.", "Las soluciones también."],
      blockBody:
        "Renueva tu licencia Jaltest y continúa trabajando con acceso a las últimas actualizaciones, nuevas coberturas y funciones avanzadas para mantener tu operación siempre un paso adelante.",
      benefitsTitle: "Beneficios de renovar:",
      benefits: [
        "Nuevas marcas y modelos compatibles",
        "Actualizaciones de funciones avanzadas",
        "Información técnica actualizada",
        "Soporte especializado",
        "Mayor eficiencia en cada diagnóstico",
      ],
      cta: "Solicitar información",
      hexAlt: "Técnico renovando licencia Jaltest",
      price: "Price",
    },
    more: {
      heading: "¿Necesitas diagnosticar más tipos de equipos?",
      p1: "Es posible que la cobertura que tienes hoy sea suficiente para tu operación actual. Sin embargo, si tus clientes o tu flota evolucionan, Jaltest te brinda la posibilidad de incorporar nuevas coberturas cuando lo necesites.",
      p2: "De esta manera podrás seguir utilizando una herramienta que ya conoces y en la que confías, ampliando sus capacidades. Tu diagnóstico no tiene por qué quedarse donde empezó. Crece contigo.",
    },
    vehicleAlts: {
      ohw: "Excavadora",
      marine: "Embarcación",
      cv: "Camión comercial",
      mhe: "Montacargas",
      agv: "Equipo agrícola",
    },
  },
  productHero: {
    price: "Price",
    quotePrefix: "Cotizar Jaltest", // + variant
  },
  productCard: {
    cta: "Añadir al carrito",
    added: "Añadido",
    outOfStock: "Agotado",
    waCta: "Consultar por WhatsApp",
    waGreeting: "Hola, quiero comprar este producto:",
    priceLabel: "Precio:",
  },
  shop: {
    title: "Tienda",
    searchPlaceholder: "Buscar productos, kits, cables…",
    searchLabel: "Buscar",
    resultsFor: "Resultados para",
    empty: "No encontramos productos con esos criterios.",
    clear: "Limpiar filtros",
    filters: "Filtros",
    category: "Categoría",
    allCategories: "Todas",
    categories: {
      laptop: "Laptops y tablets",
      cable: "Cables y adaptadores",
      finder: "Cable finder",
    },
    priceRange: "Rango de precio",
    min: "Mín.",
    max: "Máx.",
    inStock: "Solo disponibles",
    apply: "Aplicar",
    count: "productos",
  },
  product: {
    backToShop: "Volver a la tienda",
    stockLeft: "disponibles",
    outOfStock: "Sin stock",
    addToCart: "Añadir al carrito",
    specs: "Descripción",
    notFound: "Producto no encontrado",
  },
  cart: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío.",
    keepShopping: "Seguir comprando",
    item: "artículo",
    items: "artículos",
    qty: "Cantidad",
    remove: "Quitar",
    subtotal: "Subtotal",
    total: "Total",
    checkout: "Finalizar compra",
    addedToast: "Añadido al carrito",
  },
  checkout: {
    title: "Finalizar compra",
    contactData: "Tus datos",
    shipping: "Envío",
    summary: "Resumen del pedido",
    name: "Nombre y apellido",
    email: "Email",
    phone: "Teléfono (opcional)",
    address: "Dirección",
    city: "Ciudad",
    state: "Estado / Provincia",
    postalCode: "Código postal",
    country: "País",
    pay: "Pagar",
    paying: "Redirigiendo al pago…",
    empty: "Tu carrito está vacío.",
    goToShop: "Ir a la tienda",
    cancelled: "Pago cancelado. Tu carrito sigue intacto.",
    secure: "Pago seguro procesado por Stripe. No guardamos datos de tu tarjeta.",
  },
  order: {
    title: "Pedido",
    paidToast: "¡Pago recibido! Te enviamos la confirmación por email.",
    placedOn: "Realizado el",
    total: "Total",
    items: "Artículos",
    notFound: "No encontramos ese pedido.",
    statusLabel: "Estado",
    status: {
      pending: "Pendiente de pago",
      paid: "Pagado",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    },
  },
  contact: {
    heroTitle: "Contáctenos",
    heroSubtitle: "Estamos en Doral, FL. Cuéntanos qué equipo o cobertura necesitas y te asesoramos.",
    heroAlt: "Oficinas de Tech Diagnostic Solutions",
    mapTitlePrefix: "Mapa", // + company — Doral, Florida
    formHeading: "Queremos conocer más de ti",
    name: "Nombre y Apellido",
    email: "Email",
    subject: "Asunto",
    message: "Mensaje",
    namePh: "Juan Pérez",
    emailPh: "tu@correo.com",
    subjectPh: "Consulta sobre kit CV",
    messagePh: "Cuéntanos qué equipo o cobertura necesitas…",
    submit: "Enviar consulta",
    sending: "Enviando…",
    footnotePre: "O escríbenos directamente a",
    toastSuccess: "¡Gracias! Te contactaremos pronto.",
    errors: {
      name: "Ingresa tu nombre y apellido.",
      email: "Ingresa tu email.",
      emailInvalid: "Email no válido.",
      subject: "Ingresa un asunto.",
      message: "Escribe tu mensaje.",
    },
  },
  meta: {
    siteDescription:
      "Soluciones de diagnóstico profesional Jaltest para vehículos comerciales, off-highway, agrícolas, marinos y manejo de materiales.",
    productoTitle: "Producto",
    productoDescription:
      "Catálogo Jaltest: CV, OHW, AGV, Marine y MHE, laptops y tablets rugged, cables y adaptadores.",
    contactoTitle: "Contáctenos",
    contactoDescription: "Ponte en contacto con Tech Diagnostic Solutions — Doral, Florida.",
  },
};

// Tipo del diccionario derivado del español (fuente estructural).
export type Dict = typeof es;

const en: Dict = {
  nav: { home: "Home", product: "Product", shop: "Shop", contact: "Contact Us" },
  header: {
    searchPlaceholder: "Search products, kits, cables…",
    account: "Account",
    cart: "Cart",
    menu: "Menu",
    search: "Search",
    close: "Close",
    requestQuote: "Request a Quote",
    language: "Language",
  },
  comingSoon: {
    features: { search: "Product search", account: "Your account", cart: "The shopping cart" },
    title: "Oops! Coming soon",
    bodyAfterFeature: "will be available very soon. We're putting the finishing touches on the online store.",
    bodyGeneric: "This feature will be available very soon. We're putting the finishing touches on the online store.",
    gotIt: "Got it",
  },
  trust: [
    { title: "Authorized reseller", desc: "Jaltest / Cojali USA" },
    { title: "Multi-brand coverage", desc: "Commercial, off-highway, agricultural, marine and MHE" },
    { title: "Local support", desc: "Technical assistance from Doral, FL" },
    { title: "Renewals", desc: "Renew or expand your coverage" },
  ],
  coverage: {
    title: "Coverage kits",
    titleAccent: "TDS",
    subtitle: "Multi-brand coverage ready for your shop, by segment.",
    labels: {
      onHighway: "On-Highway",
      offHighway: "Off-Highway",
      materialHandling: "Material Handling",
      marine: "Marine",
      agriculture: "Agriculture",
      bundleKit: "Bundle Kit",
    },
  },
  hardware: {
    title: "Rugged Laptops & Tablets",
    subtitle: "+ Additional adapters",
    labels: {
      tabletsLaptops: "Tablets + Laptops",
      adaptersCables: "Adapters + Cables",
      cableFinder: "Cable Finder",
    },
  },
  renovaciones: {
    title: "Renew",
    titleAccent: "or add more coverage",
    watermark: "Renewals",
    plusCoverage: "Coverage",
    cta: "Renew or expand coverage",
  },
  preFooter: {
    title: "Ready to equip your shop with Jaltest?",
    body: "We help you choose the right kit and hardware for your fleet, with local technical support.",
    ctaQuote: "Request a Quote",
    ctaProducts: "View products",
  },
  footer: {
    contactWith: "Contact",
    support: "PERSONAL TECHNICAL SUPPORT SERVICE",
    callFree: "Toll-free:",
    writeFromContactPre: "Write to us from the",
    writeFromContactLink: "contact page",
    follow: "Follow us",
    followOn: "Follow us on",
    policies: {
      refund: "Refund Policy",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      po: "Purchase Order Terms & Conditions",
    },
  },
  home: {
    srHeading: "TDS — Jaltest diagnostics for your fleet, with local support in Doral",
    carouselLabel: "TDS highlights",
    slides: [
      "Jaltest diagnostic solutions for fleets",
      "Jaltest coverage: commercial, off-highway, agricultural, marine and MHE",
    ],
  },
  producto: {
    srHeading: "Jaltest catalog: CV, OHW, AGV, Marine and MHE kits, rugged hardware and accessories",
    panasonic: {
      kicker: "Tablet & Laptop.",
      brand: "Panasonic",
      p1: "Rugged laptops and tablets are built to withstand the most demanding working conditions in shops, fleets, construction, mining and field operations. Resistant to dust, water, vibration, drops and extreme temperatures, they deliver the performance and reliability you need to work where a conventional computer wouldn't survive.",
      p2: "At Tech Diagnostic Solutions we not only help you get the right equipment, we also provide specialized guidance to identify the best option for your operation, budget and needs. We work with trusted brands such as Panasonic Toughbook, Getac and Dell Rugged.",
      imgAlt: "Technician using a rugged laptop",
    },
    grids: {
      tabletTitle: "Tablet",
      tabletAccent: "& Laptop.",
      cablesTitle: "Cables",
      cablesAccent: "& Adapters.",
      finderTitle: "Cable Finder",
    },
    renew: {
      heading: "Don't let your diagnostics fall behind",
      sub: "Equipment evolves.  Technologies change.  So do the solutions.",
      blockHeading: ["Equipment evolves.", "Technologies change.", "So do the solutions."],
      blockBody:
        "Renew your Jaltest license and keep working with access to the latest updates, new coverage and advanced functions to keep your operation always one step ahead.",
      benefitsTitle: "Benefits of renewing:",
      benefits: [
        "New compatible brands and models",
        "Advanced function updates",
        "Up-to-date technical information",
        "Specialized support",
        "Greater efficiency in every diagnosis",
      ],
      cta: "Request information",
      hexAlt: "Technician renewing a Jaltest license",
      price: "Price",
    },
    more: {
      heading: "Need to diagnose more types of equipment?",
      p1: "The coverage you have today may be enough for your current operation. However, if your customers or your fleet evolve, Jaltest lets you add new coverage whenever you need it.",
      p2: "That way you can keep using a tool you already know and trust, expanding its capabilities. Your diagnostics don't have to stay where they started. It grows with you.",
    },
    vehicleAlts: {
      ohw: "Excavator",
      marine: "Boat",
      cv: "Commercial truck",
      mhe: "Forklift",
      agv: "Agricultural equipment",
    },
  },
  productHero: {
    price: "Price",
    quotePrefix: "Get a quote — Jaltest",
  },
  productCard: {
    cta: "Add to cart",
    added: "Added",
    outOfStock: "Out of stock",
    waCta: "Ask on WhatsApp",
    waGreeting: "Hello, I'd like to buy this product:",
    priceLabel: "Price:",
  },
  shop: {
    title: "Shop",
    searchPlaceholder: "Search products, kits, cables…",
    searchLabel: "Search",
    resultsFor: "Results for",
    empty: "No products match those filters.",
    clear: "Clear filters",
    filters: "Filters",
    category: "Category",
    allCategories: "All",
    categories: {
      laptop: "Laptops & tablets",
      cable: "Cables & adapters",
      finder: "Cable finder",
    },
    priceRange: "Price range",
    min: "Min",
    max: "Max",
    inStock: "In stock only",
    apply: "Apply",
    count: "products",
  },
  product: {
    backToShop: "Back to shop",
    stockLeft: "in stock",
    outOfStock: "Out of stock",
    addToCart: "Add to cart",
    specs: "Description",
    notFound: "Product not found",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty.",
    keepShopping: "Keep shopping",
    item: "item",
    items: "items",
    qty: "Quantity",
    remove: "Remove",
    subtotal: "Subtotal",
    total: "Total",
    checkout: "Checkout",
    addedToast: "Added to cart",
  },
  checkout: {
    title: "Checkout",
    contactData: "Your details",
    shipping: "Shipping",
    summary: "Order summary",
    name: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    address: "Address",
    city: "City",
    state: "State / Province",
    postalCode: "ZIP / Postal code",
    country: "Country",
    pay: "Pay",
    paying: "Redirecting to payment…",
    empty: "Your cart is empty.",
    goToShop: "Go to shop",
    cancelled: "Payment cancelled. Your cart is untouched.",
    secure: "Secure payment processed by Stripe. We never store your card details.",
  },
  order: {
    title: "Order",
    paidToast: "Payment received! We've emailed you the confirmation.",
    placedOn: "Placed on",
    total: "Total",
    items: "Items",
    notFound: "We couldn't find that order.",
    statusLabel: "Status",
    status: {
      pending: "Awaiting payment",
      paid: "Paid",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  },
  contact: {
    heroTitle: "Contact Us",
    heroSubtitle: "We're in Doral, FL. Tell us what equipment or coverage you need and we'll advise you.",
    heroAlt: "Tech Diagnostic Solutions offices",
    mapTitlePrefix: "Map",
    formHeading: "We'd like to know more about you",
    name: "Full name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    namePh: "John Smith",
    emailPh: "you@email.com",
    subjectPh: "Question about the CV kit",
    messagePh: "Tell us what equipment or coverage you need…",
    submit: "Send inquiry",
    sending: "Sending…",
    footnotePre: "Or write to us directly at",
    toastSuccess: "Thank you! We'll get in touch soon.",
    errors: {
      name: "Enter your full name.",
      email: "Enter your email.",
      emailInvalid: "Invalid email.",
      subject: "Enter a subject.",
      message: "Write your message.",
    },
  },
  meta: {
    siteDescription:
      "Professional Jaltest diagnostic solutions for commercial, off-highway, agricultural, marine and material-handling vehicles.",
    productoTitle: "Product",
    productoDescription:
      "Jaltest catalog: CV, OHW, AGV, Marine and MHE, rugged laptops and tablets, cables and adapters.",
    contactoTitle: "Contact Us",
    contactoDescription: "Get in touch with Tech Diagnostic Solutions — Doral, Florida.",
  },
};

export const DICT: Record<Lang, Dict> = { es, en };

export function getDict(lang: Lang): Dict {
  return DICT[lang];
}
