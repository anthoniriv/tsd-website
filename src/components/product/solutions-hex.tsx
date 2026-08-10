"use client";

import { useEffect, useState } from "react";
import { SmartImage } from "@/components/ui/smart-image";

/** Hexágono apuntando a izquierda y derecha, el de la lámina. */
const HEX = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

/**
 * Las 3 fotos de la lámina de cables se alternan dentro del hexágono con un
 * fundido. Todas se montan a la vez y solo cambia la opacidad: así no hay
 * parpadeo de carga al pasar de una a otra.
 *
 * Con una sola imagen no arranca ningún temporizador.
 */
export function SolutionsHex({ images, alt }: { images: string[]; alt: string }) {
  const shots = images.filter(Boolean);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (shots.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % shots.length), 5000);
    return () => clearInterval(id);
  }, [shots.length]);

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      {/* Marco: hexágono azul y, dentro, el mismo hexágono en blanco con la foto. */}
      <div className="relative aspect-[1.1547/1] w-full bg-brand-dark" style={{ clipPath: HEX }}>
        <div className="absolute inset-[6px] bg-[#f2f4f7]" style={{ clipPath: HEX }}>
          {shots.map((src, i) => (
            <SmartImage
              key={src}
              src={src}
              alt={i === active ? alt : ""}
              fit="contain"
              wrapperClassName={`absolute inset-0 h-full w-full bg-transparent transition-opacity duration-700 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
              className="p-[12%]"
            />
          ))}
        </div>
      </div>

      {shots.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-brand" : "w-1.5 bg-border hover:bg-brand/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
