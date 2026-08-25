const riyadhDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Riyadh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const adminDateFormatter = new Intl.DateTimeFormat("ar-SA", {
  calendar: "gregory",
  numberingSystem: "latn",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Riyadh",
});

const adminDateWithWeekdayFormatter = new Intl.DateTimeFormat(
  "ar-SA",
  {
    calendar: "gregory",
    numberingSystem: "latn",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  },
);

const adminTimeFormatter = new Intl.DateTimeFormat("ar-SA", {
  calendar: "gregory",
  numberingSystem: "latn",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Riyadh",
});

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTimeValue(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  // UTC is a stable container for wall-clock values used by non-admin formatters.
  return new Date(Date.UTC(2020, 0, 1, hours, minutes));
}

function parseRiyadhTimeValue(value: string) {
  const wallClockDate = parseTimeValue(value);
  if (!wallClockDate) return null;

  // Convert the stored Riyadh wall-clock value to an instant before formatting it
  // explicitly in Asia/Riyadh.
  return new Date(wallClockDate.getTime() - 3 * 60 * 60 * 1000);
}

export function getRiyadhDateValue(date = new Date()) {
  return riyadhDateFormatter.format(date);
}

export function addDaysToDate(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return riyadhDateFormatter.format(date);
}

export function getRiyadhWeekRange(reference = new Date()) {
  const dateValue = getRiyadhDateValue(reference);
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const dayOfWeek = date.getUTCDay();
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  const start = addDaysToDate(dateValue, -daysSinceSaturday);
  return { start, end: addDaysToDate(start, 6) };
}

export function formatArabicDate(value: string) {
  const date = parseDateValue(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

export function formatArabicTime(value: string) {
  const date = parseTimeValue(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

export function formatAdminDate(
  value: string,
  options: { includeWeekday?: boolean } = {},
) {
  const date = parseDateValue(value);
  if (!date) return "تاريخ غير صالح";

  return (options.includeWeekday
    ? adminDateWithWeekdayFormatter
    : adminDateFormatter
  ).format(date);
}

export function formatAdminTime(value: string) {
  const date = parseRiyadhTimeValue(value);
  return date ? adminTimeFormatter.format(date) : "وقت غير صالح";
}

export function formatAdminDateTime(
  dateValue: string,
  timeValue: string,
  options: { includeWeekday?: boolean } = {},
) {
  return `${formatAdminDate(dateValue, options)} — ${formatAdminTime(timeValue)}`;
}

export function normalizeTimeValue(value: string) {
  return value.slice(0, 5);
}
