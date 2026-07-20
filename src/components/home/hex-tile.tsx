import Link from "next/link";
import { cn } from "@/lib/utils";
import { Hexagon } from "@/components/ui/hexagon";
import { SmartImage } from "@/components/ui/smart-image";

type HexTileProps = {
  label: string;
  img?: string;
  href?: string;
  className?: string;
};

/** Hexágono con imagen de fondo + overlay + label. Hover: zoom suave. */
export function HexTile({ label, img, href, className }: HexTileProps) {
  // Hex vacío: relleno sólido uniforme #78D7F5, sin anillo ni overlay.
  if (!img) {
    return (
      <Hexagon
        as="div"
        className={cn("bg-[#78D7F5] shadow-md", className)}
      />
    );
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
      <span className="hex-clip absolute inset-[10px] block overflow-hidden">
        <SmartImage
          src={img}
          alt={label}
          wrapperClassName="absolute inset-0 h-full w-full"
          className="transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute inset-0 bg-brand-dark/55 transition-colors group-hover:bg-brand-dark/30" />
        <span className="absolute inset-0 grid place-items-center px-3 text-center text-sm font-extrabold uppercase leading-tight tracking-wide text-white drop-shadow-md sm:text-base">
          {label}
        </span>
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
