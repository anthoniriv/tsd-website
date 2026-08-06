// Chrome del sitio público (Header + Footer). Vive en un route group para que /admin,
// que cuelga del layout raíz, NO lo herede: el panel tiene su propia sidebar.

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ComingSoonProvider } from "@/components/ui/coming-soon";
import { CartProvider } from "@/components/cart/cart-provider";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { LocaleGate } from "@/components/layout/locale-gate";
import { getLocaleData, hasChosenLocale } from "@/lib/i18n.server";
import { suggestedLocale } from "@/lib/geo";
import { resolveLocale } from "@/lib/i18n";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { code, dict } = await getLocaleData();
  const es = resolveLocale(code).lang === "es";

  // Primera visita: pedimos región antes de que vea precios de otro mercado.
  const [chosen, suggested] = await Promise.all([hasChosenLocale(), suggestedLocale()]);

  return (
    <ComingSoonProvider dict={dict.comingSoon}>
      <CartProvider>
        <LocaleGate suggested={suggested} chosen={chosen} dict={dict.localeGate} />
        <Header locale={code} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer dict={dict} />
        <WhatsAppFab
          label={es ? "Escríbenos" : "Chat with us"}
          greeting={
            es
              ? "Hola, tengo una consulta sobre los equipos Jaltest."
              : "Hi, I have a question about your Jaltest equipment."
          }
        />
      </CartProvider>
    </ComingSoonProvider>
  );
}
