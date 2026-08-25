import { generalConsultation } from "@/data/booking";
import { getServiceById } from "@/data/services";
import { getRiyadhDateValue } from "@/lib/date";
import type { BookingFormData } from "@/types/booking";

export type ValidatedBooking = BookingFormData & { serviceSlug: string };

export function validateBookingPayload(value: unknown):
  | { success: true; data: ValidatedBooking }
  | { success: false; message: string } {
  if (!value || typeof value !== "object") {
    return { success: false, message: "بيانات الحجز غير مكتملة." };
  }

  const input = value as Partial<Record<keyof BookingFormData, unknown>>;
  const serviceId = typeof input.serviceId === "string" ? input.serviceId : "";
  const date = typeof input.date === "string" ? input.date : "";
  const time = typeof input.time === "string" ? input.time : "";
  const patientName = typeof input.patientName === "string" ? input.patientName.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";

  const service = getServiceById(serviceId);
  const serviceSlug =
    serviceId === generalConsultation.id ? "general-consultation" : service?.slug;

  if (!serviceSlug) {
    return { success: false, message: "اختر خدمة صحيحة." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < getRiyadhDateValue()) {
    return { success: false, message: "اختر تاريخًا صحيحًا وغير سابق." };
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return { success: false, message: "اختر وقتًا صحيحًا." };
  }
  if (patientName.length < 2 || patientName.length > 120) {
    return { success: false, message: "أدخل الاسم الكامل بصورة صحيحة." };
  }
  if (!/^05\d{8}$/.test(phone)) {
    return { success: false, message: "أدخل رقم جوال سعوديًا بصيغة 05XXXXXXXX." };
  }
  if (notes.length > 500) {
    return { success: false, message: "يجب ألا تتجاوز الملاحظات 500 حرف." };
  }

  return {
    success: true,
    data: { serviceId, date, time, patientName, phone, notes, serviceSlug },
  };
}
