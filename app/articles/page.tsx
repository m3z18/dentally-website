import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/articles/article-card";
import { Container } from "@/components/ui/container";
import { getPublicArticleCategories, getPublicArticles } from "@/lib/articles";
import { getLocale, localized } from "@/lib/i18n";

export const metadata: Metadata = { title: "المركز التوعوي | Education Center" };

export default async function ArticlesPage({ searchParams }: PageProps<"/articles">) {
  const locale = await getLocale(); const en = locale === "en"; const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80) : "";
  const category = typeof params.category === "string" ? params.category.replace(/[^a-z0-9-]/g, "").slice(0, 80) : "";
  const page = Math.max(1, Number(typeof params.page === "string" ? params.page : 1) || 1);
  const [{ articles, count, unavailable }, categories] = await Promise.all([getPublicArticles({ query: q, category, page }), getPublicArticleCategories()]);
  const pages = Math.max(1, Math.ceil(count / 9));
  const query = (nextPage: number) => ({ ...(q && { q }), ...(category && { category }), page: nextPage });
  return <Container className="py-section"><div className="max-w-3xl"><p className="text-sm font-bold text-brand">{en ? "Education Center" : "المركز التوعوي"}</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">{en ? "Knowledge for a healthier smile" : "معرفة تساعدك على العناية بابتسامتك"}</h1><p className="mt-5 text-base leading-8 text-muted">{en ? "General educational content that does not replace diagnosis or a clinical consultation." : "محتوى تثقيفي عام لا يغني عن التشخيص أو الاستشارة المباشرة."}</p></div><form className="mt-10 grid gap-3 rounded-3xl border border-line bg-surface p-4 md:grid-cols-[1fr_14rem_auto]"><input className="min-h-12 rounded-xl border border-line bg-background px-4 text-sm" type="search" name="q" defaultValue={q} placeholder={en ? "Search articles" : "ابحث في المقالات"} maxLength={80} /><select className="min-h-12 rounded-xl border border-line bg-background px-4 text-sm" name="category" defaultValue={category}><option value="">{en ? "All categories" : "كل التصنيفات"}</option>{categories.map((item) => <option key={item.id} value={item.slug}>{localized(locale, item.name_ar, item.name_en)}</option>)}</select><button className="min-h-12 rounded-xl bg-brand px-6 text-sm font-bold text-white">{en ? "Search" : "بحث"}</button></form>{unavailable ? <p className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{en ? "The Education Center is currently unavailable." : "المركز التوعوي غير متاح حاليًا."}</p> : articles.length ? <><div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} article={article} locale={locale} />)}</div><nav className="mt-10 flex items-center justify-center gap-4" aria-label={en ? "Article pages" : "صفحات المقالات"}>{page > 1 && <Link href={{ pathname: "/articles", query: query(page - 1) }} className="rounded-full border border-line px-5 py-3 text-sm font-bold">{en ? "Previous" : "السابق"}</Link>}<span className="text-sm text-muted">{page} {en ? "of" : "من"} {pages}</span>{page < pages && <Link href={{ pathname: "/articles", query: query(page + 1) }} className="rounded-full border border-line px-5 py-3 text-sm font-bold">{en ? "Next" : "التالي"}</Link>}</nav></> : <div className="mt-10 rounded-card border border-dashed border-line bg-surface p-12 text-center text-sm text-muted">{en ? "No matching published articles." : "لا توجد مقالات منشورة مطابقة."}</div>}</Container>;
}
