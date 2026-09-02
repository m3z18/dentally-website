import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";
import { contactDetails } from "@/data/contact";
import { getLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-content";

export async function ContactPreview() {
  const [locale, settings] = await Promise.all([getLocale(), getSiteSettings()]);
  const en = locale === "en";
  const phone = settings?.phone || contactDetails.phone;
  const email = settings?.email || contactDetails.email;
  const location = en ? settings?.address_en || settings?.address_ar || contactDetails.location : settings?.address_ar || contactDetails.location;
  const hours = en ? settings?.working_hours_en || settings?.working_hours_ar : settings?.working_hours_ar;
  const items = [
    { label: en ? "Location" : "الموقع", value: location },
    { label: en ? "Phone" : "الهاتف", value: phone, href: `tel:${phone}` },
    { label: en ? "Email" : "البريد الإلكتروني", value: email, href: `mailto:${email}` },
    ...(hours ? [{ label: en ? "Working hours" : "ساعات العمل", value: hours }] : []),
  ];
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
            <a href="/contact" className="mt-8 inline-flex min-h-11 items-center rounded-full border border-brand/20 px-5 text-sm font-bold text-brand-dark transition-colors hover:bg-brand-soft/60">{en ? "All contact details" : "جميع بيانات التواصل"}</a>
            {settings?.maps_url && <a href={settings.maps_url} target="_blank" rel="noopener noreferrer" className="mt-3 ms-3 inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-dark">{en ? "Open map" : "فتح الخريطة"}</a>}
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
