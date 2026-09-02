import "server-only";
import { cache } from "react";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export function getSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL;
  if (candidate) { try { const url=new URL(candidate); if(url.protocol==="https:") return new URL(url.origin); } catch {} }
  return new URL("https://dentally.example");
}

export const getSlugRedirect = cache(async (entity:"doctor"|"article"|"service",slug:string) => {
  if(!hasSupabasePublicEnv()||!slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))return null;
  const supabase=await createClient();const{data,error}=await supabase.from("content_redirects").select("new_slug").eq("entity_type",entity).eq("old_slug",slug).maybeSingle();
  return error||!data?null:data.new_slug;
});
