import "server-only";
import Stripe from "stripe";

// Cliente perezoso: si se instanciara al importar el módulo, el build fallaría en
// cualquier entorno sin STRIPE_SECRET_KEY (CI, preview sin configurar). Así solo
// revienta cuando alguien intenta cobrar de verdad sin clave.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Falta STRIPE_SECRET_KEY.");
    client = new Stripe(key);
  }
  return client;
}

/**
 * URL pública del sitio: redirects de Stripe, links de los correos, imágenes.
 *
 * En un preview NO sirve ni la variable fija ni el dominio de producción — el
 * deployment vive en una URL nueva cada vez, y usar cualquier otra mandaría al
 * usuario fuera del preview que está probando. `VERCEL_URL` es esa URL efímera.
 */
export function siteUrl(): string {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}
