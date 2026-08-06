import {
  Activity,
  BookOpen,
  CircuitBoard,
  Cpu,
  Download,
  FileText,
  Fuel,
  Headset,
  Laptop,
  LineChart,
  RefreshCw,
  ScanSearch,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Syringe,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT, formatPrice, type JaltestLine } from "@/lib/products";
import { LINE_SPECS, type FeatureIcon } from "@/lib/product-specs";
import { getLocaleData } from "@/lib/i18n.server";
import { SmartImage } from "@/components/ui/smart-image";
import { JaltestLogo } from "@/components/product/jaltest-logo";
import { ProductHeroActions } from "@/components/product/product-hero-actions";

/** Hexágono apuntando arriba-abajo (el del precio en la lámina). */
const HEX = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

/** Corte diagonal del panel de foto, igual que en la lámina. */
const PHOTO_CLIP = "polygon(22% 0, 100% 0, 100% 100%, 0 100%)";

const FEATURE_ICONS: Record<FeatureIcon, LucideIcon> = {
  dpf: CircuitBoard,
  update: Download,
  wiring: Activity,
  injector: Syringe,
  bidirectional: ShieldCheck,
  manual: BookOpen,
  params: SlidersHorizontal,
  calibration: Settings,
  fault: ScanSearch,
  actuator: Fuel,
  config: Wrench,
  report: FileText,
  realtime: LineChart,
};

/** Iconos de las 4 pastillas de "qué incluye", en el orden del diccionario. */
const INCLUDE_ICONS = [Cpu, Laptop, RefreshCw, Headset] as const;

/** Iconos de la banda de cifras: las tres primeras por posición, la última fija. */
const STAT_ICONS = [ShieldCheck, Cpu, RefreshCw, TrendingUp] as const;

/**
 * El amarillo de OHW y el verde de AGV no llegan a 4.5:1 sobre blanco, así que
 * el titular usa una versión oscurecida y el texto sobre el color va en negro.
 * El resto de líneas se queda con su acento y texto blanco.
 */
const READABLE: Record<JaltestLine["id"], { title: string; onAccent: string }> = {
  cv: { title: "var(--color-jt-cv)", onAccent: "#ffffff" },
  ohw: { title: "#a06f00", onAccent: "#1b1b1b" },
  agv: { title: "#5c7d13", onAccent: "#1b1b1b" },
  marine: { title: "var(--color-jt-marine)", onAccent: "#ffffff" },
  mhe: { title: "var(--color-jt-mhe)", onAccent: "#ffffff" },
};

/**
 * Bloque comercial de una línea Jaltest, reconstruido a partir de las láminas
 * del cliente: titular + kit + foto del equipo, lo que incluye, funciones
 * avanzadas, fabricantes compatibles, cifras y los dos CTA.
 *
 * El texto es real (traducible) y el precio sale de la BD por tier; solo son
 * imágenes los recortes que no se pueden recrear: el grid de logos de marca,
 * la foto del equipo y la del kit (`src/lib/product-specs.ts`).
 */
export async function ProductHero({ line }: { line: JaltestLine }) {
  const accent = ACCENT[line.id];
  const ink = READABLE[line.id];
  const spec = LINE_SPECS[line.id];
  const { dict, lang } = await getLocaleData();
  const t = dict.productHero;
  const price = formatPrice(line.priceCents ?? 0);
  const [headTop, headBottom] = spec.headline[lang];
  const name = `${line.brand} ${line.variant}`;
  const actionLabels = { ...t, addedToast: dict.cart.addedToast };
  const demoHref = `/contacto?asunto=demo&linea=${line.id}`;
  // La foto del panel derecho se puede cambiar desde el panel; si no hay, la de la lámina.
  const vehicleImg = line.vehicleImg || spec.vehicleImg;

  return (
    <article id={line.id} className="scroll-mt-36 border-b border-border/60 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        {/* ───────── Cabecera: texto + kit, con la foto del equipo a la derecha ───────── */}
        <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:gap-6">
          <div>
            <JaltestLogo
              src={line.logo}
              alt={name}
              size="lg"
              className="h-14 max-w-[250px] sm:h-16 sm:max-w-[280px]"
            />

            <h2 className="mt-5 text-[clamp(21px,2.8vw,30px)] font-black uppercase leading-[1.08] tracking-tight text-text-main">
              {headTop}
              <br />
              <span style={{ color: ink.title }}>{headBottom}</span>
            </h2>

            <div className="mt-3 max-w-[46ch] space-y-2 text-[14px] leading-[1.5] text-text-secondary">
              {spec.intro[lang].map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            {/* kit: protagónico, como pide el docx de retoques */}
            <SmartImage
              src={spec.kitImg}
              alt={`Kit ${name}`}
              fit="contain"
              loading="eager"
              wrapperClassName="mt-3 h-[clamp(120px,15vw,170px)] w-full bg-transparent"
            />
          </div>

          {/* foto del equipo: banner en móvil, panel con corte diagonal en desktop.
              Si la línea trae galería (patrón AGV), la foto grande cede alto a las
              3 mini etiquetadas de abajo. */}
          <div className="relative mt-8 flex flex-col gap-2 lg:mt-0 lg:min-h-[370px]">
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-xl lg:rounded-none",
                spec.gallery ? "h-40 sm:h-52 lg:flex-[3]" : "h-52 sm:h-72 lg:flex-1"
              )}
            >
              <span className="absolute inset-0 hidden lg:block" style={{ clipPath: PHOTO_CLIP }}>
                <SmartImage
                  src={vehicleImg}
                  alt={`${line.variant} — ${spec.headline[lang][1]}`}
                  wrapperClassName="absolute inset-0 h-full w-full"
                />
              </span>
              <SmartImage
                src={vehicleImg}
                alt={`${line.variant} — ${spec.headline[lang][1]}`}
                wrapperClassName="absolute inset-0 h-full w-full lg:hidden"
              />
              {spec.vehicleLabel && (
                <span
                  className="absolute bottom-2 right-2 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm"
                  style={{ backgroundColor: accent.color, color: ink.onAccent }}
                >
                  {spec.vehicleLabel[lang]}
                </span>
              )}
            </div>

            {spec.gallery && (
              <ul className="grid grid-cols-3 gap-2 lg:flex-[2]">
                {spec.gallery.map((shot) => (
                  <li
                    key={shot.img}
                    className="relative h-24 overflow-hidden rounded-lg sm:h-28 lg:h-full"
                  >
                    <SmartImage
                      src={shot.img}
                      alt={shot.label[lang]}
                      wrapperClassName="absolute inset-0 h-full w-full"
                    />
                    <span
                      className="absolute inset-x-0 bottom-0 px-1 py-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide"
                      style={{ backgroundColor: accent.color, color: ink.onAccent }}
                    >
                      {shot.label[lang]}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* hexágono de precio: a caballo sobre el corte diagonal de la foto */}
            <div className="absolute right-3 top-3 z-10 lg:-left-14 lg:right-auto lg:top-4">
              <div
                className="grid aspect-[1.1547/1] w-[110px] place-items-center shadow-lg sm:w-[132px] lg:w-[142px]"
                style={{ clipPath: HEX, backgroundColor: accent.color, color: ink.onAccent }}
              >
                <div className="flex flex-col items-center leading-none">
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">
                    {t.from}
                  </span>
                  <span className="mt-1 text-[22px] font-black tabular-nums sm:text-[25px] lg:text-[28px]">
                    {price}
                  </span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-wide opacity-90">
                    {t.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* etiquetas sueltas (Marine y MHE) */}
            {spec.badges && (
              <div className="absolute right-3 top-[52%] flex flex-col items-end gap-2">
                {spec.badges.map((badge) => (
                  <span
                    key={badge.en}
                    className="rounded-md px-3 py-1 text-[11px] font-bold uppercase leading-tight tracking-wide shadow-sm"
                    style={{ backgroundColor: accent.color, color: ink.onAccent }}
                  >
                    {badge[lang]}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ───────── Qué incluye ───────── */}
        <ul className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-border bg-bg-soft/60 p-3.5 sm:gap-5 sm:p-4 md:grid-cols-4">
          {t.includes.map((item, i) => {
            const Icon = INCLUDE_ICONS[i];
            return (
              <li key={item.title} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: ink.title }} />
                <span className="text-[13px] leading-tight">
                  <span className="block font-bold text-text-main">{item.title}</span>
                  <span className="block text-text-secondary">{item.desc}</span>
                </span>
              </li>
            );
          })}
        </ul>

        {/* ───────── Funciones avanzadas · Fabricantes compatibles ───────── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="flex flex-col rounded-xl border border-border p-4">
            <h3
              className="-mx-4 -mt-4 mb-4 w-fit rounded-br-xl rounded-tl-xl px-5 py-2 text-[13px] font-black uppercase tracking-wide"
              style={{ backgroundColor: accent.color, color: ink.onAccent }}
            >
              {t.advancedFunctions}
            </h3>
            <ul className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
              {spec.features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon];
                return (
                  <li key={feature.icon + feature.label.en} className="flex items-start gap-2.5">
                    <Icon
                      className="mt-0.5 h-[18px] w-[18px] shrink-0"
                      style={{ color: accent.color }}
                    />
                    <span className="text-[13px] font-semibold leading-tight text-text-main">
                      {feature.label[lang]}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 pt-1 text-[13px] font-bold" style={{ color: ink.title }}>
              {t.andManyMore}
            </p>
          </section>

          <section className="rounded-xl border border-border p-4">
            <h3
              className="-mx-4 -mt-4 mb-4 w-fit rounded-br-xl rounded-tl-xl px-5 py-2 text-[13px] font-black uppercase tracking-wide"
              style={{ backgroundColor: accent.color, color: ink.onAccent }}
            >
              {spec.brandsTitle[lang]}
            </h3>
            {/* recorte de la lámina: los logos de fabricante no se pueden recrear en HTML */}
            <SmartImage
              src={spec.brandsImg}
              alt={spec.brandsTitle[lang]}
              fit="contain"
              wrapperClassName="h-[clamp(110px,13vw,145px)] w-full bg-transparent"
            />
            <p className="mt-3 text-center text-[13px] font-bold uppercase tracking-wide text-text-secondary">
              {spec.brandsFootnote[lang]}
            </p>
          </section>
        </div>

        {/* ───────── Cifras + CTA (el panel de "solicitar cotización" de la lámina) ───────── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <ul
            className="grid grid-cols-2 content-center gap-5 rounded-xl px-5 py-6 sm:grid-cols-4"
            style={{ backgroundColor: accent.color, color: ink.onAccent }}
          >
            {spec.stats.map((stat, i) => {
              const Icon = STAT_ICONS[i];
              return (
                <li key={stat.label.en} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-90" />
                  <span className="leading-tight">
                    {stat.value !== "↗" && (
                      <span className="block text-[19px] font-black tabular-nums">{stat.value}</span>
                    )}
                    <span className="block text-[11px] font-bold uppercase tracking-wide opacity-90">
                      {stat.label[lang]}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col justify-center gap-4 rounded-xl border border-border p-5">
            <SmartImage
              src="/images/logo-tds.png"
              alt="Tech Diagnostic Solutions"
              fit="contain"
              wrapperClassName="mx-auto h-10 w-[180px] bg-transparent sm:mx-0"
            />
            <ProductHeroActions
              productId={line.productId}
              name={name}
              stock={line.stock ?? 0}
              accentColor={accent.color}
              accentInk={ink.onAccent}
              outlineColor={ink.title}
              demoHref={demoHref}
              labels={actionLabels}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
