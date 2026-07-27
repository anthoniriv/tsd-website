"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateShippingSettingsAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

export function ShippingSettingsForm({
  shippingAmount,
  etaEs,
  etaEn,
}: {
  shippingAmount: string;
  etaEs: string;
  etaEn: string;
}) {
  const [state, action, pending] = useActionState(updateShippingSettingsAction, initial);

  useEffect(() => {
    if (state.ok) toast.success("Ajustes de envío guardados.");
  }, [state]);

  return (
    <form action={action} className="max-w-lg space-y-5 rounded-2xl border border-border bg-white p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">Envío</h2>

      <div className="space-y-1.5">
        <Label htmlFor="shippingAmount">Costo de envío (USD)</Label>
        <Input
          id="shippingAmount"
          name="shippingAmount"
          type="number"
          min="0"
          step="0.01"
          defaultValue={shippingAmount}
          required
        />
        <p className="text-xs text-text-muted">
          Se suma al total y se cobra vía Stripe. Usa 0 para envío gratis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="etaEs">Tiempo estimado (ES)</Label>
          <Input id="etaEs" name="etaEs" defaultValue={etaEs} placeholder="3–5 días hábiles" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="etaEn">Tiempo estimado (EN)</Label>
          <Input id="etaEn" name="etaEn" defaultValue={etaEn} placeholder="3–5 business days" />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-jt-mhe">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="bg-brand hover:bg-brand-dark">
        {pending ? "Guardando…" : "Guardar ajustes"}
      </Button>
    </form>
  );
}
