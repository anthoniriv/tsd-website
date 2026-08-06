"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  COUNTRY_COOKIE,
  LANG_COOKIE,
  LANGS,
  type Dict,
  type Lang,
} from "@/lib/i18n";
import {
  CONTINENTS,
  countriesByContinent,
  langForCountry,
  tierForCountry,
} from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const STORAGE_KEY = "tds_region_chosen";

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/**
 * Modal de bienvenida: país (lista completa) + idioma.
 *
 * El país determina la tarifa —USA/Canadá contra el resto del mundo— pero eso
 * es lógica interna: el visitante solo ve su país. El idioma va aparte, así que
 * puede elegir Perú y navegar en inglés: paga precio "resto del mundo" igual.
 *
 * Al elegir país se propone su idioma, pero si el usuario ya tocó el selector
 * de idioma se respeta su elección.
 */
export function RegionGate({
  suggestedCountry,
  currentLang,
  chosen,
  dict,
}: {
  suggestedCountry: string | null;
  currentLang: Lang;
  /** Ya hay país guardado: no molestamos salvo que pidan reabrirlo con `?region`. */
  chosen: boolean;
  dict: Dict["localeGate"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(suggestedCountry ?? "");
  const [lang, setLang] = useState<Lang>(currentLang);
  const [pending, startTransition] = useTransition();
  const confirmed = useRef(false);
  const langTouched = useRef(false);

  // Nombres vía Intl en el idioma del modal, agrupados por continente.
  const groups = useMemo(
    () => CONTINENTS.map((c) => ({ continent: c, items: countriesByContinent(c, lang) })),
    [lang],
  );

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has("region");
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (forced || (!chosen && !stored)) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickCountry = (next: string) => {
    setCountry(next);
    // Sugerimos idioma por país solo mientras el usuario no lo haya tocado.
    if (!langTouched.current && next) setLang(langForCountry(next));
  };

  const pickLang = (next: Lang) => {
    langTouched.current = true;
    setLang(next);
  };

  const confirm = () => {
    if (!country) return;
    confirmed.current = true;

    writeCookie(COUNTRY_COOKIE, country);
    writeCookie(LANG_COOKIE, lang);
    try {
      localStorage.setItem(STORAGE_KEY, country);
    } catch {
      // Safari en privado puede lanzar; las cookies ya guardan la elección.
    }

    setOpen(false);

    const url = new URL(window.location.href);
    if (url.searchParams.has("region")) {
      url.searchParams.delete("region");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }

    startTransition(() => router.refresh());
  };

  // Desmontamos en vez de solo cerrar: la animación de salida de base-ui espera
  // un `animationend` que aquí no llega y el popup se quedaba visible.
  if (!open) return null;

  const tier = tierForCountry(country);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !confirmed.current) return;
        setOpen(next);
      }}
    >
      <DialogContent data-region-gate showCloseButton={false} className="sm:max-w-[440px]">
        <div className="flex flex-col gap-5 px-1 pt-2">
          <div className="space-y-2 text-center">
            <DialogTitle className="text-xl font-extrabold tracking-tight text-text-main">
              {dict.title}
            </DialogTitle>
            <DialogDescription className="text-balance text-sm leading-relaxed text-text-secondary">
              {dict.body}
            </DialogDescription>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-text-secondary">
              {dict.countryLabel}
            </span>
            <div className="relative">
              {/* La bandera va dentro de cada <option>, no como adorno aparte */}
              <select
                value={country}
                onChange={(e) => pickCountry(e.target.value)}
                className="h-11 w-full cursor-pointer appearance-none rounded-lg border-2 border-border bg-white pl-3 pr-9 text-sm font-semibold text-text-main outline-none transition-colors focus:border-brand"
              >
                <option value="" disabled>
                  {dict.countryPlaceholder}
                </option>
                {groups.map((group) => (
                  <optgroup key={group.continent} label={dict.continents[group.continent]}>
                    {group.items.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted"
              >
                ▼
              </span>
            </div>
            {country && (
              <span className="block text-xs text-text-secondary">
                {tier === "us" ? dict.priceUs : dict.priceWorld}
              </span>
            )}
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-text-secondary">
              {dict.langLabel}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {LANGS.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => pickLang(l.code)}
                    aria-pressed={active}
                    className={cn(
                      "h-11 cursor-pointer rounded-lg border-2 text-sm font-bold transition-colors",
                      active
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-border text-text-secondary hover:border-brand/40"
                    )}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            size="lg"
            onClick={confirm}
            disabled={pending || !country}
            className="w-full bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {dict.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
