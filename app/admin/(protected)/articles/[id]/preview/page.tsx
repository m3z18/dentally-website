import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeMarkdown } from "@/components/articles/safe-markdown";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/admin";

export default async function ArticlePreviewPage({ params }: PageProps<"/admin/articles/[id]/preview">) { await requireContentManager(); const { id } = await params; if (!isUuid(id)) notFound(); const supabase = await createClient(); const { data } = await supabase.from("articles").select("title_ar,excerpt_ar,content_ar").eq("id", id).maybeSingle(); if (!data) notFound(); return <><Link href={`/admin/articles/${id}`} className="text-xs font-bold text-brand">← العودة إلى التحرير</Link><div data-admin-content><div className="mt-5"><AdminPageHeader eyebrow="معاينة إدارية" title={data.title_ar} description={data.excerpt_ar} /></div><div className="mt-8 max-w-4xl rounded-card border border-line bg-surface p-6 sm:p-10"><SafeMarkdown content={data.content_ar} /></div></div></>; }
