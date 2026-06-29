import { cn } from "@/lib/utils";

const HEIGHTS = { sm: "h-9", md: "h-14", lg: "h-16" } as const;

/** Logo Jaltest oficial (SVG vectorial recuperado del Figma). */
export function JaltestLogo({
  src,
  alt,
  size = "md",
  className,
}: {
  src: string;
  alt: string;
  size?: keyof typeof HEIGHTS;
  className?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={cn("w-auto", HEIGHTS[size], className)} />;
}
