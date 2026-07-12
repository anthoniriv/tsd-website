"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-provider";

/**
 * Al volver de Stripe con pago OK: vacía el carrito y muestra el toast.
 *
 * `clear` solo es true si la BD ya confirma el pedido como pagado (vía webhook). Si el
 * webhook aún no ha llegado, no vaciamos: preferimos un carrito de más a que alguien
 * pierda su selección por un pago que no se registró.
 */
export function OrderPaidEffect({ message, clear }: { message: string; clear: boolean }) {
  const { clear: clearCart } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    toast.success(message);
    if (clear) clearCart();
  }, [message, clear, clearCart]);

  return null;
}
