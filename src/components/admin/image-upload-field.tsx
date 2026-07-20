"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

type Props = {
  /** name del input oculto que el form envía (p. ej. "img"). */
  name: string;
  value: string;
  onChange: (url: string) => void;
  /** Proporción de la preview: cuadrada (producto) o 16:9 (banner). */
  previewClassName?: string;
  required?: boolean;
};

/**
 * Sube la imagen directa cliente→Vercel Blob con un botón y spinner de progreso.
 * El valor final (URL del blob o ruta manual) viaja en un input oculto; también
 * se puede pegar una ruta a mano como fallback (p. ej. `/images/laptop.png`).
 */
export function ImageUploadField({
  name,
  value,
  onChange,
  previewClassName = "h-40 w-40",
  required,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const uploading = progress !== null;

  async function handleFile(file: File) {
    setProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      onChange(blob.url);
      toast.success("Imagen subida.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {/* El valor real que envía el form. Editable como fallback de ruta manual. */}
      <Input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/… o sube un archivo"
        required={required}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? `Subiendo… ${progress}%` : "Subir imagen"}
        </Button>
        <p className="text-xs text-text-muted">PNG, JPG, WebP o SVG · máx. 8 MB</p>
      </div>

      {value && (
        <SmartImage
          src={value}
          alt="Vista previa"
          fit="contain"
          wrapperClassName={cn("rounded-xl border border-border bg-white", previewClassName)}
        />
      )}
    </div>
  );
}
