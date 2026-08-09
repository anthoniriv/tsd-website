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

export function ContactForm({
  dict,
  prefill,
}: {
  dict: Dict["contact"];
  /** Valores iniciales al llegar desde un CTA (p.ej. "Agendar una demo"). */
  prefill?: { subject: string; message: string };
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  function validate(data: FormData): Errors {
    const e: Errors = {};
    const nombre = String(data.get("nombre") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const asunto = String(data.get("asunto") ?? "").trim();
    const mensaje = String(data.get("mensaje") ?? "").trim();
    // Los límites replican el schema de contacto/actions.ts: si el cliente deja
    // pasar algo que el servidor rechaza, el visitante solo ve "Datos inválidos."
    // sin saber qué campo falló.
    if (!nombre) e.nombre = dict.errors.name;
    else if (nombre.length < 2) e.nombre = dict.errors.nameShort;
    else if (nombre.length > 120) e.nombre = dict.errors.tooLong;

    if (!email) e.email = dict.errors.email;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = dict.errors.emailInvalid;
    else if (email.length > 254) e.email = dict.errors.tooLong;

    if (!asunto) e.asunto = dict.errors.subject;
    else if (asunto.length < 2) e.asunto = dict.errors.subjectShort;
    else if (asunto.length > 200) e.asunto = dict.errors.tooLong;

    if (!mensaje) e.mensaje = dict.errors.message;
    else if (mensaje.length < 5) e.mensaje = dict.errors.messageShort;
    else if (mensaje.length > 4000) e.mensaje = dict.errors.tooLong;

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

      {/* Honeypot antispam: invisible para humanos, los bots lo rellenan. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

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
          defaultValue={prefill?.subject}
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
          defaultValue={prefill?.message}
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
        {dict.footnotePre}{" "}
        <a href={`mailto:${CONTACT.email}`} className="text-brand hover:underline">
          {CONTACT.email}
        </a>
        .
      </p>
    </form>
  );
}
