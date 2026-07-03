import { BadgeCheck, Layers, MapPin, RefreshCw } from "lucide-react";
import { getLocaleData } from "@/lib/i18n.server";

/**
 * Strip de confianza: señales de credibilidad sin métricas inventadas.
 * Revendedor oficial · cobertura · soporte local · renovaciones.
 * Los iconos van por índice; los textos vienen del diccionario (dict.trust).
 */
const ICONS = [BadgeCheck, Layers, MapPin, RefreshCw] as const;

export async function TrustStrip() {
  const { dict } = await getLocaleData();
  return (
    <section className="border-y bg-muted/40 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-6 md:grid-cols-4">
        {dict.trust.map(({ title, desc }, i) => {
          const Icon = ICONS[i];
          return (
            <div key={title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight text-foreground">{title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
