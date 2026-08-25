import Link from "next/link";

import { Container } from "@/components/ui/container";

export function BookingCta() {
  return (
    <section className="px-page py-4 sm:py-8">
      <div className="relative mx-auto max-w-[90rem] overflow-hidden rounded-[2.5rem] bg-brand text-white shadow-[0_30px_90px_rgb(20_112_91/0.2)]">
        <div className="absolute -start-32 -top-48 size-[30rem] rounded-full border border-white/15" aria-hidden="true" />
        <div className="absolute -bottom-52 -end-24 size-[32rem] rounded-full border-[60px] border-white/5" aria-hidden="true" />
        <Container className="relative flex flex-col items-start gap-8 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-[0.1em] text-white/65">خطوتك التالية</p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.3] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              جاهز تهتم بابتسامتك؟
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">
              احجز موعدك في Dentally خلال دقائق.
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center lg:shrink-0">
            <Link
              href="/booking"
              className="inline-flex min-h-13 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-7 py-3 text-center text-sm font-bold leading-none text-brand-dark shadow-[0_12px_28px_rgb(7_55_44/0.16)] transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-brand-soft hover:shadow-[0_16px_32px_rgb(7_55_44/0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
            >
              احجز موعدك
            </Link>
            <Link
              href="#contact"
              className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/30 px-7 text-sm font-semibold text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              تواصل معنا
            </Link>
          </div>
        </Container>
      </div>
    </section>
  );
}
