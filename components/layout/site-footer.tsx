import Link from "next/link";

import { Container } from "@/components/ui/container";
import { SiteLogo } from "@/components/ui/site-logo";
import { contactDetails } from "@/data/contact";
import type { Locale } from "@/lib/locale";
import { publicNavigation, ui } from "@/lib/locale";

export function SiteFooter({ locale, contact }: { locale: Locale; contact: { phone: string | null; email: string | null; addressAr: string | null; addressEn: string | null } }) {
  const t = ui[locale];
  const primaryNavigation = publicNavigation(locale);
  const phone = contact.phone || contactDetails.phone;
  const email = contact.email || contactDetails.email;
  const location = locale === "en" ? contact.addressEn || contact.addressAr || contactDetails.location : contact.addressAr || contactDetails.location;
  const footerContact = [
    { label: t.phone, value: phone, href: `tel:${phone}` },
    { label: t.email, value: email, href: `mailto:${email}` },
    { label: t.location, value: location },
  ];
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr] lg:gap-16">
          <div className="max-w-md">
            <SiteLogo size="lg" locale={locale} />
            <p className="mt-5 text-sm leading-7 text-muted">
              {t.tagline}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">{t.links}</h2>
            <ul className="mt-4 grid gap-3 text-sm text-muted">
              {primaryNavigation.map((item) => (
                <li key={item.label}>
                  <Link className="transition-colors hover:text-brand" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">{t.contactInfo}</h2>
            <dl className="mt-4 grid gap-4">
              {footerContact.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-semibold text-foreground">{item.label}</dt>
                  <dd className="mt-1 text-sm text-muted">
                    {item.href ? (
                      <a href={item.href} className="transition-colors hover:text-brand" dir="ltr">
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Dentally Dental. {t.rights}.
          </p>
          <p>{t.clinic}</p>
        </div>
        <nav aria-label={locale === "en" ? "Legal" : "روابط تنظيمية"} className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          <Link href="/privacy">{locale === "en" ? "Privacy" : "الخصوصية"}</Link><Link href="/terms">{locale === "en" ? "Terms" : "الشروط"}</Link><Link href="/appointment-policy">{locale === "en" ? "Appointment policy" : "سياسة المواعيد"}</Link><Link href="/medical-disclaimer">{locale === "en" ? "Medical disclaimer" : "التنبيه الطبي"}</Link>
        </nav>
      </Container>
    </footer>
  );
}
