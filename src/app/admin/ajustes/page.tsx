import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";

export default async function AjustesPage() {
  // Guardar exige admin (lo revalida la Server Action); editor solo ve el estado actual.
  const me = await requireUser();
  const canEdit = me.role === "owner" || me.role === "admin";
  const settings = await getSettings();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-main">Ajustes</h1>
        <p className="text-sm text-text-muted">Configuración global de la tienda</p>
      </header>

      {canEdit ? (
        <ShippingSettingsForm
          shippingAmount={(settings.shippingCents / 100).toFixed(2)}
          etaEs={settings.shippingEta?.es ?? ""}
          etaEn={settings.shippingEta?.en ?? ""}
        />
      ) : (
        <p className="max-w-lg rounded-2xl border border-border bg-bg-soft p-5 text-sm text-text-secondary">
          Solo un usuario con rol <strong>admin</strong> u <strong>owner</strong> puede
          cambiar los ajustes de envío.
        </p>
      )}
    </>
  );
}
