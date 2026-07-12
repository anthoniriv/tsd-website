import { formatPrice, type HardwareItem } from "@/lib/products";
import { getLocaleData } from "@/lib/i18n.server";
import { ProductCard } from "@/components/product/product-card";

/** Grid de productos con título. Resuelve idioma/tier y pasa strings a las cards. */
export async function ProductGrid({
  title,
  accentWord,
  items,
}: {
  title: string;
  accentWord?: string;
  items: HardwareItem[];
}) {
  const { dict, lang } = await getLocaleData();

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
            <ProductCard
              key={item.id}
              id={item.id}
              slug={item.slug ?? ""}
              img={item.img}
              name={item.name[lang]}
              blurb={item.blurb[lang]}
              price={formatPrice(item.priceCents ?? 0)}
              stock={item.stock ?? 0}
              cta={dict.productCard.cta}
              added={dict.productCard.added}
              outOfStock={dict.productCard.outOfStock}
              waCta={dict.productCard.waCta}
              waGreeting={dict.productCard.waGreeting}
              priceLabel={dict.productCard.priceLabel}
              addedToast={dict.cart.addedToast}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
