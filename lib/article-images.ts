export const articleImagesBucket = "article-images";
export const articleImageMaximumBytes = 5 * 1024 * 1024;
export const articleImageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

const articleImagePathPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/;

export function isArticleImagePath(value: string) {
  return articleImagePathPattern.test(value);
}

export function getArticleImagePublicUrl(imagePath: string | null) {
  if (!imagePath || !isArticleImagePath(imagePath)) return null;
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const projectUrl = new URL(configuredUrl);
    if (projectUrl.protocol !== "https:") return null;
    const encodedPath = imagePath.split("/").map(encodeURIComponent).join("/");
    return `${projectUrl.origin}/storage/v1/object/public/${articleImagesBucket}/${encodedPath}`;
  } catch {
    return null;
  }
}
