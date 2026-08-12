"use client";

import { useEffect, useState } from "react";

/**
 * Fechas del panel en la zona horaria del dispositivo que mira.
 *
 * El servidor (Vercel) corre en UTC, así que un `toLocaleDateString` en RSC
 * pinta UTC para todo el mundo. Aquí el primer render (SSR) sigue siendo UTC
 * —para no dejar hueco ni saltar el layout— y al montar se reformatea con la
 * zona del navegador. `suppressHydrationWarning` calla el desajuste esperado.
 */

const FORMATS = {
  short: { day: "2-digit", month: "2-digit", year: "numeric" },
  long: { day: "numeric", month: "long", year: "numeric" },
  datetime: {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type LocalDateFormat = keyof typeof FORMATS;

function format(value: Date, variant: LocalDateFormat, timeZone?: string) {
  return new Intl.DateTimeFormat("es-ES", { ...FORMATS[variant], timeZone }).format(value);
}

export function LocalDate({
  value,
  format: variant = "short",
  className,
}: {
  value: Date | string;
  format?: LocalDateFormat;
  className?: string;
}) {
  const date = typeof value === "string" ? new Date(value) : value;
  const time = date.getTime();
  const [text, setText] = useState(() => format(date, variant, "UTC"));

  useEffect(() => {
    setText(format(new Date(time), variant));
  }, [time, variant]);

  return (
    <time dateTime={date.toISOString()} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}
