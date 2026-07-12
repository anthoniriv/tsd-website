"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";

export type CardData = {
  id: string;
  slug: string;
  img: string;
  name: string;
  blurb: string;
  price: string;
  stock: number;
};

type Labels = {
  seeMore: string;
  cta: string;
  added: string;
  outOfStock: string;
  waCta: string;
  waGreeting: string;
  priceLabel: string;
  addedToast: string;
};

/** Solo controla cuántas cards se ven. Los strings ya vienen resueltos del servidor. */
export function ProductGridClient({
  cards,
  initialCount,
  labels,
}: {
  cards: CardData[];
  initialCount: number;
  labels: Labels;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? cards : cards.slice(0, initialCount);
  const hidden = cards.length - initialCount;

  return (
    <>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((c) => (
          <ProductCard
            key={c.id}
            id={c.id}
            slug={c.slug}
            img={c.img}
            name={c.name}
            blurb={c.blurb}
            price={c.price}
            stock={c.stock}
            cta={labels.cta}
            added={labels.added}
            outOfStock={labels.outOfStock}
            waCta={labels.waCta}
            waGreeting={labels.waGreeting}
            priceLabel={labels.priceLabel}
            addedToast={labels.addedToast}
          />
        ))}
      </div>

      {!expanded && hidden > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-brand transition-colors hover:bg-brand hover:text-white"
          >
            <Plus className="h-4 w-4" />
            {labels.seeMore} ({hidden})
          </button>
        </div>
      )}
    </>
  );
}
