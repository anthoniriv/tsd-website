import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { JaltestLogo } from "@/components/product/jaltest-logo";
import { JALTEST_LINES } from "@/lib/products";

// Líneas por id para posicionarlas en los vértices del hexágono.
const byId = Object.fromEntries(JALTEST_LINES.map((l) => [l.id, l]));

// Posición de cada logo sobre un vértice del hexágono (coordenadas % del contenedor).
const NODES = [
  { id: "ohw", pos: "left-[14%] top-[27%]" },
  { id: "cv", pos: "left-1/2 top-[6%]" },
  { id: "agv", pos: "left-[86%] top-[27%]" },
  { id: "mhe", pos: "left-[14%] top-[73%]" },
  { id: "marine", pos: "left-[86%] top-[73%]" },
] as const;

/** Bloque "Renueva o añade más cobertura" con imagen + red hexagonal de logos Jaltest. */
export function Renovaciones() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-[2.5rem]">
          Renueva <span className="text-brand">o añade más cobertura</span>
        </h2>

        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* imagen (asset ya viene recortado en hexágono) */}
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
            <SmartImage
              src="/images/renovaciones.png"
              alt="Técnica usando laptop rugged Jaltest"
              fit="contain"
              wrapperClassName="aspect-square w-full bg-transparent"
            />
            <span className="absolute inset-x-0 bottom-1/3 text-center text-2xl font-bold italic text-white drop-shadow">
              Renovaciones
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

            {/* logos en los vértices */}
            {NODES.map(({ id, pos }) => {
              const line = byId[id];
              return (
                <div
                  key={id}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2",
                    pos
                  )}
                >
                  <JaltestLogo
                    src={line.logo}
                    alt={`Jaltest ${line.variant}`}
                    size="sm"
                    className="h-[2.36rem]"
                  />
                </div>
              );
            })}

            {/* +Cobertura: hexágono sólido en el vértice inferior */}
            <div className="absolute left-1/2 top-[94%] w-[20%] -translate-x-1/2 -translate-y-1/2">
              <div className="hex-clip flex aspect-[1/1.1] flex-col items-center justify-center gap-0.5 bg-brand text-white">
                <span className="text-xl font-bold leading-none">+</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide">
                  Cobertura
                </span>
              </div>
            </div>
          </div>

          {/* logos apilados (mobile) */}
          <div className="grid grid-cols-2 place-items-center gap-x-10 gap-y-8 md:hidden">
            {JALTEST_LINES.slice(0, 2).map((line) => (
              <JaltestLogo key={line.id} src={line.logo} alt={`Jaltest ${line.variant}`} size="sm" />
            ))}
            <div className="col-span-2 flex items-center gap-3">
              <span className="hex-clip grid h-12 w-12 place-items-center bg-brand text-white">
                <span className="text-lg font-bold leading-none">+</span>
              </span>
              <span className="text-sm font-semibold uppercase tracking-wide text-brand">
                + Cobertura
              </span>
            </div>
            {JALTEST_LINES.slice(2, 4).map((line) => (
              <JaltestLogo key={line.id} src={line.logo} alt={`Jaltest ${line.variant}`} size="sm" />
            ))}
            <div className="col-span-2">
              <JaltestLogo
                src={JALTEST_LINES[4].logo}
                alt={`Jaltest ${JALTEST_LINES[4].variant}`}
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/contacto"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-brand text-white hover:bg-brand-dark"
            )}
          >
            Renovar o ampliar cobertura
          </Link>
        </div>
      </div>
    </section>
  );
}
