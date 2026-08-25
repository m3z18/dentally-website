import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";

const trustItems = [
  { value: "4.3", label: "تقييم Google" },
  { value: "+390", label: "مراجعة" },
  { value: "2015", label: "منذ" },
];

export function HeroSection() {
  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-line/70">
      <div className="hero-grid absolute inset-x-0 top-0 -z-20 h-[85%]" aria-hidden="true" />
      <div
        className="absolute -end-24 top-16 -z-10 size-80 rounded-full bg-brand-soft/70 blur-3xl sm:size-[30rem]"
        aria-hidden="true"
      />

      <Container className="grid min-h-[calc(100svh-5rem)] items-center gap-12 pb-10 pt-14 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-14 lg:pt-16">
        <div className="motion-enter max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-surface/75 px-4 py-2 text-xs font-semibold text-brand-dark backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            مجمع دينتالي لطب الأسنان
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.22] tracking-[-0.045em] text-foreground sm:text-5xl sm:leading-[1.18] lg:text-[3.75rem] xl:text-[4.35rem]">
            ابتسامتك تستحق
            <span className="block text-brand">عناية استثنائية.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg sm:leading-9">
            رعاية متكاملة لصحة وجمال ابتسامتك في مجمع دينتالي لطب الأسنان، ضمن بيئة
            حديثة وتجربة تهتم بالمريض من أول زيارة.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-white shadow-[0_16px_36px_rgb(20_112_91/0.2)] transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_20px_40px_rgb(20_112_91/0.25)]"
            >
              احجز موعدك
            </Link>
            <Link
              href="/services"
              className="inline-flex min-h-13 items-center justify-center rounded-full border border-line bg-surface/80 px-7 text-sm font-semibold text-foreground backdrop-blur-sm transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:bg-brand-soft/45"
            >
              استكشف خدماتنا
            </Link>
          </div>
        </div>

        <div className="motion-enter motion-delay-1 mx-auto w-full max-w-xl lg:ms-auto" aria-hidden="true">
          <div className="relative min-h-[24rem] overflow-hidden rounded-[2.5rem] border border-white/80 bg-[linear-gradient(145deg,#ffffff_0%,#edf5f1_52%,#d8ebe4_100%)] shadow-[0_35px_100px_rgb(24_70_57/0.12)] sm:min-h-[31rem]">
            <div className="absolute inset-6 rounded-[2rem] border border-brand/10 sm:inset-9" />
            <div className="soft-float absolute -end-[15%] -top-[17%] size-[68%] rounded-full border border-brand/15" />
            <div className="soft-float absolute -end-[5%] -top-[7%] size-[50%] rounded-full border border-brand/20" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative h-28 w-64 overflow-hidden rounded-[2rem] border border-white/90 bg-white/90 shadow-[0_30px_70px_rgb(11_82_66/0.14)] sm:h-36 sm:w-80">
                <Image
                  src="/brand/dentally-logo-transparent.png"
                  alt=""
                  fill
                  sizes="(min-width: 640px) 320px, 256px"
                  loading="eager"
                  className="object-cover object-center"
                />
              </div>
            </div>
            <div className="absolute bottom-8 end-8 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-soft backdrop-blur-md sm:bottom-10 sm:end-10">
              <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-muted">DENTALLY</p>
              <p className="mt-1 text-sm font-bold text-brand-dark">عناية تبدأ بك</p>
            </div>
            <div className="absolute bottom-[28%] start-[9%] size-3 rounded-full bg-brand/25" />
            <div className="absolute bottom-[20%] start-[18%] size-2 rounded-full bg-brand" />
          </div>
        </div>

        <div className="motion-enter motion-delay-2 lg:col-span-2">
          <dl className="grid grid-cols-3 overflow-hidden rounded-3xl border border-line/80 bg-surface/75 shadow-[0_16px_50px_rgb(25_58_49/0.06)] backdrop-blur-md">
            {trustItems.map((item, index) => (
              <div
                key={item.label}
                className={`px-3 py-5 text-center sm:px-7 sm:py-6 ${
                  index > 0 ? "border-s border-line/80" : ""
                }`}
              >
                <dt className="text-xs text-muted sm:text-sm">{item.label}</dt>
                <dd className="mt-1 text-xl font-bold tracking-[-0.03em] text-brand-dark sm:text-2xl">
                  <span dir="ltr">{item.value}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
