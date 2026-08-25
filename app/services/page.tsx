import type { Metadata } from "next";
import Link from "next/link";

import { ServicesExplorer } from "@/components/services/services-explorer";
import { Container } from "@/components/ui/container";
import { dentalServices } from "@/data/services";

export const metadata: Metadata = {
  title: "خدمات الأسنان",
  description:
    "تعرّف على خدمات مجمع دينتالي لطب الأسنان، من الرعاية الوقائية إلى العلاجات الترميمية والتجميلية.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <nav aria-label="مسار الصفحة" className="text-xs font-medium text-muted">
            <Link href="/" className="transition-colors hover:text-brand">
              الرئيسية
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">الخدمات</span>
          </nav>
          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-bold text-brand">رعاية متكاملة</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
              خدمات تبدأ بفهم احتياجك.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              استعرض مجالات الرعاية المتاحة في دينتالي. يبدأ اختيار الخدمة المناسبة بتقييم الطبيب وفهم حالتك وأهدافك.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section">
        <Container>
          <ServicesExplorer services={dentalServices} />
          <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-card bg-brand px-7 py-8 text-white sm:flex-row sm:items-center sm:px-9">
            <div>
              <h2 className="text-xl font-bold">لست متأكدًا من الخدمة المناسبة؟</h2>
              <p className="mt-2 text-sm leading-7 text-white/75">
                اختر كشفًا واستشارة عامة، وسيساعدك فريق Dentally في تحديد البداية المناسبة.
              </p>
            </div>
            <Link
              href="/booking"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              احجز موعدك
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
