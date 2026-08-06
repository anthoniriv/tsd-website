import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice, type HardwareItem } from "@/lib/products";
import { getLocaleData } from "@/lib/i18n.server";
import { ProductGridClient, type CardData } from "@/components/product/product-grid-client";

/**
 * Grid de una categoría. Resuelve idioma/tier/dict en servidor y pasa strings planos;
 * el cliente solo decide CUÁNTAS cards pinta (ver más), no filtra data.
 *
 * Los items vienen ya recortados por la query (`getHardware(cat, tier, maxCount)`), así
 * que nunca se serializan al navegador más de las que se pueden llegar a mostrar.
 */
export async function ProductGrid({
  title,
  accentWord,
  items,
  category,
  initialCount = 4,
}: {
  title: string;
  accentWord?: string;
  items: HardwareItem[];
  category?: HardwareItem["category"];
  initialCount?: number;
}) {
  const { dict, lang } = await getLocaleData();

  const cards: CardData[] = items.map((item) => ({
    id: item.id,
    slug: item.slug ?? "",
    img: item.img,
    name: item.name[lang],
    blurb: item.blurb[lang],
    price: formatPrice(item.priceCents ?? 0),
    stock: item.stock ?? 0,
  }));

  return (
    // el anchor permite volver aquí desde la ficha ("Conoce más de este producto")
    <section id={category ? `hardware-${category}` : undefined} className="scroll-mt-36 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-foreground">
            {title} {accentWord && <span className="text-brand">{accentWord}</span>}
          </h2>

          {category && (
            <Link
              href={`/tienda?cat=${category}`}
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark"
            >
              {dict.shop.seeAll}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        <ProductGridClient
          cards={cards}
          initialCount={initialCount}
          labels={{
            seeMore: dict.shop.seeMore,
            cta: dict.productCard.cta,
            added: dict.productCard.added,
            outOfStock: dict.productCard.outOfStock,
            waCta: dict.productCard.waCta,
            waGreeting: dict.productCard.waGreeting,
            priceLabel: dict.productCard.priceLabel,
            addedToast: dict.cart.addedToast,
          }}
        />
      </div>
    </section>
  );
}
