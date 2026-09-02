import Link from "next/link";
import { ArticleForm } from "@/components/admin/article-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { ArticleCategoryRow } from "@/types/content";
import type { DoctorRow } from "@/types/doctor";

export default async function NewArticlePage() { await requireContentManager(); const supabase = await createClient(); const [{ data: categories }, { data: doctors }] = await Promise.all([supabase.from("article_categories").select("*").is("deleted_at", null).order("display_order"), supabase.from("doctors").select("*").is("deleted_at", null).order("display_order")]); return <><Link href="/admin/articles" className="text-xs font-bold text-brand">← العودة إلى المقالات</Link><div className="mt-5"><AdminPageHeader eyebrow="مسودة جديدة" title="إضافة مقال" description="يُحفظ المقال مخفيًا افتراضيًا حتى تراجعه وتنشره." /></div><ArticleForm categories={(categories ?? []) as ArticleCategoryRow[]} doctors={(doctors ?? []) as DoctorRow[]} /></>; }
