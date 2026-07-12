"use client";

// Carrito en localStorage. Guarda SOLO {id, qty} — nunca precios: el importe a cobrar
// se recalcula en el servidor al hacer checkout, a partir de product_prices y del tier
// del visitante. Lo que aquí se muestra es informativo.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tds_cart";
const COUPON_KEY = "tds_coupon";

export type CartLine = { id: string; qty: number };

type CartCtx = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  /** Solo el CÓDIGO. El descuento se recalcula en servidor en cada pantalla y al cobrar. */
  couponCode: string | null;
  setCouponCode: (code: string | null) => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [couponCode, setCouponState] = useState<string | null>(null);
  // `ready` evita pintar el contador antes de hidratar (si no, parpadea de 0 a N).
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
      setCouponState(localStorage.getItem(COUPON_KEY));
    } catch {
      // localStorage corrupto o bloqueado: arrancamos con carrito vacío.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const setCouponCode = useCallback((code: string | null) => {
    setCouponState(code);
    if (code) localStorage.setItem(COUPON_KEY, code);
    else localStorage.removeItem(COUPON_KEY);
  }, []);

  const add = useCallback((id: string, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) {
        return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { id, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCouponCode(null);
  }, [setCouponCode]);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      ready,
      couponCode,
      setCouponCode,
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, ready, couponCode, setCouponCode, add, setQty, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
