import { cn } from "@/lib/utils";

type HexagonProps = {
  children?: React.ReactNode;
  className?: string;
  /** color del borde/relleno via clases bg-* */
  as?: "div" | "button";
  onClick?: () => void;
};

/**
 * Hexágono reutilizable (clip-path). Mantiene ratio fijo del honeycomb.
 * El layout honeycomb se arma desde fuera con grid/offsets; aquí solo la forma.
 */
export function Hexagon({ children, className, as = "div", onClick }: HexagonProps) {
  const Comp = as;
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "hex-clip relative aspect-[1/1.1] w-full select-none",
        as === "button" && "cursor-pointer outline-none",
        className
      )}
    >
      {children}
    </Comp>
  );
}
