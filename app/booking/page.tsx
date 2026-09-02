import type { Metadata } from "next";

import { BookingFlow } from "@/components/booking/booking-flow";
import { Container } from "@/components/ui/container";
import { createBookingDates, resolveBookingServiceId } from "@/data/booking";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "طلب موعد",
  description: "طلب موعد في مجمع دينتالي لطب الأسنان.",
  robots: {
    index: false,
    follow: false,
  },
};

type BookingPageProps = {
  searchParams: Promise<{ service?: string | string[] }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const query = await searchParams;
  const requestedService = Array.isArray(query.service) ? query.service[0] : query.service;
  const initialServiceId = resolveBookingServiceId(requestedService);
  const locale = await getLocale(); const en = locale === "en";

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 h-[34rem] opacity-50" aria-hidden="true" />
      <Container className="relative">
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <p className="text-sm font-bold text-brand">{en ? "Appointment request" : "طلب موعد"}</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-foreground sm:text-5xl">
            {en ? "Request your appointment in clear steps." : "ابدأ طلب موعدك بخطوات واضحة."}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-muted sm:text-base">
            {en ? "Choose a service, date, and time, then submit your request for the Dentally team to review and confirm." : "اختر الخدمة والتاريخ والوقت المناسب، ثم أرسل طلبك ليقوم فريق Dentally بمراجعته وتأكيده."}
          </p>
        </div>
        <div className="mx-auto max-w-6xl">
          <BookingFlow
            initialServiceId={initialServiceId}
            initialDates={createBookingDates(new Date(), locale)}
            locale={locale}
          />
        </div>
      </Container>
    </section>
  );
}
