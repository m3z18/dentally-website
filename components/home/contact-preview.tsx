import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";
import { contactDetails } from "@/data/contact";

const contactItems = [
  { label: "الموقع", value: contactDetails.location },
  { label: "رقم الجوال", value: contactDetails.mobile, href: `tel:${contactDetails.mobile}` },
  { label: "الهاتف", value: contactDetails.phone, href: `tel:${contactDetails.phone}` },
  { label: "البريد الإلكتروني", value: contactDetails.email, href: `mailto:${contactDetails.email}` },
];

export function ContactPreview() {
  return (
    <section id="contact" className="py-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="الموقع والتواصل"
              title="نحن أقرب إلى ابتسامتك."
              description="تواصل مع فريق Dentally عبر بيانات التواصل المعتمدة."
            />
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface-muted/60 px-5 py-4 text-sm leading-7 text-muted">
              ساعات العمل والعنوان التفصيلي سيُضافان بعد اعتمادهما.
            </div>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
            {contactItems.map((item) => (
              <div key={item.label} className="min-h-40 bg-surface p-6 sm:p-7">
                <dt className="text-xs font-semibold text-muted">{item.label}</dt>
                <dd className="mt-7 text-base font-bold text-foreground sm:text-lg">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="transition-colors hover:text-brand"
                      dir={item.label === "الموقع" ? undefined : "ltr"}
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
