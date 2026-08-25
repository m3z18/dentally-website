import Link from "next/link";

import { Container } from "@/components/ui/container";
import { SiteLogo } from "@/components/ui/site-logo";
import { contactDetails } from "@/data/contact";
import { primaryNavigation } from "@/data/navigation";

const footerContact = [
  { label: "رقم الجوال", value: contactDetails.mobile, href: `tel:${contactDetails.mobile}` },
  { label: "الهاتف", value: contactDetails.phone, href: `tel:${contactDetails.phone}` },
  { label: "البريد الإلكتروني", value: contactDetails.email, href: `mailto:${contactDetails.email}` },
  { label: "الموقع", value: contactDetails.location },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr] lg:gap-16">
          <div className="max-w-md">
            <SiteLogo size="lg" />
            <p className="mt-5 text-sm leading-7 text-muted">
              رعاية متكاملة لصحة وجمال ابتسامتك في مجمع دينتالي لطب الأسنان.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">روابط الموقع</h2>
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
            <h2 className="text-sm font-bold text-foreground">معلومات التواصل</h2>
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
            © {new Date().getFullYear()} Dentally Dental. جميع الحقوق محفوظة.
          </p>
          <p>مجمع دينتالي لطب الأسنان</p>
        </div>
      </Container>
    </footer>
  );
}
