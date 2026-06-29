"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/smart-image";

type Slide = { img: string; alt: string };

const SLIDES: Slide[] = [
  { img: "/images/hero.png", alt: "Soluciones de diagnóstico Jaltest para flotas" },
  { img: "/images/hero2.png", alt: "Cobertura Jaltest: comercial, off-highway, agrícola, marino y MHE" },
];

const AUTOPLAY_MS = 6000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  // autoplay
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (paused) return;
    timer.current = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, count]);

  return (
    <section
      className="relative overflow-hidden bg-neutral-100"
      aria-roledescription="carrusel"
      aria-label="Destacados TDS"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h1 className="sr-only">
        TDS — Diagnóstico Jaltest para tu flota, con soporte local en Doral
      </h1>

      {/* slides apilados con crossfade */}
      <div className="relative aspect-[3/4] w-full sm:aspect-[16/9] md:aspect-[1600/600] md:min-h-[460px]">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${count}`}
            aria-hidden={i !== index}
          >
            <SmartImage
              src={slide.img}
              alt={slide.alt}
              fit="cover"
              loading={i === 0 ? "eager" : "lazy"}
              wrapperClassName="h-full w-full"
            />
          </div>
        ))}
      </div>

      {/* dots animados (centrados) */}
      <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2.5">
        {SLIDES.map((_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={active}
              className={cn(
                "h-2 overflow-hidden rounded-full transition-all duration-300",
                active ? "w-10 bg-white/40" : "w-2 bg-white/60 hover:bg-white"
              )}
            >
              {active && (
                <span
                  key={index}
                  className="block h-full rounded-full bg-white"
                  style={{
                    animation: paused
                      ? "none"
                      : `tds-hero-progress ${AUTOPLAY_MS}ms linear forwards`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes tds-hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
