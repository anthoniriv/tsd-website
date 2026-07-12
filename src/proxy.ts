// Puerta de entrada a /admin. (En Next 16 `middleware` se llama `proxy`.)
//
// Aquí solo comprobamos que EXISTA la cookie de sesión — es un filtro barato para no
// renderizar el panel a un anónimo. La validación real (token vivo en BD + rol) vive
// en `requireUser()`/`requireRole()`, que corren en el layout y en cada Server Action.

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth.shared";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
