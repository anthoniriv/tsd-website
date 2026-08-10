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

/**
 * Plan B: el binario SÍ pasa por aquí.
 *
 * La subida directa al bucket depende de que la política CORS de R2 liste el
 * origen desde el que se abre el panel; cuando no lo lista (previews de Vercel,
 * un puerto distinto, un dominio nuevo), el navegador aborta el PUT y el panel
 * queda inservible. Este PUT es mismo-origen, así que no hay CORS que valga: el
 * servidor recibe el archivo y lo reenvía firmado a R2.
 *
 * Se usa solo como reintento — el camino normal sigue siendo el directo, que no
 * gasta CPU de función ni ancho de banda de Vercel.
 */
export async function PUT(request: Request): Promise<NextResponse> {
  try {
    await requireRole("editor");

    const filename = new URL(request.url).searchParams.get("filename") ?? "imagen";
    const contentType = request.headers.get("content-type") ?? "";

    if (!ALLOWED.has(contentType)) {
      return NextResponse.json({ error: "Formato no permitido." }, { status: 400 });
    }

    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen supera los 8 MB." }, { status: 400 });
    }

    const key = `media/${slugify(filename)}-${crypto.randomUUID().slice(0, 8)}.${EXT[contentType]}`;

    // Se reusa la URL prefirmada en vez de exponer otra ruta de escritura: el
    // permiso de subida sigue viviendo en un solo sitio (`lib/r2.ts`).
    const res = await fetch(await signedUploadUrl(key, contentType), {
      method: "PUT",
      headers: { "content-type": contentType },
      body,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `El bucket rechazó la subida (${res.status}).` },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: publicUrl(key) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al subir la imagen." },
      { status: 400 },
    );
  }
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
