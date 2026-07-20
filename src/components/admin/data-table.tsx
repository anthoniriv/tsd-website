"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

/** Botón simple: corre sobre los ids seleccionados. */
type ButtonAction = {
  kind?: "button";
  label: string;
  run: (ids: string[]) => Promise<{ error?: string }>;
  confirm?: (n: number) => string;
  variant?: "default" | "danger";
};

/** Menú: el admin elige un valor y se aplica a los ids seleccionados. */
type SelectAction = {
  kind: "select";
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  run: (ids: string[], value: string) => Promise<{ error?: string }>;
};

export type BulkAction = ButtonAction | SelectAction;

type Props<T extends { id: string }> = {
  rows: T[];
  columns: Column<T>[];
  actions: BulkAction[];
  minWidth?: number;
  empty?: ReactNode;
};

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  actions,
  minWidth = 720,
  empty,
}: Props<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const selectable = actions.length > 0;
  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allChecked = selected.size > 0 && selected.size === rows.length;
  const someChecked = selected.size > 0 && !allChecked;

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(allIds));
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function runAction(fn: (ids: string[]) => Promise<{ error?: string }>, confirmMsg?: string) {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    startTransition(async () => {
      const res = await fn(ids);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Hecho.");
        setSelected(new Set());
      }
    });
  }

  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead className="border-b border-border bg-bg-soft text-left text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todo"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked;
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 accent-[var(--color-brand)]"
                  />
                </th>
              )}
              {columns.map((c, i) => (
                <th key={i} className={cn("px-4 py-3 font-bold", c.align && ALIGN[c.align])}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const checked = selected.has(row.id);
              return (
                <tr key={row.id} className={cn("hover:bg-bg-soft/60", checked && "bg-brand/5")}>
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar fila"
                        checked={checked}
                        onChange={() => toggleOne(row.id)}
                        className="h-4 w-4 accent-[var(--color-brand)]"
                      />
                    </td>
                  )}
                  {columns.map((c, i) => (
                    <td
                      key={i}
                      className={cn("px-4 py-3", c.align && ALIGN[c.align], c.className)}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-6">
          <div className="flex flex-wrap items-center gap-3 rounded-full border border-border bg-white px-5 py-2.5 shadow-lg">
            <span className="text-sm font-bold text-text-main">
              {selected.size} seleccionado{selected.size > 1 ? "s" : ""}
            </span>
            <span className="h-5 w-px bg-border" />

            {actions.map((action, i) =>
              action.kind === "select" ? (
                <select
                  key={i}
                  defaultValue=""
                  disabled={pending}
                  onChange={(e) => {
                    const value = e.target.value;
                    e.target.value = "";
                    if (value) runAction((ids) => action.run(ids, value));
                  }}
                  className="h-8 rounded-md border border-border bg-white px-2 text-xs font-semibold disabled:opacity-50"
                >
                  <option value="" disabled>
                    {action.placeholder}
                  </option>
                  {action.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Button
                  key={i}
                  size="sm"
                  disabled={pending}
                  variant={action.variant === "danger" ? "outline" : "default"}
                  className={cn(
                    action.variant === "danger" &&
                      "border-jt-mhe/30 text-jt-mhe hover:bg-jt-mhe/10",
                  )}
                  onClick={() => runAction(action.run, action.confirm?.(selected.size))}
                >
                  {action.label}
                </Button>
              ),
            )}

            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs font-semibold text-text-muted hover:text-text-main"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
