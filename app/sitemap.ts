import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=getSiteUrl();const now=new Date();const routes=["","/about","/services","/doctors","/articles","/contact","/faq","/insurance","/offers","/gallery","/branches","/privacy","/terms","/appointment-policy","/medical-disclaimer"];
  const entries:MetadataRoute.Sitemap=routes.map(path=>({url:new URL(path||"/",base).toString(),lastModified:now,changeFrequency:path===""?"weekly":"monthly",priority:path===""?1:0.7}));
  if(!hasSupabasePublicEnv())return entries;const supabase=await createClient();const timestamp=now.toISOString();const [doctors,articles,services]=await Promise.all([supabase.from("doctors").select("slug,updated_at").eq("is_active",true).is("deleted_at",null),supabase.from("articles").select("slug,updated_at").eq("is_active",true).is("deleted_at",null).lte("published_at",timestamp).or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${timestamp}`).or(`scheduled_unpublish_at.is.null,scheduled_unpublish_at.gt.${timestamp}`),supabase.from("services").select("slug,updated_at").eq("is_public",true).is("deleted_at",null)]);
  for(const row of doctors.data??[])entries.push({url:new URL(`/doctors/${row.slug}`,base).toString(),lastModified:new Date(row.updated_at),changeFrequency:"monthly",priority:0.8});
  for(const row of articles.data??[])entries.push({url:new URL(`/articles/${row.slug}`,base).toString(),lastModified:new Date(row.updated_at),changeFrequency:"monthly",priority:0.7});
  for(const row of services.data??[])entries.push({url:new URL(`/services/${row.slug}`,base).toString(),lastModified:new Date(row.updated_at),changeFrequency:"monthly",priority:0.8});return entries;
}
