import type { Metadata } from "next";
import { getLocaleData } from "@/lib/i18n.server";
import { searchHardware } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import type { HardwareItem } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";
import { ShopFilters } from "@/components/product/shop-filters";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleData();
  return { title: dict.shop.title };
}

type Search = {
  q?: string;
  cat?: string;
  min?: string;
  max?: string;
  stock?: string;
};

const CATEGORIES: HardwareItem["category"][] = ["laptop", "cable", "finder"];

function toCategory(value: string | undefined): HardwareItem["category"] | undefined {
  return CATEGORIES.find((c) => c === value);
}

/** Dólares del query string → centavos. Ignora basura (NaN) en vez de romper. */
function toCents(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { dict, lang, tier } = await getLocaleData();
  const sp = await searchParams;

  const items = await searchHardware({
    tier,
    q: sp.q,
    category: toCategory(sp.cat),
    minCents: toCents(sp.min),
    maxCents: toCents(sp.max),
    inStock: sp.stock === "1",
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wide text-text-main">
          {dict.shop.title}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {sp.q ? (
            <>
              {dict.shop.resultsFor} <strong>“{sp.q}”</strong> — {items.length} {dict.shop.count}
            </>
          ) : (
            <>
              {items.length} {dict.shop.count}
            </>
          )}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <ShopFilters dict={dict.shop} />

        <div>
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-bg-soft px-6 py-16 text-center text-sm text-text-secondary">
              {dict.shop.empty}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
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
          )}
        </div>
      </div>
    </div>
  );
}
