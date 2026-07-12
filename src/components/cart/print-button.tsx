import { Download } from "lucide-react";

/**
 * Descarga la boleta en PDF. Sustituye al window.print(): imprimir la página arrastraba
 * el header y el footer del sitio, y el resultado no era un documento presentable.
 */
export function PrintButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand"
    >
      <Download className="h-4 w-4" />
      {label}
    </a>
  );
}
