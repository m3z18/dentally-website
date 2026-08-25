import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceVisual } from "@/components/services/service-visual";
import { Container } from "@/components/ui/container";
import { dentalServices, getServiceBySlug } from "@/data/services";

export const dynamicParams = false;

export function generateStaticParams() {
  return dentalServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return { title: "الخدمة غير موجودة" };
  }

  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) notFound();

  const serviceIndex = dentalServices.findIndex((item) => item.id === service.id);

  return (
    <>
      <section className="overflow-hidden border-b border-line bg-surface">
        <Container className="py-12 sm:py-16 lg:py-20">
          <nav aria-label="مسار الصفحة" className="text-xs font-medium text-muted">
            <Link href="/" className="transition-colors hover:text-brand">الرئيسية</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href="/services" className="transition-colors hover:text-brand">الخدمات</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">{service.title}</span>
          </nav>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold text-brand">خدمات دينتالي</p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
                {service.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {service.intro}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/booking?service=${service.slug}`}
                  className="inline-flex min-h-13 items-center justify-center rounded-full bg-brand px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgb(20_112_91/0.2)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand-dark"
                >
                  احجز موعدًا لهذه الخدمة
                </Link>
                <Link
                  href="/services"
                  className="inline-flex min-h-13 items-center justify-center rounded-full border border-line px-7 text-sm font-bold text-foreground transition-colors hover:border-brand/25 hover:bg-brand-soft/40"
                >
                  جميع الخدمات
                </Link>
              </div>
            </div>
            <ServiceVisual index={serviceIndex} />
          </div>
        </Container>
      </section>

      <section className="py-section">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-7 sm:p-9">
              <p className="text-xs font-bold tracking-[0.14em] text-brand">ضمن هذه الخدمة</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                الإجراءات والخدمات الفرعية
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
              <p className="text-xs font-bold tracking-[0.14em] text-white/65">مؤشرات عامة</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                متى قد تحتاج هذه الخدمة؟
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
                هذه مؤشرات عامة وليست تشخيصًا. يحدد الطبيب الحاجة العلاجية بعد الفحص.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-section">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="text-sm font-bold text-brand">زيارة واضحة</p>
              <h2 className="mt-4 text-3xl font-bold leading-[1.3] tracking-[-0.04em] text-foreground sm:text-4xl">
                ماذا تتوقع أثناء الزيارة؟
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                نبدأ بفهم احتياجك، ثم نناقش الخطوات المناسبة بناءً على التقييم السريري.
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
      </section>

      <section className="py-section">
        <Container className="max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-bold text-brand">أسئلة شائعة</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
              معلومات أولية قبل زيارتك
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
      </section>

      <section className="pb-section">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand px-7 py-10 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14">
            <span className="absolute -bottom-24 -start-14 size-64 rounded-full border-[30px] border-white/5" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">هل ترغب في مناقشة هذه الخدمة؟</h2>
              <p className="mt-4 text-sm leading-7 text-white/75">ابدأ بطلب موعد، وسيتم ربط الحجز بالخدمة التي اخترتها.</p>
            </div>
            <Link
              href={`/booking?service=${service.slug}`}
              className="relative mt-7 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5 lg:mt-0 lg:w-auto"
            >
              احجز موعدًا لهذه الخدمة
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
