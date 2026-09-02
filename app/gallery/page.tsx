import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getLocale, localized } from "@/lib/i18n";
import { getPublicCollection } from "@/lib/public-collections";
import { getSiteContentImageUrl } from "@/lib/site-content-images";
import type { GalleryItemRow } from "@/types/collections";

export async function generateMetadata(): Promise<Metadata> { const en=(await getLocale())==="en"; return { title: en ? "Gallery" : "المعرض", description: en ? "Published photos from the Dentally facility." : "الصور المنشورة والمعتمدة لمنشأة مجمع دينتالي." }; }

export default async function GalleryPage() { const [rows, locale] = await Promise.all([getPublicCollection("gallery_items"), getLocale()]); const en = locale === "en"; const items = (rows as GalleryItemRow[]).map(item=>({item,image:getSiteContentImageUrl(item.image_path)})).filter((entry):entry is {item:GalleryItemRow;image:string}=>Boolean(entry.image)); return <Container className="py-section"><header className="max-w-3xl"><p className="text-sm font-bold text-brand">{en ? "Gallery" : "المعرض"}</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">{en ? "Inside Dentally" : "من داخل دينتالي"}</h1></header>{items.length ? <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">{items.map(({item,image}) => <figure key={item.id} className="mb-5 break-inside-avoid overflow-hidden rounded-card border border-line bg-surface"><div className="relative aspect-[4/3]"><Image src={image} alt={localized(locale, item.image_alt_ar, item.image_alt_en)} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" /></div>{(item.caption_ar || item.caption_en) && <figcaption className="p-4 text-sm leading-7 text-muted">{localized(locale, item.caption_ar || "", item.caption_en)}</figcaption>}</figure>)}</div> : <div className="mt-10 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">{en ? "No published gallery images are available." : "لا توجد صور منشورة في المعرض حاليًا."}</div>}</Container>; }
