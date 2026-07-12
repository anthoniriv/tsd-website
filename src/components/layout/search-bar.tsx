"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { searchSuggestions, type Suggestion } from "@/app/(site)/search-actions";
import type { Dict } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { SmartImage } from "@/components/ui/smart-image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

/**
 * Buscador con sugerencias en vivo. Enter (o el botón) navega a /tienda?q=… — la búsqueda
 * completa sigue siendo una URL enlazable; el dropdown es solo un atajo.
 */
export function SearchBar({
  dict,
  className,
  onNavigate,
}: {
  dict: Dict;
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  /** Término del que ya tenemos respuesta. Sin esto, mientras corre el debounce el panel
   *  diría "sin resultados" para algo que todavía no se ha buscado. */
  const [settled, setSettled] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pending, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  const term = q.trim();

  // Debounce: no lanzamos una query por tecla.
  useEffect(() => {
    if (term.length < MIN_CHARS) {
      setItems([]);
      setSettled("");
      return;
    }
    const id = setTimeout(() => {
      startTransition(async () => {
        const res = await searchSuggestions(term);
        setItems(res);
        setSettled(term);
        setActive(-1);
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [term]);

  // Cerrar al hacer click fuera.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const submit = () => {
    go(term ? `/tienda?q=${encodeURIComponent(term)}` : "/tienda");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setOpen(false);
    if (!open || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(`/tienda/${items[active].slug}`);
    }
  };

  const showPanel = open && term.length >= MIN_CHARS;
  // "Buscando" mientras el término tecleado aún no tiene respuesta (debounce incluido).
  const searching = settled !== term;
  const empty = !searching && items.length === 0;

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input
          type="search"
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={dict.header.searchPlaceholder}
          className="h-10 pr-11"
          aria-label={dict.header.search}
          role="combobox"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label={dict.header.search}
          className="absolute right-1 top-1 grid h-8 w-9 place-items-center rounded-sm bg-brand text-white transition-colors hover:bg-brand-dark"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {showPanel && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-xl border border-border bg-white shadow-xl"
        >
          {searching && items.length === 0 ? (
            <div className="p-3">
              <p className="flex items-center gap-2 px-1 pb-2 text-xs font-semibold text-text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {dict.shop.searching}
              </p>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : empty ? (
            <div className="p-6 text-center">
              <p className="text-sm text-text-secondary">
                {dict.shop.noSuggestions} <strong>“{term}”</strong>
              </p>
              <Link
                href="/tienda"
                onClick={() => setOpen(false)}
                className="mt-2 inline-block text-sm font-bold text-brand hover:underline"
              >
                {dict.shop.seeAllProducts}
              </Link>
            </div>
          ) : (
            <>
              <ul className={cn(pending && "opacity-60")}>
                {items.map((item, i) => (
                  <li key={item.id}>
                    <Link
                      href={`/tienda/${item.slug}`}
                      role="option"
                      aria-selected={i === active}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 transition-colors",
                        i === active ? "bg-bg-soft" : "hover:bg-bg-soft",
                      )}
                    >
                      <SmartImage
                        src={item.img}
                        alt={item.name}
                        fit="contain"
                        wrapperClassName="h-11 w-11 shrink-0 rounded-lg bg-brand-light/15"
                        className="p-1"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-main">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-sm font-extrabold tabular-nums text-brand">
                        {item.price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={submit}
                className="w-full cursor-pointer border-t border-border bg-bg-soft/60 py-2.5 text-xs font-bold uppercase tracking-wide text-brand hover:bg-bg-soft"
              >
                {dict.shop.viewAllResults}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
