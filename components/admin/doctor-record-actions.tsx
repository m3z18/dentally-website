"use client";

import { useActionState } from "react";

import { restoreDoctorAction, softDeleteDoctorAction } from "@/app/admin/doctors/actions";
import type { AdminActionState } from "@/types/admin";

const initialState: AdminActionState = { status: "idle", message: "" };

export function DoctorSoftDeleteForm({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const [state, formAction, pending] = useActionState(softDeleteDoctorAction, initialState);

  return (
    <form action={formAction} className="mt-10 rounded-card border border-red-200 bg-red-50 p-5 sm:p-7" aria-busy={pending}>
      <input type="hidden" name="doctorId" value={doctorId} />
      <h2 className="text-lg font-bold text-red-900">نقل السجل إلى المحذوفات</h2>
      <p className="mt-2 text-xs leading-6 text-red-800">سيُخفى ملف {doctorName} من الموقع مع الاحتفاظ بكل بياناته وصورته لإمكانية الاستعادة.</p>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs font-bold text-red-900">
        <input name="confirmDeletion" type="checkbox" value="yes" required className="mt-0.5 size-4 accent-red-700" />
        أؤكد نقل هذا السجل إلى المحذوفات
      </label>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="mt-4 min-h-11 cursor-pointer rounded-full border border-red-300 bg-white px-5 text-xs font-bold text-red-800 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60">
        {pending ? "جارٍ النقل..." : "نقل إلى المحذوفات"}
      </button>
    </form>
  );
}

export function DoctorRestoreForm({ doctorId }: { doctorId: string }) {
  const [state, formAction, pending] = useActionState(restoreDoctorAction, initialState);

  return (
    <form action={formAction} className="mt-8 rounded-card border border-amber-200 bg-amber-50 p-5 sm:p-7" aria-busy={pending}>
      <input type="hidden" name="doctorId" value={doctorId} />
      <h2 className="text-lg font-bold text-amber-950">استعادة سجل الطبيب</h2>
      <p className="mt-2 text-xs leading-6 text-amber-900">سيعود السجل بحالة مخفي، ولن يظهر في الموقع حتى تنشره يدويًا بعد المراجعة.</p>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="mt-4 min-h-11 cursor-pointer rounded-full bg-amber-900 px-5 text-xs font-bold text-white hover:bg-amber-950 disabled:cursor-wait disabled:opacity-60">
        {pending ? "جارٍ الاستعادة..." : "استعادة كملف مخفي"}
      </button>
    </form>
  );
}

function ActionMessage({ state }: { state: AdminActionState }) {
  if (!state.message) return null;

  return (
    <p className={`mt-3 text-xs ${state.status === "success" ? "text-emerald-800" : "text-red-800"}`} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}
