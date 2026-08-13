import Link from "next/link";
import { getLocaleData } from "@/lib/i18n.server";
import { SmartImage } from "@/components/ui/smart-image";
import { JaltestLogo } from "@/components/product/jaltest-logo";
import { getJaltestLines } from "@/lib/catalog";

/**
 * Bloque "Renueva o añade más cobertura": dos piezas hexagonales gemelas —
 * renovaciones (izquierda) → /producto#renovar, rueda de cobertura (derecha) →
 * /producto#ampliar. Mismo tamaño, mismo marco de acento y mismo hover en las
 * dos. En mobile la rueda se sustituye por los logos sueltos.
 */
export async function Renovaciones() {
  const { dict, tier } = await getLocaleData();
  const lines = await getJaltestLines(tier);

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

          {/* rueda de cobertura (desktop). Mismo lenguaje que el bloque de la
              izquierda: hexágono fino de acento detrás, offset abajo-derecha, y
              el mismo hover (scale). Un solo enlace — a la sección de ampliar
              cobertura de /producto — en vez de una zona sensible por cuña. */}
          <div className="relative mx-auto hidden w-72 sm:w-80 md:block">
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
              href="/producto#ampliar"
              aria-label={dict.renovaciones.plusCoverage}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <SmartImage
                src="/images/laminas/cobertura-hex.png"
                alt={dict.renovaciones.title}
                fit="contain"
                wrapperClassName="aspect-[856/935] w-full bg-transparent"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* logos apilados (mobile) */}
          <div className="grid grid-cols-2 place-items-center gap-x-10 gap-y-8 md:hidden">
            {lines.slice(0, 2).map((line) => (
              <Link key={line.id} href={`/producto#${line.id}`} aria-label={`Jaltest ${line.variant}`}>
                <JaltestLogo src={line.logo} alt={`Jaltest ${line.variant}`} size="sm" />
              </Link>
            ))}
            <Link href="/producto#ampliar" className="col-span-2 flex items-center gap-3">
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
