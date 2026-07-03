"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { LOCALES, LOCALE_COOKIE, type LocaleCode } from "@/lib/i18n";

/**
 * Selector de idioma/región (3 banderas). Guarda la elección en la cookie
 * `tds_locale` (1 año) y hace `router.refresh()` para re-renderizar los
 * componentes server con el nuevo locale. Sin ruta por idioma → misma URL.
 */
export function LocaleSwitcher({
  current,
  className,
}: {
  current: LocaleCode;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState<LocaleCode>(current);

  const select = (next: LocaleCode) => {
    if (next === code) return;
    setCode(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-border bg-white/70 p-0.5",
        pending && "opacity-70",
        className
      )}
    >
      {LOCALES.map((l) => {
        const active = l.code === code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => select(l.code)}
            aria-pressed={active}
            aria-label={l.label}
            title={l.label}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold uppercase leading-none transition-colors",
              active ? "bg-brand text-white" : "text-foreground/70 hover:bg-brand/10 hover:text-brand"
            )}
          >
            <span aria-hidden className="text-[13px] leading-none">
              {l.flag}
            </span>
            <span>{l.short}</span>
          </button>
        );
      })}
    </div>
  );
}
