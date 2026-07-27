"use client";

import { useTransition } from "react";
import { RotateCw } from "lucide-react";
import { toast } from "sonner";
import { resendOrderEmailAction } from "@/app/admin/actions";
import type { OrderEmail } from "@/db/schema";
import { ORDER_EMAIL_KIND_LABEL } from "@/lib/admin-labels";
import { Button } from "@/components/ui/button";

/** Reenvía un correo del pedido. Registra un nuevo intento en el log. */
export function ResendEmailButton({
  orderId,
  kind,
}: {
  orderId: string;
  kind: OrderEmail["kind"];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      title={`Reenviar: ${ORDER_EMAIL_KIND_LABEL[kind]}`}
      onClick={() => {
        startTransition(async () => {
          const res = await resendOrderEmailAction(orderId, kind);
          if (res?.error) toast.error(res.error);
          else toast.success(`Reenviado: ${ORDER_EMAIL_KIND_LABEL[kind]}`);
        });
      }}
    >
      <RotateCw className={pending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
      {pending ? "Enviando…" : ORDER_EMAIL_KIND_LABEL[kind]}
    </Button>
  );
}
