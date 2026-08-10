"use client";

import { useState } from "react";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

/**
 * Galería de la ficha: una foto grande y hasta 3 miniaturas debajo (formato de
 * ecommerce). Con una sola imagen no se pintan miniaturas — no hay nada que elegir.
 *
 * Es cliente porque la selección es puramente visual: no vale la pena un
 * parámetro de URL ni un round-trip al servidor para cambiar de foto.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const shots = images.filter(Boolean);
  const current = shots[active] ?? shots[0];

  return (
    <div className="space-y-3">
      <SmartImage
        // La key fuerza el fade-in del skeleton al cambiar de foto.
        key={current}
        src={current}
        alt={alt}
        fit="contain"
        wrapperClassName="aspect-square w-full rounded-2xl border border-border bg-brand-light/10"
        className="p-8"
      />

      {shots.length > 1 && (
        <ul className="grid grid-cols-4 gap-3">
          {shots.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${alt} — imagen ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "block w-full overflow-hidden rounded-xl border-2 bg-white transition-colors",
                  i === active ? "border-brand" : "border-border hover:border-brand/40",
                )}
              >
                <SmartImage
                  src={src}
                  alt=""
                  fit="contain"
                  wrapperClassName="aspect-square w-full bg-white"
                  className="p-2"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
