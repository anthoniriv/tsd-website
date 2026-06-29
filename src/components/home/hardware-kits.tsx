import { HARDWARE_KITS } from "@/lib/products";
import { HexTile } from "@/components/home/hex-tile";

/** "Laptops & Tablets para uso rudo + Adaptadores adicionales" */
export function HardwareKits() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-center text-3xl font-bold text-foreground sm:text-[2.5rem]">
          Laptops &amp; Tablets para uso rudo
        </h2>
        <p className="mb-12 text-center text-lg font-medium text-accent sm:text-xl">
          + Adaptadores adicionales
        </p>

        <div className="mx-auto grid max-w-md grid-cols-2 gap-4 sm:grid-cols-3 md:hidden">
          {HARDWARE_KITS.map((k) => (
            <HexTile key={k.label} label={k.label} img={k.img} />
          ))}
        </div>

        {/* desktop: honeycomb (4 arriba + 3 abajo offset, fotos en las esquinas y centro) */}
        <div className="hidden flex-col items-center md:flex">
          <div className="flex justify-center gap-3">
            <div className="w-40">
              <HexTile label={HARDWARE_KITS[0].label} img={HARDWARE_KITS[0].img} />
            </div>
            <div className="w-40">
              <HexTile label="" />
            </div>
            <div className="w-40">
              <HexTile label="" />
            </div>
            <div className="w-40">
              <HexTile label={HARDWARE_KITS[1].label} img={HARDWARE_KITS[1].img} />
            </div>
          </div>
          <div className="-mt-10 flex justify-center gap-3">
            {/* offset medio hex: los 3 de abajo encajan en los valles */}
            <div className="w-20" />
            <div className="w-40">
              <HexTile label="" />
            </div>
            <div className="w-40">
              <HexTile label={HARDWARE_KITS[2].label} img={HARDWARE_KITS[2].img} />
            </div>
            <div className="w-40">
              <HexTile label="" />
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>
    </section>
  );
}
