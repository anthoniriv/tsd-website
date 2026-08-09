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

const VEHICLES: { src: string; id: JaltestLine["id"]; className: string }[] = [
  { src: "/images/veh-ohw.png", id: "ohw", className: "w-[92%]" },
  { src: "/images/veh-marine.png", id: "marine", className: "w-[96%]" },
  { src: "/images/veh-cv.png", id: "cv", className: "w-[78%]" },
  { src: "/images/veh-mhe.png", id: "mhe", className: "w-[62%]" },
  { src: "/images/tractor.png", id: "agv", className: "w-[88%]" },
];

export function ExpandCoverage({
  copy,
  alts,
}: {
  copy: Dict["producto"]["more"];
  alts: Record<JaltestLine["id"], string>;
}) {
  return (
    <section className="bg-[#efeee9] pb-16 pt-12 sm:pb-20 sm:pt-14">
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
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-0">
          {VEHICLES.map((vehicle, i) => {
            const item = copy.equipment[i];
            const Icon = EQUIPMENT_ICONS[i];
            return (
              <li
                key={vehicle.id}
                className="flex flex-col items-center lg:border-l lg:border-black/10 lg:px-3 lg:first:border-l-0"
              >
                <div className="flex h-[clamp(96px,11vw,148px)] w-full items-end justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicle.src}
                    alt={alts[vehicle.id]}
                    loading="lazy"
                    className={`h-auto max-h-full object-contain ${vehicle.className}`}
                  />
                </div>
                <div className="mt-4 flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0085C9] text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[11px] font-black uppercase tracking-wide text-text-main">
                      {item.name}
                    </span>
                    <span className="block text-[11px] font-black uppercase tracking-wide text-[#0085C9]">
                      {item.accent}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold text-text-muted">
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
        <ul className="mt-6 grid gap-5 rounded-2xl border border-black/5 bg-white/70 p-6 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-black/10">
          {copy.features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <li key={feature.title} className="flex gap-3 lg:[&:not(:first-child)]:pl-5">
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#0085C9]" strokeWidth={1.75} />
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
