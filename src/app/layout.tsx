import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { ComingSoonProvider } from "@/components/ui/coming-soon";
import { SITE } from "@/lib/site";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · ${SITE.fullName}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <ComingSoonProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ComingSoonProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
