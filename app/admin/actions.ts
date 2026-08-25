"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { getRiyadhDateValue } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import {
  appointmentStatuses,
  isDateValue,
  isUuid,
  isValidTimeRange,
  isTimeValue,
} from "@/lib/validation/admin";
import type { AdminActionState } from "@/types/admin";
import type { AppointmentStatus } from "@/types/database";

const operationError = "تعذر تنفيذ العملية، حاول مرة أخرى.";

export async function updateAppointmentAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const appointmentId = String(formData.get("appointmentId") ?? "");
  const status = String(formData.get("status") ?? "") as AppointmentStatus;
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  if (
    !isUuid(appointmentId) ||
    !appointmentStatuses.includes(status) ||
    !isDateValue(date) ||
    !isTimeValue(time)
  ) {
    return { status: "error", message: "تحقق من بيانات الموعد وحاول مرة أخرى." };
  }

  if (status === "cancelled" && formData.get("confirmCancellation") !== "yes") {
    return { status: "error", message: "أكد إلغاء الموعد قبل حفظ التغييرات." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_appointment", {
    p_appointment_id: appointmentId,
    p_status: status,
    p_date: date,
    p_time: time,
  });

  if (error) {
    const unavailable = ["SLOT_TAKEN", "BLOCKED_SLOT", "DAY_CLOSED", "OUTSIDE_AVAILABILITY", "PAST_SLOT"].some(
      (code) => error.message.includes(code),
    );
    return {
      status: "error",
      message: unavailable
        ? "الوقت الجديد غير متاح. اختر تاريخًا أو وقتًا آخر."
        : operationError,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  revalidatePath(`/admin/appointments/${appointmentId}`);
  const successMessage = status === "confirmed"
    ? "تم تأكيد الموعد."
    : status === "cancelled"
      ? "تم إلغاء الموعد."
      : "تم تحديث الموعد.";

  return { status: "success", message: successMessage };
}

export async function updateAvailabilityAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const duration = Number(formData.get("duration"));
  const isActive = formData.get("isActive") === "on";

  if (
    !Number.isInteger(dayOfWeek) ||
    dayOfWeek < 0 ||
    dayOfWeek > 6 ||
    !isValidTimeRange(startTime, endTime) ||
    !Number.isInteger(duration) ||
    duration < 5 ||
    duration > 240
  ) {
    return { status: "error", message: "تحقق من أوقات العمل ومدة الموعد." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("availability").upsert(
    {
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      slot_duration_minutes: duration,
      is_active: isActive,
    },
    { onConflict: "day_of_week" },
  );

  if (error) return { status: "error", message: operationError };

  revalidatePath("/admin/availability");
  revalidatePath("/booking");
  return { status: "success", message: "تم تحديث ساعات العمل." };
}

export async function createBlockedTimeAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (
    !isDateValue(date) ||
    date < getRiyadhDateValue() ||
    !isValidTimeRange(startTime, endTime) ||
    reason.length > 240
  ) {
    return { status: "error", message: "تحقق من تاريخ ووقت الإغلاق." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blocked_times").insert({
    block_date: date,
    start_time: startTime,
    end_time: endTime,
    reason: reason || null,
  });

  if (error) return { status: "error", message: operationError };

  revalidatePath("/admin/blocked-times");
  revalidatePath("/booking");
  return { status: "success", message: "تمت إضافة الفترة المغلقة." };
}

export async function deleteBlockedTimeAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { status: "error", message: operationError };

  const supabase = await createClient();
  const { error } = await supabase.from("blocked_times").delete().eq("id", id);
  if (error) return { status: "error", message: operationError };

  revalidatePath("/admin/blocked-times");
  revalidatePath("/booking");
  return { status: "success", message: "تم حذف الفترة المغلقة." };
}
