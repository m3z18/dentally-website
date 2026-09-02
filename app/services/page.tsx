import type { Metadata } from "next";
import Link from "next/link";

import { ServicesExplorer } from "@/components/services/services-explorer";
import { Container } from "@/components/ui/container";
import { getPublicServices } from "@/lib/catalog";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> { const en=(await getLocale())==="en"; return { title: en ? "Dental services" : "خدمات الأسنان", description: en ? "Explore the dental services currently published by Dentally." : "تعرّف على خدمات طب الأسنان المنشورة حاليًا لدى مجمع دينتالي." }; }

export default async function ServicesPage() {
  const locale = await getLocale(); const en = locale === "en";
  const services = await getPublicServices(locale);
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <nav aria-label={en ? "Breadcrumb" : "مسار الصفحة"} className="text-xs font-medium text-muted">
            <Link href="/" className="transition-colors hover:text-brand">
              {en ? "Home" : "الرئيسية"}
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">{en ? "Services" : "الخدمات"}</span>
          </nav>
          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-bold text-brand">{en ? "Integrated care" : "رعاية متكاملة"}</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
              {en ? "Care that starts by understanding your needs." : "خدمات تبدأ بفهم احتياجك."}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {en ? "Explore available areas of dental care. Choosing the right service starts with a clinical assessment." : "استعرض مجالات الرعاية المتاحة في دينتالي. يبدأ اختيار الخدمة المناسبة بتقييم الطبيب وفهم حالتك وأهدافك."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section">
        <Container>
          <ServicesExplorer services={services} locale={locale} />
          <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-card bg-brand px-7 py-8 text-white sm:flex-row sm:items-center sm:px-9">
            <div>
              <h2 className="text-xl font-bold">{en ? "Not sure which service you need?" : "لست متأكدًا من الخدمة المناسبة؟"}</h2>
              <p className="mt-2 text-sm leading-7 text-white/75">
                {en ? "Book a general consultation and the Dentally team will help identify the right starting point." : "اختر كشفًا واستشارة عامة، وسيساعدك فريق Dentally في تحديد البداية المناسبة."}
              </p>
            </div>
            <Link
              href="/booking"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              {en ? "Book an appointment" : "احجز موعدك"}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
