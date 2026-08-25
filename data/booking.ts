import type { BookingDateOption } from "@/types/booking";
import { addDaysToDate, getRiyadhDateValue } from "@/lib/date";

export const generalConsultation = {
  id: "general-consultation",
  title: "لا أعرف الخدمة المناسبة",
  summaryTitle: "كشف واستشارة عامة",
};

const bookingServiceAliases: Record<string, string> = {
  implant: "implant",
  "dental-implants": "implant",
  orthodontics: "orthodontics",
  cosmetic: "cosmetic",
  "cosmetic-dentistry": "cosmetic",
  pediatric: "pediatric",
  "pediatric-dentistry": "pediatric",
  whitening: "whitening",
  "teeth-whitening": "whitening",
  "root-canal": "root-canal",
  fillings: "fillings",
  "dental-fillings": "fillings",
  prosthodontics: "prosthodontics",
  periodontics: "periodontics",
  "oral-surgery": "oral-surgery",
  preventive: "preventive",
  "preventive-care": "preventive",
};

export function resolveBookingServiceId(value?: string) {
  if (!value) return "";
  return bookingServiceAliases[value] ?? "";
}

export function createBookingDates(referenceDate = new Date()): BookingDateOption[] {
  return Array.from({ length: 21 }, (_, index) => {
    const value = addDaysToDate(getRiyadhDateValue(referenceDate), index);
    const date = new Date(`${value}T12:00:00Z`);

    return {
      value,
      dayName: new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
        weekday: "short",
        timeZone: "UTC",
      }).format(date),
      dayNumber: new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
        day: "numeric",
        timeZone: "UTC",
      }).format(date),
      monthName: new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
        month: "short",
        timeZone: "UTC",
      }).format(date),
      available: true,
    };
  });
}

export function formatBookingDate(value: string) {
  if (!value) return "لم يُحدد";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);

  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
