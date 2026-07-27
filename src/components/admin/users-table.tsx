"use client";

import { bulkDeleteUsersAction, deleteUserAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import type { AdminUser } from "@/db/schema";
import { ADMIN_ROLE_LABEL } from "@/lib/admin-labels";

type Props = { rows: AdminUser[]; meId: string; isOwner: boolean };

export function UsersTable({ rows, meId, isOwner }: Props) {
  const columns: Column<AdminUser>[] = [
    {
      header: "Usuario",
      cell: (u) => (
        <>
          <p className="font-semibold text-text-main">
            {u.name}
            {u.id === meId && (
              <span className="ml-2 text-xs font-normal text-text-muted">(tú)</span>
            )}
          </p>
          <p className="text-xs text-text-muted">{u.email}</p>
        </>
      ),
    },
    {
      header: "Rol",
      // Owner puede editar el rol de otros al vuelo; el propio rol y las vistas de no-owner
      // quedan como badge de solo lectura (evita auto-degradarse / escalada de privilegios).
      cell: (u) =>
        isOwner && u.id !== meId ? (
          <UserRoleSelect id={u.id} role={u.role} />
        ) : (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold uppercase text-brand-dark">
            {ADMIN_ROLE_LABEL[u.role]}
          </span>
        ),
    },
  ];

  if (isOwner) {
    columns.push({
      header: "",
      align: "right",
      cell: (u) =>
        u.id === meId ? null : (
          <form action={deleteUserAction}>
            <input type="hidden" name="id" value={u.id} />
            <DeleteButton confirmText={`¿Quitar el acceso de ${u.name}?`} />
          </form>
        ),
    });
  }

  return (
    <DataTable
      rows={rows}
      columns={columns}
      actions={
        isOwner
          ? [
              {
                label: "Quitar acceso",
                variant: "danger",
                run: bulkDeleteUsersAction,
                confirm: (n) => `¿Quitar el acceso de ${n} usuario${n > 1 ? "s" : ""}?`,
              },
            ]
          : []
      }
    />
  );
}
