"use client";

import { useActionState } from "react";

import { deleteBlockedTimeAction } from "@/app/admin/actions";
import type { AdminActionState } from "@/types/admin";

const initialState: AdminActionState = { status: "idle", message: "" };

export function BlockedTimeDeleteForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    deleteBlockedTimeAction,
    initialState,
  );

  return (
    <details>
      <summary className="cursor-pointer list-none text-xs font-bold text-red-700 focus-visible:rounded-lg [&::-webkit-details-marker]:hidden">
        حذف الفترة
      </summary>
      <form action={formAction} className="mt-3 rounded-2xl bg-red-50 p-3">
        <input type="hidden" name="id" value={id} />
        <p className="text-[11px] leading-5 text-red-800">
          سيعود الوقت للظهور في الحجز إذا لم يكن محجوزًا.
        </p>
        {state.message && (
          <p
            className={`mt-2 text-[11px] leading-5 ${state.status === "success" ? "text-brand-dark" : "text-red-800"}`}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 cursor-pointer text-xs font-bold text-red-800 underline disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "جارٍ الحذف..." : "تأكيد الحذف"}
        </button>
      </form>
    </details>
  );
}
