import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DoctorPortrait } from "@/components/doctors/doctor-portrait";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { DoctorRow } from "@/types/admin";

type DoctorsAdminPageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminDoctorsPage({ searchParams }: DoctorsAdminPageProps) {
  await requireContentManager();
  const filters = await searchParams;
  const queryText = (filters.q ?? "").trim().slice(0, 80);
  const searchTerm = queryText.replace(/[^\p{L}\p{N}\s.-]/gu, " ").replace(/\s+/g, " ").trim();
  const status = ["all", "published", "hidden", "deleted"].includes(filters.status ?? "") ? filters.status! : "all";

  const supabase = await createClient();
  let query = supabase.from("doctors").select("*").limit(200);

  if (searchTerm) query = query.or(`name_ar.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,specialty_ar.ilike.%${searchTerm}%,specialty_en.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
  if (status === "published") query = query.eq("is_active", true).is("deleted_at", null);
  else if (status === "hidden") query = query.eq("is_active", false).is("deleted_at", null);
  else if (status === "deleted") query = query.not("deleted_at", "is", null);

  const { data, error } = await query.order("display_order").order("name_ar");
  const doctors = (data ?? []) as DoctorRow[];
  const hasFilters = Boolean(queryText) || status !== "all";

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader eyebrow="فريق المجمع" title="الأطباء" description="إدارة الملفات المهنية وترتيب ظهورها في الموقع العام، بصورة مستقلة عن نظام الحجوزات." />
        <Link href="/admin/doctors/new" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-white hover:bg-brand-dark">
          إضافة طبيب
        </Link>
      </div>

      <form method="get" className="mt-8 grid gap-3 rounded-card border border-line bg-surface p-5 sm:grid-cols-[1fr_13rem_auto]">
        <label className="grid gap-1.5 text-xs font-bold text-muted">
          البحث
          <input name="q" type="search" defaultValue={queryText} maxLength={80} placeholder="الاسم، التخصص، أو الرابط" className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-muted">
          الحالة
          <select name="status" defaultValue={status} className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-brand">
            <option value="all">جميع السجلات</option>
            <option value="published">منشور</option>
            <option value="hidden">مخفي</option>
            <option value="deleted">المحذوفات</option>
          </select>
        </label>
        <button type="submit" className="min-h-11 self-end rounded-xl bg-brand px-5 text-xs font-bold text-white hover:bg-brand-dark">تطبيق</button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <p>{error ? "تعذر حساب النتائج" : `${doctors.length} طبيب`}</p>
        {hasFilters && <Link href="/admin/doctors" className="font-bold text-brand hover:text-brand-dark">مسح الفلاتر</Link>}
      </div>

      {error ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">تعذر تحميل الأطباء. تأكد من تطبيق migration المخصص للنظام ثم حاول مرة أخرى.</p>
      ) : doctors.length > 0 ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {doctors.map((doctor) => (
            <Link key={doctor.id} href={`/admin/doctors/${doctor.id}`} className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-3xl border border-line bg-surface p-4 transition-colors hover:border-brand/30 sm:grid-cols-[7rem_1fr]">
              <DoctorPortrait doctor={doctor} className="aspect-square rounded-2xl" />
              <div className="min-w-0 self-center">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">{doctor.professional_title_ar} {doctor.name_ar}</h2>
                  <DoctorStatus isActive={doctor.is_active} deletedAt={doctor.deleted_at} />
                </div>
                <p className="mt-2 text-xs text-muted">{doctor.specialty_ar}</p>
                <p className="mt-2 text-[11px] text-muted/75" dir="ltr">/{doctor.slug} · {doctor.display_order}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm text-muted">لا توجد سجلات مطابقة.</p>
          {!hasFilters && <Link href="/admin/doctors/new" className="mt-4 inline-flex text-sm font-bold text-brand">إضافة أول طبيب</Link>}
        </div>
      )}
    </>
  );
}

function DoctorStatus({ isActive, deletedAt }: { isActive: boolean; deletedAt: string | null }) {
  const label = deletedAt ? "في المحذوفات" : isActive ? "منشور" : "مخفي";
  const classes = deletedAt ? "bg-red-50 text-red-800" : isActive ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${classes}`}>{label}</span>;
}
