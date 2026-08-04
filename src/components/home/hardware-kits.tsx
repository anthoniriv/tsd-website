import { HARDWARE_KITS } from "@/lib/products";
import { getLocaleData } from "@/lib/i18n.server";
import { HexTile } from "@/components/home/hex-tile";

/** "Laptops & Tablets para uso rudo + Adaptadores adicionales" */
export async function HardwareKits() {
  const { dict } = await getLocaleData();
  const labels = dict.hardware.labels;
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-center text-3xl font-bold text-foreground sm:text-[2.5rem]">
          {dict.hardware.title}
        </h2>
        <p className="mb-12 text-center text-lg font-medium text-accent sm:text-xl">
          {dict.hardware.subtitle}
        </p>

        <div className="mx-auto grid max-w-md grid-cols-2 gap-4 sm:grid-cols-3 md:hidden">
          {HARDWARE_KITS.map((k) => (
            <HexTile key={k.key} label={labels[k.key]} img={k.img} href={k.href} />
          ))}
        </div>

        {/* desktop: los 3 hexágonos en una fila (sin rellenos decorativos) */}
        <div className="hidden justify-center gap-3 md:flex">
          {HARDWARE_KITS.map((k) => (
            <div key={k.key} className="w-40">
              <HexTile label={labels[k.key]} img={k.img} href={k.href} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
