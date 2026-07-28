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
  { key: "shop", href: "/tienda" },
  { key: "contact", href: "/contacto" },
] as const;

export const CONTACT = {
  company: "Tech Diagnostic Solutions",
  address: "1724 North Avenue 53",
  city: "Los Angeles, California, USA",
  // Embed de Google Maps centrado en la dirección de LA (no requiere API key).
  mapEmbed:
    "https://www.google.com/maps?q=1724+North+Avenue+53,+Los+Angeles,+CA&output=embed",
  supportTitle: "SERVICIO DE ASISTENCIA TÉCNICA PERSONAL",
  phone: "+0 000 000 0000",
  tollFree: "+0 000 000 0000",
  // Número de WhatsApp en formato internacional sin '+' ni espacios.
  whatsapp: "51993109998",
} as const;

export const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61572396180890",
    icon: "facebook",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/techdiagnosticsolutions",
    icon: "instagram",
  },
] as const;

// `key` referencia dict.footer.policies; el label visible sale del diccionario.
export const POLICIES = [
  { key: "refund", href: "#" },
  { key: "privacy", href: "#" },
  { key: "terms", href: "#" },
  { key: "po", href: "#" },
] as const;
