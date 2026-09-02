"use client";

import { useActionState } from "react";

import { deleteBlockedTimeAction } from "@/app/admin/actions";
import { useAdminI18n } from "@/components/admin/admin-i18n";
import type { AdminActionState } from "@/types/admin";

const initialState: AdminActionState = { status: "idle", message: "" };

export function BlockedTimeDeleteForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    deleteBlockedTimeAction,
    initialState,
  );
  const { t, translate } = useAdminI18n();

  return (
    <details>
      <summary className="cursor-pointer list-none text-xs font-bold text-red-700 focus-visible:rounded-lg [&::-webkit-details-marker]:hidden">
        {t("حذف الفترة", "Delete period")}
      </summary>
      <form action={formAction} className="mt-3 rounded-2xl bg-red-50 p-3">
        <input type="hidden" name="id" value={id} />
        <p className="text-[11px] leading-5 text-red-800">
          {t("سيعود الوقت للظهور في الحجز إذا لم يكن محجوزًا.", "The time will reappear in booking if it is not already booked.")}
        </p>
        {state.message && (
          <p
            className={`mt-2 text-[11px] leading-5 ${state.status === "success" ? "text-brand-dark" : "text-red-800"}`}
            role={state.status === "error" ? "alert" : "status"}
          >
            {translate(state.message)}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 cursor-pointer text-xs font-bold text-red-800 underline disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? t("جارٍ الحذف...", "Deleting...") : t("تأكيد الحذف", "Confirm deletion")}
        </button>
      </form>
    </details>
  );
}
