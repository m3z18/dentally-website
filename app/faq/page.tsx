import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getLocale, localized } from "@/lib/i18n";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FaqRow } from "@/types/content";

type PublicFaqRow = FaqRow & {
  services: { slug: string; name_ar: string; name_en: string | null } | null;
};

export async function generateMetadata(): Promise<Metadata> { return { title: (await getLocale()) === "en" ? "Frequently asked questions" : "الأسئلة الشائعة" }; }

export default async function FaqPage() {
  const locale = await getLocale(); const en = locale === "en"; let items: PublicFaqRow[] = []; let unavailable = false;
  if (hasSupabasePublicEnv()) { const supabase = await createClient(); const { data, error } = await supabase.from("faq_items").select("*, services(slug,name_ar,name_en)").eq("is_active", true).is("deleted_at", null).order("display_order"); items = (data ?? []) as unknown as PublicFaqRow[]; unavailable = Boolean(error); } else unavailable = true;
  const schema = items.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: localized(locale, item.question_ar, item.question_en), acceptedAnswer: { "@type": "Answer", text: localized(locale, item.answer_ar, item.answer_en) } })) } : null;
  return <Container className="py-section"><div className="max-w-3xl"><p className="text-sm font-bold text-brand">{en ? "Plan your visit" : "دليلك للزيارة"}</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">{en ? "Frequently asked questions" : "الأسئلة الشائعة"}</h1><p className="mt-5 text-base leading-8 text-muted">{en ? "General answers; recommendations may vary after assessment." : "إجابات عامة، وقد تختلف التوصية بحسب تقييم الحالة."}</p></div>{unavailable ? <p className="mt-10 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{en ? "FAQ is currently unavailable." : "الأسئلة غير متاحة حاليًا."}</p> : items.length ? <div className="mt-10 grid gap-4">{items.map((item) => <details key={item.id} className="rounded-3xl border border-line bg-surface p-5"><summary className="cursor-pointer font-bold leading-7">{localized(locale, item.question_ar, item.question_en)}</summary>{(item.category || item.services) && <div className="mt-3 flex flex-wrap gap-2 text-xs text-brand">{item.category && <span className="rounded-full bg-brand-soft px-3 py-1">{item.category}</span>}{item.services && <a href={`/services/${item.services.slug}`} className="rounded-full bg-brand-soft px-3 py-1 font-bold hover:bg-brand-soft/70">{localized(locale, item.services.name_ar, item.services.name_en)}</a>}</div>}<p className="mt-4 border-t border-line pt-4 text-sm leading-8 text-muted">{localized(locale, item.answer_ar, item.answer_en)}</p></details>)}</div> : <div className="mt-10 rounded-card border border-dashed border-line bg-surface p-12 text-center text-sm text-muted">{en ? "No published questions yet." : "لا توجد أسئلة منشورة حاليًا."}</div>}{schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}</Container>;
}
