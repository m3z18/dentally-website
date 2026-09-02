import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";
import { dentalServices } from "@/data/services";
import { getLocale } from "@/lib/i18n";

export async function ServicesPreview() {
  const en = (await getLocale()) === "en";
  const featuredServices = dentalServices.filter((service) => service.featured);
  const additionalServices = dentalServices.filter((service) => !service.featured);

  return (
    <section id="services" className="py-section">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={en ? "Dentally services" : "خدمات دينتالي"}
            title={en ? "Everything your smile needs, in one place." : "كل ما تحتاجه ابتسامتك، في مكان واحد."}
            description={en ? "Integrated dental services in a clear experience that starts by understanding your needs." : "مجموعة متكاملة من خدمات طب الأسنان، ضمن تجربة واضحة تبدأ بفهم احتياجك."}
          />
          <Link
            href="/services"
            className="inline-flex min-h-12 w-fit items-center justify-center rounded-full border border-brand/20 px-6 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft/60"
          >
            {en ? "View all services" : "عرض جميع الخدمات"}
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
          {featuredServices.map((service, index) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className={`group relative min-h-64 overflow-hidden rounded-card border border-line bg-surface p-7 shadow-[0_18px_55px_rgb(25_58_49/0.05)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-soft sm:p-8 ${
                index < 2 ? "lg:col-span-7" : "lg:col-span-5"
              }`}
            >
              <span className="text-xs font-semibold text-brand/65">0{index + 1}</span>
              <div className="mt-16 max-w-md sm:mt-20">
                <h3 className="text-2xl font-bold tracking-[-0.025em] text-foreground">
                  {en ? service.titleEn || service.title : service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">{en ? service.descriptionEn || service.description : service.description}</p>
              </div>
              <span className="absolute end-6 top-6 grid size-11 place-items-center rounded-full bg-brand-soft text-lg text-brand-dark transition-[background-color,color,transform] duration-300 group-hover:-translate-x-1 group-hover:bg-brand group-hover:text-white">
                ←
              </span>
              <span className="absolute -bottom-16 -start-14 size-40 rounded-full border-[18px] border-brand-soft/50 transition-transform duration-500 group-hover:scale-110" />
            </Link>
          ))}
        </div>

        <div id="services-list" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {additionalServices.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-line/90 bg-background px-5 py-4 text-sm font-semibold text-foreground transition-[border-color,background-color] hover:border-brand/20 hover:bg-brand-soft/35"
            >
              {en ? service.titleEn || service.title : service.title}
              <span className="text-brand transition-transform group-hover:-translate-x-1" aria-hidden="true">
                ←
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
