"use client";

import { useAdminI18n } from "@/components/admin/admin-i18n";
import type { AppointmentStatus } from "@/types/database";

const statusClasses: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-red-50 text-red-800",
  completed: "bg-slate-100 text-slate-700",
  no_show: "bg-violet-50 text-violet-800",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { locale } = useAdminI18n();
  const labels: Record<AppointmentStatus, { ar: string; en: string }> = {
    pending: { ar: "بانتظار التأكيد", en: "Pending" },
    confirmed: { ar: "مؤكد", en: "Confirmed" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    completed: { ar: "مكتمل", en: "Completed" },
    no_show: { ar: "لم يحضر", en: "No-show" },
  };
  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold ${statusClasses[status]}`}>
      {labels[status][locale]}
    </span>
  );
}
