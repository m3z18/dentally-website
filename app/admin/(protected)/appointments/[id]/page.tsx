import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppointmentEditor } from "@/components/admin/appointment-editor";
import { AdminDate, AdminDateTime, AdminTime } from "@/components/admin/date-time-display";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentWithService } from "@/types/admin";

export default async function AdminAppointmentDetailPage({ params }: PageProps<"/admin/appointments/[id]">) {
  await requireAdmin();
  const { id } = await params;
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
      <Link href="/admin/appointments" className="text-xs font-bold text-brand hover:text-brand-dark">← العودة إلى المواعيد</Link>
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
          <h2 className="text-lg font-bold text-foreground">بيانات الحجز</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Detail label="اسم المريض" value={appointment.patient_name} />
            <Detail label="رقم الجوال" value={appointment.patient_phone} ltr />
            <Detail label="الخدمة" value={appointment.services?.name_ar ?? "خدمة غير متاحة"} />
            <Detail label="رقم الحجز" value={appointment.booking_reference} ltr />
            <Detail label="التاريخ" value={<AdminDate value={appointment.appointment_date} includeWeekday />} />
            <Detail label="الوقت" value={<AdminTime value={appointment.appointment_time} />} />
            <div className="rounded-2xl bg-surface-muted p-4 sm:col-span-2">
              <dt className="text-xs font-bold text-muted">الملاحظات</dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">{appointment.notes || "لا توجد ملاحظات"}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-card border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-bold text-foreground">تحديث الموعد</h2>
          <p className="mt-2 text-xs leading-6 text-muted">لن يقبل النظام وقتًا محجوزًا أو مغلقًا أو خارج ساعات العمل.</p>
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
