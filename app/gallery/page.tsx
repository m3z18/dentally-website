import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getLocale, localized } from "@/lib/i18n";
import { getPublicCollection } from "@/lib/public-collections";
import { getSiteContentImageUrl } from "@/lib/site-content-images";
import type { GalleryItemRow } from "@/types/collections";

export const metadata: Metadata = { title: "المعرض | Gallery", description: "صور منشأة مجمع دينتالي المعتمدة." };

export default async function GalleryPage() { const [rows, locale] = await Promise.all([getPublicCollection("gallery_items"), getLocale()]); const en = locale === "en"; const items = rows as GalleryItemRow[]; return <Container className="py-section"><header className="max-w-3xl"><p className="text-sm font-bold text-brand">{en ? "Gallery" : "المعرض"}</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">{en ? "Inside Dentally" : "من داخل دينتالي"}</h1></header>{items.length ? <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">{items.map((item) => { const image = getSiteContentImageUrl(item.image_path); return image && <figure key={item.id} className="mb-5 break-inside-avoid overflow-hidden rounded-card border border-line bg-surface"><div className="relative aspect-[4/3]"><Image src={image} alt={localized(locale, item.image_alt_ar, item.image_alt_en)} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" /></div>{(item.caption_ar || item.caption_en) && <figcaption className="p-4 text-sm leading-7 text-muted">{localized(locale, item.caption_ar || "", item.caption_en)}</figcaption>}</figure>; })}</div> : <div className="mt-10 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">{en ? "Approved facility photos will appear here." : "ستظهر صور المجمع المعتمدة هنا عند توفرها."}</div>}</Container>; }
