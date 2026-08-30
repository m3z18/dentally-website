import Image from "next/image";

import { getDoctorImagePublicUrl } from "@/lib/doctor-images";
import type { PublicDoctor } from "@/types/doctor";

type DoctorPortraitProps = {
  doctor: Pick<PublicDoctor, "name_ar" | "image_path" | "image_alt_ar">;
  className?: string;
  priority?: boolean;
};

export function DoctorPortrait({ doctor, className = "", priority = false }: DoctorPortraitProps) {
  const initial = doctor.name_ar.replace(/^د\.?\s*/, "").trim().charAt(0) || "د";
  const imageUrl = getDoctorImagePublicUrl(doctor.image_path);

  return (
    <div className={`relative overflow-hidden bg-brand-soft ${className}`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={doctor.image_alt_ar || `صورة ${doctor.name_ar}`}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
          preload={priority}
        />
      ) : (
        <div className="grid h-full w-full place-items-center" aria-hidden="true">
          <span className="text-6xl font-bold text-brand/30 sm:text-7xl">{initial}</span>
        </div>
      )}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-brand-dark/12 to-transparent" aria-hidden="true" />
    </div>
  );
}
