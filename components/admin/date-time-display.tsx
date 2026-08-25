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
  return (
    <time dateTime={value} className={className}>
      <bdi dir="rtl">{formatAdminDate(value, { includeWeekday })}</bdi>
    </time>
  );
}

export function AdminTime({ value, className }: DisplayProps) {
  return (
    <time dateTime={value} className={className}>
      <bdi dir="rtl">{formatAdminTime(value)}</bdi>
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
  return (
    <time
      dateTime={`${date}T${normalizeTimeValue(time)}:00+03:00`}
      className={className}
    >
      <bdi dir="rtl">{formatDateTime(date, time, { includeWeekday })}</bdi>
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
