import Link from "next/link";
import {
  ChartColumnIncreasing,
  Cog,
  CircleDollarSign,
  Forklift,
  HardHat,
  Headset,
  Laptop,
  Puzzle,
  Ship,
  ShieldCheck,
  Tractor,
  TrendingUp,
  Truck,
  Wrench,
} from "lucide-react";
import type { Dict } from "@/lib/i18n";
import type { JaltestLine } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * "¿Necesitas diagnosticar más tipos de equipos?" — cierre de /producto, según la
 * lámina del cliente: cabecera, las 5 coberturas con su vehículo, dos paneles de
 * argumento, franja de beneficios y CTA.
 *
 * Las imágenes van separadas (no solapadas como en la franja de renovaciones)
 * porque cada una lleva su etiqueta debajo y deben leerse de una en una.
 */

/** Un icono por cobertura, en el orden del diccionario. */
const EQUIPMENT_ICONS = [HardHat, Ship, Truck, Forklift, Tractor] as const;

const FEATURE_ICONS = [ShieldCheck, Cog, CircleDollarSign, Headset, ChartColumnIncreasing] as const;

const PANEL_ICONS = [TrendingUp, Puzzle] as const;

/**
 * Los cinco recortes salen de la misma lámina y a la misma escala (anchos de
 * 308–326 px), así que a `w-full` reproducen tal cual las proporciones del
 * diseño: la excavadora es la más alta y el yate el más bajo. Apoyan todos en
 * la misma línea de suelo (`items-end` en el contenedor).
 */
const VEHICLES: { src: string; id: JaltestLine["id"] }[] = [
  { src: "/images/laminas/veh-ohw.png", id: "ohw" },
  { src: "/images/laminas/veh-marine.png", id: "marine" },
  { src: "/images/laminas/veh-cv.png", id: "cv" },
  { src: "/images/laminas/veh-mhe.png", id: "mhe" },
  { src: "/images/laminas/veh-agv.png", id: "agv" },
];

export function ExpandCoverage({
  copy,
  alts,
}: {
  copy: Dict["producto"]["more"];
  alts: Record<JaltestLine["id"], string>;
}) {
  return (
    // La lámina va sobre blanco que vira a gris azulado en la mitad inferior, con
    // el corte a la altura del suelo de los vehículos.
    <section className="bg-gradient-to-b from-white via-white to-[#eef1f6] pb-16 pt-12 sm:pb-20 sm:pt-14">
      <div className="mx-auto max-w-6xl px-6">
        {/* Cabecera */}
        <div className="flex items-center justify-center gap-3">
          <span className="hidden h-px w-10 bg-brand/40 sm:block" />
          <Wrench className="h-4 w-4 shrink-0 text-brand" />
          <p className="text-center text-[11px] font-black uppercase tracking-[0.12em] text-brand sm:text-[13px]">
            {copy.eyebrow}
          </p>
          <span className="hidden h-px w-10 bg-brand/40 sm:block" />
        </div>

        <h2 className="mt-4 text-center text-[clamp(26px,3.4vw,44px)] font-extrabold uppercase leading-[1.05] tracking-tight">
          <span className="block text-text-main">{copy.headingTop}</span>
          <span className="block text-[#0085C9]">{copy.headingBottom}</span>
        </h2>

        <p className="mt-3 text-center text-[clamp(15px,1.4vw,19px)] font-bold text-text-secondary">
          {copy.subtitle} <span className="text-[#0085C9]">{copy.subtitleStrong}</span>
        </p>

        {/* Las 5 coberturas */}
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-1">
          {VEHICLES.map((vehicle, i) => {
            const item = copy.equipment[i];
            const Icon = EQUIPMENT_ICONS[i];
            return (
              <li key={vehicle.id} className="flex flex-col">
                {/* Todos apoyan en la misma línea de suelo, como en la lámina. */}
                <div className="flex h-[clamp(120px,17vw,232px)] w-full items-end justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicle.src}
                    alt={alts[vehicle.id]}
                    loading="lazy"
                    className="h-auto max-h-full w-full object-contain"
                  />
                </div>
                {/* El separador vive en la etiqueta, no en la columna entera: si
                    abarcara la imagen cortaría a los vehículos que sangran. */}
                <div
                  className={cn(
                    "mt-5 flex items-start gap-2.5",
                    i > 0 && "lg:border-l lg:border-black/10 lg:pl-4",
                  )}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0085C9] text-white">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[11px] font-black uppercase tracking-wide text-text-main">
                      {item.name}
                    </span>
                    <span className="block text-[11px] font-black uppercase tracking-wide text-[#0085C9]">
                      {item.accent}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold text-text-muted">
                      {item.code}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Los dos argumentos */}
        <div className="mt-12 grid gap-6 rounded-2xl border border-black/5 bg-white/70 p-6 sm:p-8 md:grid-cols-2 md:gap-10 md:divide-x md:divide-black/10">
          {copy.panels.map((panel, i) => {
            const Icon = PANEL_ICONS[i];
            return (
              <div key={panel.title} className="flex gap-4 md:[&:not(:first-child)]:pl-10">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[#0085C9]">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[14px] font-black uppercase leading-tight tracking-wide text-text-main">
                    <span className="block">{panel.title}</span>
                    <span className="block">{panel.title2}</span>
                  </p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-text-secondary">
                    {panel.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Franja de beneficios */}
        <ul className="mt-6 grid gap-5 rounded-2xl bg-[#eaeff7] p-6 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-black/10">
          {copy.features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <li key={feature.title} className="flex gap-3 lg:[&:not(:first-child)]:pl-5">
                <Icon className="mt-0.5 h-7 w-7 shrink-0 text-[#0b3a6f]" strokeWidth={1.6} />
                <span className="leading-snug">
                  <span className="block text-[12px] font-black uppercase tracking-wide text-text-main">
                    {feature.title}
                  </span>
                  <span className="mt-1 block text-[12px] text-text-secondary">{feature.desc}</span>
                </span>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <Link
          href="/contacto?asunto=ampliacion"
          className="group mt-8 flex flex-col items-center gap-3 rounded-2xl bg-[#0b2e5c] px-6 py-6 text-center transition-colors hover:bg-[#0a2750] sm:flex-row sm:justify-center sm:gap-5 sm:text-left"
        >
          <Laptop className="h-8 w-8 shrink-0 text-white/90" strokeWidth={1.5} />
          <span>
            <span className="block text-[13px] font-black uppercase tracking-wide text-white sm:text-[15px]">
              {copy.ctaTitle}
            </span>
            <span className="mt-1 block text-[13px] font-semibold text-brand underline-offset-4 group-hover:underline sm:text-[14px]">
              {copy.ctaLink}
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
