"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type SmartImageProps = {
  src?: string;
  alt: string;
  className?: string;
  /** clases del contenedor (controla tamaño/aspect) */
  wrapperClassName?: string;
  /** object-fit, default cover */
  fit?: "cover" | "contain";
  loading?: "lazy" | "eager";
};

/**
 * Imagen con skeleton loader + lazy loading nativo.
 * Usa <img> simple a propósito: el `src` es placeholder y se actualiza luego.
 * Si el src falta o falla, mantiene el skeleton/fondo para no romper el layout.
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  fit = "cover",
  loading = "lazy",
}: SmartImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>();
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const loaded = loadedSrc === src;
  const showImg = src && failedSrc !== src;
  const handleImgRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) {
        setLoadedSrc(src);
      }
    },
    [src]
  );

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {(!loaded || !showImg) && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      )}
      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={handleImgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={cn(
            "h-full w-full transition-opacity duration-500",
            fit === "cover" ? "object-cover" : "object-contain",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
}
