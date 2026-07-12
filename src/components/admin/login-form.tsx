"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

export function LoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form
      action={action}
      className="mt-8 space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="next" value={params.get("next") ?? "/admin"} />

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="username" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-jt-mhe">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full bg-brand hover:bg-brand-dark">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
