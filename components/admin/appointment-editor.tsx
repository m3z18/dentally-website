"use client";

import { useActionState, useState } from "react";

import {
  updateAppointmentAction,
} from "@/app/admin/actions";
import { AdminDateInput, AdminTimeInput } from "@/components/admin/localized-date-time-inputs";
import { appointmentStatusLabels } from "@/types/admin";
import type { AppointmentStatus } from "@/types/database";
import type { AdminActionState } from "@/types/admin";

const statuses = Object.entries(appointmentStatusLabels) as Array<[AppointmentStatus, string]>;
const initialAdminActionState: AdminActionState = { status: "idle", message: "" };

export function AppointmentEditor({
  appointmentId,
  date,
  time,
  status,
}: {
  appointmentId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}) {
  const [state, formAction, pending] = useActionState(
    updateAppointmentAction,
    initialAdminActionState,
  );
  const [selectedStatus, setSelectedStatus] = useState(status);
  const messageId = "appointment-editor-message";
  const hasError = state.status === "error";

  return (
    <form action={formAction} className="grid gap-5" aria-busy={pending}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <label className="grid gap-2 text-sm font-bold text-foreground">
        الحالة
        <select
          name="status"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value as AppointmentStatus)}
          aria-describedby={state.message ? messageId : undefined}
          aria-invalid={hasError}
          className="min-h-12 rounded-2xl border border-line bg-background px-4 font-normal outline-none focus:border-brand"
        >
          {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-foreground">
          التاريخ
          <AdminDateInput name="date" defaultValue={date} required ariaDescribedBy={state.message ? messageId : undefined} ariaInvalid={hasError} className="min-h-12 rounded-2xl border border-line bg-background px-4 font-normal outline-none focus:border-brand" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-foreground">
          الوقت
          <AdminTimeInput name="time" defaultValue={time} required ariaDescribedBy={state.message ? messageId : undefined} ariaInvalid={hasError} className="min-h-12 rounded-2xl border border-line bg-background px-4 font-normal outline-none focus:border-brand" />
        </label>
      </div>
      {selectedStatus === "cancelled" && (
        <label className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold leading-6 text-red-900">
          <input
            type="checkbox"
            name="confirmCancellation"
            value="yes"
            required
            className="mt-1 size-4 shrink-0 accent-red-700"
          />
          أؤكد إلغاء الموعد وإعادة الوقت إلى المواعيد المتاحة.
        </label>
      )}
      {state.message && (
        <p id={messageId} className={`rounded-2xl px-4 py-3 text-xs leading-6 ${state.status === "success" ? "bg-brand-soft text-brand-dark" : "bg-red-50 text-red-800"}`} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">
        {pending ? "جارٍ الحفظ..." : selectedStatus === "cancelled" ? "إلغاء الموعد" : "حفظ التغييرات"}
      </button>
    </form>
  );
}
