import Link from "next/link";
import { getLocaleData } from "@/lib/i18n.server";
import { COVERAGE_COLLAGE_IMG } from "@/lib/products";
import { HexTile } from "@/components/home/hex-tile";
import { SmartImage } from "@/components/ui/smart-image";

/**
 * Bloque "Renueva o añade más cobertura": dos hexágonos, ambos como puerta de
 * entrada a /producto. Sin CTA propio — la navegación son los hexágonos.
 */
export async function Renovaciones() {
  const { dict } = await getLocaleData();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-[2.5rem]">
          {dict.renovaciones.title}{" "}
          <span className="text-brand">{dict.renovaciones.titleAccent}</span>
        </h2>

        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* hexágono izquierdo: renovaciones → sección de renovación de /producto */}
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
              <span className="pointer-events-none absolute inset-x-0 bottom-1/3 text-center text-2xl font-bold italic text-white drop-shadow">
                {dict.renovaciones.watermark}
              </span>
            </Link>
          </div>

          {/* hexágono derecho: cobertura por tipo de equipo → /producto */}
          <div className="mx-auto w-72 sm:w-80">
            <HexTile
              label={dict.renovaciones.coverageAlt}
              img={COVERAGE_COLLAGE_IMG}
              href="/producto"
              hideLabel
            />
          </div>
        </div>
      </div>
    </section>
  );
}
