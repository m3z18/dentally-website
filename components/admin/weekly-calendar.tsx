"use client";

import Link from "next/link";

import { useAdminI18n } from "@/components/admin/admin-i18n";
import { AdminDate, AdminTime } from "@/components/admin/date-time-display";
import { StatusBadge } from "@/components/admin/status-badge";
import { addDaysToDate } from "@/lib/date";
import type { AppointmentWithService } from "@/types/admin";

export function WeeklyCalendar({
  appointments,
  weekStart,
  today,
}: {
  appointments: AppointmentWithService[];
  weekStart: string;
  today: string;
}) {
  const { t } = useAdminI18n();
  const days = Array.from({ length: 7 }, (_, index) => addDaysToDate(weekStart, index));

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {days.map((date) => {
        const dayAppointments = appointments.filter((item) => item.appointment_date === date);
        const isToday = date === today;
        return (
          <section key={date} className={`min-h-44 rounded-3xl border p-4 ${isToday ? "border-brand/30 bg-brand-soft/25" : "border-line bg-surface"}`}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xs font-bold leading-5 text-foreground">
                <AdminDate value={date} includeWeekday />
              </h3>
              <span className="shrink-0 rounded-full bg-surface-muted px-2 py-1 text-[10px] font-bold text-muted" aria-label={t(`${dayAppointments.length} مواعيد`, `${dayAppointments.length} appointments`)}>
                {dayAppointments.length}
              </span>
            </div>
            <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto pe-1">
              {dayAppointments.length > 0 ? dayAppointments.map((appointment) => (
                <Link key={appointment.id} href={`/admin/appointments/${appointment.id}`} className="rounded-2xl border border-transparent bg-surface px-3 py-3 text-[11px] leading-5 text-brand-dark hover:border-brand/20">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <AdminTime value={appointment.appointment_time} className="font-bold" />
                    <StatusBadge status={appointment.status} />
                  </span>
                  <span className="mt-1 block truncate font-semibold" data-admin-content>{appointment.patient_name}</span>
                </Link>
              )) : <p className="text-[11px] text-muted/70">{t("لا توجد مواعيد", "No appointments")}</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
