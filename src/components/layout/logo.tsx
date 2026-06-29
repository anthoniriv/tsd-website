import Link from "next/link";
import { cn } from "@/lib/utils";

/** Logo TDS provisional (texto + marca). Reemplazar por SVG/imagen oficial luego. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="TDS inicio">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-brand/10 text-brand">
        {/* placeholder de marca hexagonal */}
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 2l8 4.6v9.2L12 22l-8-6.2V6.6L12 2z" />
          <circle cx="12" cy="11" r="2.4" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-2xl font-extrabold tracking-tight text-brand">TDS</span>
        <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Tech Diagnostic Solutions
        </span>
      </span>
    </Link>
  );
}
