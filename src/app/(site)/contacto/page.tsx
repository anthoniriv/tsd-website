import type { Metadata } from "next";
import { CONTACT } from "@/lib/site";
import { getLocaleData } from "@/lib/i18n.server";
import { SmartImage } from "@/components/ui/smart-image";
import { ContactForm } from "@/components/contact/contact-form";
import { LocationMap } from "@/components/contact/location-map";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleData();
  return { title: dict.meta.contactoTitle, description: dict.meta.contactoDescription };
}

/** Variantes que pueden llegar en `?linea=` desde los CTA de /producto. */
const LINE_LABEL: Record<string, string> = {
  cv: "CV",
  ohw: "OHW",
  agv: "AGV",
  marine: "Marine",
  mhe: "MHE",
};

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dict } = await getLocaleData();
  const c = dict.contact;
  const mapTitle = `${c.mapTitlePrefix} ${CONTACT.company} — Los Ángeles, California`;

  // "Agendar una demo" llega como /contacto?asunto=demo&linea=cv
  const params = await searchParams;
  const linea = typeof params.linea === "string" ? LINE_LABEL[params.linea] : undefined;
  const isDemo = params.asunto === "demo";
  const prefill = isDemo
    ? {
        subject: [c.demoSubject, linea].filter(Boolean).join(" "),
        message: c.demoMessage.replace("{linea}", linea ?? "").replace(" .", "."),
      }
    : undefined;

  return (
    <>
      {/* hero oficina */}
      <section className="relative">
        <SmartImage
          src="/images/bannercontacto.jpg"
          alt={c.heroAlt}
          wrapperClassName="h-[36vw] max-h-[420px] min-h-[220px] w-full bg-neutral-200"
        />
        {/* wash celeste de marca parejo + gradiente abajo para legibilidad del texto */}
        <span className="pointer-events-none absolute inset-0 bg-brand/55 mix-blend-multiply" />
        <span className="pointer-events-none absolute inset-0 bg-brand/30" />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-8">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-md sm:text-4xl">
              {c.heroTitle}
            </h1>
            <p className="mt-2 max-w-xl text-base text-white/90 drop-shadow sm:text-lg">
              {c.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-2">
          <LocationMap title={mapTitle} />
          <ContactForm dict={c} prefill={prefill} />
        </div>
      </section>
    </>
  );
}
