import Link from "next/link";
import { cn } from "@/lib/utils";
import { ACCENT, type JaltestLine } from "@/lib/products";
import { SmartImage } from "@/components/ui/smart-image";
import { JaltestLogo } from "@/components/product/jaltest-logo";

const HEX = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

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
    logo: "md:left-[8vw] md:top-[3vw] md:h-[clamp(96px,10vw,165px)]",
    kit: "md:left-[11vw] md:top-[17vw] md:h-[clamp(92px,9vw,140px)] md:w-[clamp(285px,28vw,420px)]",
    badge: "md:left-[39.5vw] md:top-[10.6vw]",
    vehicle: "md:right-[5vw] md:top-[7vw] md:h-[clamp(210px,22vw,340px)] md:w-[clamp(420px,44vw,660px)]",
    text: "md:left-[7vw] md:right-[7vw] md:top-[clamp(323px,32.5vw,510px)]",
  },
  ohw: {
    height: "md:min-h-[clamp(640px,66vw,950px)]",
    logo: "md:left-[8vw] md:top-[4.5vw] md:h-[clamp(100px,10vw,160px)]",
    kit: "md:left-[8vw] md:top-[20vw] md:h-[clamp(128px,13vw,200px)] md:w-[clamp(325px,34vw,500px)]",
    badge: "md:left-[38.5vw] md:top-[12.4vw]",
    vehicle: "md:right-[3vw] md:top-[4.8vw] md:h-[clamp(310px,31vw,475px)] md:w-[clamp(510px,52vw,790px)]",
    text: "md:left-[7vw] md:right-[7vw] md:top-[clamp(360px,36.4vw,565px)]",
    accentShape: "ohw",
  },
  agv: {
    height: "md:min-h-[clamp(560px,58vw,840px)]",
    logo: "md:left-[7vw] md:top-[3.6vw] md:h-[clamp(105px,10.4vw,162px)]",
    kit: "md:left-[12vw] md:top-[18.7vw] md:h-[clamp(100px,10vw,145px)] md:w-[clamp(300px,31vw,430px)]",
    badge: "md:left-[40.5vw] md:top-[9.3vw]",
    vehicle: "md:right-[2.4vw] md:top-[10.5vw] md:h-[clamp(210px,21vw,305px)] md:w-[clamp(500px,51vw,720px)]",
    text: "md:left-[8vw] md:right-[8vw] md:top-[clamp(336px,33.5vw,505px)]",
    grayRaised: true,
  },
  marine: {
    height: "md:min-h-[clamp(630px,64vw,930px)]",
    logo: "md:left-[9.5vw] md:top-[2.8vw] md:h-[clamp(110px,11vw,168px)]",
    kit: "md:left-[11.5vw] md:top-[16.6vw] md:h-[clamp(130px,13vw,200px)] md:w-[clamp(326px,34vw,500px)]",
    badge: "md:left-[41vw] md:top-[2.8vw]",
    vehicle: "md:right-[3.4vw] md:top-[7.6vw] md:h-[clamp(250px,25vw,370px)] md:w-[clamp(505px,52vw,780px)]",
    text: "md:left-[8vw] md:right-[8vw] md:top-[clamp(322px,32vw,510px)]",
    accentShape: "marine",
  },
  mhe: {
    height: "md:min-h-[clamp(560px,58vw,840px)]",
    logo: "md:left-[9.5vw] md:top-[3.6vw] md:h-[clamp(110px,10.8vw,165px)]",
    kit: "md:left-[11.5vw] md:top-[19.4vw] md:h-[clamp(112px,11vw,165px)] md:w-[clamp(300px,31vw,450px)]",
    badge: "md:left-[41.2vw] md:top-[5vw]",
    vehicle: "md:right-[7vw] md:top-[4.2vw] md:h-[clamp(300px,30vw,450px)] md:w-[clamp(430px,44vw,650px)]",
    text: "md:left-[8vw] md:right-[8vw] md:top-[clamp(348px,35vw,540px)]",
    grayRaised: true,
    pull: "md:mt-[-5vw]",
  },
};

/** Badge hexagonal de precio: relleno translúcido del color + borde celeste. */
function PriceBadge({ color, price }: { color: string; price: string }) {
  return (
    <div
      className="relative grid aspect-[1.1547/1] w-[136px] shrink-0 place-items-center text-white shadow-sm md:w-[clamp(136px,12.8vw,190px)]"
      style={{ clipPath: HEX, backgroundColor: "#67c8e8" }}
    >
      <div
        className="absolute inset-[6px] flex flex-col items-center justify-center px-[18px] text-center"
        style={{
          clipPath: HEX,
          backgroundColor: `color-mix(in srgb, ${color} 62%, transparent)`,
        }}
      >
        <span className="text-[clamp(13px,1.2vw,17px)] font-extrabold leading-none">Price</span>
        <span className="mt-1 text-[clamp(28px,2.88vw,42px)] font-extrabold leading-none tracking-normal tabular-nums">
          {price}
        </span>
      </div>
    </div>
  );
}

/**
 * Bloque comercial compacto por línea Jaltest (CV/OHW/AGV/Marine/MHE).
 * Banner horizontal (~500px desktop), MISMA orientación en todos: logo+kit a la
 * izquierda, hexágono de precio al centro, maquinaria grande a la derecha; debajo
 * la descripción a todo el ancho y un CTA pill centrado.
 * Fondo: gris en la franja superior, blanco abajo (texto sobre limpio) y un gran
 * triángulo del color de la línea como acento detrás del vehículo.
 */
export function ProductHero({ line }: { line: JaltestLine }) {
  const accent = ACCENT[line.id];
  const visual = VISUALS[line.id];

  return (
    <article className={cn("md:py-0", visual.pull)}>
      <div
        className={cn(
          "relative mx-auto w-screen max-w-none overflow-x-clip px-6 py-9 sm:px-10 md:left-1/2 md:ml-[-50vw] md:px-0 md:py-0",
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

        <div className="relative z-10 flex flex-col gap-5 md:block">
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

        <div className={cn("relative z-10 mt-8 md:absolute md:mt-0", visual.text)}>
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
    </article>
  );
}
