"use client";

import { useState } from "react";
import { CONTACT } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Errors = Partial<Record<"nombre" | "email" | "asunto" | "mensaje", string>>;

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  function validate(data: FormData): Errors {
    const e: Errors = {};
    const nombre = String(data.get("nombre") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const asunto = String(data.get("asunto") ?? "").trim();
    const mensaje = String(data.get("mensaje") ?? "").trim();
    if (!nombre) e.nombre = "Ingresa tu nombre y apellido.";
    if (!email) e.email = "Ingresa tu email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email no válido.";
    if (!asunto) e.asunto = "Ingresa un asunto.";
    if (!mensaje) e.mensaje = "Escribe tu mensaje.";
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
    // TODO ecommerce: enviar a Server Action / API de email. Hoy: stub.
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    form.reset();
    toast.success("¡Gracias! Te contactaremos pronto.");
  }

  const field = (key: keyof Errors) =>
    errors[key] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground/80">
        Queremos conocer más de ti
      </h2>

      <div className="space-y-1.5">
        <Label htmlFor="nombre">
          Nombre y Apellido <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nombre"
          name="nombre"
          required
          placeholder="Juan Pérez"
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
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu@correo.com"
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
          Asunto <span className="text-destructive">*</span>
        </Label>
        <Input
          id="asunto"
          name="asunto"
          required
          placeholder="Consulta sobre kit CV"
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
          Mensaje <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="mensaje"
          name="mensaje"
          rows={6}
          required
          placeholder="Cuéntanos qué equipo o cobertura necesitas…"
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
        {sending ? "Enviando…" : "Enviar consulta"}
      </Button>

      <p className="text-xs text-muted-foreground">
        O escríbenos directamente a {CONTACT.company}, {CONTACT.city}.
      </p>
    </form>
  );
}
