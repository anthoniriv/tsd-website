import Link from "next/link";
import { cn } from "@/lib/utils";
import { ACCENT, type JaltestLine } from "@/lib/products";
import { SmartImage } from "@/components/ui/smart-image";
import { JaltestLogo } from "@/components/product/jaltest-logo";

const HEX = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

/**
 * Unidades mixtas a propósito:
 * - FONDO (caja, alturas, top): `vw` → se mantiene full-bleed 100vw, alineación
 *   y forma originales (gris diagonal + triángulo de color).
 * - CONTENIDO horizontal y tamaños (left/right, w/h): `cqw` → proporcional a la
 *   capa contenedora max-w-6xl, así el arte (logo/kit/hex/vehículo) y el texto
 *   quedan dentro de los márgenes generales sin tocar el fondo.
 * Los `top` siguen en `vw` para que el contenido caiga sobre el fondo igual que antes.
 */
const VISUALS: Record<
  JaltestLine["id"],
  {
    height: string;
    logo: string;
    kit: string;
    badge: string;
    vehicle: string;
    text: string;
    accentShape?: "ohw" | "marine";
    /** El plano gris sube por encima del bloque para tocar el acento previo */
    grayRaised?: boolean;
    /** Margen negativo superior para acercar el bloque al anterior */
    pull?: string;
  }
> = {
  cv: {
    height: "md:min-h-[clamp(560px,58vw,840px)]",
    logo: "md:left-[8cqw] md:top-[3vw] md:h-[clamp(96px,10cqw,165px)]",
    kit: "md:left-[11cqw] md:top-[17vw] md:h-[clamp(92px,9cqw,140px)] md:w-[clamp(285px,28cqw,420px)]",
    badge: "md:left-[39.5cqw] md:top-[10.6vw]",
    vehicle: "md:right-[5cqw] md:top-[7vw] md:h-[clamp(210px,22cqw,340px)] md:w-[clamp(420px,44cqw,660px)]",
    text: "md:top-[clamp(323px,32.5vw,510px)]",
  },
  ohw: {
    height: "md:min-h-[clamp(640px,66vw,950px)]",
    logo: "md:left-[8cqw] md:top-[4.5vw] md:h-[clamp(100px,10cqw,160px)]",
    kit: "md:left-[8cqw] md:top-[20vw] md:h-[clamp(128px,13cqw,200px)] md:w-[clamp(325px,34cqw,500px)]",
    badge: "md:left-[38.5cqw] md:top-[12.4vw]",
    vehicle: "md:right-[3cqw] md:top-[4.8vw] md:h-[clamp(310px,31cqw,475px)] md:w-[clamp(510px,52cqw,790px)]",
    text: "md:top-[clamp(360px,36.4vw,565px)]",
    accentShape: "ohw",
  },
  agv: {
    height: "md:min-h-[clamp(560px,58vw,840px)]",
    logo: "md:left-[7cqw] md:top-[3.6vw] md:h-[clamp(105px,10.4cqw,162px)]",
    kit: "md:left-[12cqw] md:top-[18.7vw] md:h-[clamp(100px,10cqw,145px)] md:w-[clamp(300px,31cqw,430px)]",
    badge: "md:left-[40.5cqw] md:top-[9.3vw]",
    vehicle: "md:right-[2.4cqw] md:top-[10.5vw] md:h-[clamp(210px,21cqw,305px)] md:w-[clamp(500px,51cqw,720px)]",
    text: "md:top-[clamp(336px,33.5vw,505px)]",
    grayRaised: true,
  },
  marine: {
    height: "md:min-h-[clamp(630px,64vw,930px)]",
    logo: "md:left-[9.5cqw] md:top-[2.8vw] md:h-[clamp(110px,11cqw,168px)]",
    kit: "md:left-[11.5cqw] md:top-[16.6vw] md:h-[clamp(130px,13cqw,200px)] md:w-[clamp(326px,34cqw,500px)]",
    badge: "md:left-[41cqw] md:top-[2.8vw]",
    vehicle: "md:right-[3.4cqw] md:top-[7.6vw] md:h-[clamp(250px,25cqw,370px)] md:w-[clamp(505px,52cqw,780px)]",
    text: "md:top-[clamp(322px,32vw,510px)]",
    accentShape: "marine",
  },
  mhe: {
    height: "md:min-h-[clamp(560px,58vw,840px)]",
    logo: "md:left-[9.5cqw] md:top-[3.6vw] md:h-[clamp(110px,10.8cqw,165px)]",
    kit: "md:left-[11.5cqw] md:top-[19.4vw] md:h-[clamp(112px,11cqw,165px)] md:w-[clamp(300px,31cqw,450px)]",
    badge: "md:left-[41.2cqw] md:top-[5vw]",
    vehicle: "md:right-[7cqw] md:top-[4.2vw] md:h-[clamp(300px,30cqw,450px)] md:w-[clamp(430px,44cqw,650px)]",
    text: "md:top-[clamp(348px,35vw,540px)]",
    grayRaised: true,
    pull: "md:mt-[-5vw]",
  },
};

/** Badge hexagonal de precio: relleno translúcido del color + borde celeste. */
function PriceBadge({ color, price }: { color: string; price: string }) {
  return (
    <div
      className="relative grid aspect-[1.1547/1] w-[136px] shrink-0 place-items-center text-white shadow-sm md:w-[clamp(136px,12.8cqw,190px)]"
      style={{ clipPath: HEX, backgroundColor: "#67c8e8" }}
    >
      <div
        className="absolute inset-[6px] flex flex-col items-center justify-center px-[18px] text-center"
        style={{
          clipPath: HEX,
          backgroundColor: `color-mix(in srgb, ${color} 62%, transparent)`,
        }}
      >
        <span className="text-[15px] font-extrabold leading-none md:text-[clamp(13px,1.2cqw,17px)]">Price</span>
        <span className="mt-1 text-[34px] font-extrabold leading-none tracking-normal tabular-nums md:text-[clamp(28px,2.88cqw,42px)]">
          {price}
        </span>
      </div>
    </div>
  );
}

/**
 * Bloque comercial compacto por línea Jaltest (CV/OHW/AGV/Marine/MHE).
 * Fondo full-bleed (100vw) con gris diagonal + triángulo de acento; el contenido
 * (logo+kit izq, hexágono de precio centro, maquinaria der, descripción + CTA
 * debajo) vive en una capa max-w-6xl centrada → dentro de los márgenes generales.
 */
export function ProductHero({ line }: { line: JaltestLine }) {
  const accent = ACCENT[line.id];
  const visual = VISUALS[line.id];

  return (
    <article className={cn("md:py-0", visual.pull)}>
      {/* ───────── MOBILE: card por línea, sin fondo gris, acento = contraste ───────── */}
      <div className="px-5 py-4 md:hidden">
        <div
          className="overflow-hidden rounded-3xl border bg-white shadow-[0_10px_30px_-14px_rgba(16,42,67,0.25)]"
          style={{ borderColor: `color-mix(in srgb, ${accent.color} 35%, #d9e2ec)` }}
        >
          {/* Header: barra de acento tintada + logo + precio */}
          <div
            className="flex items-center justify-between gap-3 border-l-[6px] px-5 py-4"
            style={{
              borderColor: accent.color,
              backgroundColor: `color-mix(in srgb, ${accent.color} 10%, white)`,
            }}
          >
            <JaltestLogo
              src={line.logo}
              alt={`Jaltest ${line.variant}`}
              size="lg"
              className="h-16 max-w-[62%]"
            />
            <div
              className="shrink-0 rounded-2xl px-4 py-2 text-center text-white"
              style={{ backgroundColor: accent.color }}
            >
              <span className="block text-[11px] font-bold uppercase leading-none opacity-90">
                Price
              </span>
              <span className="mt-1 block text-[22px] font-extrabold leading-none tabular-nums">
                {line.price}
              </span>
            </div>
          </div>

          {/* Imagen: vehículo (o kit) sobre tinte suave del acento */}
          <div
            className="flex items-end justify-center gap-2 px-5 pt-5"
            style={{ backgroundColor: `color-mix(in srgb, ${accent.color} 5%, white)` }}
          >
            <SmartImage
              src={line.vehicleImg ?? line.kitImg}
              alt={`Vehículo ${line.variant}`}
              fit="contain"
              loading="lazy"
              wrapperClassName="h-40 w-full max-w-[380px] bg-transparent"
            />
          </div>
          <div className="-mt-6 flex justify-center px-5">
            <SmartImage
              src={line.kitImg}
              alt={`Kit ${line.brand} ${line.variant}`}
              fit="contain"
              loading="lazy"
              wrapperClassName="h-20 w-full max-w-[240px] bg-transparent"
            />
          </div>

          {/* Descripción + CTA */}
          <div className="px-5 pb-6 pt-4">
            <div className="space-y-3">
              {line.description.map((p, i) => (
                <p key={i} className="text-[14px] font-semibold leading-[1.45] text-[#666]">
                  {p}
                </p>
              ))}
            </div>
            <Link
              href="/contacto"
              className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-full px-6 text-[1rem] font-extrabold uppercase leading-none text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent.color }}
            >
              Cotizar Jaltest {line.variant}
            </Link>
          </div>
        </div>
      </div>

      {/* ───────── DESKTOP: layout original full-bleed (gris diagonal + triángulo) ───────── */}
      {/* Caja full-bleed: el fondo vive aquí, 100vw, alineación original */}
      <div
        className={cn(
          "relative mx-auto hidden w-screen max-w-none overflow-x-clip sm:px-10 md:left-1/2 md:ml-[-50vw] md:block md:px-0 md:py-0",
          visual.height
        )}
      >
        {/* Plano gris diagonal: paralelogramo de altura constante.
            Sup-der en el tope (0%), sup-izq a 20%, inferior paralela. */}
        {!visual.accentShape && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 -z-20 bg-[#efeee9]",
              visual.grayRaised ? "top-[-15%] bottom-0" : "inset-y-0",
              // compensa el pull del bloque para que el gris quede en su sitio
              visual.pull && "md:translate-y-[5vw]"
            )}
            style={{
              clipPath: visual.grayRaised
                ? "polygon(0 30%, 100% 0, 100% 69.6%, 0 100%)"
                : "polygon(0 20%, 100% 0, 100% 80%, 0 100%)",
            }}
          />
        )}
        {visual.accentShape === "ohw" && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-[-15%] -z-10 hidden h-[104%] w-[36%] md:block"
            style={{
              backgroundColor: accent.color,
              clipPath: "polygon(100% 0, 100% 100%, 0 50%)",
            }}
          />
        )}
        {visual.accentShape === "marine" && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-[-30%] -z-10 hidden h-[119%] w-[40%] md:block"
            style={{
              backgroundColor: accent.color,
              clipPath: "polygon(100% 0, 100% 100%, 0 50%)",
            }}
          />
        )}

        {/* Capa de contenido: centrada a max-w-6xl y @container (cqw) para que el
            arte y el texto queden proporcionales y dentro de los márgenes. */}
        <div className="relative z-10 md:absolute md:inset-y-0 md:left-1/2 md:w-full md:max-w-6xl md:-translate-x-1/2 md:[container-type:inline-size]">
          <div className="flex flex-col gap-5 md:block">
            <div className={cn("md:absolute", visual.logo)}>
              <JaltestLogo
                src={line.logo}
                alt={`Jaltest ${line.variant}`}
                size="lg"
                className="h-20 max-w-full sm:h-[96px] md:h-full"
              />
            </div>

            <div className={cn("md:absolute", visual.kit)}>
              <SmartImage
                src={line.kitImg}
                alt={`Kit ${line.brand} ${line.variant}`}
                fit="contain"
                loading="eager"
                wrapperClassName="h-28 w-full max-w-[360px] bg-transparent md:h-full md:max-w-none"
              />
            </div>

            <div className={cn("md:absolute md:z-20", visual.badge)}>
              <PriceBadge color={accent.color} price={line.price} />
            </div>

            <div className={cn("md:absolute", visual.vehicle)}>
              <SmartImage
                src={line.vehicleImg ?? line.kitImg}
                alt={`Vehículo ${line.variant}`}
                fit="contain"
                loading="eager"
                wrapperClassName="h-48 w-full max-w-[620px] bg-transparent md:h-full md:max-w-none"
              />
            </div>
          </div>

          {/* texto + CTA al ancho del contenedor (márgenes generales) */}
          <div className={cn("relative z-10 mt-8 md:absolute md:inset-x-0 md:mt-0", visual.text)}>
            <div className="space-y-4">
              {line.description.map((p, i) => (
                <p
                  key={i}
                  className="text-[clamp(14px,1.48vw,20px)] font-extrabold leading-[1.18] text-[#666]"
                >
                  {p}
                </p>
              ))}
            </div>
            {/* CTA fluye justo después del texto (espaciado consistente) */}
            <div className="mt-7 text-left md:text-center">
              <Link
                href="/contacto"
                className="inline-flex h-[53px] w-full max-w-full items-center justify-center rounded-full px-[2.1rem] text-center text-[1.05rem] font-extrabold uppercase leading-none text-white transition-opacity hover:opacity-90 sm:w-auto sm:min-w-[264px]"
                style={{ backgroundColor: accent.color }}
              >
                Cotizar Jaltest {line.variant}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
