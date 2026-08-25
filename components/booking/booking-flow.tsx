"use client";

import { useMemo, useRef, useState } from "react";

import {
  formatBookingDate,
  generalConsultation,
} from "@/data/booking";
import { dentalServices, getServiceById } from "@/data/services";
import type {
  BookingAvailabilityState,
  BookingDateOption,
  BookingFormData,
  BookingStep,
  BookingSuccess,
  TimeSlot,
} from "@/types/booking";

type BookingFlowProps = {
  initialServiceId: string;
  initialDates: BookingDateOption[];
};

type PatientErrors = Partial<Record<"patientName" | "phone", string>>;

const stepLabels = ["الخدمة", "التاريخ", "الوقت", "بياناتك", "التأكيد"];

const initialBookingData: BookingFormData = {
  serviceId: "",
  date: "",
  time: "",
  patientName: "",
  phone: "",
  notes: "",
};

const primaryButtonClasses =
  "inline-flex min-h-13 cursor-pointer items-center justify-center rounded-full bg-brand px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgb(20_112_91/0.18)] transition-[background-color,transform,opacity] hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

export function BookingFlow({ initialServiceId, initialDates }: BookingFlowProps) {
  const [step, setStep] = useState<BookingStep>(1);
  const [booking, setBooking] = useState<BookingFormData>({
    ...initialBookingData,
    serviceId: initialServiceId,
  });
  const [dateOptions] = useState<BookingDateOption[]>(initialDates);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availabilityState, setAvailabilityState] =
    useState<BookingAvailabilityState>("idle");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [success, setSuccess] = useState<BookingSuccess | null>(null);
  const [errors, setErrors] = useState<PatientErrors>({});
  const flowHeadingRef = useRef<HTMLHeadingElement>(null);

  const selectedService = useMemo(
    () => getServiceById(booking.serviceId),
    [booking.serviceId],
  );
  const selectedTime = timeSlots.find((slot) => slot.value === booking.time);
  const serviceSummary =
    booking.serviceId === generalConsultation.id
      ? generalConsultation.summaryTitle
      : selectedService?.title ?? "لم تُحدد";

  function updateBooking<Key extends keyof BookingFormData>(
    key: Key,
    value: BookingFormData[Key],
  ) {
    setBooking((current) => ({ ...current, [key]: value }));
  }

  function moveToStep(nextStep: BookingStep) {
    setStep(nextStep);
    window.setTimeout(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      flowHeadingRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      flowHeadingRef.current?.focus({ preventScroll: true });
    }, 0);
  }

  function validatePatientDetails() {
    const nextErrors: PatientErrors = {};
    if (booking.patientName.trim().length < 2) {
      nextErrors.patientName = "أدخل الاسم الكامل.";
    }
    if (!/^05\d{8}$/.test(booking.phone)) {
      nextErrors.phone = "أدخل رقمًا سعوديًا بصيغة 05XXXXXXXX.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (step === 1 && booking.serviceId) moveToStep(2);
    if (step === 2 && booking.date) {
      moveToStep(3);
      void loadAvailability(booking.date);
    }
    if (step === 3 && booking.time) moveToStep(4);
    if (step === 4 && validatePatientDetails()) moveToStep(5);
  }

  async function loadAvailability(date: string) {
    setAvailabilityState("loading");
    setAvailabilityMessage("");
    setTimeSlots([]);
    updateBooking("time", "");

    try {
      const response = await fetch(`/api/availability?date=${encodeURIComponent(date)}`, {
        cache: "no-store",
      });
      const result = (await response.json()) as { message?: string; slots?: TimeSlot[] };

      if (!response.ok) {
        setAvailabilityState("error");
        setAvailabilityMessage(result.message ?? "تعذر تحميل المواعيد المتاحة.");
        return;
      }

      setTimeSlots(result.slots ?? []);
      setAvailabilityState("success");
    } catch {
      setAvailabilityState("error");
      setAvailabilityMessage("تعذر الاتصال بخدمة المواعيد. تحقق من اتصالك وحاول مجددًا.");
    }
  }

  async function confirmBooking() {
    setIsSubmitting(true);
    setSubmissionMessage("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      const result = (await response.json()) as {
        code?: string;
        message?: string;
        bookingReference?: string;
        status?: "pending";
      };

      if (response.status === 409 && result.code === "SLOT_UNAVAILABLE") {
        setSubmissionMessage(result.message ?? "لم يعد الموعد متاحًا.");
        moveToStep(3);
        await loadAvailability(booking.date);
        return;
      }

      if (!response.ok || !result.bookingReference) {
        setSubmissionMessage(result.message ?? "تعذر إتمام الحجز الآن. حاول مرة أخرى.");
        return;
      }

      setSuccess({ bookingReference: result.bookingReference, status: "pending" });
      moveToStep(6);
    } catch {
      setSubmissionMessage("تعذر الاتصال بخدمة الحجز. تحقق من اتصالك وحاول مجددًا.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetBooking() {
    setBooking({ ...initialBookingData, serviceId: initialServiceId });
    setTimeSlots([]);
    setAvailabilityState("idle");
    setAvailabilityMessage("");
    setSubmissionMessage("");
    setSuccess(null);
    setErrors({});
    moveToStep(1);
  }

  if (step === 6 && success) {
    return (
      <div className="rounded-[2.5rem] border border-brand/15 bg-surface px-6 py-12 text-center shadow-soft sm:px-10 sm:py-16">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-2xl text-white" aria-hidden="true">✓</span>
        <p className="mt-7 text-sm font-bold text-brand">تم تسجيل الطلب</p>
        <h2 ref={flowHeadingRef} tabIndex={-1} className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
          تم استلام طلب حجزك بنجاح
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-muted">
          تم تسجيل الطلب بحالة بانتظار التأكيد. سيتولى فريق Dentally مراجعة الموعد.
        </p>
        <dl className="mx-auto mt-9 grid max-w-3xl gap-3 rounded-3xl bg-surface-muted p-5 text-start sm:grid-cols-4 sm:p-6">
          <SummaryItem label="رقم الحجز" value={success.bookingReference} ltr />
          <SummaryItem label="الخدمة" value={serviceSummary} />
          <SummaryItem label="التاريخ" value={formatBookingDate(booking.date)} />
          <SummaryItem label="الوقت" value={selectedTime?.label ?? "لم يُحدد"} />
        </dl>
        <p className="mt-5 text-xs font-bold text-brand-dark">الحالة: بانتظار التأكيد</p>
        <button type="button" onClick={resetBooking} className={`${primaryButtonClasses} mt-8 w-full sm:w-auto`}>
          بدء طلب جديد
        </button>
      </div>
    );
  }

  const canContinue =
    (step === 1 && Boolean(booking.serviceId)) ||
    (step === 2 && Boolean(booking.date)) ||
    (step === 3 && Boolean(booking.time)) ||
    step === 4;

  return (
    <div className="rounded-[2rem] border border-line bg-surface p-4 shadow-[0_26px_80px_rgb(22_53_45/0.07)] sm:p-7 lg:p-9">
      <div className="rounded-3xl bg-surface-muted p-4 sm:p-5">
        <ol className="grid grid-cols-5 gap-1" aria-label="خطوات الحجز">
          {stepLabels.map((label, index) => {
            const number = index + 1;
            const isActive = step === number;
            const isComplete = step > number;
            return (
              <li key={label} className="text-center">
                <span
                  className={`mx-auto grid size-9 place-items-center rounded-full text-xs font-bold transition-colors sm:size-10 ${
                    isActive
                      ? "bg-brand text-white"
                      : isComplete
                        ? "bg-brand-soft text-brand-dark"
                        : "border border-line bg-surface text-muted"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isComplete ? "✓" : number}
                </span>
                <span className={`mt-2 hidden text-[11px] font-semibold sm:block ${isActive ? "text-brand-dark" : "text-muted"}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="px-1 pb-2 pt-9 sm:px-2 sm:pt-11">
        {step === 1 && (
          <section key="service" aria-labelledby="booking-step-title">
            <StepHeading
              headingRef={flowHeadingRef}
              eyebrow="الخطوة الأولى"
              title="ما الخدمة التي تبحث عنها؟"
              description="اختر خدمة واحدة، أو ابدأ بكشف واستشارة عامة إن لم تكن متأكدًا."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dentalServices.map((service) => (
                <SelectionButton
                  key={service.id}
                  selected={booking.serviceId === service.id}
                  onClick={() => updateBooking("serviceId", service.id)}
                  title={service.title}
                  description={service.description}
                />
              ))}
              <SelectionButton
                selected={booking.serviceId === generalConsultation.id}
                onClick={() => updateBooking("serviceId", generalConsultation.id)}
                title={generalConsultation.title}
                description="سنبدأ بكشف واستشارة عامة لفهم احتياجك."
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section key="date" aria-labelledby="booking-step-title">
            <StepHeading
              headingRef={flowHeadingRef}
              eyebrow="الخطوة الثانية"
              title="اختر تاريخًا مناسبًا"
              description="اختر يومًا لعرض الأوقات المتاحة فعليًا وفق ساعات العمل والحجوزات الحالية."
            />
            <div className="mt-6 grid grid-cols-3 gap-2 min-[430px]:grid-cols-4 sm:grid-cols-7">
              {dateOptions.length > 0 ? (
                dateOptions.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    disabled={!date.available}
                    onClick={() => updateBooking("date", date.value)}
                    className={`min-h-28 cursor-pointer rounded-2xl border p-3 text-center transition-[border-color,background-color,color,transform] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted/55 disabled:hover:translate-y-0 ${
                      booking.date === date.value
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-white text-foreground hover:border-brand/30"
                    }`}
                    aria-pressed={booking.date === date.value}
                  >
                    <span className="block text-xs font-medium opacity-75">{date.dayName}</span>
                    <span className="mt-2 block text-xl font-bold">{date.dayNumber}</span>
                    <span className="mt-1 block text-[11px] opacity-70">{date.monthName}</span>
                  </button>
                ))
              ) : (
                Array.from({ length: 7 }, (_, index) => (
                  <div key={index} className="min-h-28 animate-pulse rounded-2xl bg-surface-muted" />
                ))
              )}
            </div>
          </section>
        )}

        {step === 3 && (
          <section key="time" aria-labelledby="booking-step-title">
            <StepHeading
              headingRef={flowHeadingRef}
              eyebrow="الخطوة الثالثة"
              title="اختر الوقت"
              description={`التاريخ المختار: ${formatBookingDate(booking.date)}`}
            />
            <div className="mt-6" aria-live="polite">
              {availabilityState === "loading" && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }, (_, index) => (
                    <div key={index} className="min-h-16 animate-pulse rounded-2xl bg-surface-muted" />
                  ))}
                </div>
              )}

              {availabilityState === "error" && (
                <StateMessage message={availabilityMessage}>
                  <button
                    type="button"
                    onClick={() => void loadAvailability(booking.date)}
                    className="mt-4 cursor-pointer text-xs font-bold text-brand hover:text-brand-dark"
                  >
                    إعادة المحاولة
                  </button>
                </StateMessage>
              )}

              {availabilityState === "success" && timeSlots.length === 0 && (
                <StateMessage message="لا توجد أوقات متاحة في هذا اليوم. اختر تاريخًا آخر." />
              )}

              {availabilityState === "success" && timeSlots.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => updateBooking("time", slot.value)}
                      className={`min-h-16 cursor-pointer rounded-2xl border px-4 text-sm font-bold transition-[border-color,background-color,color,transform] hover:-translate-y-0.5 ${
                        booking.time === slot.value
                          ? "border-brand bg-brand text-white"
                          : "border-line bg-white text-foreground hover:border-brand/30"
                      }`}
                      aria-pressed={booking.time === slot.value}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {step === 4 && (
          <section key="patient" aria-labelledby="booking-step-title">
            <StepHeading
              headingRef={flowHeadingRef}
              eyebrow="الخطوة الرابعة"
              title="بيانات التواصل"
              description="نطلب الحد الأدنى من البيانات اللازمة لتجهيز طلب الموعد."
            />
            <form
              className="mt-8 grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleNext();
              }}
              noValidate
            >
              <Field label="الاسم الكامل" error={errors.patientName}>
                <input
                  type="text"
                  value={booking.patientName}
                  onChange={(event) => {
                    updateBooking("patientName", event.target.value);
                    setErrors((current) => ({ ...current, patientName: undefined }));
                  }}
                  autoComplete="name"
                  className="min-h-13 w-full rounded-2xl border border-line bg-background px-4 text-sm outline-none transition-colors focus:border-brand"
                  aria-invalid={Boolean(errors.patientName)}
                  aria-describedby={errors.patientName ? "patient-name-error" : undefined}
                />
              </Field>
              <Field label="رقم الجوال" hint="بالصيغة 05XXXXXXXX" error={errors.phone}>
                <input
                  type="text"
                  name="phone"
                  inputMode="numeric"
                  dir="ltr"
                  maxLength={10}
                  value={booking.phone}
                  onChange={(event) => {
                    updateBooking("phone", event.target.value.replace(/\D/g, ""));
                    setErrors((current) => ({ ...current, phone: undefined }));
                  }}
                  placeholder="05XXXXXXXX"
                  className="min-h-13 w-full rounded-2xl border border-line bg-background px-4 text-start text-sm outline-none transition-colors focus:border-brand"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
              </Field>
              <Field label="ملاحظات" hint="اختياري — تجنب إدخال معلومات طبية حساسة هنا">
                <textarea
                  value={booking.notes}
                  onChange={(event) => updateBooking("notes", event.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-y rounded-2xl border border-line bg-background px-4 py-3 text-sm leading-7 outline-none transition-colors focus:border-brand"
                />
              </Field>
              <button type="submit" className="sr-only">متابعة إلى المراجعة</button>
            </form>
          </section>
        )}

        {step === 5 && (
          <section key="summary" aria-labelledby="booking-step-title">
            <StepHeading
              headingRef={flowHeadingRef}
              eyebrow="الخطوة الخامسة"
              title="راجع طلبك"
              description="تأكد من البيانات قبل إرسال طلب الحجز إلى Dentally."
            />
            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              <SummaryItem label="الخدمة" value={serviceSummary} />
              <SummaryItem label="التاريخ" value={formatBookingDate(booking.date)} />
              <SummaryItem label="الوقت" value={selectedTime?.label ?? "لم يُحدد"} />
              <SummaryItem label="الاسم" value={booking.patientName} />
              <SummaryItem label="رقم الجوال" value={booking.phone} ltr />
              <SummaryItem label="الملاحظات" value={booking.notes || "لا توجد ملاحظات"} />
            </dl>
            {submissionMessage && (
              <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-xs leading-6 text-red-800" role="alert">
                {submissionMessage}
              </p>
            )}
          </section>
        )}

        <div className="sticky bottom-3 z-10 mt-10 flex flex-wrap gap-3 rounded-3xl border border-line bg-surface/95 p-3 shadow-[0_14px_40px_rgb(22_53_45/0.1)] backdrop-blur sm:static sm:flex-nowrap sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          {step > 1 && (
            <button
              type="button"
              onClick={() => moveToStep((step - 1) as BookingStep)}
              className="inline-flex min-h-13 flex-1 cursor-pointer items-center justify-center rounded-full border border-line px-6 text-sm font-bold text-foreground transition-colors hover:border-brand/30 hover:bg-brand-soft/35 sm:flex-none"
            >
              رجوع
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleNext}
              className={`${primaryButtonClasses} flex-[1.4] sm:flex-none`}
            >
              متابعة
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => moveToStep(1)}
                className="inline-flex min-h-13 flex-1 cursor-pointer items-center justify-center rounded-full border border-line px-6 text-sm font-bold text-foreground transition-colors hover:bg-surface-muted sm:flex-none"
              >
                تعديل
              </button>
              <button
                type="button"
                onClick={() => void confirmBooking()}
                disabled={isSubmitting}
                className={`${primaryButtonClasses} basis-full sm:basis-auto`}
              >
                {isSubmitting ? "جارٍ إرسال الطلب..." : "تأكيد الحجز"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type StepHeadingProps = {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  eyebrow: string;
  title: string;
  description: string;
};

function StepHeading({ headingRef, eyebrow, title, description }: StepHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold text-brand">{eyebrow}</p>
      <h2
        id="booking-step-title"
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 text-2xl font-bold tracking-[-0.035em] text-foreground outline-none sm:text-3xl"
      >
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}

type SelectionButtonProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
};

function SelectionButton({ selected, onClick, title, description }: SelectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-36 cursor-pointer rounded-3xl border p-5 text-start transition-[border-color,background-color,transform] hover:-translate-y-0.5 ${
        selected ? "border-brand bg-brand-soft/70" : "border-line bg-white hover:border-brand/30"
      }`}
    >
      <span className="flex items-start justify-between gap-4">
        <span className="text-base font-bold text-foreground">{title}</span>
        <span className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs ${selected ? "border-brand bg-brand text-white" : "border-line text-transparent"}`} aria-hidden="true">
          ✓
        </span>
      </span>
      <span className="mt-3 block text-xs leading-6 text-muted">{description}</span>
    </button>
  );
}

function StateMessage({ children, message }: { children?: React.ReactNode; message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-surface-muted px-5 py-10 text-center">
      <p className="text-sm leading-7 text-muted">{message}</p>
      {children}
    </div>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, hint, error, children }: FieldProps) {
  const errorId = label === "الاسم الكامل" ? "patient-name-error" : "phone-error";
  return (
    <label className="grid gap-2 text-sm font-bold text-foreground">
      <span>
        {label}
        {hint && <span className="ms-2 text-xs font-normal text-muted">{hint}</span>}
      </span>
      {children}
      {error && <span id={errorId} className="text-xs font-medium text-red-700">{error}</span>}
    </label>
  );
}

function SummaryItem({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-white p-4">
      <dt className="text-[11px] font-bold text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-bold leading-6 text-foreground" dir={ltr ? "ltr" : undefined}>{value}</dd>
    </div>
  );
}
