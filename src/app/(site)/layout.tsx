// Chrome del sitio público (Header + Footer). Vive en un route group para que /admin,
// que cuelga del layout raíz, NO lo herede: el panel tiene su propia sidebar.

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ComingSoonProvider } from "@/components/ui/coming-soon";
import { CartProvider } from "@/components/cart/cart-provider";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { RegionGate } from "@/components/layout/region-gate";
import { getLocaleData, hasChosenCountry } from "@/lib/i18n.server";
import { detectCountry } from "@/lib/geo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { lang, country, dict } = await getLocaleData();
  const es = lang === "es";

  // Primera visita: pedimos país antes de que vea precios de otro mercado.
  const [chosen, detected] = await Promise.all([hasChosenCountry(), detectCountry()]);

  return (
    <ComingSoonProvider dict={dict.comingSoon}>
      <CartProvider>
        <RegionGate
          suggestedCountry={country ?? detected}
          currentLang={lang}
          chosen={chosen}
          dict={dict.localeGate}
        />
        <Header lang={lang} country={country} dict={dict} />
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
