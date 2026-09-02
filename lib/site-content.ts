import "server-only";
import { cache } from "react";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettingsRow } from "@/types/content";

export const getSiteSettings = cache(async (): Promise<SiteSettingsRow | null> => { if (!hasSupabasePublicEnv()) return null; const supabase = await createClient(); const { data, error } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle(); return error ? null : data as SiteSettingsRow | null; });
