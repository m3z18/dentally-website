import Link from "next/link";

import { DoctorPortrait } from "@/components/doctors/doctor-portrait";
import type { PublicDoctor } from "@/lib/doctors";
import type { Locale } from "@/lib/locale";
import { localized } from "@/lib/locale";

export function DoctorCard({ doctor, locale = "ar" }: { doctor: PublicDoctor; locale?: Locale }) {
  const name = localized(locale, doctor.name_ar, doctor.name_en);
  const title = localized(locale, doctor.professional_title_ar, doctor.professional_title_en);
  return (
    <article className="group overflow-hidden rounded-card border border-line bg-surface shadow-[0_18px_55px_rgb(25_58_49/0.05)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-soft">
      <Link href={`/doctors/${doctor.slug}`} className="block">
        <DoctorPortrait doctor={doctor} className="aspect-[4/3]" />
        <div className="p-6 sm:p-7">
          <p className="text-xs font-bold text-brand">{localized(locale, doctor.specialty_ar, doctor.specialty_en)}</p>
          <h2 className="mt-3 text-xl font-bold tracking-[-0.025em] text-foreground sm:text-2xl">
            {title} {name}
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">{localized(locale, doctor.short_bio_ar, doctor.short_bio_en)}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-brand-dark">
            {locale === "ar" ? "عرض الملف المهني" : "View profile"}
            <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
