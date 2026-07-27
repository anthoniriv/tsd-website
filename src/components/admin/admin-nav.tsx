"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Image,
  Inbox,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/cupones", label: "Cupones", icon: Tag },
  { href: "/admin/contacto", label: "Solicitudes", icon: Inbox },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {LINKS.map(({ href, label, icon: Icon }) => {
        // "/admin" solo marca activo en exacto; el resto también en sus subrutas.
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-brand/10 text-brand-dark"
                : "text-text-secondary hover:bg-bg-soft hover:text-text-main",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
