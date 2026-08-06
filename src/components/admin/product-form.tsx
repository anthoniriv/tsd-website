"use client";

import { useActionState, useState } from "react";
import { saveProductAction, type ActionState } from "@/app/admin/actions";
import type { Product, ProductPrice } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { cn } from "@/lib/utils";

const initial: ActionState = {};

type Props = {
  product?: Product;
  prices?: ProductPrice[];
};

function priceOf(prices: ProductPrice[] | undefined, tier: ProductPrice["tier"]) {
  const cents = prices?.find((p) => p.tier === tier)?.amountCents;
  return cents != null ? cents / 100 : "";
}

/** Los párrafos se guardan como array; en el form se editan separados por línea en blanco. */
function joinParagraphs(list: string[] | undefined) {
  return (list ?? []).join("\n\n");
}

export function ProductForm({ product, prices }: Props) {
  const [state, action, pending] = useActionState(saveProductAction, initial);
  const [kind, setKind] = useState<Product["kind"]>(product?.kind ?? "hardware");
  const [img, setImg] = useState(product?.img ?? "");
  const [vehicleImg, setVehicleImg] = useState(product?.vehicleImg ?? "");

  return (
    <form action={action} className="space-y-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Identidad">
        <Field label="Slug (URL)" hint="minúsculas, números y guiones">
          <Input name="slug" defaultValue={product?.slug} required />
        </Field>

        <Field label="Tipo">
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as Product["kind"])}
            className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm"
          >
            <option value="hardware">Hardware</option>
            <option value="jaltest">Línea Jaltest</option>
          </select>
        </Field>

        {kind === "hardware" ? (
          <>
            <Field label="Categoría">
              <select
                name="category"
                defaultValue={product?.category ?? "laptop"}
                className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm"
              >
                <option value="laptop">Laptop</option>
                <option value="cable">Cable</option>
                <option value="finder">Cable finder</option>
              </select>
            </Field>
            <Field label="SKU">
              <Input name="sku" defaultValue={product?.sku ?? ""} />
            </Field>
          </>
        ) : (
          <p className="col-span-full rounded-lg bg-bg-soft px-4 py-3 text-sm text-text-secondary">
            Las 5 líneas Jaltest tienen un layout propio en la página de producto. Puedes
            editar sus textos, precios e imágenes, pero crear una línea nueva requiere
            añadirla también al diseño.
          </p>
        )}
      </Section>

      <Section title="Contenido">
        <Field label="Nombre (ES)">
          <Input name="name_es" defaultValue={product?.name.es} required />
        </Field>
        <Field label="Nombre (EN)">
          <Input name="name_en" defaultValue={product?.name.en} required />
        </Field>

        <Field label="Descripción corta (ES)" full>
          <Textarea name="blurb_es" rows={2} defaultValue={product?.blurb?.es ?? ""} />
        </Field>
        <Field label="Descripción corta (EN)" full>
          <Textarea name="blurb_en" rows={2} defaultValue={product?.blurb?.en ?? ""} />
        </Field>

        <Field label="Descripción larga (ES)" hint="separa párrafos con una línea en blanco" full>
          <Textarea
            name="description_es"
            rows={6}
            defaultValue={joinParagraphs(product?.description?.es)}
          />
        </Field>
        <Field label="Descripción larga (EN)" hint="separa párrafos con una línea en blanco" full>
          <Textarea
            name="description_en"
            rows={6}
            defaultValue={joinParagraphs(product?.description?.en)}
          />
        </Field>
      </Section>

      <Section title="Imagen">
        <div className="col-span-full">
          <ImageUploadField name="img" value={img} onChange={setImg} required />
        </div>
        {/* La foto grande del panel derecho del bloque en /producto */}
        {kind === "jaltest" && (
          <div className="col-span-full">
            <p className="mb-2 text-sm font-semibold text-text-secondary">
              Foto del equipo (panel derecho de /producto)
            </p>
            <ImageUploadField name="vehicleImg" value={vehicleImg} onChange={setVehicleImg} />
          </div>
        )}
      </Section>

      <Section title="Precios (USD)">
        <Field label="Estados Unidos / Canadá">
          <Input
            name="priceUs"
            type="number"
            step="0.01"
            min="0"
            defaultValue={priceOf(prices, "us")}
            required
          />
        </Field>
        <Field label="Resto del mundo">
          <Input
            name="priceWorld"
            type="number"
            step="0.01"
            min="0"
            defaultValue={priceOf(prices, "world")}
            required
          />
        </Field>
      </Section>

      <Section title="Disponibilidad">
        <Field label="Stock">
          <Input name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} required />
        </Field>
        <Field label="Estado">
          <select
            name="status"
            defaultValue={product?.status ?? "published"}
            className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm"
          >
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
          </select>
        </Field>
        <Field label="Orden" hint="menor = primero">
          <Input name="sort" type="number" min="0" defaultValue={product?.sort ?? 0} required />
        </Field>
      </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-border bg-white p-6">
      <legend className="px-2 text-sm font-bold uppercase tracking-wide text-text-secondary">
        {title}
      </legend>
      <div className="grid gap-5 sm:grid-cols-3">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", full && "col-span-full")}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
