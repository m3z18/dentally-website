import Image from "next/image";
import Link from "next/link";
import { getArticleImagePublicUrl } from "@/lib/article-images";
import { articleReadingMinutes } from "@/lib/articles";
import type { PublicArticle } from "@/types/content";
import type { Locale } from "@/lib/locale";
import { localized } from "@/lib/locale";

export function ArticleCard({ article, locale = "ar" }: { article: PublicArticle; locale?: Locale }) {
  const image = getArticleImagePublicUrl(article.image_path);
  const content = localized(locale, article.content_ar, article.content_en);
  return <article className="overflow-hidden rounded-card border border-line bg-surface shadow-soft"><Link href={`/articles/${article.slug}`} className="group block">{image ? <div className="relative aspect-[16/9] overflow-hidden bg-brand-soft"><Image src={image} alt={localized(locale, article.image_alt_ar || "", article.image_alt_en)} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div> : <div className="aspect-[16/9] bg-brand-soft" />}<div className="p-5 sm:p-6"><div className="flex flex-wrap gap-2 text-[11px] font-bold text-brand">{article.article_categories && <span>{localized(locale, article.article_categories.name_ar, article.article_categories.name_en)}</span>}<span>{articleReadingMinutes(content)} {locale === "ar" ? "دقائق قراءة" : "min read"}</span>{article.is_featured && <span>{locale === "ar" ? "مميز" : "Featured"}</span>}</div><h2 className="mt-3 text-xl font-bold leading-8 text-foreground group-hover:text-brand">{localized(locale, article.title_ar, article.title_en)}</h2><p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">{localized(locale, article.excerpt_ar, article.excerpt_en)}</p></div></Link></article>;
}
