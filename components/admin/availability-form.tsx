"use client";

import { useActionState, useState } from "react";

import {
  updateAvailabilityAction,
} from "@/app/admin/actions";
import { AdminTimeInput } from "@/components/admin/localized-date-time-inputs";
import type { AdminActionState } from "@/types/admin";

const initialAdminActionState: AdminActionState = { status: "idle", message: "" };

export function AvailabilityForm({
  dayOfWeek,
  dayName,
  startTime,
  endTime,
  duration,
  isActive,
}: {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  duration: number;
  isActive: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateAvailabilityAction,
    initialAdminActionState,
  );
  const [enabled, setEnabled] = useState(isActive);
  const messageId = `availability-message-${dayOfWeek}`;
  const hasError = state.status === "error";

  return (
    <form action={formAction} className="rounded-3xl border border-line bg-surface p-5" aria-busy={pending}>
      <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-bold text-foreground">{dayName}</h2>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-muted">
          <input name="isActive" type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="size-4 accent-brand" />
          {enabled ? "مفعل" : "متوقف"}
        </label>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="grid gap-1.5 text-xs font-bold text-muted">
          البداية
          <AdminTimeInput name="startTime" defaultValue={startTime} required ariaDescribedBy={state.message ? messageId : undefined} ariaInvalid={hasError} className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-muted">
          النهاية
          <AdminTimeInput name="endTime" defaultValue={endTime} required ariaDescribedBy={state.message ? messageId : undefined} ariaInvalid={hasError} className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand" />
        </label>
      </div>
      <label className="mt-3 grid gap-1.5 text-xs font-bold text-muted">
        مدة الموعد بالدقائق
        <input name="duration" type="number" min="5" max="240" step="5" defaultValue={duration} required dir="ltr" aria-describedby={state.message ? messageId : undefined} aria-invalid={hasError} className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand" />
      </label>
      {state.message && <p id={messageId} className={`mt-3 text-xs ${state.status === "success" ? "text-brand-dark" : "text-red-700"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
      <button type="submit" disabled={pending} className="mt-4 min-h-11 w-full cursor-pointer rounded-full bg-brand-soft px-4 text-xs font-bold text-brand-dark hover:bg-brand hover:text-white disabled:cursor-wait disabled:opacity-60">
        {pending ? "جارٍ الحفظ..." : "حفظ اليوم"}
      </button>
    </form>
  );
}
