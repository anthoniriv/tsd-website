import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

/**
 * Genera el token para subir imágenes cliente→Blob (evita el límite de ~4.5 MB
 * del body serverless). La subida real la hace el navegador contra Vercel Blob;
 * aquí solo autorizamos: exigimos rol `editor` (misma guarda que las escrituras
 * del panel) y restringimos a tipos de imagen.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        await requireRole("editor");
        return {
          allowedContentTypes: [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/svg+xml",
            "image/avif",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 8 * 1024 * 1024,
        };
      },
      // Sin persistencia extra: la URL del blob se guarda al enviar el form.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al subir la imagen." },
      { status: 400 },
    );
  }
}
