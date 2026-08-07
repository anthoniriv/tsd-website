"use client";

// Filtros del catálogo. Escriben en el query string (no en estado local): la búsqueda
// queda enlazable/compartible y el servidor es quien filtra.

import { useRouter, useSearchParams } from "next/navigation";
import type { Dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CATEGORIES = ["laptop", "cable", "finder", "renewal", "upgrade"] as const;

export function ShopFilters({ dict }: { dict: Dict["shop"] }) {
  const router = useRouter();
  const params = useSearchParams();

  const current = {
    q: params.get("q") ?? "",
    cat: params.get("cat") ?? "",
    min: params.get("min") ?? "",
    max: params.get("max") ?? "",
    stock: params.get("stock") === "1",
  };

  const push = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    router.push(sp.size ? `/tienda?${sp}` : "/tienda");
  };

  const hasFilters = Boolean(current.q || current.cat || current.min || current.max || current.stock);

  return (
    <aside className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          push({
            q: String(fd.get("q") ?? "").trim() || null,
            min: String(fd.get("min") ?? "").trim() || null,
            max: String(fd.get("max") ?? "").trim() || null,
          });
        }}
        className="space-y-6 rounded-2xl border border-border bg-white p-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="q">{dict.searchLabel}</Label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={current.q}
            placeholder={dict.searchPlaceholder}
            key={current.q}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-text-main">{dict.category}</p>
          <div className="flex flex-col gap-1">
            <CategoryChip
              active={!current.cat}
              label={dict.allCategories}
              onClick={() => push({ cat: null })}
            />
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c}
                active={current.cat === c}
                label={dict.categories[c]}
                onClick={() => push({ cat: c })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-text-main">{dict.priceRange}</p>
          <div className="flex items-center gap-2">
            <Input
              name="min"
              type="number"
              min="0"
              placeholder={dict.min}
              defaultValue={current.min}
              key={`min-${current.min}`}
              className="h-9"
            />
            <span className="text-text-muted">–</span>
            <Input
              name="max"
              type="number"
              min="0"
              placeholder={dict.max}
              defaultValue={current.max}
              key={`max-${current.max}`}
              className="h-9"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-main">
          <input
            type="checkbox"
            checked={current.stock}
            onChange={(e) => push({ stock: e.target.checked ? "1" : null })}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          {dict.inStock}
        </label>

        <Button type="submit" className="w-full bg-brand hover:bg-brand-dark">
          {dict.apply}
        </Button>

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/tienda")}
            className="w-full text-xs font-semibold text-text-muted hover:text-brand"
          >
            {dict.clear}
          </button>
        )}
      </form>
    </aside>
  );
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-left text-sm font-medium transition-colors",
        active ? "bg-brand/10 font-bold text-brand-dark" : "text-text-secondary hover:bg-bg-soft",
      )}
    >
      {label}
    </button>
  );
}
