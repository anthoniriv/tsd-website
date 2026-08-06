import Link from "next/link";
import { cn } from "@/lib/utils";

/** Logo oficial TDS. `variant="white"` para fondos oscuros (footer). */
export function Logo({
  className,
  imgClassName,
  variant = "default",
}: {
  className?: string;
  /** Tamaño de la imagen. Por defecto el del footer; el header lo pide un 10% mayor. */
  imgClassName?: string;
  variant?: "default" | "white";
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="TDS inicio">
      {/* eager: el logo está siempre above the fold */}
      <img
        src={variant === "white" ? "/images/logo-tds-white.png" : "/images/logo-tds.png"}
        alt="TDS — Tech Diagnostic Solutions"
        width={900}
        height={350}
        className={cn("h-11 w-auto sm:h-12", imgClassName)}
      />
    </Link>
  );
}
