// Constantes globales del sitio TDS. Centralizado para fácil edición.

export const SITE = {
  name: "TDS",
  fullName: "Tech Diagnostic Solutions",
  description:
    "Soluciones de diagnóstico profesional para vehículos comerciales, off-highway, agrícolas, marinos y manejo de materiales.",
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
  // Oficina principal (la que manda en footer, contacto y mapa).
  address: "Betania, Los Ángeles, Calle 63, Casa 27",
  city: "Ciudad de Panamá, Panamá",
  // Embed de Google Maps (no requiere API key).
  mapEmbed:
    "https://www.google.com/maps?q=Betania,+Los+Angeles,+Calle+63,+Casa+27,+Ciudad+de+Panama,+Panama&output=embed",
  supportTitle: "SERVICIO DE ASISTENCIA TÉCNICA PERSONAL",
  // Por ahora un único número para todo: teléfono, línea gratuita y WhatsApp.
  phone: "+507 6319 3440",
  tollFree: "+507 6319 3440",
  // Número de WhatsApp en formato internacional sin '+' ni espacios.
  whatsapp: "50763193440",
  email: "info@techdsolution.com",
} as const;

/** Segunda oficina. Se lista después de la principal, sin mapa propio. */
export const CONTACT_US_OFFICE = {
  address: "1724 North Avenue 53",
  city: "Los Angeles, California, USA",
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
