import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import { ServiceVisual } from "@/components/services/service-visual";
import { Container } from "@/components/ui/container";
import { dentalServices } from "@/data/services";
import { getPublicServiceBySlug } from "@/lib/catalog";
import { getLocale } from "@/lib/i18n";
import { getSlugRedirect } from "@/lib/seo";

export const dynamicParams = true;

export function generateStaticParams() {
  return dentalServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const service = await getPublicServiceBySlug(slug, locale);
  const en = locale === "en";

  if (!service) {
    return { title: en ? "Service not found" : "الخدمة غير موجودة" };
  }

  return {
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.description,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const service = await getPublicServiceBySlug(slug, locale);

  if (!service) { const target=await getSlugRedirect("service",slug); if(target) permanentRedirect(`/services/${target}`); notFound(); }

  const serviceIndex = dentalServices.findIndex((item) => item.slug === service.slug);
  const en = locale === "en";
  const schema = { "@context":"https://schema.org", "@type":"Service", name:service.title, description:service.description, url:`/services/${service.slug}` };

  return (
    <>
      <section className="overflow-hidden border-b border-line bg-surface">
        <Container className="py-12 sm:py-16 lg:py-20">
          <nav aria-label={en ? "Breadcrumb" : "مسار الصفحة"} className="text-xs font-medium text-muted">
            <Link href="/" className="transition-colors hover:text-brand">{en ? "Home" : "الرئيسية"}</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href="/services" className="transition-colors hover:text-brand">{en ? "Services" : "الخدمات"}</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">{service.title}</span>
          </nav>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold text-brand">{service.specialty?.label || (en ? "Dentally services" : "خدمات دينتالي")}</p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
                {service.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {service.intro}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={service.bookingEnabled ? `/booking?service=${service.slug}` : "/booking"}
                  className="inline-flex min-h-13 items-center justify-center rounded-full bg-brand px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgb(20_112_91/0.2)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand-dark"
                >
                  {en ? "Book this service" : "احجز موعدًا لهذه الخدمة"}
                </Link>
                <Link
                  href="/services"
                  className="inline-flex min-h-13 items-center justify-center rounded-full border border-line px-7 text-sm font-bold text-foreground transition-colors hover:border-brand/25 hover:bg-brand-soft/40"
                >
                  {en ? "All services" : "جميع الخدمات"}
                </Link>
              </div>
            </div>
            {service.imageUrl?<div className="relative aspect-[4/3] overflow-hidden rounded-card bg-brand-soft"><Image src={service.imageUrl} alt={service.imageAlt||service.title} fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover"/></div>:<ServiceVisual index={serviceIndex} />}
          </div>
        </Container>
      </section>

      {(service.procedures.length>0||service.needIndicators.length>0)&&<section className="py-section">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-7 sm:p-9">
              <p className="text-xs font-bold tracking-[0.14em] text-brand">{en ? "Included" : "ضمن هذه الخدمة"}</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                {en ? "Procedures and related care" : "الإجراءات والخدمات الفرعية"}
              </h2>
              <ul className="mt-7 grid gap-3">
                {service.procedures.map((procedure) => (
                  <li key={procedure} className="flex items-start gap-3 rounded-2xl bg-surface-muted px-4 py-3.5 text-sm leading-7 text-foreground">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    {procedure}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card bg-brand p-7 text-white sm:p-9">
              <p className="text-xs font-bold tracking-[0.14em] text-white/65">{en ? "General indicators" : "مؤشرات عامة"}</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {en ? "When might you need this service?" : "متى قد تحتاج هذه الخدمة؟"}
              </h2>
              <ul className="mt-7 grid gap-5">
                {service.needIndicators.map((indicator, index) => (
                  <li key={indicator} className="flex items-start gap-4 text-sm leading-7 text-white/80">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/20 text-[10px] font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {indicator}
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t border-white/15 pt-5 text-xs leading-6 text-white/60">
                {en ? "These are general indicators, not a diagnosis. Treatment needs are determined after examination." : "هذه مؤشرات عامة وليست تشخيصًا. يحدد الطبيب الحاجة العلاجية بعد الفحص."}
              </p>
            </div>
          </div>
        </Container>
      </section>}

      {service.visitExpectations.length>0&&<section className="bg-surface py-section">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="text-sm font-bold text-brand">{en ? "A clear visit" : "زيارة واضحة"}</p>
              <h2 className="mt-4 text-3xl font-bold leading-[1.3] tracking-[-0.04em] text-foreground sm:text-4xl">
                {en ? "What to expect during your visit" : "ماذا تتوقع أثناء الزيارة؟"}
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                {en ? "We begin by understanding your needs, then discuss appropriate steps based on the clinical assessment." : "نبدأ بفهم احتياجك، ثم نناقش الخطوات المناسبة بناءً على التقييم السريري."}
              </p>
            </div>
            <ol className="grid gap-4">
              {service.visitExpectations.map((expectation, index) => (
                <li key={expectation} className="grid grid-cols-[auto_1fr] items-start gap-4 rounded-3xl border border-line bg-background p-5 sm:p-6">
                  <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand-dark">
                    {index + 1}
                  </span>
                  <p className="pt-1.5 text-sm leading-7 text-foreground">{expectation}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>}

      {service.faq.length>0&&<section className="py-section">
        <Container className="max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-bold text-brand">{en ? "FAQ" : "أسئلة شائعة"}</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
              {en ? "Helpful information before your visit" : "معلومات أولية قبل زيارتك"}
            </h2>
          </div>
          <div className="mt-9 grid gap-3">
            {service.faq.map((item) => (
              <details key={item.question} className="group rounded-3xl border border-line bg-surface px-5 py-1 open:border-brand/20 sm:px-7">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-normal text-brand-dark transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="border-t border-line pb-6 pt-5 text-sm leading-8 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>}

      <section className="pb-section">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand px-7 py-10 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14">
            <span className="absolute -bottom-24 -start-14 size-64 rounded-full border-[30px] border-white/5" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{en ? "Would you like to discuss this service?" : "هل ترغب في مناقشة هذه الخدمة؟"}</h2>
              <p className="mt-4 text-sm leading-7 text-white/75">{en ? "Start an appointment request with this service preselected." : "ابدأ بطلب موعد، وسيتم ربط الحجز بالخدمة التي اخترتها."}</p>
            </div>
            <Link
              href={service.bookingEnabled ? `/booking?service=${service.slug}` : "/booking"}
              className="relative mt-7 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5 lg:mt-0 lg:w-auto"
            >
              {en ? "Book this service" : "احجز موعدًا لهذه الخدمة"}
            </Link>
          </div>
        </Container>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}} />
    </>
  );
}
