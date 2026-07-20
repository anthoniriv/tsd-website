"use client";

import { bulkDeleteUsersAction, deleteUserAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, type Column } from "@/components/admin/data-table";
import type { AdminUser } from "@/db/schema";

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
      cell: (u) => (
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold uppercase text-brand-dark">
          {u.role}
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
