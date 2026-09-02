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
import type { Locale } from "@/lib/locale";

type BookingFlowProps = {
  initialServiceId: string;
  initialDates: BookingDateOption[];
  locale: Locale;
};

type PatientErrors = Partial<Record<"patientName" | "phone", string>>;

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

function calendarDate(date:string,time:string){return `${date.replaceAll("-","")}T${time.replace(":","")}00`;}
function escapeIcs(value:string){return value.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");}

export function BookingFlow({ initialServiceId, initialDates, locale }: BookingFlowProps) {
  const en = locale === "en";
  const t = (arabic: string, english: string) => en ? english : arabic;
  const stepLabels = en ? ["Service", "Date", "Time", "Your details", "Confirm"] : ["الخدمة", "التاريخ", "الوقت", "بياناتك", "التأكيد"];
  const displayTime = (slot: TimeSlot | undefined) => {
    if (!slot) return t("لم يُحدد", "Not selected");
    if (!en) return slot.label;
    const [hours, minutes] = slot.value.split(":").map(Number);
    return new Intl.DateTimeFormat("en-SA", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date(Date.UTC(2020, 0, 1, hours, minutes)));
  };
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
      ? t(generalConsultation.summaryTitle, "General consultation")
      : selectedService ? (en ? selectedService.titleEn || selectedService.title : selectedService.title) : t("لم تُحدد", "Not selected");
  function downloadCalendar(){const start=calendarDate(booking.date,booking.time);const title=t(`طلب موعد - ${serviceSummary}`,`Appointment request - ${serviceSummary}`);const content=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Dentally//Booking Request//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${escapeIcs(success?.bookingReference??crypto.randomUUID())}@dentally`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}`,`DTSTART;TZID=Asia/Riyadh:${start}`,`SUMMARY:${escapeIcs(title)}`,`DESCRIPTION:${escapeIcs(t("طلب موعد بانتظار تأكيد المجمع.","Appointment request pending clinic confirmation."))}`,"STATUS:TENTATIVE","END:VEVENT","END:VCALENDAR"].join("\r\n");const url=URL.createObjectURL(new Blob([content],{type:"text/calendar;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download=`dentally-${success?.bookingReference??"appointment"}.ics`;link.click();URL.revokeObjectURL(url);}

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
      nextErrors.patientName = t("أدخل الاسم الكامل.", "Enter your full name.");
    }
    if (!/^05\d{8}$/.test(booking.phone)) {
      nextErrors.phone = t("أدخل رقمًا سعوديًا بصيغة 05XXXXXXXX.", "Enter a Saudi mobile number in the format 05XXXXXXXX.");
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
        setAvailabilityMessage(en ? "Unable to load available times." : result.message ?? "تعذر تحميل المواعيد المتاحة.");
        return;
      }

      setTimeSlots(result.slots ?? []);
      setAvailabilityState("success");
    } catch {
      setAvailabilityState("error");
      setAvailabilityMessage(t("تعذر الاتصال بخدمة المواعيد. تحقق من اتصالك وحاول مجددًا.", "Unable to reach the appointment service. Check your connection and try again."));
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
        setSubmissionMessage(en ? "This time is no longer available." : result.message ?? "لم يعد الموعد متاحًا.");
        moveToStep(3);
        await loadAvailability(booking.date);
        return;
      }

      if (!response.ok || !result.bookingReference) {
        setSubmissionMessage(en ? "Unable to complete the request. Please try again." : result.message ?? "تعذر إتمام الحجز الآن. حاول مرة أخرى.");
        return;
      }

      setSuccess({ bookingReference: result.bookingReference, status: "pending" });
      moveToStep(6);
    } catch {
      setSubmissionMessage(t("تعذر الاتصال بخدمة الحجز. تحقق من اتصالك وحاول مجددًا.", "Unable to reach the booking service. Check your connection and try again."));
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
        <p className="mt-7 text-sm font-bold text-brand">{t("تم تسجيل الطلب", "Request received")}</p>
        <h2 ref={flowHeadingRef} tabIndex={-1} className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
          {t("تم استلام طلب حجزك بنجاح", "Your appointment request was received")}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-muted">
          {t("تم تسجيل الطلب بحالة بانتظار التأكيد. سيتولى فريق Dentally مراجعة الموعد.", "Your request is pending confirmation. The Dentally team will review the appointment.")}
        </p>
        <dl className="mx-auto mt-9 grid max-w-3xl gap-3 rounded-3xl bg-surface-muted p-5 text-start sm:grid-cols-4 sm:p-6">
          <SummaryItem label={t("رقم الحجز", "Booking reference")} value={success.bookingReference} ltr />
          <SummaryItem label={t("الخدمة", "Service")} value={serviceSummary} />
          <SummaryItem label={t("التاريخ", "Date")} value={formatBookingDate(booking.date, locale)} />
          <SummaryItem label={t("الوقت", "Time")} value={displayTime(selectedTime)} />
        </dl>
        <p className="mt-5 text-xs font-bold text-brand-dark">{t("الحالة: بانتظار التأكيد", "Status: pending confirmation")}</p>
        <button type="button" onClick={downloadCalendar} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-brand/20 px-5 text-xs font-bold text-brand-dark">{t("تنزيل ملف تقويم (.ics)","Download calendar file (.ics)")}</button>
        <p className="mt-3 text-[11px] text-muted">{t("تذكير مبدئي يمكن فتحه في Apple أو Outlook أو استيراده إلى Google Calendar؛ الموعد لا يزال بانتظار التأكيد.","A tentative reminder for Apple or Outlook, or manual import into Google Calendar; the appointment is still pending confirmation.")}</p>
        <button type="button" onClick={resetBooking} className={`${primaryButtonClasses} mt-8 w-full sm:w-auto`}>
          {t("بدء طلب جديد", "Start a new request")}
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
        <ol className="grid grid-cols-5 gap-1" aria-label={t("خطوات الحجز", "Booking steps")}>
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
              eyebrow={t("الخطوة الأولى", "Step one")}
              title={t("ما الخدمة التي تبحث عنها؟", "Which service are you looking for?")}
              description={t("اختر خدمة واحدة، أو ابدأ بكشف واستشارة عامة إن لم تكن متأكدًا.", "Choose one service, or start with a general consultation if you are unsure.")}
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-labelledby="booking-step-title">
              {dentalServices.map((service) => (
                <SelectionButton
                  key={service.id}
                  selected={booking.serviceId === service.id}
                  onClick={() => updateBooking("serviceId", service.id)}
                  title={en ? service.titleEn || service.title : service.title}
                  description={en ? service.descriptionEn || service.description : service.description}
                />
              ))}
              <SelectionButton
                selected={booking.serviceId === generalConsultation.id}
                onClick={() => updateBooking("serviceId", generalConsultation.id)}
                title={t(generalConsultation.title, "I am not sure which service I need")}
                description={t("سنبدأ بكشف واستشارة عامة لفهم احتياجك.", "We will begin with a general consultation to understand your needs.")}
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section key="date" aria-labelledby="booking-step-title">
            <StepHeading
              headingRef={flowHeadingRef}
              eyebrow={t("الخطوة الثانية", "Step two")}
              title={t("اختر تاريخًا مناسبًا", "Choose a suitable date")}
              description={t("اختر يومًا لعرض الأوقات المتاحة فعليًا وفق ساعات العمل والحجوزات الحالية.", "Choose a day to view currently available times based on working hours and existing bookings.")}
            />
            <div className="mt-6 grid grid-cols-3 gap-2 min-[430px]:grid-cols-4 sm:grid-cols-7" role="radiogroup" aria-labelledby="booking-step-title">
              {dateOptions.length > 0 ? (
                dateOptions.map((date) => (
                  <label
                    key={date.value}
                    aria-disabled={!date.available}
                    className={`group relative min-h-32 rounded-2xl border p-3 text-center transition-[border-color,background-color,color,box-shadow,transform] focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-background ${
                      !date.available
                        ? "cursor-not-allowed border-line/70 bg-surface-muted text-muted opacity-75"
                        : booking.date === date.value
                          ? "cursor-pointer border-brand bg-brand text-white shadow-[0_10px_26px_rgb(20_112_91/0.2)] ring-1 ring-brand/35"
                          : "cursor-pointer border-line bg-surface text-foreground hover:-translate-y-0.5 hover:border-brand/50 hover:bg-surface-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="booking-date"
                      value={date.value}
                      checked={booking.date === date.value}
                      disabled={!date.available}
                      onChange={() => updateBooking("date", date.value)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                      {date.dayName}
                      {booking.date === date.value && <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[11px]" aria-hidden="true">✓</span>}
                    </span>
                    <span className="mt-2 block text-2xl font-bold leading-none">{date.dayNumber}</span>
                    <span className="mt-2 block text-[11px] font-medium opacity-80">{date.monthName}</span>
                    {!date.available && <span className="mt-2 block text-[10px] font-bold text-muted">{t("غير متاح", "Unavailable")}</span>}
                  </label>
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
              eyebrow={t("الخطوة الثالثة", "Step three")}
              title={t("اختر الوقت", "Choose a time")}
              description={`${t("التاريخ المختار", "Selected date")}: ${formatBookingDate(booking.date, locale)}`}
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
                    {t("إعادة المحاولة", "Try again")}
                  </button>
                </StateMessage>
              )}

              {availabilityState === "success" && timeSlots.length === 0 && (
                <StateMessage message={t("لا توجد أوقات متاحة في هذا اليوم. اختر تاريخًا آخر.", "No times are available on this day. Choose another date.")} />
              )}

              {availabilityState === "success" && timeSlots.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-labelledby="booking-step-title">
                  {timeSlots.map((slot) => (
                    <label
                      key={slot.value}
                      className={`group grid min-h-16 cursor-pointer grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border px-4 text-sm font-bold transition-[border-color,background-color,color,box-shadow,transform] hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-background ${
                        booking.time === slot.value
                          ? "border-brand bg-brand text-white shadow-[0_10px_26px_rgb(20_112_91/0.2)] ring-1 ring-brand/35"
                          : "border-line bg-surface text-foreground hover:border-brand/50 hover:bg-surface-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="booking-time"
                        value={slot.value}
                        checked={booking.time === slot.value}
                        onChange={() => updateBooking("time", slot.value)}
                        className="sr-only"
                      />
                      <span>{displayTime(slot)}</span>
                      <span className={`grid size-6 place-items-center rounded-full border-2 text-xs transition-colors ${booking.time === slot.value ? "border-white/70 bg-white/20 text-white" : "border-line bg-surface-muted text-transparent group-hover:border-brand/60"}`} aria-hidden="true">✓</span>
                    </label>
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
              eyebrow={t("الخطوة الرابعة", "Step four")}
              title={t("بيانات التواصل", "Contact details")}
              description={t("نطلب الحد الأدنى من البيانات اللازمة لتجهيز طلب الموعد.", "We request only the minimum information needed for your appointment request.")}
            />
            <form
              className="mt-8 grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleNext();
              }}
              noValidate
            >
              <Field label={t("الاسم الكامل", "Full name")} error={errors.patientName}>
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
              <Field label={t("رقم الجوال", "Mobile number")} hint={t("بالصيغة 05XXXXXXXX", "Format: 05XXXXXXXX")} error={errors.phone}>
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
              <Field label={t("ملاحظات", "Notes")} hint={t("اختياري — تجنب إدخال معلومات طبية حساسة هنا", "Optional — do not enter sensitive medical information here")}>
                <textarea
                  value={booking.notes}
                  onChange={(event) => updateBooking("notes", event.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-y rounded-2xl border border-line bg-background px-4 py-3 text-sm leading-7 outline-none transition-colors focus:border-brand"
                />
              </Field>
              <button type="submit" className="sr-only">{t("متابعة إلى المراجعة", "Continue to review")}</button>
            </form>
          </section>
        )}

        {step === 5 && (
          <section key="summary" aria-labelledby="booking-step-title">
            <StepHeading
              headingRef={flowHeadingRef}
              eyebrow={t("الخطوة الخامسة", "Step five")}
              title={t("راجع طلبك", "Review your request")}
              description={t("تأكد من البيانات قبل إرسال طلب الحجز إلى Dentally.", "Check your details before sending the appointment request to Dentally.")}
            />
            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              <SummaryItem label={t("الخدمة", "Service")} value={serviceSummary} />
              <SummaryItem label={t("التاريخ", "Date")} value={formatBookingDate(booking.date, locale)} />
              <SummaryItem label={t("الوقت", "Time")} value={displayTime(selectedTime)} />
              <SummaryItem label={t("الاسم", "Name")} value={booking.patientName} />
              <SummaryItem label={t("رقم الجوال", "Mobile number")} value={booking.phone} ltr />
              <SummaryItem label={t("الملاحظات", "Notes")} value={booking.notes || t("لا توجد ملاحظات", "No notes")} />
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
              {t("رجوع", "Back")}
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleNext}
              className={`${primaryButtonClasses} flex-[1.4] sm:flex-none`}
            >
              {t("متابعة", "Continue")}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => moveToStep(1)}
                className="inline-flex min-h-13 flex-1 cursor-pointer items-center justify-center rounded-full border border-line px-6 text-sm font-bold text-foreground transition-colors hover:bg-surface-muted sm:flex-none"
              >
                {t("تعديل", "Edit")}
              </button>
              <button
                type="button"
                onClick={() => void confirmBooking()}
                disabled={isSubmitting}
                className={`${primaryButtonClasses} basis-full sm:basis-auto`}
              >
                {isSubmitting ? t("جارٍ إرسال الطلب...", "Sending request...") : t("تأكيد الحجز", "Confirm request")}
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
    <label
      className={`group relative min-h-36 cursor-pointer rounded-3xl border p-5 text-start shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-background ${
        selected
          ? "border-brand bg-brand-soft/70 shadow-[0_12px_30px_rgb(20_112_91/0.14)] ring-1 ring-brand/30"
          : "border-line bg-surface hover:border-brand/50 hover:bg-surface-muted"
      }`}
    >
      <input
        type="radio"
        name="booking-service"
        checked={selected}
        onChange={onClick}
        className="sr-only"
      />
      <span className="flex items-start justify-between gap-4">
        <span className={`text-base font-bold ${selected ? "text-brand-dark" : "text-foreground"}`}>{title}</span>
        <span className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-sm font-black transition-colors ${selected ? "border-brand bg-brand text-white" : "border-line bg-surface-muted text-transparent group-hover:border-brand/60"}`} aria-hidden="true">
          ✓
        </span>
      </span>
      <span className={`mt-3 block text-xs leading-6 ${selected ? "text-foreground/80" : "text-muted"}`}>{description}</span>
    </label>
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
  const errorId = label === "الاسم الكامل" || label === "Full name" ? "patient-name-error" : "phone-error";
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
    <div className="rounded-2xl border border-line/80 bg-surface p-4">
      <dt className="text-[11px] font-bold text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-bold leading-6 text-foreground" dir={ltr ? "ltr" : undefined}>{value}</dd>
    </div>
  );
}
