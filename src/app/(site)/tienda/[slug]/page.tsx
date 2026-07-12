import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getLocaleData } from "@/lib/i18n.server";
import { getProductBySlug } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import { SmartImage } from "@/components/ui/smart-image";
import { AddToCart } from "@/components/cart/add-to-cart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang, tier, dict } = await getLocaleData();
  const product = await getProductBySlug(slug, tier);

  if (!product) return { title: dict.product.notFound };

  return {
    title: product.name[lang],
    description: product.blurb?.[lang] ?? undefined,
  };
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { dict, lang, tier } = await getLocaleData();

  const product = await getProductBySlug(slug, tier);
  if (!product) notFound();

  const paragraphs = product.description?.[lang] ?? [];
  const soldOut = product.stock <= 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <Link
        href="/tienda"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict.product.backToShop}
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <SmartImage
          src={product.img}
          alt={product.name[lang]}
          fit="contain"
          wrapperClassName="aspect-square w-full rounded-2xl border border-border bg-brand-light/10"
          className="p-8"
        />

        <div>
          {product.sku && (
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
              {product.sku}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-black leading-tight text-text-main">
            {product.name[lang]}
          </h1>

          {product.blurb?.[lang] && (
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              {product.blurb[lang]}
            </p>
          )}

          <p className="mt-6 text-4xl font-black tabular-nums text-brand">
            {formatPrice(product.priceCents ?? 0)}
          </p>

          <p className="mt-1 text-sm font-semibold">
            {soldOut ? (
              <span className="text-jt-mhe">{dict.product.outOfStock}</span>
            ) : (
              <span className="text-[#5f8f14]">
                {product.stock} {dict.product.stockLeft}
              </span>
            )}
          </p>

          <div className="mt-6">
            <AddToCart
              id={product.id}
              name={product.name[lang]}
              stock={product.stock}
              label={dict.product.addToCart}
              added={dict.productCard.added}
              outOfStock={dict.product.outOfStock}
              qtyLabel={dict.cart.qty}
              addedToast={dict.cart.addedToast}
            />
          </div>

          {paragraphs.length > 0 && (
            <section className="mt-10 border-t border-border pt-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">
                {dict.product.specs}
              </h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-text-secondary">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
