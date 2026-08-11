import Link from "next/link";
import { CONTACT, CONTACT_US_OFFICE, POLICIES, SOCIALS } from "@/lib/site";
import type { Dict } from "@/lib/i18n";
import { Logo } from "@/components/layout/logo";

// Los teléfonos son placeholders (+0 000 000 0000); no mostramos datos falsos.
// `CONTACT` es `as const`, así que sin ensanchar a string TS trata las
// comparaciones como imposibles y rompe el type check.
const PHONE_PLACEHOLDER: string = "+0 000 000 0000";
const phone: string = CONTACT.phone;
const tollFree: string = CONTACT.tollFree;
const hasRealPhone = phone !== PHONE_PLACEHOLDER;
// Mientras haya un solo número no tiene sentido repetirlo como "línea gratuita".
const hasTollFree = tollFree !== PHONE_PLACEHOLDER && tollFree !== phone;

// lucide eliminó los logos de marca; usamos SVGs inline simples.
function Svg({ className, d }: { className?: string; d: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: ({ className }) => (
    <Svg className={className} d="M13 22v-8h2.7l.4-3H13V9.1c0-.9.3-1.5 1.6-1.5H16V5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9V11H7.5v3H10v8h3z" />
  ),
  instagram: ({ className }) => (
    <Svg className={className} d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17.8 7a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21 7.1c-.1-1.5-.4-2.8-1.5-3.9S17.1 1.7 15.6 1.6C14.1 1.5 9.9 1.5 8.4 1.6 6.9 1.7 5.6 2 4.5 3.1S2.8 5.5 2.7 7c-.1 1.5-.1 5.7 0 7.2.1 1.5.4 2.8 1.5 3.9s2.4 1.4 3.9 1.5c1.5.1 5.7.1 7.2 0 1.5-.1 2.8-.4 3.9-1.5s1.4-2.4 1.5-3.9c.1-1.5.1-5.7 0-7.1zm-2 8.7a3.1 3.1 0 0 1-1.8 1.8c-1.2.5-4.1.4-5.4.4s-4.2.1-5.4-.4a3.1 3.1 0 0 1-1.8-1.8c-.5-1.2-.4-4.1-.4-5.4s-.1-4.2.4-5.4A3.1 3.1 0 0 1 6.6 3.6c1.2-.5 4.1-.4 5.4-.4s4.2-.1 5.4.4a3.1 3.1 0 0 1 1.8 1.8c.5 1.2.4 4.1.4 5.4s.1 4.2-.4 5.4z" />
  ),
  youtube: ({ className }) => (
    <Svg className={className} d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.8 12 4.8 12 4.8s-7 0-8.9.6A3 3 0 0 0 1 7.5C.4 9.4.4 12 .4 12s0 2.6.6 4.5a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1c.6-1.9.6-4.5.6-4.5s0-2.6-.6-4.5zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z" />
  ),
  linkedin: ({ className }) => (
    <Svg className={className} d="M6.9 8.5H3.6V21h3.3V8.5zM5.2 3a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM21 21h-3.3v-6.1c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V21H10V8.5h3.1v1.7h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5V21z" />
  ),
  x: ({ className }) => (
    <Svg className={className} d="M17.5 3h2.8l-6.1 7L21.5 21h-5.6l-4.4-5.8L6.3 21H3.5l6.6-7.5L3 3h5.7l4 5.3L17.5 3zm-1 16h1.6L7.6 4.6H5.9L16.5 19z" />
  ),
};

export function Footer({ dict }: { dict: Dict }) {
  return (
    <footer className="mt-auto">
      <div className="bg-neutral-900 text-neutral-200">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 text-sm leading-relaxed">
            <Logo variant="white" />
            <p className="max-w-xs text-neutral-300">{dict.meta.siteDescription}</p>
            <Link
              href="https://integrasgp.com/"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              aria-label={`${dict.footer.partOfGroup} — integrasgp.com`}
              className="inline-flex items-center gap-2 rounded-full border border-[#4fc9e1]/35 bg-[#00609c]/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#a6d8ed] transition-colors hover:border-[#4fc9e1] hover:bg-[#00609c]/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4fc9e1]"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-[#4fc9e1] shadow-[0_0_0_3px_rgba(79,201,225,0.16)]"
              />
              {dict.footer.partOfGroup}
              <span aria-hidden>↗</span>
            </Link>
          </div>

          <div className="text-sm leading-relaxed">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              {dict.footer.contactWith} {CONTACT.company}
            </h3>
            <p className="font-semibold text-white">{CONTACT.company}</p>
            {/* Panamá es la oficina principal; LA queda como segunda sede.
                Ciudad arriba y dirección debajo, igual que en /contacto. */}
            <ul className="mt-3 space-y-3">
              {[CONTACT, CONTACT_US_OFFICE].map((office) => (
                <li key={office.city}>
                  <p className="font-semibold text-white">{office.city}</p>
                  <p>{office.address}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm leading-relaxed">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              {dict.footer.support}
            </h3>
            {hasRealPhone ? (
              <>
                <p>
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:underline">
                    {CONTACT.phone}
                  </a>
                </p>
                {hasTollFree && (
                  <>
                    <p className="mt-1">{dict.footer.callFree}</p>
                    <p>{CONTACT.tollFree}</p>
                  </>
                )}
                <p className="mt-1">
                  <a href={`mailto:${CONTACT.email}`} className="hover:underline">
                    {CONTACT.email}
                  </a>
                </p>
              </>
            ) : (
              <p className="text-neutral-300">
                {dict.footer.writeFromContactPre}{" "}
                <Link href="/contacto" className="text-brand hover:underline">
                  {dict.footer.writeFromContactLink}
                </Link>
                .
              </p>
            )}
          </div>

          <div className="text-sm lg:text-right">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              {dict.footer.follow}
            </h3>
            <ul className="flex gap-3 lg:justify-end">
              {SOCIALS.map((s) => {
                const Icon = ICONS[s.icon];
                return (
                  <li key={s.label}>
                    <Link
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${dict.footer.followOn} ${s.label}`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-brand"
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t bg-muted">
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-4 text-sm text-muted-foreground">
          {POLICIES.map((p, i) => (
            <li key={p.key} className="flex items-center gap-3">
              <Link href={p.href} className="hover:text-brand">
                {dict.footer.policies[p.key]}
              </Link>
              {i < POLICIES.length - 1 && (
                <span className="text-muted-foreground/60">·</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
