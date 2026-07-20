import { asc } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { UsersTable } from "@/components/admin/users-table";
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
        <UsersTable rows={rows} meId={me.id} isOwner={isOwner} />

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
