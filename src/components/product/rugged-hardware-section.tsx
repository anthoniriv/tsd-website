import {
  BatteryCharging,
  CalendarCheck,
  CheckCircle2,
  Construction,
  Factory,
  Headphones,
  Laptop,
  Network,
  Shield,
  ShieldCheck,
  Ship,
  Sprout,
  Sun,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { SmartImage } from "@/components/ui/smart-image";
import { RUGGED_DEFAULTS, type MediaMap } from "@/lib/site-media";

const FEATURE_ICONS = [ShieldCheck, Sun, BatteryCharging, Network, Laptop];
const SECTOR_ICONS = [Wrench, Truck, Construction, Shield, Zap, Factory, Sprout, Ship];
const TRUST_ICONS = [ShieldCheck, CheckCircle2, CalendarCheck, Headphones];

function IconList({
  items,
  icons,
}: {
  items: { title: string; desc: string }[];
  icons: LucideIcon[];
}) {
  return items.map((item, index) => {
    const Icon = icons[index];
    return (
      <li key={item.title} className="text-center">
        <Icon className="mx-auto h-9 w-9 text-[#073a91]" strokeWidth={1.8} />
        <p className="mt-3 text-[12px] font-black uppercase leading-tight text-[#071a4f]">
          {item.title}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-[#27375c]">{item.desc}</p>
      </li>
    );
  });
}

export function RuggedHardwareSection({
  copy,
  media = {},
}: {
  copy: Dict["producto"]["panasonic"];
  media?: MediaMap;
}) {
  const img = (key: string) => media[key]?.img || RUGGED_DEFAULTS[key]?.img || "";

  return (
    <section id="rugged" className="scroll-mt-32 overflow-hidden bg-white pb-12 pt-14 sm:pb-16 sm:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(380px,0.8fr)_minmax(0,1.2fr)] lg:gap-4">
          <div className="relative z-10">
            <p className="text-[clamp(20px,2.1vw,30px)] font-medium uppercase text-[#071a4f]">
              {copy.kicker}
            </p>
            <h2 className="mt-1 bg-gradient-to-r from-[#0067bd] to-[#071a4f] bg-clip-text text-[clamp(58px,7vw,96px)] font-black uppercase leading-[0.82] tracking-[-0.055em] text-transparent">
              {copy.title}
            </h2>
            <div className="mt-5 h-0.5 w-20 bg-[#0c54ba]" />
            <p className="mt-5 text-[clamp(22px,1.8vw,26px)] font-black uppercase leading-tight text-[#071a4f] lg:whitespace-nowrap">
              <span className="text-[#0c54ba]">{copy.taglineAccent}</span> {copy.tagline}
            </p>
            <div className="mt-5 max-w-[500px] space-y-4 text-[14px] leading-[1.55] text-[#101a3a] sm:text-[15px]">
              <p>{copy.p1}</p>
              <p>{copy.p2}</p>
            </div>
          </div>

          <SmartImage
            src={img("rugged.devices")}
            alt={copy.devicesAlt}
            fit="contain"
            wrapperClassName="aspect-[19/8] w-full bg-transparent lg:-mr-10"
          />
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-5 sm:divide-x sm:divide-[#cbd3e0]">
            <IconList items={copy.features} icons={FEATURE_ICONS} />
          </ul>

          <div className="grid overflow-hidden rounded-2xl border border-[#e2e7ef] bg-white shadow-[0_16px_45px_rgba(7,26,79,0.08)] sm:grid-cols-3 sm:divide-x sm:divide-[#cbd3e0] lg:-mt-24">
            {copy.brands.map((brand, index) => (
              <article key={brand.name} className="border-b border-[#cbd3e0] p-6 last:border-b-0 sm:border-b-0">
                <SmartImage
                  src={img(`rugged.brand${index + 1}`)}
                  alt={brand.name}
                  fit="contain"
                  wrapperClassName="h-14 w-full bg-transparent"
                />
                <p className="mt-5 min-h-14 text-[12px] font-bold leading-snug text-[#101a3a]">
                  {brand.desc}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {brand.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-[11px] leading-snug text-[#101a3a]">
                      <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-[#0c54ba]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 border-y border-[#d8deea] py-7">
          <div className="mb-6 flex items-center gap-5">
            <span className="h-px flex-1 bg-[#0c54ba]" />
            <h3 className="text-center text-[16px] font-black uppercase text-[#071a4f] sm:text-[18px]">
              {copy.sectorsTitle}
            </h3>
            <span className="h-px flex-1 bg-[#0c54ba]" />
          </div>
          {/* 4 columnas y no 8: con 8 los rótulos largos ("Agricultura y entornos
              rurales") no caben y se salían por la derecha. `min-w-0` deja que el
              texto envuelva en vez de desbordar el separador. */}
          <ul className="grid grid-cols-2 gap-x-2 gap-y-7 sm:grid-cols-4 sm:divide-x sm:divide-[#cbd3e0] sm:[&>li:nth-child(4n+1)]:border-l-0">
            {copy.sectors.map((sector, index) => {
              const Icon = SECTOR_ICONS[index];
              return (
                <li key={sector} className="flex items-center gap-3 px-3 lg:px-5">
                  <Icon className="h-9 w-9 shrink-0 text-[#073a91]" strokeWidth={1.8} />
                  <span className="min-w-0 break-words text-[11px] font-black uppercase leading-snug text-[#071a4f]">
                    {sector}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <ul className="grid gap-y-5 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#cbd3e0]">
          {copy.trust.map((item, index) => {
            const Icon = TRUST_ICONS[index];
            return (
              <li key={item} className="flex items-center justify-center gap-3 px-5 text-center">
                <Icon className="h-8 w-8 shrink-0 text-[#073a91]" strokeWidth={1.8} />
                <span className="text-[12px] font-black uppercase leading-tight text-[#071a4f]">
                  {item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
