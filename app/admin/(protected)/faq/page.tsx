import { AdminPageHeader } from "@/components/admin/page-header";
import { FaqDeleteForm, FaqForm } from "@/components/admin/content-foundation-forms";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { FaqRow } from "@/types/content";

export default async function AdminFaqPage() { await requireContentManager(); const supabase = await createClient(); const [{ data, error }, { data: services }] = await Promise.all([supabase.from("faq_items").select("*").order("display_order"), supabase.from("services").select("id,name_ar").order("name_ar")]); const items = (data ?? []) as FaqRow[]; const serviceOptions = services ?? []; return <><AdminPageHeader eyebrow="إدارة المحتوى" title="الأسئلة الشائعة" description="أسئلة عامة أو مرتبطة بخدمة، مع نشر اختياري وحذف منطقي." /><div className="mt-8"><FaqForm services={serviceOptions} /></div>{error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">تعذر تحميل الأسئلة. راجع تطبيق Migration الجديدة.</p> : <div className="mt-8 grid gap-5">{items.map((item) => <div key={item.id}><FaqForm item={item} services={serviceOptions} /><FaqDeleteForm item={item} /></div>)}</div>}</>; }
