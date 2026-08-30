import Link from "next/link";

import { DoctorPortrait } from "@/components/doctors/doctor-portrait";
import type { PublicDoctor } from "@/lib/doctors";

export function DoctorCard({ doctor }: { doctor: PublicDoctor }) {
  return (
    <article className="group overflow-hidden rounded-card border border-line bg-surface shadow-[0_18px_55px_rgb(25_58_49/0.05)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-soft">
      <Link href={`/doctors/${doctor.slug}`} className="block">
        <DoctorPortrait doctor={doctor} className="aspect-[4/3]" />
        <div className="p-6 sm:p-7">
          <p className="text-xs font-bold text-brand">{doctor.specialty_ar}</p>
          <h2 className="mt-3 text-xl font-bold tracking-[-0.025em] text-foreground sm:text-2xl">
            {doctor.professional_title_ar} {doctor.name_ar}
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">{doctor.short_bio_ar}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-brand-dark">
            عرض الملف المهني
            <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
