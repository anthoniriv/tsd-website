import type { HardwareItem } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";

/** Grid de productos con título. */
export function ProductGrid({
  title,
  accentWord,
  items,
}: {
  title: string;
  accentWord?: string;
  items: HardwareItem[];
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-foreground">
            {title} {accentWord && <span className="text-brand">{accentWord}</span>}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
