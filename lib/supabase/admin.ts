import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseServerConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const { url, secretKey } = getSupabaseServerConfig();

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
