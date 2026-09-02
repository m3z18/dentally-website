"use client";

import { useActionState } from "react";

import {
  createBlockedTimeAction,
} from "@/app/admin/actions";
import { useAdminI18n } from "@/components/admin/admin-i18n";
import { AdminDateInput, AdminTimeInput } from "@/components/admin/localized-date-time-inputs";
import type { AdminActionState } from "@/types/admin";

const initialAdminActionState: AdminActionState = { status: "idle", message: "" };

export function BlockedTimeForm({ minDate }: { minDate: string }) {
  const [state, formAction, pending] = useActionState(
    createBlockedTimeAction,
    initialAdminActionState,
  );
  const { t, translate } = useAdminI18n();
  const messageId = "blocked-time-form-message";
  const hasError = state.status === "error";

  return (
    <form action={formAction} className="grid gap-4 rounded-card border border-line bg-surface p-6 sm:grid-cols-2" aria-busy={pending}>
      <label className="grid gap-2 text-sm font-bold text-foreground sm:col-span-2">
        {t("التاريخ", "Date")}
        <AdminDateInput name="date" min={minDate} required ariaDescribedBy={state.message ? messageId : undefined} ariaInvalid={hasError} className="min-h-12 rounded-2xl border border-line bg-background px-4 font-normal outline-none focus:border-brand" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-foreground">
        {t("من", "From")}
        <AdminTimeInput name="startTime" required ariaDescribedBy={state.message ? messageId : undefined} ariaInvalid={hasError} className="min-h-12 rounded-2xl border border-line bg-background px-4 font-normal outline-none focus:border-brand" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-foreground">
        {t("إلى", "To")}
        <AdminTimeInput name="endTime" required ariaDescribedBy={state.message ? messageId : undefined} ariaInvalid={hasError} className="min-h-12 rounded-2xl border border-line bg-background px-4 font-normal outline-none focus:border-brand" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-foreground sm:col-span-2">
        {t("السبب", "Reason")} <span className="text-xs font-normal text-muted">{t("اختياري", "Optional")}</span>
        <input name="reason" type="text" maxLength={240} aria-describedby={state.message ? messageId : undefined} aria-invalid={hasError} className="min-h-12 rounded-2xl border border-line bg-background px-4 font-normal outline-none focus:border-brand" />
      </label>
      {state.message && <p id={messageId} className={`text-xs sm:col-span-2 ${state.status === "success" ? "text-brand-dark" : "text-red-700"}`} role={state.status === "error" ? "alert" : "status"}>{translate(state.message)}</p>}
      <button type="submit" disabled={pending} className="min-h-12 cursor-pointer rounded-full bg-brand px-6 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
        {pending ? t("جارٍ الإضافة...", "Adding...") : t("إضافة وقت مغلق", "Add blocked time")}
      </button>
    </form>
  );
}
