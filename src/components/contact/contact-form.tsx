"use client";

import { useState } from "react";
import { submitContact } from "@/app/(site)/contacto/actions";
import { CONTACT } from "@/lib/site";
import type { Dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Errors = Partial<Record<"nombre" | "email" | "asunto" | "mensaje", string>>;

export function ContactForm({ dict }: { dict: Dict["contact"] }) {
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  function validate(data: FormData): Errors {
    const e: Errors = {};
    const nombre = String(data.get("nombre") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const asunto = String(data.get("asunto") ?? "").trim();
    const mensaje = String(data.get("mensaje") ?? "").trim();
    if (!nombre) e.nombre = dict.errors.name;
    if (!email) e.email = dict.errors.email;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = dict.errors.emailInvalid;
    if (!asunto) e.asunto = dict.errors.subject;
    if (!mensaje) e.mensaje = dict.errors.message;
    return e;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    const res = await submitContact(data);
    setSending(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }
    form.reset();
    toast.success(dict.toastSuccess);
  }

  const field = (key: keyof Errors) =>
    errors[key] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground/80">
        {dict.formHeading}
      </h2>

      <div className="space-y-1.5">
        <Label htmlFor="nombre">
          {dict.name} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nombre"
          name="nombre"
          required
          placeholder={dict.namePh}
          className={field("nombre")}
          aria-invalid={!!errors.nombre}
        />
        {errors.nombre && (
          <p role="alert" className="text-xs text-destructive">
            {errors.nombre}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          {dict.email} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder={dict.emailPh}
          className={field("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p role="alert" className="text-xs text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asunto">
          {dict.subject} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="asunto"
          name="asunto"
          required
          placeholder={dict.subjectPh}
          className={field("asunto")}
          aria-invalid={!!errors.asunto}
        />
        {errors.asunto && (
          <p role="alert" className="text-xs text-destructive">
            {errors.asunto}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mensaje">
          {dict.message} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="mensaje"
          name="mensaje"
          rows={6}
          required
          placeholder={dict.messagePh}
          className={field("mensaje")}
          aria-invalid={!!errors.mensaje}
        />
        {errors.mensaje && (
          <p role="alert" className="text-xs text-destructive">
            {errors.mensaje}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={sending}
        className="w-full bg-brand text-white hover:bg-brand-dark sm:w-auto"
      >
        {sending ? dict.sending : dict.submit}
      </Button>

      <p className="text-xs text-muted-foreground">
        {dict.footnotePre} {CONTACT.company}, {CONTACT.city}.
      </p>
    </form>
  );
}
