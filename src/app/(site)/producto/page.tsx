import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { ACCENT, formatPrice, type JaltestLine } from "@/lib/products";
import { getHardware, getJaltestLines } from "@/lib/catalog";
import { getLocaleData } from "@/lib/i18n.server";
import { ProductHero } from "@/components/product/product-hero";
import { ProductGrid } from "@/components/product/product-grid";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import { JaltestLogo } from "@/components/product/jaltest-logo";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleData();
  return { title: dict.meta.productoTitle, description: dict.meta.productoDescription };
}

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

function RenewalVehicles({ alts }: { alts: Record<JaltestLine["id"], string> }) {
  const vehicles = [
    { src: "/images/veh-ohw.png", alt: alts.ohw, className: "z-10 w-[29%] -translate-y-[3%]" },
    {
      src: "/images/veh-marine.png",
      alt: alts.marine,
      className: "z-20 -ml-[13%] w-[28%] translate-y-[12%]",
    },
    { src: "/images/veh-cv.png", alt: alts.cv, className: "z-30 -ml-[8%] w-[31%]" },
    {
      src: "/images/veh-mhe.png",
      alt: alts.mhe,
      className: "z-20 -ml-[8%] w-[18%] translate-y-[5%]",
    },
    {
      src: "/images/tractor.png",
      alt: alts.agv,
      className: "z-10 -ml-[5%] w-[31%] translate-y-[7%]",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl items-end justify-center px-4">
      {vehicles.map((vehicle) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={vehicle.src}
          src={vehicle.src}
          alt={vehicle.alt}
          loading="lazy"
          className={cn("relative h-auto object-contain", vehicle.className)}
        />
      ))}
    </div>
  );
}

export default async function ProductoPage() {
  const { dict, tier } = await getLocaleData();
  const p = dict.producto;

  // Máximo 8 por categoría: es lo máximo que la sección puede llegar a mostrar tras
  // "Ver más". El catálogo completo vive en /tienda.
  const MAX_PER_SECTION = 8;

  const [lines, laptops, cables, renewals, upgrades] = await Promise.all([
    getJaltestLines(tier),
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
          <ProductHero key={line.id} line={line} />
        ))}

      {/* Panasonic / hardware rugged (dentro del wrapper: hereda la base blanca
          continua y deja ver el sangrado del gris de MHE como su fondo) */}
      <section className="relative overflow-x-clip pt-10 pb-16 sm:pt-12 sm:pb-20">
        <div className="mx-auto grid w-full items-center gap-6 px-6 md:grid-cols-[minmax(420px,1fr)_minmax(300px,0.5fr)] md:gap-8 md:px-[6vw]">
          <div className="max-w-[680px]">
            <p className="text-[24px] font-black uppercase leading-none tracking-normal text-[#666]">
              {p.panasonic.kicker}
            </p>
            {/* Las dos marcas con las que trabaja TDS. Los logos oficiales
                sustituirán al texto cuando el cliente los mande. */}
            <p className="mt-1 flex flex-wrap items-baseline gap-x-5 text-[clamp(40px,5.6vw,64px)] font-black leading-[0.95] tracking-normal text-black">
              <span>{p.panasonic.brand}</span>
              <span>{p.panasonic.brand2}</span>
            </p>
            <div className="mt-5 space-y-4 text-[15px] font-medium leading-[1.6] text-[#666]">
              <p>{p.panasonic.p1}</p>
              <p>{p.panasonic.p2}</p>
            </div>
          </div>
          {/* Una laptop y una tablet en vez de la foto de la técnica */}
          <div className="mx-auto grid w-full max-w-[380px] grid-cols-2 items-center gap-4">
            <SmartImage
              src="/images/laptop.png"
              alt={p.panasonic.imgAlt}
              fit="contain"
              wrapperClassName="aspect-square w-full bg-transparent"
            />
            <SmartImage
              src="https://pub-d51770ee631f4c29836b56b7e8e01dd6.r2.dev/media/hardware-tablet-jaltest-26b9afab.png"
              alt={p.panasonic.imgAlt2}
              fit="contain"
              wrapperClassName="aspect-square w-full bg-transparent"
            />
          </div>
        </div>
      </section>
      </section>

      {/* Grids de hardware */}
      <ProductGrid
        title={p.grids.tabletTitle}
        accentWord={p.grids.tabletAccent}
        items={laptops}
        category="laptop"
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

      {/* franja de vehículos: encabeza la sección de ampliar cobertura */}
      <div className="relative h-[clamp(150px,16.8vw,216px)]">
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[#efeee9]" />
        <div className="absolute inset-x-0 bottom-[6%]">
          <RenewalVehicles alts={p.vehicleAlts} />
        </div>
      </div>

      <section className="bg-[#efeee9] pb-16 pt-8 sm:pb-20 sm:pt-10">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-[clamp(24px,2.76vw,35px)] font-extrabold uppercase leading-tight tracking-normal text-[#0085C9] md:whitespace-nowrap">
            {p.more.heading}
          </h2>
          <div className="mx-auto mt-8 grid max-w-[900px] gap-10 text-[18px] font-semibold leading-[1.22] text-[#666] md:grid-cols-2">
            <p>{p.more.p1}</p>
            <p>{p.more.p2}</p>
          </div>
        </div>
      </section>

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
