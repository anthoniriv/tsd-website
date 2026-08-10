import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { getHardware, getJaltestLines, getSiteMedia } from "@/lib/catalog";
import { getLocaleData } from "@/lib/i18n.server";
import { ProductHero } from "@/components/product/product-hero";
import { ProductGrid } from "@/components/product/product-grid";
import { SmartImage } from "@/components/ui/smart-image";
import { RuggedHardwareSection } from "@/components/product/rugged-hardware-section";
import { ExpandCoverage } from "@/components/product/expand-coverage";
import { SolutionsSection } from "@/components/product/solutions-section";
import { SOLUTIONS_GROUP } from "@/lib/site-media";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleData();
  return { title: dict.meta.productoTitle, description: dict.meta.productoDescription };
}

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

export default async function ProductoPage() {
  const { dict, tier } = await getLocaleData();
  const p = dict.producto;

  // Máximo 8 por categoría: es lo máximo que la sección puede llegar a mostrar tras
  // "Ver más". El catálogo completo vive en /tienda.
  const MAX_PER_SECTION = 8;

  const [lines, media, laptops, cables, renewals, upgrades] = await Promise.all([
    getJaltestLines(tier),
    getSiteMedia(),
    getHardware("laptop", tier, MAX_PER_SECTION),
    getHardware("cable", tier, MAX_PER_SECTION),
    getHardware("renewal", tier, MAX_PER_SECTION),
    getHardware("upgrade", tier, MAX_PER_SECTION),
  ]);

  return (
    <>
      <h1 className="sr-only">{p.srHeading}</h1>

      {/* Bloques por línea Jaltest sobre base blanca continua: las capas
          decorativas (gris -z-20, triángulo -z-10) se ordenan en este contexto */}
      <section className="relative isolate bg-white">
        {lines.map((line) => (
          <ProductHero key={line.id} line={line} media={media} />
        ))}

        <RuggedHardwareSection copy={p.panasonic} />
      </section>

      {/* Grids de hardware */}
      <ProductGrid
        title={p.grids.tabletTitle}
        accentWord={p.grids.tabletAccent}
        items={laptops}
        category="laptop"
      />
      {/* Lámina de cables y adaptadores: entra justo antes de su grid de productos.
          Sin imágenes cargadas en el panel cae a la foto genérica de cable. */}
      <SolutionsSection
        copy={p.solutions}
        images={(() => {
          const shots = SOLUTIONS_GROUP.slots
            .map((slot) => media[slot.key]?.img)
            .filter((img): img is string => Boolean(img));
          return shots.length > 0 ? shots : ["/images/cable-b.png"];
        })()}
      />

      <ProductGrid
        title={p.grids.cablesTitle}
        accentWord={p.grids.cablesAccent}
        items={cables}
        category="cable"
      />
      {/* Cable Finder fuera de /producto por decisión del cliente; sigue en /tienda */}

      {/* Salida al catálogo completo: la página de producto es institucional, la compra
          vive en /tienda */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto flex max-w-6xl justify-center px-6">
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            {dict.shop.seeAllProducts}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ───── Renovaciones: lámina del cliente reconstruida + productos ───── */}
      <section id="renovar" className="scroll-mt-36 overflow-hidden bg-white pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-[clamp(26px,3.4vw,36px)] font-black uppercase leading-tight tracking-normal text-text-main">
            {p.renew.heading}
          </h2>
          <p className="mt-2 text-center text-[clamp(15px,1.7vw,19px)] leading-tight text-text-secondary">
            {p.renew.sub}
          </p>
          <p className="text-center text-[clamp(15px,1.7vw,19px)] font-semibold leading-tight text-brand">
            {p.renew.tagline}
          </p>

          <div className="mt-10 grid items-start gap-8 md:grid-cols-[1fr_264px_1.15fr]">
            <div className="text-left">
              <h3 className="text-[18px] font-black uppercase leading-[1.15] text-text-main">
                {p.renew.blockHeading.map((line, i) => (
                  <span key={i} className={i === 2 ? "text-brand" : undefined}>
                    {line}
                    {i < p.renew.blockHeading.length - 1 && <br />}
                  </span>
                ))}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.5] text-text-secondary">
                {p.renew.blockBody}
              </p>
              <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-border bg-bg-soft/60 px-4 py-3 text-[13px] font-semibold leading-snug text-text-secondary">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {p.renew.badge}
              </p>
            </div>

            <div className="mx-auto w-[264px] max-w-full">
              <div
                className="relative aspect-[1/1.1547] bg-[#7fcde2] p-[5px]"
                style={{ clipPath: HEX }}
              >
                <SmartImage
                  src="/images/renovaciones.png"
                  alt={p.renew.hexAlt}
                  wrapperClassName="h-full w-full"
                  className="scale-110"
                />
              </div>
            </div>

            <div className="text-left">
              <p className="text-[16px] font-black uppercase tracking-normal text-text-main">
                {p.renew.benefitsTitle}
              </p>
              <ul className="mt-4 space-y-3">
                {p.renew.benefits.map((b) => (
                  <li key={b.title} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-jt-agv" strokeWidth={3} />
                    <span className="leading-snug">
                      <span className="block text-[14px] font-bold text-text-main">{b.title}</span>
                      <span className="block text-[13px] text-text-secondary">{b.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contacto?asunto=renovacion"
                className="mt-5 inline-flex h-10 items-center rounded-full bg-jt-agv px-6 text-[13px] font-black uppercase leading-none text-white hover:opacity-90"
              >
                {p.renew.cta}
              </Link>
            </div>
          </div>

          {/* franja inferior de la lámina */}
          <ul className="mt-10 grid gap-4 rounded-xl border border-border bg-bg-soft/40 p-5 sm:grid-cols-2 lg:grid-cols-5">
            {p.renew.chips.map((chip) => (
              <li key={chip.title} className="leading-snug">
                <span className="block text-[12px] font-black uppercase tracking-wide text-text-main">
                  {chip.title}
                </span>
                <span className="mt-1 block text-[12px] text-text-secondary">{chip.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Productos de renovación, con el mismo formato de card que los cables */}
      <ProductGrid
        title={p.grids.renewalTitle}
        accentWord={p.grids.renewalAccent}
        items={renewals}
        category="renewal"
      />

      {/* Ampliar cobertura: los vehículos ahora viven dentro de la sección, cada uno
          con su etiqueta, en vez de como franja solapada previa. */}
      <ExpandCoverage copy={p.more} alts={p.vehicleAlts} />

      {/* Productos de ampliación de cobertura */}
      <ProductGrid
        title={p.grids.upgradeTitle}
        accentWord={p.grids.upgradeAccent}
        items={upgrades}
        category="upgrade"
      />
    </>
  );
}
