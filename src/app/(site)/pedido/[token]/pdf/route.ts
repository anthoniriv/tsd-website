// Descarga de la boleta en PDF. El token público es la única credencial: el mismo que
// da acceso a la página del pedido, así que no añade superficie nueva.

import { getOrderByToken } from "@/lib/orders";
import { receiptFileName, renderReceiptPdf } from "@/lib/pdf/receipt";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const order = await getOrderByToken(token);
  if (!order) return new Response("Pedido no encontrado", { status: 404 });

  const pdf = await renderReceiptPdf(order);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${receiptFileName(order)}"`,
      // Documento privado y por token: que no lo cachee ningún intermediario.
      "Cache-Control": "private, no-store",
    },
  });
}
