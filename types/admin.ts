import type { AppointmentStatus, Database } from "@/types/database";
import type { DoctorRow } from "@/types/doctor";

export type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
export type AvailabilityRow = Database["public"]["Tables"]["availability"]["Row"];
export type BlockedTimeRow = Database["public"]["Tables"]["blocked_times"]["Row"];
export type { DoctorRow };

export type AppointmentWithService = AppointmentRow & {
  services: { name_ar: string; slug: string } | null;
};

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  completed: "مكتمل",
  no_show: "لم يحضر",
};
