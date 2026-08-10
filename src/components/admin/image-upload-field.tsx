"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SmartImage } from "@/components/ui/smart-image";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  /** name del input oculto que el form envía (p. ej. "img"). */
  name: string;
  value: string;
  onChange: (url: string) => void;
  /** Proporción de la preview: cuadrada (producto) o 16:9 (banner). */
  previewClassName?: string;
  /** Tamaño recomendado, se muestra bajo el recuadro. */
  hint?: string;
  required?: boolean;
};

/**
 * Campo de imagen tipo gestor de medios: el usuario ve la foto, no la URL.
 *
 * Sin archivo → recuadro para hacer clic o arrastrar. Con archivo → la miniatura
 * con "Reemplazar" y "Quitar" encima. La ruta real viaja en un input oculto; solo
 * quien la necesite la ve, tras abrir "ruta manual" (fallback para assets que ya
 * están en /public y no se suben).
 *
 * La subida va directa cliente→R2: `/api/admin/upload` firma la URL y el binario
 * nunca pasa por la función serverless.
 */

/** PUT con progreso. `fetch` no expone el avance de subida; XHR sí. */
function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`El bucket rechazó la subida (${xhr.status}).`));
    // El navegador oculta el detalle de un fallo CORS; lo decimos explícito.
    xhr.onerror = () => reject(new CorsError());
    xhr.send(file);
  });
}

/** El PUT directo no llegó a R2 (CORS o red): se puede reintentar por el servidor. */
class CorsError extends Error {
  constructor() {
    super("Fallo de red o CORS al subir a R2.");
  }
}

/** Reintento mismo-origen: el archivo viaja al servidor y éste lo reenvía a R2. */
async function uploadViaServer(file: File, contentType: string): Promise<string> {
  const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "No se pudo subir la imagen.");
  return data.url;
}

export function ImageUploadField({
  name,
  value,
  onChange,
  previewClassName = "aspect-square",
  hint,
  required,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [manual, setManual] = useState(false);
  const [dragging, setDragging] = useState(false);
  const uploading = progress !== null;
  const manualId = useId();

  async function handleFile(file: File) {
    setProgress(0);
    try {
      // El navegador puede no adivinar el tipo (SVG raros); asumimos PNG antes que
      // mandar vacío, que la firma rechazaría.
      const contentType = file.type || "image/png";

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType, size: file.size }),
      });
      const data = (await res.json()) as { uploadUrl?: string; url?: string; error?: string };
      if (!res.ok || !data.uploadUrl || !data.url) {
        throw new Error(data.error ?? "No se pudo autorizar la subida.");
      }

      try {
        await putWithProgress(data.uploadUrl, file, contentType, setProgress);
        onChange(data.url);
      } catch (err) {
        // Solo el fallo de CORS/red justifica el rodeo por el servidor: si R2
        // respondió con un error real (firma, tamaño), reintentar da lo mismo.
        if (!(err instanceof CorsError)) throw err;
        setProgress(100);
        onChange(await uploadViaServer(file, contentType));
      }
      toast.success("Imagen subida.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {/* El valor real que envía el form. Nunca se muestra salvo en modo manual. */}
      <input type="hidden" name={name} value={value} />

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

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border bg-bg-soft/40 transition-colors",
          previewClassName,
          dragging ? "border-brand bg-brand/5" : "border-dashed border-border",
          value && "border-solid bg-white",
        )}
      >
        {value ? (
          <>
            <SmartImage
              src={value}
              alt="Vista previa"
              fit="contain"
              wrapperClassName="absolute inset-0 h-full w-full bg-white"
              className="p-2"
            />
            {/* Acciones sobre la foto: en móvil siempre visibles, en desktop al pasar. */}
            <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-bold text-text-main hover:bg-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reemplazar
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-bold text-jt-mhe hover:bg-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4 text-center text-text-muted hover:text-brand"
          >
            <ImagePlus className="h-7 w-7" />
            <span className="text-xs font-bold">
              {required ? "Subir imagen (obligatoria)" : "Subir imagen"}
            </span>
            <span className="text-[11px]">Haz clic o arrastra el archivo aquí</span>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/85">
            <Loader2 className="h-5 w-5 animate-spin text-brand" />
            <span className="text-xs font-bold text-text-secondary">Subiendo… {progress}%</span>
            <span className="h-1 w-24 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full bg-brand transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-text-muted">{hint ?? "PNG, JPG, WebP o SVG · máx. 8 MB"}</p>
        <button
          type="button"
          onClick={() => setManual((v) => !v)}
          className="text-[11px] font-semibold text-text-muted underline underline-offset-2 hover:text-brand"
          aria-expanded={manual}
          aria-controls={manualId}
        >
          {manual ? "Ocultar ruta" : "Ruta manual"}
        </button>
      </div>

      {manual && (
        <Input
          id={manualId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/… o https://…"
          className="text-xs"
        />
      )}
    </div>
  );
}
