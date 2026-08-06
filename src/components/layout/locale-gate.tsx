"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES, LOCALE_COOKIE, type Dict, type LocaleCode } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Marca local de "ya eligió": sobrevive a que la cookie no esté aún leída. */
const STORAGE_KEY = "tds_region_chosen";

/**
 * Modal de bienvenida: se muestra una sola vez, cuando no hay cookie
 * `tds_locale`. La región no es solo idioma — decide la tarifa (`us` para
 * USA/Canadá, `world` para el resto), así que preferimos preguntarlo antes de
 * que el visitante vea precios de otro mercado.
 *
 * `suggested` viene del país que Vercel resuelve por IP; es solo la opción
 * preseleccionada, la última palabra la tiene el usuario. La elección se guarda
 * en la misma cookie que usa el switcher del header, así que ambos comparten
 * estado y el modal no vuelve a salir.
 */
export function LocaleGate({
  suggested,
  chosen,
  dict,
}: {
  suggested: LocaleCode;
  /** Ya hay cookie `tds_locale`: no molestamos salvo que pidan reabrirlo. */
  chosen: boolean;
  dict: Dict["localeGate"];
}) {
  const router = useRouter();
  const [choice, setChoice] = useState<LocaleCode>(suggested);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  // Solo se cierra al elegir: sin esto, Esc o un clic fuera lo dejarían sin región.
  const confirmed = useRef(false);

  // Abrimos tras montar: el Dialog es cliente y así no hay parpadeo en SSR.
  // `?region` fuerza el modal — sirve para QA y para volver a elegir por enlace.
  // Deps vacías a propósito: la decisión se toma una vez, si no el
  // `router.refresh()` de `confirm()` lo volvería a abrir.
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

  const confirm = () => {
    confirmed.current = true;
    document.cookie = `${LOCALE_COOKIE}=${choice}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    setOpen(false);

    // Quitamos `?region` de la URL: si no, el refresh volvería a forzar el modal.
    const url = new URL(window.location.href);
    if (url.searchParams.has("region")) {
      url.searchParams.delete("region");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }

    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Safari en privado puede lanzar; la cookie ya guarda la elección.
    }

    startTransition(() => router.refresh());
  };

  // Desmontamos en lugar de solo cerrar: la animación de salida de base-ui
  // depende de un `animationend` que aquí no llega, y el popup se quedaba
  // visible tras elegir región.
  if (!open) return null;

  return (
    <Dialog
      open={open}
      // `open` solo es controlado de verdad si base-ui recibe también el
      // callback; el guard es lo que impide cerrar sin elegir región.
      onOpenChange={(next) => {
        if (!next && !confirmed.current) return;
        setOpen(next);
      }}
    >
      <DialogContent data-locale-gate showCloseButton={false} className="sm:max-w-[440px]">
        <div className="flex flex-col gap-5 px-1 pt-2">
          <div className="space-y-2 text-center">
            <DialogTitle className="text-xl font-extrabold tracking-tight text-text-main">
              {dict.title}
            </DialogTitle>
            <DialogDescription className="text-balance text-sm leading-relaxed text-text-secondary">
              {dict.body}
            </DialogDescription>
          </div>

          <ul className="flex flex-col gap-2">
            {LOCALES.map((locale) => {
              const active = locale.code === choice;
              return (
                <li key={locale.code}>
                  <button
                    type="button"
                    onClick={() => setChoice(locale.code)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
                      active
                        ? "border-brand bg-brand/5"
                        : "border-border hover:border-brand/40 hover:bg-brand/[0.03]"
                    )}
                  >
                    <span aria-hidden className="text-2xl leading-none">
                      {locale.flag}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-text-main">
                        {locale.label}
                      </span>
                      <span className="block text-xs text-text-secondary">
                        {locale.tier === "us" ? dict.priceUs : dict.priceWorld}
                      </span>
                      {locale.code === suggested && (
                        <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wide text-brand">
                          {dict.suggested}
                        </span>
                      )}
                    </span>
                    {active && <Check className="h-5 w-5 shrink-0 text-brand" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <Button
            size="lg"
            onClick={confirm}
            disabled={pending}
            className="w-full bg-brand text-white hover:bg-brand-dark"
          >
            {dict.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
