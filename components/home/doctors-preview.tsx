import Link from "next/link";

import { DoctorCard } from "@/components/doctors/doctor-card";
import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";
import { getPublicDoctors } from "@/lib/doctors";
import { getLocale } from "@/lib/i18n";

export async function DoctorsPreview() {
  const locale = await getLocale(); const en = locale === "en";
  const { doctors } = await getPublicDoctors(3);
  if (doctors.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface py-section">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={en ? "Dentally team" : "فريق دينتالي"}
            title={en ? "Diverse expertise, centered on your care." : "خبرات متعددة، وعناية تتمحور حولك."}
            description={en ? "Meet our dentists and explore their professional experience and clinical interests." : "تعرّف على أطباء المجمع وخبراتهم المهنية ومجالات اهتمامهم السريري."}
          />
          <Link href="/doctors" className="inline-flex min-h-12 w-fit items-center justify-center rounded-full border border-brand/20 px-6 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft/60">
            {en ? "View all doctors" : "عرض جميع الأطباء"}
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} locale={locale} />)}
        </div>
      </Container>
    </section>
  );
}
