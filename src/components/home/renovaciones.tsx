import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLocaleData } from "@/lib/i18n.server";
import { SmartImage } from "@/components/ui/smart-image";
import { JaltestLogo } from "@/components/product/jaltest-logo";
import { getJaltestLines } from "@/lib/catalog";

/**
 * Zona sensible de cada cuña sobre la rueda de cobertura (`cobertura-hex.png`,
 * el gráfico que mandó el cliente). Coordenadas en % del contenedor, centradas
 * sobre el logo de cada línea.
 */
const WEDGES = [
  { id: "cv", pos: "left-[20%] top-[13%] w-[27%] h-[19%]" },
  { id: "agv", pos: "left-[58%] top-[25%] w-[27%] h-[19%]" },
  { id: "ohw", pos: "left-[5%] top-[38%] w-[27%] h-[19%]" },
  { id: "marine", pos: "left-[58%] top-[55%] w-[27%] h-[19%]" },
  { id: "mhe", pos: "left-[23%] top-[63%] w-[27%] h-[19%]" },
] as const;

/**
 * Bloque "Renueva o añade más cobertura" con imagen + red hexagonal de logos
 * Jaltest. Cada logo enlaza al bloque de su línea en /producto; el hex
 * "+Cobertura" lleva a la página completa. Sin CTA propio: la navegación son
 * los propios hexágonos.
 */
export async function Renovaciones() {
  const { dict, tier } = await getLocaleData();
  const lines = await getJaltestLines(tier);
  const byId = Object.fromEntries(lines.map((l) => [l.id, l]));

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-[2.5rem]">
          {dict.renovaciones.title}{" "}
          <span className="text-brand">{dict.renovaciones.titleAccent}</span>
        </h2>

        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* imagen (asset ya viene recortado en hexágono) → sección de renovación */}
          <div className="relative mx-auto w-72 sm:w-80">
            {/* hexágono decorativo de borde fino (acento), alineado abajo-derecha */}
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute -bottom-6 -right-6 -z-10 aspect-square w-full"
              aria-hidden
            >
              <polygon
                points="50,4 92,28 92,72 50,96 8,72 8,28"
                fill="none"
                stroke="var(--color-accent-aqua)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <Link
              href="/producto#renovar"
              aria-label={dict.renovaciones.watermark}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <SmartImage
                src="/images/renovaciones.png"
                alt={dict.renovaciones.watermark}
                fit="contain"
                wrapperClassName="aspect-square w-full bg-transparent"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <span className="pointer-events-none absolute inset-x-0 bottom-1/3 text-center text-2xl font-bold italic text-white drop-shadow">
              {dict.renovaciones.watermark}
            </span>
          </div>

          {/* rueda de cobertura (desktop): el gráfico del cliente con una zona
              sensible por cuña, cada una al bloque de su línea en /producto */}
          <div className="relative mx-auto hidden aspect-[856/935] w-full max-w-[430px] md:block">
            <SmartImage
              src="/images/laminas/cobertura-hex.png"
              alt={dict.renovaciones.title}
              fit="contain"
              wrapperClassName="absolute inset-0 h-full w-full bg-transparent"
            />

            {WEDGES.map(({ id, pos }) => {
              const line = byId[id];
              if (!line) return null;
              return (
                <Link
                  key={id}
                  href={`/producto#${id}`}
                  aria-label={`Jaltest ${line.variant}`}
                  className={cn(
                    "absolute rounded-md transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                    pos
                  )}
                />
              );
            })}
          </div>

          {/* logos apilados (mobile) */}
          <div className="grid grid-cols-2 place-items-center gap-x-10 gap-y-8 md:hidden">
            {lines.slice(0, 2).map((line) => (
              <Link key={line.id} href={`/producto#${line.id}`} aria-label={`Jaltest ${line.variant}`}>
                <JaltestLogo src={line.logo} alt={`Jaltest ${line.variant}`} size="sm" />
              </Link>
            ))}
            <Link href="/producto" className="col-span-2 flex items-center gap-3">
              <span className="hex-clip grid h-12 w-12 place-items-center bg-brand text-white">
                <span className="text-lg font-bold leading-none">+</span>
              </span>
              <span className="text-sm font-semibold uppercase tracking-wide text-brand">
                + {dict.renovaciones.plusCoverage}
              </span>
            </Link>
            {lines.slice(2, 4).map((line) => (
              <Link key={line.id} href={`/producto#${line.id}`} aria-label={`Jaltest ${line.variant}`}>
                <JaltestLogo src={line.logo} alt={`Jaltest ${line.variant}`} size="sm" />
              </Link>
            ))}
            {lines[4] && (
              <Link
                href={`/producto#${lines[4].id}`}
                aria-label={`Jaltest ${lines[4].variant}`}
                className="col-span-2"
              >
                <JaltestLogo src={lines[4].logo} alt={`Jaltest ${lines[4].variant}`} size="sm" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
