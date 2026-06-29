"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Hexagon } from "@/components/ui/hexagon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Modal "Próximamente" global. Toda función del futuro ecommerce (búsqueda,
 * perfil, carrito, precios) la dispara vía `useComingSoon()` en lugar de
 * ejecutar lógica real. Mantiene la línea gráfica (hex + marca) y las
 * transiciones del Dialog base.
 */

/** Mensaje opcional por feature; `feature` es el nombre humano de la función. */
type ComingSoonPayload = { feature?: string };
type OpenFn = (payload?: ComingSoonPayload) => void;

const ComingSoonContext = createContext<OpenFn | null>(null);

export function useComingSoon(): OpenFn {
  const ctx = useContext(ComingSoonContext);
  if (!ctx) {
    throw new Error("useComingSoon debe usarse dentro de <ComingSoonProvider>");
  }
  return ctx;
}

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>();

  const openModal = useCallback<OpenFn>((payload) => {
    setFeature(payload?.feature);
    setOpen(true);
  }, []);

  // El handler es estable → seguro como value de contexto.
  const value = useMemo(() => openModal, [openModal]);

  return (
    <ComingSoonContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="overflow-hidden text-center sm:max-w-[400px]"
        >
          {/* halo de marca detrás del hex */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
          />

          <div className="relative flex flex-col items-center gap-4 px-2 pt-3 pb-1">
            {/* hex con destello suave */}
            <div className="relative w-24 animate-in zoom-in-50 duration-300">
              <Hexagon className="bg-gradient-to-br from-brand to-accent-aqua shadow-lg shadow-brand/30">
                <span className="absolute inset-0 grid place-items-center text-4xl">
                  🚧
                </span>
              </Hexagon>
              <span className="absolute -right-1 -top-1 text-xl">✨</span>
            </div>

            <DialogTitle className="text-xl font-extrabold tracking-tight text-text-main">
              ¡Ops! Próximamente
            </DialogTitle>

            <DialogDescription className="text-balance text-sm leading-relaxed text-text-secondary">
              {feature ? (
                <>
                  <span className="font-semibold text-brand">{feature}</span>{" "}
                  estará disponible muy pronto. Estamos afinando los últimos
                  detalles de la tienda en línea.
                </>
              ) : (
                <>
                  Esta función estará disponible muy pronto. Estamos afinando los
                  últimos detalles de la tienda en línea.
                </>
              )}
            </DialogDescription>

            <DialogClose
              render={
                <Button
                  size="lg"
                  className="mt-2 w-full bg-brand text-white hover:bg-brand-dark"
                />
              }
            >
              Entendido
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </ComingSoonContext.Provider>
  );
}
