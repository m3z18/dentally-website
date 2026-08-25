import Link from "next/link";

import { ServiceVisual } from "@/components/services/service-visual";
import type { DentalService } from "@/types/service";

type ServiceCardProps = {
  service: DentalService;
  index: number;
};

export function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-card border border-line bg-surface p-4 shadow-[0_18px_50px_rgb(24_57_48/0.045)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-soft">
      <Link
        href={`/services/${service.slug}`}
        className="flex flex-1 flex-col rounded-[1.65rem] focus-visible:outline-offset-4"
        aria-label={`اعرف المزيد عن ${service.title}`}
      >
        <ServiceVisual index={index} />
        <div className="flex flex-1 flex-col px-2 pb-2 pt-6">
          <h2 className="text-xl font-bold tracking-[-0.025em] text-foreground sm:text-2xl">
            {service.title}
          </h2>
          <p className="mt-3 flex-1 text-sm leading-7 text-muted">{service.description}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-dark">
            اعرف المزيد
            <span className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">
              ←
            </span>
          </span>
        </div>
      </Link>
      <Link
        href={`/booking?service=${service.slug}`}
        className="mx-2 mb-2 mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-brand/20 px-5 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-soft/60"
      >
        احجز موعدًا
      </Link>
    </article>
  );
}
