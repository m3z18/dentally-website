import type { Metadata } from "next";
import Link from "next/link";

import { DoctorCard } from "@/components/doctors/doctor-card";
import { Container } from "@/components/ui/container";
import { getPublicDoctors } from "@/lib/doctors";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "أطباء دينتالي",
  description: "تعرّف على أطباء مجمع دينتالي لطب الأسنان وتخصصاتهم وخبراتهم المهنية.",
};

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const locale = await getLocale();
  const { doctors, unavailable } = await getPublicDoctors();
  const en = locale === "en";

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <nav aria-label={en ? "Breadcrumb" : "مسار الصفحة"} className="text-xs font-medium text-muted">
            <Link href="/" className="transition-colors hover:text-brand">{en ? "Home" : "الرئيسية"}</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">{en ? "Doctors" : "الأطباء"}</span>
          </nav>
          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-bold text-brand">{en ? "Dentally team" : "فريق دينتالي"}</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
              {en ? "Experience that listens. Care built on trust." : "خبرة تُصغي إليك، ورعاية تبدأ بالثقة."}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {en ? "Explore our dentists’ professional profiles, specialties, qualifications, and areas of expertise." : "استعرض الملفات المهنية لأطباء المجمع، وتعرّف على تخصصاتهم ومؤهلاتهم ومجالات خبرتهم."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section">
        <Container>
          {unavailable ? (
            <div className="rounded-card border border-line bg-surface px-6 py-14 text-center" role="status">
              <h2 className="text-xl font-bold text-foreground">{en ? "Doctors are unavailable right now" : "تعذر تحميل قائمة الأطباء الآن"}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{en ? "Please try again later." : "يرجى المحاولة مرة أخرى لاحقًا."}</p>
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} locale={locale} />)}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
              <h2 className="text-xl font-bold text-foreground">{en ? "Team profiles will be published soon" : "سيتم نشر ملفات الفريق قريبًا"}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{en ? "Profiles are reviewed before appearing on the website." : "تُراجع بيانات الأطباء قبل ظهورها في الموقع."}</p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
