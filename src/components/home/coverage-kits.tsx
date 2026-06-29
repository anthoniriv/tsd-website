import { COVERAGE_KITS } from "@/lib/products";
import { HexTile } from "@/components/home/hex-tile";
import { Hexagon } from "@/components/ui/hexagon";

/**
 * "Kits de cobertura TDS".
 * Desktop: honeycomb (4 arriba + 2 abajo offset). Mobile: grid 2-col de hexágonos.
 */
export function CoverageKits() {
  const [top, bottom] = [COVERAGE_KITS.slice(0, 4), COVERAGE_KITS.slice(4)];

  return (
    <section className="bg-muted/60 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-center text-3xl font-bold text-foreground sm:text-[2.5rem]">
          Kits de cobertura <span className="text-accent">TDS</span>
        </h2>
        <p className="mb-12 text-center text-lg text-muted-foreground sm:text-xl">
          Cobertura multimarca lista para tu taller, por segmento.
        </p>

        {/* mobile: grid */}
        <div className="mx-auto grid max-w-md grid-cols-2 gap-4 sm:grid-cols-3 md:hidden">
          {COVERAGE_KITS.map((k) => (
            <HexTile key={k.label} label={k.label} img={k.img} />
          ))}
        </div>

        {/* desktop: honeycomb */}
        <div className="hidden flex-col items-center md:flex">
          <div className="flex justify-center gap-3">
            {top.map((k) => (
              <div key={k.label} className="w-48">
                <HexTile label={k.label} img={k.img} />
              </div>
            ))}
          </div>
          <div className="-mt-12 flex justify-center gap-3">
            {/* offset medio hex: los de abajo encajan en los valles */}
            <div className="w-24" />
            <div className="w-48">
              <HexTile label={bottom[0].label} img={bottom[0].img} />
            </div>
            {/* hex blanco central (vacío del centro) */}
            <div className="w-48">
              <Hexagon as="div" className="bg-white" />
            </div>
            <div className="w-48">
              <HexTile label={bottom[1].label} img={bottom[1].img} />
            </div>
            <div className="w-24" />
          </div>
        </div>
      </div>
    </section>
  );
}
