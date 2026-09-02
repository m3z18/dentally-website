import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getLocale, localized } from "@/lib/i18n";
import { getPublicCollection } from "@/lib/public-collections";
import type { OfferRow } from "@/types/collections";

export async function OffersPreview() { const [rows, locale] = await Promise.all([getPublicCollection("offers"), getLocale()]); const en = locale === "en"; const offers = (rows as OfferRow[]).slice(0, 3); if (!offers.length) return null; return <section className="py-section"><Container><div className="flex items-end justify-between gap-5"><div><p className="text-sm font-bold text-brand">{en ? "Current offers" : "العروض الحالية"}</p><h2 className="mt-3 text-3xl font-bold">{en ? "Announcements from Dentally" : "تنبيهات وعروض دينتالي"}</h2></div><Link href="/offers" className="text-sm font-bold text-brand">{en ? "View all" : "عرض الكل"}</Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{offers.map((offer) => <article key={offer.id} className="rounded-card bg-brand p-6 text-white"><h3 className="text-xl font-bold">{localized(locale, offer.title_ar, offer.title_en)}</h3><p className="mt-3 line-clamp-4 text-sm leading-7 text-white/75">{localized(locale, offer.description_ar, offer.description_en)}</p></article>)}</div></Container></section>; }
