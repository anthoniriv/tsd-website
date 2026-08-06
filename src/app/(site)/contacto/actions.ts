"use server";

import { z } from "zod";
import { db } from "@/db";
import { contactRequests } from "@/db/schema";
import { sendContactAck, sendContactNotification } from "@/lib/email";
import { getLocaleData } from "@/lib/i18n.server";

const schema = z.object({
  nombre: z.string().trim().min(2),
  email: z.email(),
  asunto: z.string().trim().min(2),
  mensaje: z.string().trim().min(5),
});

/** Guarda la consulta en la bandeja del panel y avisa por email a TDS. */
export async function submitContact(formData: FormData): Promise<{ error?: string }> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Datos inválidos." };

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
