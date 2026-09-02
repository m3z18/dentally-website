import { SpecialtyForm } from "@/components/admin/catalog-forms";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { SpecialtyRow } from "@/types/catalog";

export default async function AdminSpecialtiesPage(){await requireContentManager();const supabase=await createClient();const{data,error}=await supabase.from("specialties").select("*").order("display_order").order("name_ar");const items=(data??[]) as SpecialtyRow[];return <><AdminPageHeader eyebrow="إدارة المحتوى" title="التخصصات" description="تصنيف محتوى الأطباء والخدمات فقط، دون أي ربط بالحجز أو التوافر."/><div className="mt-8"><SpecialtyForm/></div>{error?<p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">تعذر التحميل. راجع ملف Migration دون تطبيقه تلقائيًا.</p>:<div className="mt-8 grid gap-5">{items.map(item=><SpecialtyForm key={item.id} item={item}/>)}</div>}</>}
