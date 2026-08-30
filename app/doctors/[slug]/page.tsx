import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DoctorPortrait } from "@/components/doctors/doctor-portrait";
import { Container } from "@/components/ui/container";
import { getDoctorImagePublicUrl } from "@/lib/doctor-images";
import { getPublicDoctorBySlug } from "@/lib/doctors";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/doctors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getPublicDoctorBySlug(slug);
  if (!doctor) return { title: "الطبيب غير موجود" };

  const title = `${doctor.professional_title_ar} ${doctor.name_ar}`;
  const publicImage = getDoctorImagePublicUrl(doctor.image_path);

  return {
    title,
    description: doctor.short_bio_ar,
    openGraph: {
      title,
      description: doctor.short_bio_ar,
      images: publicImage ? [{ url: publicImage, alt: doctor.image_alt_ar || `صورة ${doctor.name_ar}` }] : [],
    },
    twitter: {
      card: publicImage ? "summary_large_image" : "summary",
      title,
      description: doctor.short_bio_ar,
      images: publicImage ? [publicImage] : [],
    },
  };
}

export default async function DoctorDetailPage({ params }: PageProps<"/doctors/[slug]">) {
  const { slug } = await params;
  const doctor = await getPublicDoctorBySlug(slug);
  if (!doctor) notFound();

  const hasProfileDetails = doctor.qualifications_ar.length > 0 || doctor.expertise_ar.length > 0 || doctor.languages_ar.length > 0;

  return (
    <>
      <section className="overflow-hidden border-b border-line bg-surface">
        <Container className="py-12 sm:py-16 lg:py-20">
          <nav aria-label="مسار الصفحة" className="text-xs font-medium text-muted">
            <Link href="/" className="transition-colors hover:text-brand">الرئيسية</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href="/doctors" className="transition-colors hover:text-brand">الأطباء</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">{doctor.name_ar}</span>
          </nav>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <DoctorPortrait doctor={doctor} priority className="aspect-[4/3] rounded-card shadow-soft lg:aspect-[4/5]" />
            <div>
              <p className="text-sm font-bold text-brand">{doctor.specialty_ar}</p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
                {doctor.professional_title_ar} {doctor.name_ar}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">{doctor.short_bio_ar}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <article className="rounded-card border border-line bg-surface p-7 sm:p-9">
              <p className="text-xs font-bold text-brand">السيرة المهنية</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">عن الطبيب</h2>
              <div className="mt-6 whitespace-pre-line text-sm leading-8 text-muted">
                {doctor.bio_ar || doctor.short_bio_ar}
              </div>
            </article>

            {hasProfileDetails && (
              <div className="grid gap-5">
                {doctor.qualifications_ar.length > 0 && <ProfileList title="المؤهلات" items={doctor.qualifications_ar} />}
                {doctor.expertise_ar.length > 0 && <ProfileList title="مجالات الخبرة" items={doctor.expertise_ar} />}
                {doctor.languages_ar.length > 0 && <ProfileList title="لغات التواصل" items={doctor.languages_ar} compact />}
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/doctors" className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand/20 px-6 text-sm font-bold text-brand-dark transition-colors hover:bg-brand-soft/60">
              العودة إلى جميع الأطباء
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function ProfileList({ title, items, compact = false }: { title: string; items: string[]; compact?: boolean }) {
  return (
    <section className="rounded-card bg-brand p-7 text-white sm:p-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className={`mt-5 ${compact ? "flex flex-wrap gap-2" : "grid gap-3"}`}>
        {items.map((item) => (
          <li key={item} className={compact ? "rounded-full border border-white/20 px-4 py-2 text-xs text-white/85" : "flex items-start gap-3 text-sm leading-7 text-white/80"}>
            {!compact && <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-white/70" aria-hidden="true" />}
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
