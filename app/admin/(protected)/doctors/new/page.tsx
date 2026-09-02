import Link from "next/link";

import { DoctorForm } from "@/components/admin/doctor-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { SpecialtyRow } from "@/types/catalog";

export default async function NewDoctorPage() {
  await requireContentManager();
  const supabase = await createClient();
  const { data } = await supabase.from("specialties").select("*").order("display_order");

  return (
    <>
      <Link href="/admin/doctors" className="text-xs font-bold text-brand hover:text-brand-dark">← العودة إلى الأطباء</Link>
      <div className="mt-5">
        <AdminPageHeader eyebrow="ملف مهني جديد" title="إضافة طبيب" description="أدخل البيانات المعتمدة، ثم فعّل النشر عندما يصبح الملف جاهزًا للظهور العام." />
      </div>
      <DoctorForm specialties={(data ?? []) as SpecialtyRow[]} />
    </>
  );
}
