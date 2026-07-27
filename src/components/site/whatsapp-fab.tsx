"use client";

// CTA flotante de WhatsApp, presente en todo el sitio público. Se monta en el layout
// del route group (site) → no aparece en /admin. Sin dependencias: un ancla estilizada.

import { CONTACT } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export function WhatsAppFab({ label, greeting }: { label: string; greeting: string }) {
  const href = greeting
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(greeting)}`
    : `https://wa.me/${CONTACT.whatsapp}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-white shadow-lg shadow-black/20 transition-all hover:bg-whatsapp-dark hover:shadow-xl active:translate-y-px"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[160px] sm:inline">
        {label}
      </span>
    </a>
  );
}
