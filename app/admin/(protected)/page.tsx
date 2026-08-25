import Link from "next/link";

import { AdminDate, AdminDateTime, AdminTime } from "@/components/admin/date-time-display";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { WeeklyCalendar } from "@/components/admin/weekly-calendar";
import { requireAdmin } from "@/lib/auth/admin";
import { addDaysToDate, getRiyadhDateValue, getRiyadhWeekRange } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentWithService } from "@/types/admin";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();
  const today = getRiyadhDateValue();
  const tomorrow = addDaysToDate(today, 1);
  const week = getRiyadhWeekRange();

  const [todayCount, pendingCount, confirmedCount, cancelledCount, weekCount, weekAppointments, upcomingResult] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("appointment_date", today).neq("status", "cancelled"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).gte("appointment_date", today).eq("status", "pending"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).gte("appointment_date", today).eq("status", "confirmed"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).gte("appointment_date", week.start).lte("appointment_date", week.end).eq("status", "cancelled"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).gte("appointment_date", week.start).lte("appointment_date", week.end).neq("status", "cancelled"),
    supabase.from("appointments").select("*, services(name_ar, slug)").gte("appointment_date", week.start).lte("appointment_date", week.end).order("appointment_date").order("appointment_time"),
    supabase.from("appointments").select("*, services(name_ar, slug)").gte("appointment_date", tomorrow).in("status", ["pending", "confirmed"]).order("appointment_date").order("appointment_time").limit(5),
  ]);

  const hasError = [todayCount, pendingCount, confirmedCount, cancelledCount, weekCount, weekAppointments, upcomingResult].some((result) => result.error);
  const calendarAppointments = (weekAppointments.data ?? []) as AppointmentWithService[];
  const upcomingAppointments = (upcomingResult.data ?? []) as AppointmentWithService[];
  const todayAppointments = calendarAppointments.filter((item) => item.appointment_date === today && item.status !== "cancelled");
  const metrics = [
    { label: "مواعيد اليوم", value: todayCount.count ?? 0, hint: "باستثناء الملغاة" },
    { label: "بانتظار التأكيد", value: pendingCount.count ?? 0, hint: "من اليوم فصاعدًا" },
    { label: "المواعيد المؤكدة", value: confirmedCount.count ?? 0, hint: "من اليوم فصاعدًا" },
    { label: "الملغاة هذا الأسبوع", value: cancelledCount.count ?? 0, hint: "السجل محفوظ" },
    { label: "مواعيد هذا الأسبوع", value: weekCount.count ?? 0, hint: "باستثناء الملغاة" },
  ];

  return (
    <>
      <AdminPageHeader eyebrow="Dentally Admin" title="نظرة عامة" description="ملخص حي للحجوزات وجدول الأسبوع الحالي." />
      {hasError && <p className="mt-7 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">تعذر تحميل بعض بيانات اللوحة الآن.</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-3xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold text-muted">{metric.label}</p>
            <p className="mt-4 text-3xl font-bold text-foreground">{metric.value}</p>
            <p className="mt-2 text-[11px] text-muted/80">{metric.hint}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">مواعيد اليوم</h2>
              <AdminDate value={today} includeWeekday className="mt-1 block text-xs text-muted" />
            </div>
            <Link href="/admin/appointments?scope=today" className="text-xs font-bold text-brand">عرض الكل</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {todayAppointments.length > 0 ? todayAppointments.map((appointment) => (
              <Link key={appointment.id} href={`/admin/appointments/${appointment.id}`} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-brand/25 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{appointment.patient_name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <span>{appointment.services?.name_ar}</span>
                    <span aria-hidden="true">—</span>
                    <AdminTime value={appointment.appointment_time} />
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </Link>
            )) : <p className="rounded-3xl border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-muted">لا توجد مواعيد مسجلة لليوم.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">المواعيد القادمة</h2>
              <p className="mt-1 text-xs text-muted">أقرب خمسة مواعيد بعد اليوم</p>
            </div>
            <Link href="/admin/appointments?scope=upcoming" className="text-xs font-bold text-brand">عرض الكل</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment) => (
              <Link key={appointment.id} href={`/admin/appointments/${appointment.id}`} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-brand/25 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{appointment.patient_name}</p>
                  <AdminDateTime date={appointment.appointment_date} time={appointment.appointment_time} includeWeekday className="mt-1 block text-xs text-muted" />
                </div>
                <StatusBadge status={appointment.status} />
              </Link>
            )) : <p className="rounded-3xl border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-muted">لا توجد مواعيد قادمة.</p>}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">العرض الأسبوعي</h2>
        <div className="mt-5"><WeeklyCalendar appointments={calendarAppointments} weekStart={week.start} today={today} /></div>
      </section>
    </>
  );
}
