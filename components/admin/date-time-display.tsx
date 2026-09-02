"use client";

import { useAdminI18n } from "@/components/admin/admin-i18n";
import {
  formatAdminDate,
  formatAdminDateTime as formatDateTime,
  formatAdminTime,
  normalizeTimeValue,
} from "@/lib/date";

type DisplayProps = {
  className?: string;
  value: string;
};

export function AdminDate({
  value,
  includeWeekday = false,
  className,
}: DisplayProps & { includeWeekday?: boolean }) {
  const { locale, direction } = useAdminI18n();
  return (
    <time dateTime={value} className={className}>
      <bdi dir={direction}>{formatAdminDate(value, { includeWeekday, locale })}</bdi>
    </time>
  );
}

export function AdminTime({ value, className }: DisplayProps) {
  const { locale, direction } = useAdminI18n();
  return (
    <time dateTime={value} className={className}>
      <bdi dir={direction}>{formatAdminTime(value, locale)}</bdi>
    </time>
  );
}

export function AdminDateTime({
  date,
  time,
  includeWeekday = false,
  className,
}: {
  date: string;
  time: string;
  includeWeekday?: boolean;
  className?: string;
}) {
  const { locale, direction } = useAdminI18n();
  return (
    <time
      dateTime={`${date}T${normalizeTimeValue(time)}:00+03:00`}
      className={className}
    >
      <bdi dir={direction}>{formatDateTime(date, time, { includeWeekday, locale })}</bdi>
    </time>
  );
}

export function AdminTimeRange({
  start,
  end,
  className,
}: {
  start: string;
  end: string;
  className?: string;
}) {
  return (
    <span className={className}>
      <AdminTime value={start} />
      <span className="mx-1.5" aria-hidden="true">—</span>
      <AdminTime value={end} />
    </span>
  );
}
