import { ServiceForm } from "@/components/admin/catalog-forms";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { ServiceContentRow, SpecialtyRow } from "@/types/catalog";

export default async function AdminServicesPage(){await requireContentManager();const supabase=await createClient();const[{data,error},{data:specialties}]=await Promise.all([supabase.from("services").select("*").order("display_order").order("name_ar"),supabase.from("specialties").select("*").order("display_order")]);const items=(data??[]) as ServiceContentRow[];const options=(specialties??[]) as SpecialtyRow[];return <><AdminPageHeader eyebrow="إدارة المحتوى" title="الخدمات" description="محتوى صفحات الخدمات مع بقاء اختيار الخدمة الحالي في الحجز متوافقًا ودون تغيير منطق الحجز."/><div className="mt-8"><ServiceForm specialties={options}/></div>{error?<p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">تعذر التحميل. راجع ملف Migration دون تطبيقه تلقائيًا.</p>:<div className="mt-8 grid gap-5">{items.map(item=><ServiceForm key={item.id} item={item} specialties={options}/>)}</div>}</>}
