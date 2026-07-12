// Layout del panel. Reemplaza el chrome del sitio (Header/Footer) por una sidebar.
// El árbol de /admin es siempre dinámico: cada request valida la sesión contra la BD.

import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Panel TDS",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  // La página de login usa este mismo layout, pero sin sidebar.
  if (!user) return <div className="min-h-screen bg-bg-main">{children}</div>;

  return (
    <div className="flex min-h-screen bg-bg-main">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="border-b border-border px-6 py-5">
          <Link href="/admin" className="text-lg font-black tracking-tight text-text-main">
            TDS <span className="text-brand">Panel</span>
          </Link>
        </div>

        <AdminNav />

        <div className="mt-auto border-t border-border px-4 py-4">
          <p className="truncate text-sm font-semibold text-text-main">{user.name}</p>
          <p className="truncate text-xs text-text-muted">{user.email}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-brand">{user.role}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-3 text-xs font-semibold text-text-secondary underline-offset-2 hover:text-text-main hover:underline"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
