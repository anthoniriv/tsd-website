import { Check } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Banner de progreso del flujo de compra: Carrito → Datos → Pago. */
export function CheckoutSteps({
  current,
  dict,
}: {
  current: 1 | 2 | 3;
  dict: Dict["checkout"]["steps"];
}) {
  const steps = [dict.cart, dict.details, dict.payment];

  return (
    <ol className="mx-auto mb-10 flex w-full max-w-xl items-center">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;

        return (
          <li key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black transition-colors",
                  done && "bg-brand text-white",
                  active && "bg-brand text-white ring-4 ring-brand/20",
                  !done && !active && "bg-border-light text-text-muted",
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
              </span>
              <span
                className={cn(
                  "text-sm font-bold",
                  active ? "text-text-main" : "text-text-muted",
                  // En móvil solo se etiqueta el paso actual, o no cabe.
                  !active && "hidden sm:inline",
                )}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-3 h-0.5 flex-1 rounded-full transition-colors",
                  done ? "bg-brand" : "bg-border-light",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
