import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Headset, ShieldCheck, Truck } from "lucide-react";
import { getLocaleData } from "@/lib/i18n.server";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import { SmartImage } from "@/components/ui/smart-image";
import { AddToCart } from "@/components/cart/add-to-cart";
import { WhatsAppButton } from "@/components/product/whatsapp-button";
import { ProductCard } from "@/components/product/product-card";

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

  const related = await getRelatedProducts(product.id, product.category, tier, 4);

  const name = product.name[lang];
  const blurb = product.blurb?.[lang];
  const price = formatPrice(product.priceCents ?? 0);
  const paragraphs = product.description?.[lang] ?? [];
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 3;

  // "Conoce más de este producto": lleva al bloque institucional de /producto.
  // Las 5 líneas Jaltest tienen anchor propio (#cv, #ohw…); el hardware va al
  // grid de su categoría.
  const learnMoreHref =
    product.kind === "jaltest"
      ? product.accentKey
        ? `/producto#${product.accentKey}`
        : "/producto"
      : product.category
        ? `/producto#hardware-${product.category}`
        : "/producto";

  const trust = [
    { icon: Truck, title: dict.product.trust.shipping, hint: dict.product.trust.shippingHint },
    { icon: ShieldCheck, title: dict.product.trust.secure, hint: dict.product.trust.secureHint },
    { icon: Headset, title: dict.product.trust.support, hint: dict.product.trust.supportHint },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm">
        <Link href="/tienda" className="text-text-muted hover:text-brand">
          {dict.shop.title}
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            <Link
              href={`/tienda?cat=${product.category}`}
              className="text-text-muted hover:text-brand"
            >
              {dict.shop.categories[product.category]}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
        <span className="truncate font-semibold text-text-main">{name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <SmartImage
          src={product.img}
          alt={name}
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
          <h1 className="mt-1 text-3xl font-black leading-tight text-text-main">{name}</h1>

          {blurb && (
            <p className="mt-3 text-base leading-relaxed text-text-secondary">{blurb}</p>
          )}

          <p className="mt-6 text-4xl font-black tabular-nums text-brand">{price}</p>

          <p className="mt-1 text-sm font-semibold">
            {soldOut ? (
              <span className="text-jt-mhe">{dict.product.outOfStock}</span>
            ) : lowStock ? (
              <span className="text-jt-ohw">{dict.product.lastUnits}</span>
            ) : (
              <span className="text-[#5f8f14]">{dict.product.available}</span>
            )}
          </p>

          <div className="mt-6 space-y-3">
            <AddToCart
              id={product.id}
              name={name}
              stock={product.stock}
              label={dict.product.addToCart}
              added={dict.productCard.added}
              outOfStock={dict.product.outOfStock}
              qtyLabel={dict.cart.qty}
              addedToast={dict.cart.addedToast}
            />

            {/* Agotado = el punto donde hoy se perdía la venta. Damos salida por WhatsApp. */}
            <WhatsAppButton
              label={soldOut ? dict.product.askStock : dict.product.askAdvisor}
              variant={soldOut ? "solid" : "ghost"}
              greeting={dict.productCard.waGreeting}
              name={name}
              blurb={blurb ?? undefined}
              priceLabel={dict.productCard.priceLabel}
              price={price}
              img={product.img}
            />
          </div>

          <Link
            href={learnMoreHref}
            className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark"
          >
            {dict.product.learnMore}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <ul className="mt-8 space-y-3 border-t border-border pt-6">
            {trust.map(({ icon: Icon, title, hint }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-dark">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-text-main">{title}</span>
                  <span className="block text-xs text-text-muted">{hint}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {paragraphs.length > 0 && (
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-text-secondary">
            {dict.product.specs}
          </h2>
          <div className="grid gap-5 text-[15px] leading-relaxed text-text-secondary md:grid-cols-2">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="mb-8 text-2xl font-extrabold uppercase tracking-wide text-text-main">
            {dict.product.related}
          </h2>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {related.map((item) => (
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
        </section>
      )}
    </div>
  );
}
