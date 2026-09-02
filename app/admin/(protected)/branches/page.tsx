import { BranchForm } from "@/components/admin/catalog-forms";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { BranchRow } from "@/types/catalog";

export default async function AdminBranchesPage(){await requireContentManager();const supabase=await createClient();const{data,error}=await supabase.from("branches").select("*").order("display_order").order("name_ar");const items=(data??[]) as BranchRow[];return <><AdminPageHeader eyebrow="إدارة المحتوى" title="الفروع" description="معلومات عامة للفروع فقط. الفروع غير مرتبطة بالحجز الحالي."/><div className="mt-8"><BranchForm/></div>{error?<p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">تعذر التحميل. راجع ملف Migration دون تطبيقه تلقائيًا.</p>:<div className="mt-8 grid gap-5">{items.map(item=><BranchForm key={item.id} item={item}/>)}</div>}</>}
