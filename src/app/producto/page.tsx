import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  ACCENT,
  CABLES,
  CABLE_FINDER,
  JALTEST_LINES,
  LAPTOPS,
  formatPrice,
  type JaltestLine,
} from "@/lib/products";
import type { PriceTier } from "@/lib/i18n";
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

const HONEYCOMB_ORDER: JaltestLine["id"][] = ["ohw", "cv", "agv", "marine", "mhe"];

function RenewalHex({
  line,
  tier,
  priceLabel,
}: {
  line: JaltestLine;
  tier: PriceTier;
  priceLabel: string;
}) {
  const accent = ACCENT[line.id];

  return (
    <div
      className="relative grid aspect-[0.86/1] w-[clamp(135px,16.5vw,205px)] shrink-0 place-items-center"
      style={{ clipPath: HEX, backgroundColor: accent.color }}
    >
      <div
        className="absolute inset-[2px] flex flex-col items-center justify-center bg-white px-5 text-center"
        style={{ clipPath: HEX }}
      >
        <JaltestLogo
          src={line.logo}
          alt={`Jaltest ${line.variant}`}
          size="lg"
          className="h-[clamp(38px,4.6vw,58px)] max-w-[78%]"
        />
        <span
          className="mt-2 rounded-full px-3 py-0.5 text-[clamp(10px,1vw,13px)] font-black leading-none text-white"
          style={{ backgroundColor: accent.color }}
        >
          {priceLabel}
        </span>
        <span className="mt-1 text-[clamp(25px,3.2vw,38px)] font-black leading-none tracking-normal text-[#49d719]">
          {formatPrice(line.priceUSD, tier)}
        </span>
      </div>
    </div>
  );
}

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
  const renewHex = (id: JaltestLine["id"]) => {
    const line = JALTEST_LINES.find((item) => item.id === id);
    return line ? (
      <RenewalHex key={line.id} line={line} tier={tier} priceLabel={p.renew.price} />
    ) : null;
  };

  return (
    <>
      <h1 className="sr-only">{p.srHeading}</h1>

      {/* Bloques por línea Jaltest sobre base blanca continua: las capas
          decorativas (gris -z-20, triángulo -z-10) se ordenan en este contexto */}
      <section className="relative isolate bg-white">
        {JALTEST_LINES.map((line) => (
          <ProductHero key={line.id} line={line} />
        ))}

      {/* Panasonic / hardware rugged (dentro del wrapper: hereda la base blanca
          continua y deja ver el sangrado del gris de MHE como su fondo) */}
      <section className="relative overflow-x-clip pt-10 pb-16 sm:pt-12 sm:pb-20">
        <div className="mx-auto grid w-full items-center gap-10 px-6 md:grid-cols-[minmax(420px,0.92fr)_minmax(320px,0.62fr)] md:px-[8vw]">
          <div className="max-w-[680px]">
            <p className="text-[24px] font-black uppercase leading-none tracking-normal text-[#666]">
              {p.panasonic.kicker}
            </p>
            <p className="mt-1 text-[clamp(56px,8vw,86px)] font-black leading-[0.9] tracking-normal text-black">
              {p.panasonic.brand}
            </p>
            <div className="mt-7 space-y-6 text-[15px] font-medium leading-[1.6] text-[#666]">
              <p>{p.panasonic.p1}</p>
              <p>{p.panasonic.p2}</p>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[350px]">
            <SmartImage
              src="/images/renovaciones.png"
              alt={p.panasonic.imgAlt}
              wrapperClassName="aspect-square w-full rounded-full"
            />
          </div>
        </div>
      </section>
      </section>

      {/* Grids de hardware */}
      <ProductGrid title={p.grids.tabletTitle} accentWord={p.grids.tabletAccent} items={LAPTOPS} />
      <ProductGrid title={p.grids.cablesTitle} accentWord={p.grids.cablesAccent} items={CABLES} />
      <ProductGrid title={p.grids.finderTitle} items={CABLE_FINDER} />

      <section className="overflow-hidden bg-white pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-[clamp(29px,3.7vw,38px)] font-black uppercase leading-tight tracking-normal text-[#666]">
            {p.renew.heading}
          </h2>
          <p className="mt-1 text-center text-[clamp(19px,2.4vw,25px)] leading-tight text-brand">
            {p.renew.sub}
          </p>

          <div className="mt-8 grid items-center gap-10 md:grid-cols-[1fr_264px_1fr]">
            <div className="text-left text-[18px] font-semibold leading-[1.22] text-[#666]">
              <h3 className="mb-6 text-[20px] font-black uppercase leading-[1.12] text-black">
                {p.renew.blockHeading.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < p.renew.blockHeading.length - 1 && <br />}
                  </span>
                ))}
              </h3>
              <p>{p.renew.blockBody}</p>
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
              <p className="text-[20px] font-black uppercase tracking-normal text-black">
                {p.renew.benefitsTitle}
              </p>
              <ul className="mt-6 space-y-1.5 text-[18px] font-extrabold leading-tight text-[#666]">
                {p.renew.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-jt-agv" strokeWidth={3} />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/contacto"
                className="mt-5 inline-flex h-[34px] items-center rounded-full bg-jt-agv px-6 text-[14px] font-black uppercase leading-none text-white hover:opacity-90"
              >
                {p.renew.cta}
              </Link>
            </div>
          </div>

          {/* mobile: grid simple */}
          <div className="mx-auto mt-10 grid max-w-[420px] grid-cols-2 place-items-center gap-3 md:hidden">
            {HONEYCOMB_ORDER.map((id) => renewHex(id))}
          </div>

          {/* desktop: panal apretado — fila inferior anidada en los valles */}
          <div className="mt-20 hidden flex-col items-center md:flex">
            <div className="flex gap-x-[5px]">
              {(["ohw", "cv", "agv"] as const).map((id) => renewHex(id))}
            </div>
            <div className="-mt-[clamp(36px,4.4vw,54px)] flex gap-x-[5px]">
              {(["marine", "mhe"] as const).map((id) => renewHex(id))}
            </div>
          </div>
        </div>

        <div className="relative mt-0 h-[clamp(150px,16.8vw,216px)]">
          <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[#efeee9]" />
          <div className="absolute inset-x-0 bottom-[6%]">
            <RenewalVehicles alts={p.vehicleAlts} />
          </div>
        </div>
      </section>

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
    </>
  );
}
