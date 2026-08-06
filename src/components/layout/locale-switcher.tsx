"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { LANGS, LANG_COOKIE, type Lang } from "@/lib/i18n";
import { flagEmoji } from "@/lib/countries";

/**
 * Idioma (ES/EN) + país. Son dos cosas distintas: el idioma cambia el
 * contenido al vuelo; el país define la tarifa y por eso se cambia en el modal
 * (`?region`), que explica lo que implica.
 */
export function LocaleSwitcher({
  lang: current,
  country,
  changeLabel,
  className,
}: {
  lang: Lang;
  country: string | null;
  changeLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lang, setLang] = useState<Lang>(current);

  // El estado local es optimista; si el idioma cambia por fuera (el modal de
  // bienvenida) hay que resincronizar.
  useEffect(() => setLang(current), [current]);

  const select = (next: Lang) => {
    if (next === lang) return;
    setLang(next);
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div className={cn("flex items-center gap-1.5", pending && "opacity-70", className)}>
      <div
        role="group"
        aria-label="Idioma / Language"
        className="flex items-center gap-0.5 rounded-full border border-border bg-white/70 p-0.5"
      >
        {LANGS.map((l) => {
          const active = l.code === lang;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => select(l.code)}
              aria-pressed={active}
              title={l.label}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase leading-none transition-colors",
                active
                  ? "bg-brand text-white"
                  : "text-foreground/70 hover:bg-brand/10 hover:text-brand"
              )}
            >
              {l.short}
            </button>
          );
        })}
      </div>

      {/* El país abre el modal: cambiarlo cambia precios y envío. */}
      <a
        href="?region=1"
        aria-label={changeLabel}
        title={changeLabel}
        className="flex items-center gap-1 rounded-full border border-border bg-white/70 px-2 py-1 text-[11px] font-bold uppercase leading-none text-foreground/70 transition-colors hover:border-brand/40 hover:text-brand"
      >
        <span aria-hidden className="text-[13px] leading-none">
          {country ? flagEmoji(country) : "🌎"}
        </span>
        <span>{country ?? "—"}</span>
      </a>
    </div>
  );
}
