import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
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
  const { lang } = await getLocaleData();

  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
