"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTACT } from "@/lib/site";

/** Mapa de Google (embed, sin API key) centrado en Doral FL. Lazy con skeleton. */
export function LocationMap() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-xl border">
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      <iframe
        title={`Mapa ${CONTACT.company} — Doral, Florida`}
        src={CONTACT.mapEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        className="h-full min-h-[360px] w-full border-0"
      />
    </div>
  );
}
