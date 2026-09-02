import Link from "next/link";
import Image from "next/image";

import { ServiceVisual } from "@/components/services/service-visual";
import type { DentalService } from "@/types/service";
import type { Locale } from "@/lib/locale";

type ServiceCardProps = {
  service: DentalService;
  index: number;
  locale?: Locale;
};

export function ServiceCard({ service, index, locale = "ar" }: ServiceCardProps) {
  const en = locale === "en";
  const title=en?service.titleEn||service.title:service.title;
  const description=en?service.descriptionEn||service.description:service.description;
  return (
    <article className="group flex h-full flex-col rounded-card border border-line bg-surface p-4 shadow-[0_18px_50px_rgb(24_57_48/0.045)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-soft">
      <Link
        href={`/services/${service.slug}`}
        className="flex flex-1 flex-col rounded-[1.65rem] focus-visible:outline-offset-4"
        aria-label={en ? `Learn more about ${title}` : `اعرف المزيد عن ${title}`}
      >
        {service.imageUrl?<div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-brand-soft"><Image src={service.imageUrl} alt={service.imageAlt||title} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw" className="object-cover"/></div>:<ServiceVisual index={index} />}
        <div className="flex flex-1 flex-col px-2 pb-2 pt-6">
          <h2 className="text-xl font-bold tracking-[-0.025em] text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mt-3 flex-1 text-sm leading-7 text-muted">{description}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-dark">
            {en ? "Learn more" : "اعرف المزيد"}
            <span className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">
              ←
            </span>
          </span>
        </div>
      </Link>
      <Link
        href={service.bookingEnabled === false ? "/booking" : `/booking?service=${service.slug}`}
        className="mx-2 mb-2 mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-brand/20 px-5 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-soft/60"
      >
        {en ? "Book an appointment" : "احجز موعدًا"}
      </Link>
    </article>
  );
}
