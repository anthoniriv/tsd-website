// Constantes globales del sitio TDS. Centralizado para fácil edición.

export const SITE = {
  name: "TDS",
  fullName: "Tech Diagnostic Solutions",
  description:
    "Soluciones de diagnóstico profesional Jaltest para vehículos comerciales, off-highway, agrícolas, marinos y manejo de materiales.",
} as const;

// `key` referencia dict.nav; el label visible sale del diccionario.
export const NAV = [
  { key: "home", href: "/" },
  { key: "product", href: "/producto" },
  { key: "contact", href: "/contacto" },
] as const;

export const CONTACT = {
  company: "Cojali USA Inc.",
  address: "2070 NW 79th Avenue",
  city: "Doral, Florida 33122, USA",
  // Embed de Google Maps centrado en Doral FL (no requiere API key).
  mapEmbed:
    "https://www.google.com/maps?q=2070+NW+79th+Avenue,+Doral,+FL+33122&output=embed",
  supportTitle: "SERVICIO DE ASISTENCIA TÉCNICA PERSONAL",
  phone: "+0 000 000 0000",
  tollFree: "+0 000 000 0000",
  // Número de WhatsApp en formato internacional sin '+' ni espacios.
  whatsapp: "51993109998",
} as const;

export const SOCIALS = [
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "YouTube", href: "#", icon: "youtube" },
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "X", href: "#", icon: "x" },
] as const;

// `key` referencia dict.footer.policies; el label visible sale del diccionario.
export const POLICIES = [
  { key: "refund", href: "#" },
  { key: "privacy", href: "#" },
  { key: "terms", href: "#" },
  { key: "po", href: "#" },
] as const;
