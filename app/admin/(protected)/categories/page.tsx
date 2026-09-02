import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryDeleteForm, CategoryForm } from "@/components/admin/content-foundation-forms";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { ArticleCategoryRow } from "@/types/content";

export default async function CategoriesPage() { await requireContentManager(); const supabase = await createClient(); const { data, error } = await supabase.from("article_categories").select("*").order("display_order").order("name_ar"); const categories = (data ?? []) as ArticleCategoryRow[]; return <><AdminPageHeader eyebrow="المركز التوعوي" title="تصنيفات المقالات" description="التصنيف الجديد مخفي افتراضيًا، والحذف منطقي." /><div className="mt-8"><CategoryForm /></div>{error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">تعذر تحميل التصنيفات. راجع تطبيق Migration الجديدة.</p> : <div className="mt-8 grid gap-5 xl:grid-cols-2">{categories.map((category) => <div key={category.id}><CategoryForm category={category} /><CategoryDeleteForm category={category} /></div>)}</div>}</>; }
