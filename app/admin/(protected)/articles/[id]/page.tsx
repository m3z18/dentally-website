import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { ArticleRecordActions } from "@/components/admin/article-record-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/admin";
import type { ArticleCategoryRow, ArticleReferenceRow, ArticleRow } from "@/types/content";
import type { DoctorRow } from "@/types/doctor";

export default async function EditArticlePage({ params }: PageProps<"/admin/articles/[id]">) { await requireContentManager(); const { id } = await params; if (!isUuid(id)) notFound(); const supabase = await createClient(); const [{ data: article }, { data: categories }, { data: doctors }, { data: references }] = await Promise.all([supabase.from("articles").select("*").eq("id", id).maybeSingle(), supabase.from("article_categories").select("*").order("display_order"), supabase.from("doctors").select("*").is("deleted_at", null).order("display_order"), supabase.from("article_references").select("*").eq("article_id", id).order("display_order")]); if (!article) notFound(); const row = article as ArticleRow; return <><div className="flex flex-wrap items-center justify-between gap-4"><Link href="/admin/articles" className="text-xs font-bold text-brand">← العودة إلى المقالات</Link><Link href={`/admin/articles/${id}/preview`} className="rounded-full border border-brand px-4 py-2 text-xs font-bold text-brand">معاينة آمنة</Link></div><div className="mt-5"><AdminPageHeader eyebrow="تحرير المقال" title={row.title_ar} description="راجع المحتوى والصورة وحالة النشر." /></div>{!row.deleted_at && <ArticleForm article={row} categories={(categories ?? []) as ArticleCategoryRow[]} doctors={(doctors ?? []) as DoctorRow[]} references={(references ?? []) as ArticleReferenceRow[]} />}<ArticleRecordActions articleId={id} deleted={Boolean(row.deleted_at)} /></>; }
