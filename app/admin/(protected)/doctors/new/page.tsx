import Link from "next/link";

import { DoctorForm } from "@/components/admin/doctor-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";

export default async function NewDoctorPage() {
  await requireContentManager();

  return (
    <>
      <Link href="/admin/doctors" className="text-xs font-bold text-brand hover:text-brand-dark">← العودة إلى الأطباء</Link>
      <div className="mt-5">
        <AdminPageHeader eyebrow="ملف مهني جديد" title="إضافة طبيب" description="أدخل البيانات المعتمدة، ثم فعّل النشر عندما يصبح الملف جاهزًا للظهور العام." />
      </div>
      <DoctorForm />
    </>
  );
}
