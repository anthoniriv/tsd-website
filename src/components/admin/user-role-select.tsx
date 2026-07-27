"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserRoleAction } from "@/app/admin/actions";
import type { AdminUser } from "@/db/schema";
import { ADMIN_ROLE_LABEL, ADMIN_ROLES } from "@/lib/admin-labels";

/** Cambia el rol de un usuario al vuelo. Sin botón de guardar: un select, una acción. */
export function UserRoleSelect({
  id,
  role,
  disabled,
}: {
  id: string;
  role: AdminUser["role"];
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={pending || disabled}
      onChange={(e) => {
        const next = e.target.value as AdminUser["role"];
        startTransition(async () => {
          const res = await updateUserRoleAction(id, next);
          if (res?.error) toast.error(res.error);
          else toast.success(`Rol actualizado: ${ADMIN_ROLE_LABEL[next]}`);
        });
      }}
      className="h-7 rounded-md border border-border bg-white px-2 text-xs font-semibold disabled:opacity-50"
    >
      {ADMIN_ROLES.map((r) => (
        <option key={r} value={r}>
          {ADMIN_ROLE_LABEL[r]}
        </option>
      ))}
    </select>
  );
}
