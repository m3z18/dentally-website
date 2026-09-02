import Link from "next/link";
import { notFound } from "next/navigation";

import { DoctorRestoreForm, DoctorSoftDeleteForm } from "@/components/admin/doctor-record-actions";
import { DoctorForm } from "@/components/admin/doctor-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/admin";
import type { DoctorRow } from "@/types/admin";
import type { SpecialtyRow } from "@/types/catalog";

export default async function EditDoctorPage({ params }: PageProps<"/admin/doctors/[id]">) {
  await requireContentManager();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const [{ data, error }, { data: specialties }] = await Promise.all([
    supabase.from("doctors").select("*").eq("id", id).maybeSingle(),
    supabase.from("specialties").select("*").order("display_order"),
  ]);
  if (error || !data) notFound();
  const doctor = data as DoctorRow;

  return (
    <>
      <Link href="/admin/doctors" className="text-xs font-bold text-brand hover:text-brand-dark">← العودة إلى الأطباء</Link>
      <div className="mt-5">
        <AdminPageHeader eyebrow="تحرير الملف المهني" title={`${doctor.professional_title_ar} ${doctor.name_ar}`} description="حدّث البيانات وحالة الظهور وترتيب الملف في الموقع العام." />
      </div>
      {doctor.deleted_at ? (
        <DoctorRestoreForm doctorId={doctor.id} />
      ) : (
        <>
          <DoctorForm doctor={doctor} specialties={(specialties ?? []) as SpecialtyRow[]} />
          <DoctorSoftDeleteForm doctorId={doctor.id} doctorName={`${doctor.professional_title_ar} ${doctor.name_ar}`} />
        </>
      )}
    </>
  );
}
