"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveCouponAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

export function NewCouponForm() {
  const [state, action, pending] = useActionState(saveCouponAction, initial);
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Cupón creado.");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="h-fit space-y-4 rounded-2xl border border-border bg-white p-6"
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
        Nuevo cupón
      </h2>

      <div className="space-y-1.5">
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          name="code"
          required
          placeholder="BIENVENIDA10"
          className="uppercase"
          onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kind">Tipo</Label>
        <select
          id="kind"
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as "percent" | "fixed")}
          className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="percent">Porcentaje (%)</option>
          <option value="fixed">Monto fijo (USD)</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="value">{kind === "percent" ? "Porcentaje" : "Monto en USD"}</Label>
        <Input
          id="value"
          name="value"
          type="number"
          step={kind === "percent" ? "1" : "0.01"}
          min="1"
          max={kind === "percent" ? "100" : undefined}
          required
          placeholder={kind === "percent" ? "10" : "50"}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="minSubtotal">Compra mínima (USD)</Label>
        <Input id="minSubtotal" name="minSubtotal" type="number" min="0" step="0.01" defaultValue="0" />
        <p className="text-xs text-text-muted">0 = sin mínimo.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maxUses">Límite de usos</Label>
        <Input id="maxUses" name="maxUses" type="number" min="1" placeholder="ilimitado" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expiresAt">Caduca el</Label>
        <Input id="expiresAt" name="expiresAt" type="date" />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-text-main">
        <input
          type="checkbox"
          name="active"
          defaultChecked
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        Activo
      </label>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-jt-mhe">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full bg-brand hover:bg-brand-dark">
        {pending ? "Creando…" : "Crear cupón"}
      </Button>
    </form>
  );
}
