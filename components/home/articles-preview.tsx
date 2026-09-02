import Link from "next/link";
import { ArticleCard } from "@/components/articles/article-card";
import { Container } from "@/components/ui/container";
import { getPublicArticles } from "@/lib/articles";
import { getLocale } from "@/lib/i18n";

export async function ArticlesPreview() { const locale = await getLocale(); const en = locale === "en"; const { articles } = await getPublicArticles({ pageSize: 3 }); if (!articles.length) return null; return <section className="py-section"><Container><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-bold text-brand">{en ? "Education Center" : "المركز التوعوي"}</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">{en ? "Selected articles" : "مقالات مختارة"}</h2></div><Link href="/articles" className="text-sm font-bold text-brand">{en ? "View all articles" : "عرض جميع المقالات"} ←</Link></div><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} article={article} locale={locale} />)}</div></Container></section>; }
