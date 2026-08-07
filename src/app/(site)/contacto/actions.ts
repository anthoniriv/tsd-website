"use server";

import { z } from "zod";
import { db } from "@/db";
import { contactRequests } from "@/db/schema";
import { sendContactAck, sendContactNotification } from "@/lib/email";
import { getLocaleData } from "@/lib/i18n.server";
import { checkRateLimit, clientIp, RateLimitError } from "@/lib/rate-limit";

const schema = z.object({
  nombre: z.string().trim().min(2, "Datos inválidos.").max(120, "Datos inválidos."),
  email: z.email("Datos inválidos.").max(254, "Datos inválidos."),
  asunto: z.string().trim().min(2, "Datos inválidos.").max(200, "Datos inválidos."),
  mensaje: z.string().trim().min(5, "Datos inválidos.").max(4000, "Datos inválidos."),
  // Honeypot antispam: oculto para humanos; los bots lo rellenan.
  website: z.string().optional(),
});

/** Guarda la consulta en la bandeja del panel y avisa por email a TDS. */
export async function submitContact(formData: FormData): Promise<{ error?: string }> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Datos inválidos." };

  // Bot detectado: éxito silencioso para no enseñarle al bot que falló.
  if (parsed.data.website?.trim()) return {};

  try {
    await checkRateLimit(`contact:${await clientIp()}`, 5, 600);
  } catch (err) {
    if (err instanceof RateLimitError) return { error: err.message };
    throw err;
  }

  const { nombre, email, asunto, mensaje } = parsed.data;
  const { lang } = await getLocaleData();

  await db.insert(contactRequests).values({
    name: nombre,
    email,
    subject: asunto,
    message: mensaje,
    locale: lang,
  });

  // Aviso a TDS + acuse de recibo al visitante (en su idioma). En paralelo: ninguno
  // depende del otro, y un fallo de email no debe perder la consulta ya guardada.
  await Promise.all([
    sendContactNotification({ name: nombre, email, subject: asunto, message: mensaje }),
    sendContactAck({ name: nombre, email, lang }),
  ]);

  return {};
}
