import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLocaleData } from "@/lib/i18n.server";
import { SmartImage } from "@/components/ui/smart-image";
import { JaltestLogo } from "@/components/product/jaltest-logo";
import { getJaltestLines } from "@/lib/catalog";

// Posición de cada logo sobre un vértice del hexágono (coordenadas % del contenedor).
const NODES = [
  { id: "ohw", pos: "left-[14%] top-[27%]" },
  { id: "cv", pos: "left-1/2 top-[6%]" },
  { id: "agv", pos: "left-[86%] top-[27%]" },
  { id: "mhe", pos: "left-[14%] top-[73%]" },
  { id: "marine", pos: "left-[86%] top-[73%]" },
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

          {/* red hexagonal de logos (desktop) */}
          <div className="relative mx-auto hidden aspect-[1.1/1] w-full max-w-[460px] md:block">
            {/* contorno del hexágono que une los logos */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <polygon
                points="50,10 82,30 82,74 50,94 18,74 18,30"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* laptop al centro */}
            <SmartImage
              src="/images/logo-computer.svg"
              alt="Equipo de diagnóstico Jaltest"
              fit="contain"
              wrapperClassName="absolute left-1/2 top-1/2 w-[18%] -translate-x-1/2 -translate-y-1/2 bg-transparent"
            />

            {/* logos en los vértices: cada uno lleva al bloque de su línea */}
            {NODES.map(({ id, pos }) => {
              const line = byId[id];
              if (!line) return null;
              return (
                <Link
                  key={id}
                  href={`/producto#${id}`}
                  aria-label={`Jaltest ${line.variant}`}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 rounded-md p-1 transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                    pos
                  )}
                >
                  <JaltestLogo
                    src={line.logo}
                    alt={`Jaltest ${line.variant}`}
                    size="sm"
                    className="h-[2.36rem]"
                  />
                </Link>
              );
            })}

            {/* +Cobertura: hexágono sólido en el vértice inferior → catálogo completo */}
            <Link
              href="/producto"
              aria-label={dict.renovaciones.plusCoverage}
              className="absolute left-1/2 top-[94%] w-[20%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <div className="hex-clip flex aspect-[1/1.1] flex-col items-center justify-center gap-0.5 bg-brand text-white">
                <span className="text-xl font-bold leading-none">+</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide">
                  {dict.renovaciones.plusCoverage}
                </span>
              </div>
            </Link>
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
