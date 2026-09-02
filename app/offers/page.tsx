import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getLocale, localized } from "@/lib/i18n";
import { getPublicCollection } from "@/lib/public-collections";
import type { OfferRow } from "@/types/collections";

export const metadata: Metadata = { title: "العروض | Offers", description: "العروض والتنبيهات الحالية المنشورة لدى مجمع دينتالي." };

export default async function OffersPage() { const [rows, locale] = await Promise.all([getPublicCollection("offers"), getLocale()]); const en = locale === "en"; const offers = rows as OfferRow[]; return <Container className="py-section"><header className="max-w-3xl"><p className="text-sm font-bold text-brand">{en ? "Offers" : "العروض"}</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">{en ? "Current announcements and offers" : "العروض والتنبيهات الحالية"}</h1></header>{offers.length ? <div className="mt-10 grid gap-5 md:grid-cols-2">{offers.map((offer) => <article key={offer.id} className="rounded-card border border-line bg-surface p-7"><h2 className="text-2xl font-bold">{localized(locale, offer.title_ar, offer.title_en)}</h2><p className="mt-4 whitespace-pre-line text-sm leading-8 text-muted">{localized(locale, offer.description_ar, offer.description_en)}</p>{offer.cta_url && <Link href={offer.cta_url} className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-xs font-bold text-white">{localized(locale, offer.cta_label_ar || (en ? "Learn more" : "اعرف المزيد"), offer.cta_label_en)}</Link>}</article>)}</div> : <div className="mt-10 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">{en ? "No active offers are published." : "لا توجد عروض نشطة منشورة حاليًا."}</div>}</Container>; }
