import "server-only";
import { cache } from "react";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const getPublicCollection = cache(async (table: "insurance_providers" | "offers" | "testimonials" | "gallery_items") => {
  if (!hasSupabasePublicEnv()) return [];
  const supabase = await createClient();
  let request = supabase.from(table).select("*").eq("is_active", true).is("deleted_at", null);
  if (table === "offers") {
    const now = new Date().toISOString();
    request = request.or(`start_at.is.null,start_at.lte.${now}`).or(`end_at.is.null,end_at.gt.${now}`);
  }
  const { data, error } = await request.order("display_order");
  return error ? [] : data ?? [];
});
