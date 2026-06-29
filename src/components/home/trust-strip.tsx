import { BadgeCheck, Layers, MapPin, RefreshCw } from "lucide-react";

/**
 * Strip de confianza: señales de credibilidad sin métricas inventadas.
 * Revendedor oficial · cobertura · soporte local · renovaciones.
 */
const ITEMS = [
  {
    icon: BadgeCheck,
    title: "Revendedor oficial",
    desc: "Jaltest / Cojali USA",
  },
  {
    icon: Layers,
    title: "Cobertura multimarca",
    desc: "Comercial, off-highway, agrícola, marino y MHE",
  },
  {
    icon: MapPin,
    title: "Soporte local",
    desc: "Asistencia técnica desde Doral, FL",
  },
  {
    icon: RefreshCw,
    title: "Renovaciones",
    desc: "Renueva o amplía tu cobertura",
  },
] as const;

export function TrustStrip() {
  return (
    <section className="border-y bg-muted/40 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-6 md:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight text-foreground">{title}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
