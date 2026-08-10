import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Cable,
  Plug,
  Puzzle,
  ShoppingCart,
} from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { SolutionsHex } from "@/components/product/solutions-hex";

/** Hexágono apuntando a izquierda y derecha, el mismo de la lámina. */
const HEX = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

/** Un icono por beneficio, en el orden del diccionario. */
const FEATURE_ICONS = [Puzzle, BadgeCheck, Plug, Briefcase] as const;

/**
 * "Conecta sin límites" — lámina de cables y adaptadores especiales, reconstruida
 * en HTML (texto real y traducible); solo las fotos del hexágono son imagen, y
 * rotan entre las 3 variantes que mandó el cliente (editables en /admin/laminas).
 */
export function SolutionsSection({
  copy,
  images,
}: {
  copy: Dict["producto"]["solutions"];
  images: string[];
}) {
  return (
    <section id="soluciones" className="scroll-mt-36 bg-[#f7f9fc] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(300px,42%)] lg:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-brand-dark text-brand-dark">
                <Cable className="h-5 w-5" />
              </span>
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-brand-dark sm:text-[14px]">
                {copy.eyebrow}
              </p>
              <span className="hidden h-px flex-1 bg-brand/40 sm:block" />
            </div>

            {/* El titular va a 2 líneas como en la lámina: el tamaño se limita a
                lo que cabe sin partir "Conecta sin límites." */}
            <h2 className="mt-6 text-[clamp(24px,2.8vw,36px)] font-black uppercase leading-[1.05] tracking-tight text-[#0b2e5c]">
              <span className="block">{copy.headingTop}</span>
              <span className="block text-brand-dark">{copy.headingBottom}</span>
            </h2>

            <span className="mt-6 block h-[3px] w-16 bg-brand-dark" />

            <p className="mt-6 max-w-[52ch] text-[clamp(15px,1.5vw,18px)] leading-relaxed text-text-secondary">
              {copy.p1} <strong className="font-bold text-brand-dark">{copy.p1Strong}</strong>
            </p>
            <p className="mt-4 max-w-[52ch] text-[clamp(15px,1.5vw,18px)] leading-relaxed text-text-secondary">
              {copy.p2}
            </p>
          </div>

          <div className="relative">
            <SolutionsHex images={images} alt={copy.hexAlt} />

            {/* Sello "Equipa tu taller", pegado al vértice inferior derecho del hex. */}
            <div
              className="absolute -bottom-2 right-0 grid aspect-[1.1547/1] w-[42%] max-w-[190px] place-items-center bg-brand-dark px-4 text-center text-white shadow-lg"
              style={{ clipPath: HEX }}
            >
              <span>
                <ShoppingCart className="mx-auto mb-1 h-5 w-5" />
                <span className="block text-[11px] font-black uppercase leading-tight sm:text-[12px]">
                  {copy.hexBadgeTop}
                </span>
                <span className="mt-0.5 block text-[9px] font-bold uppercase leading-tight opacity-90">
                  {copy.hexBadgeBottom}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Los 4 beneficios de la franja media */}
        <ul className="mt-14 grid gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
          {copy.features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <li key={feature.title} className="flex gap-3 lg:[&:not(:first-child)]:pl-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-brand-dark/80 text-brand-dark">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="leading-snug">
                  <span className="block text-[12px] font-black uppercase tracking-wide text-[#0b2e5c]">
                    {feature.title}
                  </span>
                  <span className="mt-1.5 block text-[13px] text-text-secondary">
                    {feature.desc}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        {/* Barra azul de cierre */}
        <Link
          href="/tienda?cat=cable"
          className="group mt-10 flex flex-col gap-5 rounded-2xl bg-[#0b2e5c] px-6 py-6 transition-colors hover:bg-[#0a2750] sm:flex-row sm:items-center sm:gap-8 sm:px-9"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
            <Plug className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-black uppercase leading-tight text-white sm:text-[17px]">
              {copy.ctaTitle}
            </span>
            <span className="mt-1 block text-[13px] text-white/75 sm:text-[14px]">
              {copy.ctaBody}
            </span>
          </span>
          <span className="flex items-center gap-3 sm:border-l sm:border-white/20 sm:pl-8">
            <ArrowRight className="h-6 w-6 shrink-0 rounded-full border border-white/40 p-1 text-white transition-transform group-hover:translate-x-0.5" />
            <span>
              <span className="block text-[13px] font-black uppercase tracking-wide text-white">
                {copy.ctaLink}
              </span>
              <span className="block text-[13px] font-semibold text-brand">{copy.ctaLinkSub}</span>
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
