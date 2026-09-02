import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { ArticleRow } from "@/types/content";

export default async function AdminArticlesPage({ searchParams }: PageProps<"/admin/articles">) {
  await requireContentManager(); const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.replace(/[^\p{L}\p{N}\s.-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80) : "";
  const status = typeof params.status === "string" && ["all", "draft", "published", "scheduled", "hidden", "deleted"].includes(params.status) ? params.status : "all";
  const supabase = await createClient(); let request = supabase.from("articles").select("*").limit(200);
  if (q) request = request.or(`title_ar.ilike.%${q}%,title_en.ilike.%${q}%,slug.ilike.%${q}%`);
  const now = new Date().toISOString();
  if (status === "draft") request = request.eq("is_active", false).is("published_at", null).is("deleted_at", null);
  else if (status === "published") request = request.eq("is_active", true).is("deleted_at", null).or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${now}`).or(`scheduled_unpublish_at.is.null,scheduled_unpublish_at.gt.${now}`);
  else if (status === "scheduled") request = request.eq("is_active", true).is("deleted_at", null).gt("scheduled_publish_at", now);
  else if (status === "hidden") request = request.eq("is_active", false).not("published_at", "is", null).is("deleted_at", null);
  else if (status === "deleted") request = request.not("deleted_at", "is", null);
  const { data, error } = await request.order("updated_at", { ascending: false }); const articles = (data ?? []) as ArticleRow[];
  return <><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><AdminPageHeader eyebrow="إدارة المحتوى" title="المقالات" description="إدارة المركز التوعوي والمسودات والنشر والجدولة." /><Link href="/admin/articles/new" className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-white">إضافة مقال</Link></div><form className="mt-8 grid gap-3 rounded-card border border-line bg-surface p-5 sm:grid-cols-[1fr_13rem_auto]"><input className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm" name="q" type="search" defaultValue={q} placeholder="العنوان أو الرابط" /><select className="min-h-11 rounded-xl border border-line bg-background px-3 text-sm" name="status" defaultValue={status}><option value="all">الكل</option><option value="draft">مسودة</option><option value="published">منشور</option><option value="scheduled">مجدول</option><option value="hidden">مخفي</option><option value="deleted">المحذوفات</option></select><button className="min-h-11 rounded-xl bg-brand px-5 text-xs font-bold text-white">تطبيق</button></form>{error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">تعذر تحميل المقالات. راجع تطبيق Migration الجديدة.</p> : articles.length ? <div className="mt-6 grid gap-4">{articles.map((article) => <Link key={article.id} href={`/admin/articles/${article.id}`} className="rounded-3xl border border-line bg-surface p-5 hover:border-brand/30"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">{article.title_ar}</h2><Status article={article} now={now} /></div><p className="mt-2 text-xs text-muted" dir="ltr">/{article.slug}</p><p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">{article.excerpt_ar}</p></Link>)}</div> : <div className="mt-6 rounded-card border border-dashed border-line bg-surface p-12 text-center text-sm text-muted">لا توجد مقالات مطابقة.</div>}</>;
}

function Status({ article, now }: { article: ArticleRow; now: string }) { let label = "مسودة"; let color = "bg-slate-100 text-slate-700"; if (article.deleted_at) { label = "محذوف"; color = "bg-red-50 text-red-800"; } else if (article.is_active && article.scheduled_publish_at && article.scheduled_publish_at > now) { label = "مجدول"; color = "bg-blue-50 text-blue-800"; } else if (article.is_active && (!article.scheduled_unpublish_at || article.scheduled_unpublish_at > now)) { label = "منشور"; color = "bg-emerald-50 text-emerald-800"; } else if (article.published_at) { label = "مخفي"; color = "bg-amber-50 text-amber-800"; } return <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${color}`}>{label}</span>; }
