export function hasSupabasePublicEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseServerEnv() {
  return Boolean(hasSupabasePublicEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const supabaseConfigurationMessage =
  "خدمة المواعيد غير متاحة حاليًا. يرجى المحاولة لاحقًا أو التواصل مع المجمع.";
