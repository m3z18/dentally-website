import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";
import { contactDetails } from "@/data/contact";
import { getLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-content";

export async function ContactPreview() {
  const [locale, settings] = await Promise.all([getLocale(), getSiteSettings()]); const en = locale === "en";
  const phone = settings?.phone || contactDetails.phone; const email = settings?.email || contactDetails.email; const location = en ? settings?.address_en || settings?.address_ar || contactDetails.location : settings?.address_ar || contactDetails.location;
  const items = en ? [
    { label: "Location", value: location }, { label: "Phone", value: phone, href: `tel:${phone}` }, { label: "Email", value: email, href: `mailto:${email}` },
  ] : [{ label: "الموقع", value: location }, { label: "الهاتف", value: phone, href: `tel:${phone}` }, { label: "البريد الإلكتروني", value: email, href: `mailto:${email}` }];
  return (
    <section id="contact" className="py-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={en ? "Location and contact" : "الموقع والتواصل"}
              title={en ? "Closer to your smile." : "نحن أقرب إلى ابتسامتك."}
              description={en ? "Contact the Dentally team using the approved contact details." : "تواصل مع فريق Dentally عبر بيانات التواصل المعتمدة."}
            />
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface-muted/60 px-5 py-4 text-sm leading-7 text-muted">
              {en ? "Working hours and the detailed address will appear after approval." : "ساعات العمل والعنوان التفصيلي سيُضافان بعد اعتمادهما."}
            </div>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.label} className="min-h-40 bg-surface p-6 sm:p-7">
                <dt className="text-xs font-semibold text-muted">{item.label}</dt>
                <dd className="mt-7 text-base font-bold text-foreground sm:text-lg">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="transition-colors hover:text-brand"
                      dir={item.href ? "ltr" : undefined}
                    >
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
      </Container>
    </section>
  );
}
