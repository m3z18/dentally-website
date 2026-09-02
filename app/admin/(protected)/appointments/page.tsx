import Link from "next/link";

import { AdminDateTime } from "@/components/admin/date-time-display";
import { AdminDateInput } from "@/components/admin/localized-date-time-inputs";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { getRiyadhDateValue } from "@/lib/date";
import { getLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { isDateValue } from "@/lib/validation/admin";
import { appointmentStatusLabels, type AppointmentWithService } from "@/types/admin";
import type { AppointmentStatus } from "@/types/database";

type AppointmentsPageProps = {
  searchParams: Promise<{
    scope?: string;
    date?: string;
    status?: string;
    q?: string;
  }>;
};

export default async function AdminAppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const [, filters, locale] = await Promise.all([requireAdmin(), searchParams, getLocale()]);
  const t = (arabic: string, english: string) => locale === "ar" ? arabic : english;
  const today = getRiyadhDateValue();
  const scope = ["today", "upcoming", "all"].includes(filters.scope ?? "") ? filters.scope! : "upcoming";
  const status = Object.hasOwn(appointmentStatusLabels, filters.status ?? "")
    ? (filters.status as AppointmentStatus)
    : "";
  const exactDate = isDateValue(filters.date ?? "") ? filters.date! : "";
  const queryText = (filters.q ?? "").trim().toLocaleLowerCase("ar").slice(0, 80);
  const searchTerm = queryText
    .replace(/[^\p{L}\p{N}\s+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const hasFilters = scope !== "upcoming" || Boolean(status || exactDate || queryText);

  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select("*, services(name_ar, slug)")
    .limit(200);

  if (exactDate) query = query.eq("appointment_date", exactDate);
  else if (scope === "today") query = query.eq("appointment_date", today);
  else if (scope === "upcoming") query = query.gte("appointment_date", today);
  if (status) query = query.eq("status", status);
  else if (scope === "upcoming") query = query.in("status", ["pending", "confirmed"]);
  if (searchTerm) {
    query = query.or(`patient_name.ilike.%${searchTerm}%,patient_phone.ilike.%${searchTerm}%,booking_reference.ilike.%${searchTerm}%`);
  }

  query = query
    .order("appointment_date", { ascending: scope !== "all" })
    .order("appointment_time", { ascending: scope !== "all" });

  const { data, error } = await query;
  const appointments = (data ?? []) as AppointmentWithService[];

  return (
    <>
      <AdminPageHeader eyebrow="إدارة الحجوزات" title="المواعيد" description="اعرض المواعيد القادمة، وابحث وفلتر دون كشف البيانات خارج لوحة الإدارة." />
      <form className="mt-8 grid gap-3 rounded-card border border-line bg-surface p-5 sm:grid-cols-2 xl:grid-cols-5" method="get">
        <label className="grid gap-1.5 text-xs font-bold text-muted">
          {t("العرض", "View")}
          <select name="scope" defaultValue={scope} className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand">
            <option value="today">{t("مواعيد اليوم", "Today's appointments")}</option>
            <option value="upcoming">{t("المواعيد القادمة", "Upcoming appointments")}</option>
            <option value="all">{t("جميع المواعيد", "All appointments")}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-muted">
          {t("التاريخ", "Date")}
          <AdminDateInput name="date" defaultValue={exactDate} className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-muted">
          {t("الحالة", "Status")}
          <select name="status" defaultValue={status} className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand">
            <option value="">{t("جميع الحالات", "All statuses")}</option>
            {Object.entries(appointmentStatusLabels).map(([value, label]) => <option key={value} value={value}>{locale === "ar" ? label : ({ pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled", completed: "Completed", no_show: "No-show" }[value] ?? label)}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-muted xl:col-span-2">
          {t("البحث", "Search")}
          <span className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input name="q" type="search" defaultValue={queryText} maxLength={80} placeholder={t("الاسم، الجوال، أو رقم الحجز", "Name, mobile, or booking reference")} className="min-h-11 min-w-0 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand" />
            <button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-xs font-bold text-white hover:bg-brand-dark">{t("تطبيق", "Apply")}</button>
          </span>
        </label>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <p>{error ? t("تعذر حساب النتائج", "Could not count results") : t(`${appointments.length} موعد`, `${appointments.length} appointments`)}</p>
        {hasFilters && <Link href="/admin/appointments" className="font-bold text-brand hover:text-brand-dark">{t("مسح الفلاتر", "Clear filters")}</Link>}
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{t("تعذر تحميل المواعيد الآن. حاول مرة أخرى.", "Appointments could not be loaded. Please try again.")}</p>
      ) : appointments.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {appointments.map((appointment) => (
            <Link key={appointment.id} href={`/admin/appointments/${appointment.id}`} className="grid gap-4 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-brand/30 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-sm font-bold text-foreground" data-admin-content>{appointment.patient_name}</h2>
                  <span className="text-xs font-bold text-brand" dir="ltr" data-admin-content>{appointment.booking_reference}</span>
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs leading-6 text-muted">
                  <span data-admin-content>{appointment.services?.name_ar}</span>
                  <span aria-hidden="true">—</span>
                  <AdminDateTime date={appointment.appointment_date} time={appointment.appointment_time} includeWeekday />
                </p>
                <p className="mt-1 text-xs text-muted" dir="ltr" data-admin-content>{appointment.patient_phone}</p>
              </div>
              <StatusBadge status={appointment.status} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-3xl border border-dashed border-line bg-surface px-5 py-12 text-center text-sm text-muted">{t("لا توجد مواعيد مطابقة للفلاتر الحالية.", "No appointments match the current filters.")}</p>
      )}
    </>
  );
}
