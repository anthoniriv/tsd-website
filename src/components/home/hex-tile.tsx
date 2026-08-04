import Link from "next/link";
import { cn } from "@/lib/utils";
import { ACCENT, type AccentKey } from "@/lib/products";
import { Hexagon } from "@/components/ui/hexagon";
import { SmartImage } from "@/components/ui/smart-image";

/** `bundle` no es una línea: cubre todas, y su borde lleva un lado de cada color. */
export type HexAccent = AccentKey | "bundle";

type HexTileProps = {
  label: string;
  img?: string;
  href?: string;
  accent?: HexAccent;
  /** La imagen ya trae su propio texto: el label queda solo como alt/aria. */
  hideLabel?: boolean;
  className?: string;
};

/**
 * Borde del hexágono. En reposo siempre es `brand`; en hover pasa al color de la
 * categoría. Para `bundle` el anillo es un cónico de 6 tramos — uno por lado —
 * con los cinco colores de línea más el propio `brand`.
 */
const BUNDLE_RING = `conic-gradient(from 30deg, var(--color-jt-cv) 0deg 60deg, var(--color-jt-ohw) 60deg 120deg, var(--color-jt-agv) 120deg 180deg, var(--color-jt-marine) 180deg 240deg, var(--color-jt-mhe) 240deg 300deg, var(--color-brand) 300deg 360deg)`;

function ringStyle(accent?: HexAccent) {
  if (!accent) return undefined;
  if (accent === "bundle") {
    // El gradiente se pinta siempre; la opacidad lo revela en hover (ver `group-hover`).
    return { backgroundImage: BUNDLE_RING };
  }
  return { backgroundColor: ACCENT[accent].color };
}

/** Hexágono con imagen de fondo + overlay + label. Hover: zoom suave + borde de acento. */
export function HexTile({ label, img, href, accent, hideLabel, className }: HexTileProps) {
  // Hex vacío: relleno sólido uniforme #78D7F5, sin anillo ni overlay.
  if (!img) {
    return <Hexagon as="div" className={cn("bg-[#78D7F5] shadow-md", className)} />;
  }

  // Con href → hex clicable (Link). Sin href → mantiene el botón original.
  const hex = (
    <Hexagon
      as={href ? "div" : "button"}
      className={cn(
        "group bg-brand p-[3px] shadow-md transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        className
      )}
    >
      {/* capa de acento sobre el anillo brand: aparece en hover */}
      {accent && (
        <span
          aria-hidden
          className="hex-clip absolute inset-0 block opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={ringStyle(accent)}
        />
      )}
      <span className="hex-clip absolute inset-[10px] block overflow-hidden">
        <SmartImage
          src={img}
          alt={label}
          wrapperClassName="absolute inset-0 h-full w-full"
          className="transition-transform duration-500 group-hover:scale-110"
        />
        <span
          className={cn(
            "absolute inset-0 transition-colors",
            hideLabel
              ? "bg-brand-dark/10 group-hover:bg-transparent"
              : "bg-brand-dark/55 group-hover:bg-brand-dark/30"
          )}
        />
        {!hideLabel && (
          <span className="absolute inset-0 grid place-items-center px-3 text-center text-sm font-extrabold uppercase leading-tight tracking-wide text-white drop-shadow-md sm:text-base">
            {label}
          </span>
        )}
      </span>
    </Hexagon>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className="block rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        {hex}
      </Link>
    );
  }

  return hex;
}
