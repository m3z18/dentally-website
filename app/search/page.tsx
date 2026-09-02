import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { searchPublishedContent } from "@/lib/catalog";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "البحث | Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  const locale = await getLocale(); const en = locale === "en";
  const results = await searchPublishedContent(query, locale);
  return <Container className="py-16 sm:py-20"><h1 className="text-4xl font-bold">{en?"Search":"البحث"}</h1><form className="mt-8 flex max-w-2xl gap-3" action="/search"><label className="sr-only" htmlFor="site-search">{en?"Search":"البحث"}</label><input id="site-search" name="q" defaultValue={query} minLength={2} maxLength={80} className="min-h-12 flex-1 rounded-full border border-line bg-surface px-5 outline-none focus:border-brand" placeholder={en?"Services, doctors, articles":"الخدمات، الأطباء، المقالات"}/><button className="rounded-full bg-brand px-6 font-bold text-white">{en?"Search":"بحث"}</button></form>{query.length>=2?<div className="mt-10 grid gap-4">{results.length?results.map((result)=><Link key={`${result.type}-${result.href}`} href={result.href} className="rounded-card border border-line bg-surface p-5 transition-colors hover:border-brand/30"><span className="text-xs font-bold text-brand">{result.type}</span><h2 className="mt-2 text-lg font-bold">{result.title}</h2>{result.description&&<p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">{result.description}</p>}</Link>):<p className="rounded-card border border-dashed border-line p-8 text-center text-muted">{en?"No published results found.":"لم يتم العثور على نتائج منشورة."}</p>}</div>:<p className="mt-6 text-sm text-muted">{en?"Enter at least two characters.":"أدخل حرفين على الأقل."}</p>}</Container>;
}
