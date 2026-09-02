import "server-only";

import { cache } from "react";
import { dentalServices, getServiceBySlug } from "@/data/services";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { DentalService } from "@/types/service";
import type { BranchRow, SearchResult, ServiceContentRow } from "@/types/catalog";
import { getServiceImagePublicUrl } from "@/lib/service-images";

const emptyDetails = { procedures: [], needIndicators: [], visitExpectations: [], faq: [] };

function localized(ar: string | null | undefined, en: string | null | undefined, locale: "ar" | "en") {
  return locale === "en" ? en || ar || "" : ar || "";
}

function toDentalService(row: ServiceContentRow, locale: "ar" | "en"): DentalService {
  const fallback = getServiceBySlug(row.slug);
  const description = localized(row.description_ar, row.description_en, locale);
  const content = localized(row.content_ar, row.content_en, locale);
  return {
    id: row.id,
    slug: row.slug,
    title: localized(row.name_ar, row.name_en, locale),
    featured: row.display_order < 4,
    description: description || fallback?.description || "",
    intro: content || description || fallback?.intro || "",
    procedures: locale==="en" ? [] : fallback?.procedures ?? emptyDetails.procedures,
    needIndicators: locale==="en" ? [] : fallback?.needIndicators ?? emptyDetails.needIndicators,
    visitExpectations: locale==="en" ? [] : fallback?.visitExpectations ?? emptyDetails.visitExpectations,
    faq: locale==="en" ? [] : fallback?.faq ?? emptyDetails.faq,
    bookingEnabled:Boolean(fallback),imageUrl:getServiceImagePublicUrl(row.image_path),imageAlt:localized(row.image_alt_ar,row.image_alt_en,locale)||null,
    seoTitle:localized(row.seo_title_ar,row.seo_title_en,locale)||null,seoDescription:localized(row.seo_description_ar,row.seo_description_en,locale)||null,
  };
}

function localizeStatic(service:DentalService,locale:"ar"|"en"):DentalService{return locale==="en"?{...service,title:service.titleEn||service.title,description:service.descriptionEn||service.description,intro:service.introEn||service.descriptionEn||service.intro,procedures:[],needIndicators:[],visitExpectations:[],faq:[]}:service;}

export const getPublicServices = cache(async (locale: "ar" | "en"): Promise<DentalService[]> => {
  if (!hasSupabasePublicEnv()) return dentalServices.map(service=>localizeStatic(service,locale));
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").select("*").eq("is_public", true).is("deleted_at", null).order("display_order").order("name_ar");
  if (error) return dentalServices.map(service=>localizeStatic(service,locale));
  return (data as ServiceContentRow[]).map((row) => toDentalService(row, locale));
});

export const getPublicServiceBySlug = cache(async (slug: string, locale: "ar" | "en") => {
  if (!hasSupabasePublicEnv()) {const fallback=getServiceBySlug(slug);return fallback?localizeStatic(fallback,locale):null;}
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").select("*").eq("slug", slug).eq("is_public", true).is("deleted_at", null).maybeSingle();
  if(error){const fallback=getServiceBySlug(slug);return fallback?localizeStatic(fallback,locale):null;}if(!data)return null;return toDentalService(data as ServiceContentRow, locale);
});

export const getPublicBranches = cache(async (): Promise<BranchRow[]> => {
  if (!hasSupabasePublicEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("branches").select("*").eq("is_active", true).is("deleted_at", null).order("display_order").order("name_ar");
  return error ? [] : data as BranchRow[];
});

export async function searchPublishedContent(query: string, locale: "ar" | "en"): Promise<SearchResult[]> {
  const term = query.trim().slice(0, 80);
  if (term.length < 2 || !hasSupabasePublicEnv()) return [];
  const supabase = await createClient();
  const safe = term.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();
  if (safe.length < 2) return [];
  const [services, doctors, articles] = await Promise.all([
    supabase.from("services").select("slug,name_ar,name_en,description_ar,description_en").eq("is_public", true).is("deleted_at", null).or(`name_ar.ilike.%${safe}%,name_en.ilike.%${safe}%,description_ar.ilike.%${safe}%,description_en.ilike.%${safe}%`).limit(8),
    supabase.from("doctors").select("slug,name_ar,name_en,short_bio_ar,short_bio_en").eq("is_active", true).is("deleted_at", null).or(`name_ar.ilike.%${safe}%,name_en.ilike.%${safe}%,specialty_ar.ilike.%${safe}%,specialty_en.ilike.%${safe}%`).limit(8),
    supabase.from("articles").select("slug,title_ar,title_en,excerpt_ar,excerpt_en").eq("is_active", true).is("deleted_at", null).lte("published_at", new Date().toISOString()).or(`title_ar.ilike.%${safe}%,title_en.ilike.%${safe}%,excerpt_ar.ilike.%${safe}%,excerpt_en.ilike.%${safe}%`).limit(8),
  ]);
  const results: SearchResult[] = [];
  for (const row of services.data ?? []) results.push({ type: "service", title: localized(row.name_ar,row.name_en,locale), description: localized(row.description_ar,row.description_en,locale), href: `/services/${row.slug}` });
  for (const row of doctors.data ?? []) results.push({ type: "doctor", title: localized(row.name_ar,row.name_en,locale), description: localized(row.short_bio_ar,row.short_bio_en,locale), href: `/doctors/${row.slug}` });
  for (const row of articles.data ?? []) results.push({ type: "article", title: localized(row.title_ar,row.title_en,locale), description: localized(row.excerpt_ar,row.excerpt_en,locale), href: `/articles/${row.slug}` });
  return results;
}
