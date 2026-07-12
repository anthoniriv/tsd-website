import { desc } from "drizzle-orm";
import { Mail, MailOpen } from "lucide-react";
import { db } from "@/db";
import { contactRequests } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { toggleContactReadAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export default async function ContactoPage() {
  await requireUser();

  const rows = await db
    .select()
    .from(contactRequests)
    .orderBy(desc(contactRequests.createdAt))
    .limit(100);

  const unread = rows.filter((r) => !r.read).length;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Solicitudes de contacto</h1>
        <p className="text-sm text-text-muted">
          {rows.length} en total · {unread} sin leer
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center text-sm text-text-secondary">
          Todavía no hay consultas.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className={cn(
                "rounded-2xl border bg-white p-5",
                r.read ? "border-border" : "border-brand/40 bg-brand/[0.03]",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-text-main">
                    {r.subject}
                    {!r.read && (
                      <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-black uppercase text-white">
                        nuevo
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {r.name} ·{" "}
                    <a href={`mailto:${r.email}`} className="text-brand hover:underline">
                      {r.email}
                    </a>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">
                    {r.createdAt.toLocaleDateString("es-ES")}
                  </span>
                  <form action={toggleContactReadAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="read" value={r.read ? "0" : "1"} />
                    <button
                      type="submit"
                      title={r.read ? "Marcar como no leída" : "Marcar como leída"}
                      className="grid h-8 w-8 place-items-center rounded-md text-text-muted hover:bg-bg-soft hover:text-brand"
                    >
                      {r.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </button>
                  </form>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {r.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
