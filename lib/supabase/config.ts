function readSupabasePublicEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    publicKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  };
}

function readSupabaseServerSecret() {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function getSupabasePublicConfig() {
  const config = readSupabasePublicEnv();

  if (!config.url || !config.publicKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return {
    url: config.url,
    publicKey: config.publicKey,
  };
}

export function getSupabaseServerConfig() {
  const { url } = readSupabasePublicEnv();
  const secretKey = readSupabaseServerSecret();

  if (!url || !secretKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return { url, secretKey };
}

export function hasSupabasePublicEnv() {
  const { url, publicKey } = readSupabasePublicEnv();
  return Boolean(url && publicKey);
}

export function hasSupabaseServerEnv() {
  const { url } = readSupabasePublicEnv();
  return Boolean(url && readSupabaseServerSecret());
}

export const supabaseConfigurationMessage =
  "خدمة المواعيد غير متاحة حاليًا. يرجى المحاولة لاحقًا أو التواصل مع المجمع.";
