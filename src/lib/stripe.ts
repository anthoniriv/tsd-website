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

/** URL pública del sitio, para los redirects de Stripe. */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}
