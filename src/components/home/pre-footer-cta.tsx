import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLocaleData } from "@/lib/i18n.server";
import { buttonVariants } from "@/components/ui/button";

/** Cierre comercial antes del footer: mensaje fuerte + CTAs. */
export async function PreFooterCta() {
  const { dict } = await getLocaleData();
  return (
    <section className="bg-gradient-to-r from-brand to-brand-dark py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          {dict.preFooter.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
          {dict.preFooter.body}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white text-brand-dark hover:bg-white/90"
            )}
          >
            {dict.preFooter.ctaQuote}
          </Link>
          <Link
            href="/producto"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
            )}
          >
            {dict.preFooter.ctaProducts}
          </Link>
        </div>
      </div>
    </section>
  );
}
