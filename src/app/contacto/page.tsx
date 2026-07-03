import type { Metadata } from "next";
import { SmartImage } from "@/components/ui/smart-image";
import { ContactForm } from "@/components/contact/contact-form";
import { LocationMap } from "@/components/contact/location-map";

export const metadata: Metadata = {
  title: "Contáctenos",
  description: "Ponte en contacto con Tech Diagnostic Solutions — Doral, Florida.",
};

export default function ContactoPage() {
  return (
    <>
      {/* hero oficina */}
      <section className="relative">
        <SmartImage
          src="/images/bannercontacto.jpg"
          alt="Oficinas de Tech Diagnostic Solutions"
          wrapperClassName="h-[36vw] max-h-[420px] min-h-[220px] w-full bg-neutral-200"
        />
        {/* wash celeste de marca parejo + gradiente abajo para legibilidad del texto */}
        <span className="pointer-events-none absolute inset-0 bg-brand/55 mix-blend-multiply" />
        <span className="pointer-events-none absolute inset-0 bg-brand/30" />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-8">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-md sm:text-4xl">
              Contáctenos
            </h1>
            <p className="mt-2 max-w-xl text-base text-white/90 drop-shadow sm:text-lg">
              Estamos en Doral, FL. Cuéntanos qué equipo o cobertura necesitas y te asesoramos.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-2">
          <LocationMap />
          <ContactForm />
        </div>
      </section>
    </>
  );
}
