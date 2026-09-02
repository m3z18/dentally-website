import Link from "next/link";

import { AdminDate, AdminDateTime, AdminTime } from "@/components/admin/date-time-display";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { WeeklyCalendar } from "@/components/admin/weekly-calendar";
import { requireAdmin } from "@/lib/auth/admin";
import { addDaysToDate, getRiyadhDateValue, getRiyadhWeekRange } from "@/lib/date";
import { getLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentWithService } from "@/types/admin";

export default async function AdminDashboardPage() {
  const [profile, locale] = await Promise.all([requireAdmin(), getLocale()]);
  const t = (arabic: string, english: string) => locale === "ar" ? arabic : english;
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
  const canManageContent = profile.role === "admin" || profile.role === "manager";
  const contentCounts = canManageContent ? await Promise.all([
    supabase.from("doctors").select("id",{count:"exact",head:true}).is("deleted_at",null),
    supabase.from("articles").select("id",{count:"exact",head:true}).eq("is_active",true).is("deleted_at",null),
    supabase.from("articles").select("id",{count:"exact",head:true}).eq("is_active",false).is("deleted_at",null),
    supabase.from("articles").select("id",{count:"exact",head:true}).not("scheduled_publish_at","is",null).is("deleted_at",null),
    supabase.from("faq_items").select("id",{count:"exact",head:true}).is("deleted_at",null),
    supabase.from("gallery_items").select("id",{count:"exact",head:true}).is("deleted_at",null),
  ]) : [];
  const todayAppointments = calendarAppointments.filter((item) => item.appointment_date === today && item.status !== "cancelled");
  const metrics = [
    { label: t("مواعيد اليوم", "Today's appointments"), value: todayCount.count ?? 0, hint: t("باستثناء الملغاة", "Excluding cancelled") },
    { label: t("بانتظار التأكيد", "Pending confirmation"), value: pendingCount.count ?? 0, hint: t("من اليوم فصاعدًا", "From today onward") },
    { label: t("المواعيد المؤكدة", "Confirmed appointments"), value: confirmedCount.count ?? 0, hint: t("من اليوم فصاعدًا", "From today onward") },
    { label: t("الملغاة هذا الأسبوع", "Cancelled this week"), value: cancelledCount.count ?? 0, hint: t("السجل محفوظ", "Record retained") },
    { label: t("مواعيد هذا الأسبوع", "This week's appointments"), value: weekCount.count ?? 0, hint: t("باستثناء الملغاة", "Excluding cancelled") },
  ];

  return (
    <>
      <AdminPageHeader eyebrow="Dentally Admin" title="نظرة عامة" description="ملخص حي للحجوزات وجدول الأسبوع الحالي." />
      {hasError && <p className="mt-7 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{t("تعذر تحميل بعض بيانات اللوحة الآن.", "Some dashboard data could not be loaded.")}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-3xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold text-muted">{metric.label}</p>
            <p className="mt-4 text-3xl font-bold text-foreground">{metric.value}</p>
            <p className="mt-2 text-[11px] text-muted/80">{metric.hint}</p>
          </article>
        ))}
      </div>
      {canManageContent && <section className="mt-10"><h2 className="text-xl font-bold text-foreground">{t("ملخص المحتوى", "Content summary")}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{[
        [t("الأطباء", "Doctors"),contentCounts[0]?.count??0],[t("المقالات المنشورة", "Published articles"),contentCounts[1]?.count??0],[t("المسودات والمخفية", "Drafts and hidden"),contentCounts[2]?.count??0],[t("المجدولة", "Scheduled"),contentCounts[3]?.count??0],[t("الأسئلة", "Questions"),contentCounts[4]?.count??0],[t("صور المعرض", "Gallery images"),contentCounts[5]?.count??0],
      ].map(([label,value])=><article key={String(label)} className="rounded-3xl border border-line bg-surface p-5"><p className="text-xs text-muted">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p></article>)}</div></section>}

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{t("مواعيد اليوم", "Today's appointments")}</h2>
              <AdminDate value={today} includeWeekday className="mt-1 block text-xs text-muted" />
            </div>
            <Link href="/admin/appointments?scope=today" className="text-xs font-bold text-brand">{t("عرض الكل", "View all")}</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {todayAppointments.length > 0 ? todayAppointments.map((appointment) => (
              <Link key={appointment.id} href={`/admin/appointments/${appointment.id}`} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-brand/25 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground" data-admin-content>{appointment.patient_name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <span data-admin-content>{appointment.services?.name_ar}</span>
                    <span aria-hidden="true">—</span>
                    <AdminTime value={appointment.appointment_time} />
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </Link>
            )) : <p className="rounded-3xl border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-muted">{t("لا توجد مواعيد مسجلة لليوم.", "No appointments are recorded for today.")}</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{t("المواعيد القادمة", "Upcoming appointments")}</h2>
              <p className="mt-1 text-xs text-muted">{t("أقرب خمسة مواعيد بعد اليوم", "The next five appointments after today")}</p>
            </div>
            <Link href="/admin/appointments?scope=upcoming" className="text-xs font-bold text-brand">{t("عرض الكل", "View all")}</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment) => (
              <Link key={appointment.id} href={`/admin/appointments/${appointment.id}`} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-brand/25 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground" data-admin-content>{appointment.patient_name}</p>
                  <AdminDateTime date={appointment.appointment_date} time={appointment.appointment_time} includeWeekday className="mt-1 block text-xs text-muted" />
                </div>
                <StatusBadge status={appointment.status} />
              </Link>
            )) : <p className="rounded-3xl border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-muted">{t("لا توجد مواعيد قادمة.", "No upcoming appointments.")}</p>}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">{t("العرض الأسبوعي", "Weekly view")}</h2>
        <div className="mt-5"><WeeklyCalendar appointments={calendarAppointments} weekStart={week.start} today={today} /></div>
      </section>
    </>
  );
}
