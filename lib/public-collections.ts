import "server-only";
import { cache } from "react";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const getPublicCollection = cache(async (table: "insurance_providers" | "offers" | "testimonials" | "gallery_items") => { if (!hasSupabasePublicEnv()) return []; const supabase = await createClient(); const { data } = await supabase.from(table).select("*").eq("is_active", true).is("deleted_at", null).order("display_order"); return data ?? []; });
