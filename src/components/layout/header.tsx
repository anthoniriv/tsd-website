"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV } from "@/lib/site";
import { Logo } from "@/components/layout/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useComingSoon } from "@/components/ui/coming-soon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function SearchBar({ className }: { className?: string }) {
  const comingSoon = useComingSoon();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        comingSoon({ feature: "La búsqueda de productos" });
      }}
      className={cn("relative w-full", className)}
    >
      <Input
        type="search"
        placeholder="Buscar productos, kits, cables…"
        className="h-10 pr-11"
        aria-label="Buscar"
        readOnly
        onClick={() => comingSoon({ feature: "La búsqueda de productos" })}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1 top-1 grid h-8 w-9 place-items-center rounded-sm bg-brand text-white transition-colors hover:bg-brand-dark"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

export function Header() {
  const pathname = usePathname();
  const comingSoon = useComingSoon();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white/95 backdrop-blur transition-shadow",
        scrolled ? "shadow-md" : "shadow-sm"
      )}
    >
      {/* fila superior: logo + search + acciones */}
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5">
        <Logo />
        <SearchBar className="hidden flex-1 md:block" />
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cuenta"
            className="text-brand"
            onClick={() => comingSoon({ feature: "Tu cuenta" })}
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Carrito"
            className="text-brand"
            onClick={() => comingSoon({ feature: "El carrito de compras" })}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
          {/* botón menú mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
              aria-label="Menú"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Menú
                  <button onClick={() => setOpen(false)} aria-label="Cerrar">
                    <X className="h-4 w-4" />
                  </button>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col px-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "border-b py-3.5 text-base font-medium",
                      isActive(item.href) ? "text-brand" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="space-y-4 px-4 pt-4">
                <SearchBar />
                <Link
                  href="/contacto"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full bg-brand text-white hover:bg-brand-dark"
                  )}
                >
                  Solicitar una cotización
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* fila inferior: navegación (desktop) */}
      <nav className="hidden border-t bg-muted/60 md:block">
        <ul className="mx-auto flex max-w-6xl items-stretch px-4">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "inline-block px-5 py-3 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "bg-brand text-white"
                    : "text-foreground/80 hover:bg-brand/5 hover:text-brand"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
