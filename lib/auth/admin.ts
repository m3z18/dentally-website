import "server-only";

import { redirect } from "next/navigation";

import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type AdminProfile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getAdminProfile(): Promise<AdminProfile | null> {
  if (!hasSupabasePublicEnv()) return null;

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active, created_at, updated_at")
    .eq("id", userId)
    .eq("is_active", true)
    .in("role", ["admin", "manager", "receptionist"])
    .maybeSingle();

  if (error || !profile) return null;
  return profile;
}

export async function requireAdmin() {
  if (!hasSupabasePublicEnv()) {
    redirect("/admin/login?error=configuration");
  }

  const profile = await getAdminProfile();
  if (!profile) redirect("/admin/login?error=unauthorized");
  return profile;
}

export async function requireContentManager() {
  const profile = await requireAdmin();
  if (profile.role !== "admin" && profile.role !== "manager") {
    redirect("/admin?error=content-permission");
  }
  return profile;
}
