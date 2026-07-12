import { asc } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { deleteUserAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { NewUserForm } from "@/components/admin/new-user-form";

export default async function UsuariosPage() {
  const me = await requireUser();
  const isOwner = me.role === "owner";

  const rows = await db.select().from(adminUsers).orderBy(asc(adminUsers.createdAt));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Usuarios</h1>
        <p className="text-sm text-text-muted">Quién puede entrar al panel y con qué permisos</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-soft text-left text-xs uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-bold">Usuario</th>
                <th className="px-4 py-3 font-bold">Rol</th>
                {isOwner && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text-main">
                      {u.name}
                      {u.id === me.id && (
                        <span className="ml-2 text-xs font-normal text-text-muted">(tú)</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold uppercase text-brand-dark">
                      {u.role}
                    </span>
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right">
                      {u.id !== me.id && (
                        <form action={deleteUserAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <DeleteButton confirmText={`¿Quitar el acceso de ${u.name}?`} />
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isOwner ? (
          <NewUserForm />
        ) : (
          <p className="h-fit rounded-2xl border border-border bg-bg-soft p-5 text-sm text-text-secondary">
            Solo un usuario con rol <strong>owner</strong> puede crear o eliminar accesos.
          </p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-white p-5 text-sm text-text-secondary">
        <p className="mb-2 font-bold text-text-main">Permisos</p>
        <ul className="space-y-1">
          <li>
            <strong>editor</strong> — edita productos, banners, pedidos y solicitudes.
          </li>
          <li>
            <strong>admin</strong> — lo anterior y además puede eliminar productos y banners.
          </li>
          <li>
            <strong>owner</strong> — control total, incluida la gestión de usuarios.
          </li>
        </ul>
      </div>
    </>
  );
}
