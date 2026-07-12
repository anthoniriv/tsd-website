import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Cabecera del flujo de compra: banner de marca con el título y el progreso
 * (Carrito → Datos → Pago). Se usa en los 3 pasos para que el comprador siempre sepa
 * dónde está y cuánto le queda.
 */
export function CheckoutSteps({
  current,
  title,
  subtitle,
  dict,
}: {
  current: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  dict: Dict["checkout"]["steps"];
}) {
  const steps = [
    { label: dict.cart, href: "/carrito" },
    { label: dict.details, href: "/checkout" },
    { label: dict.payment, href: null },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-brand-dark print:hidden">
      {/* Degradado de marca + panal sutil: el hexágono es el motivo de TDS */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-dark via-brand to-accent-aqua"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.13]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='64' viewBox='0 0 56 64'%3E%3Cpath d='M28 0 56 16v32L28 64 0 48V16z' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E\")",
          backgroundSize: "56px 64px",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <h1 className="text-center text-3xl font-black uppercase tracking-wide text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-center text-sm font-medium text-white/80">{subtitle}</p>
        )}

        <ol className="mx-auto mt-8 flex w-full max-w-2xl items-center justify-center">
          {steps.map((step, i) => {
            const n = i + 1;
            const done = n < current;
            const active = n === current;
            // Solo se puede volver atrás, nunca saltar hacia adelante.
            const href = done ? step.href : null;

            const content = (
              <span
                className={cn(
                  "flex items-center gap-2.5",
                  href && "transition-opacity hover:opacity-80",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black transition-colors",
                    active && "bg-white text-brand-dark ring-4 ring-white/30",
                    done && "bg-white/90 text-brand-dark",
                    !done && !active && "bg-white/15 text-white/60 ring-1 ring-inset ring-white/30",
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
                </span>
                <span
                  className={cn(
                    "text-sm font-bold uppercase tracking-wide",
                    active ? "text-white" : "text-white/70",
                    !active && "hidden sm:inline",
                  )}
                >
                  {step.label}
                </span>
              </span>
            );

            return (
              <li key={step.label} className="flex items-center">
                {href ? <Link href={href}>{content}</Link> : content}

                {i < steps.length - 1 && (
                  <ChevronRight
                    aria-hidden
                    className={cn(
                      "mx-3 h-5 w-5 sm:mx-5",
                      n < current ? "text-white/80" : "text-white/30",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
