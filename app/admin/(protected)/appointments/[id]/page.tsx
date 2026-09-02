import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppointmentEditor } from "@/components/admin/appointment-editor";
import { AdminDate, AdminDateTime, AdminTime } from "@/components/admin/date-time-display";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { getLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentWithService } from "@/types/admin";

export default async function AdminAppointmentDetailPage({ params }: PageProps<"/admin/appointments/[id]">) {
  const [, { id }, locale] = await Promise.all([requireAdmin(), params, getLocale()]);
  const t = (arabic: string, english: string) => locale === "ar" ? arabic : english;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, services(name_ar, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const appointment = data as AppointmentWithService;

  return (
    <>
      <Link href="/admin/appointments" className="text-xs font-bold text-brand hover:text-brand-dark">← {t("العودة إلى المواعيد", "Back to appointments")}</Link>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          eyebrow={appointment.booking_reference}
          title="تفاصيل الموعد"
          description={<AdminDateTime date={appointment.appointment_date} time={appointment.appointment_time} includeWeekday />}
        />
        <StatusBadge status={appointment.status} />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-card border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-bold text-foreground">{t("بيانات الحجز", "Booking details")}</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Detail label={t("اسم المريض", "Patient name")} value={<span data-admin-content>{appointment.patient_name}</span>} />
            <Detail label={t("رقم الجوال", "Mobile number")} value={<span data-admin-content>{appointment.patient_phone}</span>} ltr />
            <Detail label={t("الخدمة", "Service")} value={appointment.services?.name_ar ? <span data-admin-content>{appointment.services.name_ar}</span> : t("خدمة غير متاحة", "Service unavailable")} />
            <Detail label={t("رقم الحجز", "Booking reference")} value={<span data-admin-content>{appointment.booking_reference}</span>} ltr />
            <Detail label={t("التاريخ", "Date")} value={<AdminDate value={appointment.appointment_date} includeWeekday />} />
            <Detail label={t("الوقت", "Time")} value={<AdminTime value={appointment.appointment_time} />} />
            <div className="rounded-2xl bg-surface-muted p-4 sm:col-span-2">
              <dt className="text-xs font-bold text-muted">{t("الملاحظات", "Notes")}</dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">{appointment.notes ? <span data-admin-content>{appointment.notes}</span> : t("لا توجد ملاحظات", "No notes")}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-card border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-bold text-foreground">{t("تحديث الموعد", "Update appointment")}</h2>
          <p className="mt-2 text-xs leading-6 text-muted">{t("لن يقبل النظام وقتًا محجوزًا أو مغلقًا أو خارج ساعات العمل.", "The system will reject booked, blocked, or out-of-hours times.")}</p>
          <div className="mt-6">
            <AppointmentEditor appointmentId={appointment.id} date={appointment.appointment_date} time={appointment.appointment_time} status={appointment.status} />
          </div>
        </section>
      </div>
    </>
  );
}

function Detail({ label, value, ltr = false }: { label: string; value: ReactNode; ltr?: boolean }) {
  return (
    <div className="rounded-2xl bg-surface-muted p-4">
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-bold text-foreground" dir={ltr ? "ltr" : undefined}>{value}</dd>
    </div>
  );
}
