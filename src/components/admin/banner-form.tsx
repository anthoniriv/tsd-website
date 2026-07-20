"use client";

import { useActionState, useState } from "react";
import { saveBannerAction, type ActionState } from "@/app/admin/actions";
import type { Banner } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/image-upload-field";

const initial: ActionState = {};

/**
 * Los slides del hero hoy solo llevan imagen; título/subtítulo/CTA quedan disponibles
 * para cuando el cliente quiera texto encima del banner.
 */
export function BannerForm({ banner }: { banner?: Banner }) {
  const [state, action, pending] = useActionState(saveBannerAction, initial);
  const [img, setImg] = useState(banner?.img ?? "");

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-border bg-white p-6">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <input type="hidden" name="key" value={banner?.key ?? "home-hero"} />

      <div className="space-y-1.5">
        <Label>Imagen</Label>
        <ImageUploadField
          name="img"
          value={img}
          onChange={setImg}
          previewClassName="aspect-video w-full max-w-md"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title_es">Título (ES)</Label>
          <Input id="title_es" name="title_es" defaultValue={banner?.title?.es ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title_en">Título (EN)</Label>
          <Input id="title_en" name="title_en" defaultValue={banner?.title?.en ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subtitle_es">Subtítulo (ES)</Label>
          <Input id="subtitle_es" name="subtitle_es" defaultValue={banner?.subtitle?.es ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subtitle_en">Subtítulo (EN)</Label>
          <Input id="subtitle_en" name="subtitle_en" defaultValue={banner?.subtitle?.en ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ctaLabel_es">Texto del botón (ES)</Label>
          <Input id="ctaLabel_es" name="ctaLabel_es" defaultValue={banner?.ctaLabel?.es ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ctaLabel_en">Texto del botón (EN)</Label>
          <Input id="ctaLabel_en" name="ctaLabel_en" defaultValue={banner?.ctaLabel?.en ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ctaHref">Enlace del botón</Label>
          <Input id="ctaHref" name="ctaHref" defaultValue={banner?.ctaHref ?? ""} placeholder="/producto" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sort">Orden</Label>
          <Input id="sort" name="sort" type="number" min="0" defaultValue={banner?.sort ?? 0} required />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-text-main">
        <input
          type="checkbox"
          name="active"
          defaultChecked={banner?.active ?? true}
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        Visible en el sitio
      </label>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-jt-mhe">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="bg-brand hover:bg-brand-dark">
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
