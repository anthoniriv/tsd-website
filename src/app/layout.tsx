import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { ComingSoonProvider } from "@/components/ui/coming-soon";
import { SITE } from "@/lib/site";
import { getLocaleData } from "@/lib/i18n.server";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleData();
  return {
    title: {
      default: `${SITE.name} · ${SITE.fullName}`,
      template: `%s · ${SITE.name}`,
    },
    description: dict.meta.siteDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { code, lang, dict } = await getLocaleData();

  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <ComingSoonProvider dict={dict.comingSoon}>
          <Header locale={code} dict={dict} />
          <main className="flex-1">{children}</main>
          <Footer dict={dict} />
        </ComingSoonProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
