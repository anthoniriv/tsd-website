// Chrome del sitio público (Header + Footer). Vive en un route group para que /admin,
// que cuelga del layout raíz, NO lo herede: el panel tiene su propia sidebar.

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ComingSoonProvider } from "@/components/ui/coming-soon";
import { getLocaleData } from "@/lib/i18n.server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { code, dict } = await getLocaleData();

  return (
    <ComingSoonProvider dict={dict.comingSoon}>
      <Header locale={code} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer dict={dict} />
    </ComingSoonProvider>
  );
}
