import "server-only";

import { cache } from "react";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { PublicArticle } from "@/types/content";

const publicFields = "*, article_categories(slug,name_ar,name_en)";

export const getPublicArticles = cache(async ({ query = "", category = "", page = 1, pageSize = 9 }: { query?: string; category?: string; page?: number; pageSize?: number } = {}) => {
  if (!hasSupabasePublicEnv()) return { articles: [] as PublicArticle[], count: 0, unavailable: true };
  const supabase = await createClient();
  const safePage = Math.max(1, page);
  const size = Math.min(24, Math.max(1, pageSize));
  const fields = category ? "*, article_categories!inner(slug,name_ar,name_en)" : publicFields;
  let request = supabase.from("articles").select(fields, { count: "exact" }).eq("is_active", true).is("deleted_at", null);
  if (query) request = request.or(`title_ar.ilike.%${query}%,title_en.ilike.%${query}%,excerpt_ar.ilike.%${query}%,excerpt_en.ilike.%${query}%`);
  if (category) request = request.eq("article_categories.slug", category);
  const { data, count, error } = await request.order("is_featured", { ascending: false }).order("display_order").order("published_at", { ascending: false }).range((safePage - 1) * size, safePage * size - 1);
  return { articles: error ? [] : data as unknown as PublicArticle[], count: error ? 0 : count ?? 0, unavailable: Boolean(error) };
});

export const getPublicArticleBySlug = cache(async (slug: string) => {
  if (!hasSupabasePublicEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select(`${publicFields}, article_references(*)`).eq("slug", slug).eq("is_active", true).is("deleted_at", null).maybeSingle();
  return error ? null : data as unknown as PublicArticle | null;
});

export const getPublicArticleCategories = cache(async () => {
  if (!hasSupabasePublicEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("article_categories").select("*").eq("is_active", true).is("deleted_at", null).order("display_order").order("name_ar");
  return data ?? [];
});

export function articleReadingMinutes(content: string) {
  const words = content.replace(/[#>*_`\[\]()-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}
