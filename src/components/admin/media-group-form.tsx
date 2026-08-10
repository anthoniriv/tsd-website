"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { saveSiteMediaAction, type ActionState } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MediaGroup } from "@/lib/site-media";

const initial: ActionState = {};

export type SlotValue = { img: string; labelEs: string; labelEn: string };

/**
 * Un formulario por lámina. Cada slot manda `img:<clave>` (+ etiquetas), y la
 * Server Action solo acepta claves que el diseño declara.
 *
 * Cada grupo se guarda por separado a propósito: son láminas independientes y
 * así un error de validación no arrastra el trabajo hecho en las otras.
 */
export function MediaGroupForm({
  group,
  values,
}: {
  group: MediaGroup;
  values: Record<string, SlotValue>;
}) {
  const [state, action, pending] = useActionState(saveSiteMediaAction, initial);
  const [slots, setSlots] = useState<Record<string, SlotValue>>(() =>
    Object.fromEntries(
      group.slots.map((s) => [s.key, values[s.key] ?? { img: "", labelEs: "", labelEn: "" }]),
    ),
  );

  // Lo guardado por última vez. Comparado con `slots` da el estado "sin guardar":
  // subir una imagen solo la coloca en el formulario, persiste el botón.
  const [saved, setSaved] = useState(() => JSON.stringify(slots));
  const dirty = JSON.stringify(slots) !== saved;

  useEffect(() => {
    if (state.ok) {
      toast.success("Imágenes guardadas.");
      setSaved(JSON.stringify(slots));
    }
    if (state.error) toast.error(state.error);
    // `slots` a propósito fuera de las dependencias: solo interesa su valor en el
    // momento en que el guardado responde, no en cada tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Red de seguridad: recargar o cerrar con cambios pendientes avisa.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (key: string, patch: Partial<SlotValue>) =>
    setSlots((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  return (
    <form action={action} className="rounded-2xl border border-border bg-white p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-text-main">{group.title}</h2>
        {dirty && (
          <span className="rounded-full bg-jt-ohw/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#a06f00]">
            Cambios sin guardar
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {group.slots.map((slot) => {
          const value = slots[slot.key];
          return (
            <div key={slot.key} className="space-y-2">
              <p className="text-sm font-bold text-text-main">{slot.title}</p>
              <ImageUploadField
                name={`img:${slot.key}`}
                value={value.img}
                onChange={(img) => update(slot.key, { img })}
                hint={slot.size}
              />
              <p className="text-[11px] leading-snug text-text-muted">{slot.hint}</p>

              {slot.labeled && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[11px]">Etiqueta sobre la foto</Label>
                  <Input
                    name={`labelEs:${slot.key}`}
                    value={value.labelEs}
                    onChange={(e) => update(slot.key, { labelEs: e.target.value })}
                    placeholder="ES · Cosechadoras"
                    className="text-xs"
                  />
                  <Input
                    name={`labelEn:${slot.key}`}
                    value={value.labelEn}
                    onChange={(e) => update(slot.key, { labelEn: e.target.value })}
                    placeholder="EN · Combines"
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-jt-mhe">
          {state.error}
        </p>
      )}

      {/* Pegado al fondo mientras haya cambios: con 6 láminas en la página, el botón
          de la que estás editando puede quedar fuera de pantalla. */}
      <div
        className={cn(
          "mt-6 flex items-center gap-3",
          dirty && "sticky bottom-4 z-10 rounded-xl border border-brand/30 bg-white/95 p-3 shadow-lg",
        )}
      >
        <Button type="submit" disabled={pending} className="bg-brand hover:bg-brand-dark">
          {pending ? "Guardando…" : "Guardar lámina"}
        </Button>
        {dirty && (
          <p className="text-xs font-semibold text-text-secondary">
            Subir una imagen no la publica: guarda para que quede.
          </p>
        )}
      </div>
    </form>
  );
}
