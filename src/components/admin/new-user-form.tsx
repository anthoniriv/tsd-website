"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createUserAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

export function NewUserForm() {
  const [state, action, pending] = useActionState(createUserAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Usuario creado.");
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
        Nuevo acceso
      </h2>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
        <p className="text-xs text-text-muted">Mínimo 8 caracteres.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          name="role"
          defaultValue="editor"
          className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="editor">editor</option>
          <option value="admin">admin</option>
          <option value="owner">owner</option>
        </select>
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-jt-mhe">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full bg-brand hover:bg-brand-dark">
        {pending ? "Creando…" : "Crear usuario"}
      </Button>
    </form>
  );
}
