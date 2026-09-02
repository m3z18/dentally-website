import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { DoctorPortrait } from "@/components/doctors/doctor-portrait";
import { Container } from "@/components/ui/container";
import { getDoctorImagePublicUrl } from "@/lib/doctor-images";
import { getPublicDoctorBySlug } from "@/lib/doctors";
import { getLocale, localized } from "@/lib/i18n";
import { getSlugRedirect } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/doctors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getPublicDoctorBySlug(slug);
  const locale = await getLocale();
  if (!doctor) return { title: locale === "en" ? "Doctor not found" : "الطبيب غير موجود" };

  const name = localized(locale, doctor.name_ar, doctor.name_en);
  const title = `${localized(locale, doctor.professional_title_ar, doctor.professional_title_en)} ${name}`;
  const description = localized(locale, doctor.short_bio_ar, doctor.short_bio_en);
  const publicImage = getDoctorImagePublicUrl(doctor.image_path);

  return {
    title,
    description,
    alternates: { canonical: `/doctors/${doctor.slug}` },
    openGraph: {
      title,
      description,
      images: publicImage ? [{ url: publicImage, alt: localized(locale, doctor.image_alt_ar || `صورة ${name}`, doctor.image_alt_en || `Photo of ${name}`) }] : [],
    },
    twitter: {
      card: publicImage ? "summary_large_image" : "summary",
      title,
      description,
      images: publicImage ? [publicImage] : [],
    },
  };
}

export default async function DoctorDetailPage({ params }: PageProps<"/doctors/[slug]">) {
  const { slug } = await params;
  const doctor = await getPublicDoctorBySlug(slug);
  if (!doctor) { const target=await getSlugRedirect("doctor",slug); if(target) permanentRedirect(`/doctors/${target}`); notFound(); }
  const locale = await getLocale(); const en = locale === "en";
  const name = localized(locale, doctor.name_ar, doctor.name_en);
  const qualifications = localized(locale, doctor.qualifications_ar, doctor.qualifications_en.length ? doctor.qualifications_en : null);
  const expertise = localized(locale, doctor.expertise_ar, doctor.expertise_en.length ? doctor.expertise_en : null);
  const languages = localized(locale, doctor.languages_ar, doctor.languages_en.length ? doctor.languages_en : null);

  const hasProfileDetails = qualifications.length > 0 || expertise.length > 0 || languages.length > 0;
  const schema = { "@context":"https://schema.org", "@type":"Person", name:`${localized(locale, doctor.professional_title_ar, doctor.professional_title_en)} ${name}`, description:localized(locale,doctor.short_bio_ar,doctor.short_bio_en), image:getDoctorImagePublicUrl(doctor.image_path)||undefined, jobTitle:localized(locale,doctor.specialty_ar,doctor.specialty_en), url:`/doctors/${doctor.slug}` };

  return (
    <>
      <section className="overflow-hidden border-b border-line bg-surface">
        <Container className="py-12 sm:py-16 lg:py-20">
          <nav aria-label={en ? "Breadcrumb" : "مسار الصفحة"} className="text-xs font-medium text-muted">
            <Link href="/" className="transition-colors hover:text-brand">{en ? "Home" : "الرئيسية"}</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href="/doctors" className="transition-colors hover:text-brand">{en ? "Doctors" : "الأطباء"}</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">{name}</span>
          </nav>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <DoctorPortrait doctor={doctor} locale={locale} priority className="aspect-[4/3] rounded-card shadow-soft lg:aspect-[4/5]" />
            <div>
              <p className="text-sm font-bold text-brand">{localized(locale, doctor.specialty_ar, doctor.specialty_en)}</p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
                {localized(locale, doctor.professional_title_ar, doctor.professional_title_en)} {name}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">{localized(locale, doctor.short_bio_ar, doctor.short_bio_en)}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <article className="rounded-card border border-line bg-surface p-7 sm:p-9">
              <p className="text-xs font-bold text-brand">{en ? "Professional profile" : "السيرة المهنية"}</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">{en ? "About the doctor" : "عن الطبيب"}</h2>
              <div className="mt-6 whitespace-pre-line text-sm leading-8 text-muted">
                {localized(locale, doctor.bio_ar || doctor.short_bio_ar, doctor.bio_en || doctor.short_bio_en)}
              </div>
            </article>

            {hasProfileDetails && (
              <div className="grid gap-5">
                {qualifications.length > 0 && <ProfileList title={en ? "Qualifications" : "المؤهلات"} items={qualifications} />}
                {expertise.length > 0 && <ProfileList title={en ? "Areas of expertise" : "مجالات الخبرة"} items={expertise} />}
                {languages.length > 0 && <ProfileList title={en ? "Languages" : "لغات التواصل"} items={languages} compact />}
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/doctors" className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand/20 px-6 text-sm font-bold text-brand-dark transition-colors hover:bg-brand-soft/60">
              {en ? "Back to all doctors" : "العودة إلى جميع الأطباء"}
            </Link>
          </div>
        </Container>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}} />
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
