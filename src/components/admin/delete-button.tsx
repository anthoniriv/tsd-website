"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

/**
 * Botón de borrado dentro de un <form action={serverAction}>.
 * Usa `confirm()` nativo a propósito: es una acción destructiva y poco frecuente,
 * no justifica montar un dialog.
 */
export function DeleteButton({ confirmText }: { confirmText: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Eliminar"
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className="rounded-md p-2 text-text-muted transition-colors hover:bg-jt-mhe/10 hover:text-jt-mhe disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
