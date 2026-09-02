export const serviceImagesBucket = "service-images";
export const serviceImageMaximumBytes = 5 * 1024 * 1024;
export const serviceImageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const pathPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/;
export function getServiceImagePublicUrl(path:string|null){if(!path||!pathPattern.test(path))return null;const configured=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();if(!configured)return null;try{const url=new URL(configured);if(url.protocol!=="https:")return null;return `${url.origin}/storage/v1/object/public/${serviceImagesBucket}/${path.split("/").map(encodeURIComponent).join("/")}`;}catch{return null;}}
