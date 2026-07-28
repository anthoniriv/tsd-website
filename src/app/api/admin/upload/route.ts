import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { publicUrl, signedUploadUrl } from "@/lib/r2";

/**
 * Autoriza una subida a R2 y devuelve una URL prefirmada. El binario NO pasa por
 * aquí: el navegador hace el PUT directo al bucket (evita el límite de body y el
 * coste de CPU de mover el archivo dos veces).
 *
 * La guarda es la misma que la de cualquier escritura del panel: rol `editor`.
 */

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/avif",
]);

const MAX_BYTES = 8 * 1024 * 1024;

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

type Body = { filename?: string; contentType?: string; size?: number };

/** `Foto Del Producto.PNG` → `foto-del-producto`. Evita claves con espacios o acentos. */
function slugify(filename: string): string {
  return (
    filename
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "imagen"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireRole("editor");

    const { filename, contentType, size } = (await request.json()) as Body;

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Falta el nombre o el tipo del archivo." }, { status: 400 });
    }
    if (!ALLOWED.has(contentType)) {
      return NextResponse.json({ error: "Formato no permitido." }, { status: 400 });
    }
    // El tamaño lo declara el cliente: es una barrera de UX, no de seguridad. El
    // límite duro lo pone la política del bucket.
    if (typeof size === "number" && size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen supera los 8 MB." }, { status: 400 });
    }

    // Sufijo aleatorio: dos archivos con el mismo nombre no se pisan.
    const key = `media/${slugify(filename)}-${crypto.randomUUID().slice(0, 8)}.${EXT[contentType]}`;

    return NextResponse.json({
      uploadUrl: await signedUploadUrl(key, contentType),
      url: publicUrl(key),
      contentType,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al preparar la subida." },
      { status: 400 },
    );
  }
}
