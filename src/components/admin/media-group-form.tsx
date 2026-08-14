"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { saveSiteMediaAction, type ActionState } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MediaDefault, MediaGroup } from "@/lib/site-media";

const initial: ActionState = {};

export type SlotValue = { img: string; labelEs: string; labelEn: string };

/** Precios (en dólares) de la línea Jaltest que publica esta lámina. */
export type LinePrices = { productId: string; priceUs: string; priceWorld: string };

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
  defaults = {},
  prices,
}: {
  group: MediaGroup;
  values: Record<string, SlotValue>;
  /** Lo que se publica hoy en cada slot si nadie lo ha personalizado. */
  defaults?: Record<string, MediaDefault>;
  /** Solo en láminas de línea: precios por tarifa de su producto Jaltest. */
  prices?: LinePrices;
}) {
  const [state, action, pending] = useActionState(saveSiteMediaAction, initial);
  const [slots, setSlots] = useState<Record<string, SlotValue>>(() =>
    Object.fromEntries(
      group.slots.map((s) => [s.key, values[s.key] ?? { img: "", labelEs: "", labelEn: "" }]),
    ),
  );
  const [priceUs, setPriceUs] = useState(prices?.priceUs ?? "");
  const [priceWorld, setPriceWorld] = useState(prices?.priceWorld ?? "");

  // Lo guardado por última vez. Comparado con el estado actual da "sin guardar":
  // subir una imagen o teclear un precio solo lo coloca en el formulario.
  const snapshot = JSON.stringify({ slots, priceUs, priceWorld });
  const [saved, setSaved] = useState(snapshot);
  const dirty = snapshot !== saved;

  useEffect(() => {
    if (state.ok) {
      toast.success(prices ? "Lámina y precios guardados." : "Imágenes guardadas.");
      setSaved(snapshot);
    }
    if (state.error) toast.error(state.error);
    // `snapshot` a propósito fuera de las dependencias: solo interesa su valor en
    // el momento en que el guardado responde, no en cada tecla.
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
          const fallback = defaults[slot.key];
          return (
            <div key={slot.key} className="space-y-2">
              <p className="text-sm font-bold text-text-main">{slot.title}</p>
              <ImageUploadField
                name={`img:${slot.key}`}
                value={value.img}
                onChange={(img) => update(slot.key, { img })}
                hint={slot.size}
                fallback={fallback?.img}
              />
              <p className="text-[11px] leading-snug text-text-muted">{slot.hint}</p>

              {slot.labeled && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[11px]">Etiqueta sobre la foto</Label>
                  {/* El placeholder es la etiqueta que se publica hoy, no un
                      ejemplo inventado: dejarlo vacío mantiene esa. */}
                  <Input
                    name={`labelEs:${slot.key}`}
                    value={value.labelEs}
                    onChange={(e) => update(slot.key, { labelEs: e.target.value })}
                    placeholder={fallback?.labelEs ? `ES · ${fallback.labelEs}` : "ES · sin etiqueta"}
                    className="text-xs"
                  />
                  <Input
                    name={`labelEn:${slot.key}`}
                    value={value.labelEn}
                    onChange={(e) => update(slot.key, { labelEn: e.target.value })}
                    placeholder={fallback?.labelEn ? `EN · ${fallback.labelEn}` : "EN · sin etiqueta"}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Precios de la línea: la misma tabla que /admin/productos, aquí a mano
          porque el cliente cambia tarifa y fotos en la misma pasada. */}
      {prices && (
        <div className="mt-6 rounded-xl border border-border bg-bg-soft/60 p-4">
          <input type="hidden" name="productId" value={prices.productId} />
          <p className="text-sm font-bold text-text-main">Precios (USD)</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:max-w-lg">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Estados Unidos / Canadá</Label>
              <Input
                name="priceUs"
                type="number"
                step="0.01"
                min="0"
                value={priceUs}
                onChange={(e) => setPriceUs(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Resto del mundo</Label>
              <Input
                name="priceWorld"
                type="number"
                step="0.01"
                min="0"
                value={priceWorld}
                onChange={(e) => setPriceWorld(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}

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
