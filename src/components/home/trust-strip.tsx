import { BadgeCheck, Laptop, Layers, MapPin } from "lucide-react";
import { getLocaleData } from "@/lib/i18n.server";

/**
 * Strip de confianza: señales de credibilidad sin métricas inventadas.
 * Distribuidor autorizado · cobertura · soporte local · equipo rugged.
 * Los iconos van por índice; los textos vienen del diccionario (dict.trust).
 */
const ICONS = [BadgeCheck, Layers, MapPin, Laptop] as const;

export async function TrustStrip() {
  const { dict } = await getLocaleData();
  return (
    <section className="border-y bg-muted/40 py-14 sm:py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-10 px-6 sm:grid-cols-2 md:grid-cols-4">
        {dict.trust.map(({ title, desc }, i) => {
          const Icon = ICONS[i];
          return (
            <div key={title} className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-base font-bold leading-tight text-foreground sm:text-lg">
                  {title}
                </p>
                <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
