"use server";

import { revalidatePath } from "next/cache";

import { requireContentManager } from "@/lib/auth/admin";
import { articleImageMaximumBytes, articleImageMimeTypes, articleImagesBucket } from "@/lib/article-images";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/admin";
import { parseArticleForm } from "@/lib/validation/articles";
import type { AdminActionState } from "@/types/admin";

type PreparedImage = { bytes: ArrayBuffer; contentType: (typeof articleImageMimeTypes)[number]; extension: "jpg" | "png" | "webp" };
const genericError = "تعذر تنفيذ العملية. تحقق من البيانات وإعدادات قاعدة البيانات.";

function matches(bytes: Uint8Array, expected: number[], offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

async function prepareImage(formData: FormData): Promise<{ success: true; image: PreparedImage | null } | { success: false; message: string }> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { success: true, image: null };
  if (file.size > articleImageMaximumBytes) return { success: false, message: "حجم الصورة يجب ألا يتجاوز 5MB." };
  if (!(articleImageMimeTypes as readonly string[]).includes(file.type)) return { success: false, message: "الصورة يجب أن تكون JPG أو PNG أو WebP." };
  const bytes = await file.arrayBuffer();
  const signature = new Uint8Array(bytes.slice(0, 12));
  const jpeg = file.type === "image/jpeg" && matches(signature, [0xff, 0xd8, 0xff]);
  const png = file.type === "image/png" && matches(signature, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const webp = file.type === "image/webp" && matches(signature, [0x52, 0x49, 0x46, 0x46]) && matches(signature, [0x57, 0x45, 0x42, 0x50], 8);
  if (!jpeg && !png && !webp) return { success: false, message: "توقيع ملف الصورة غير صالح." };
  return { success: true, image: { bytes, contentType: file.type as PreparedImage["contentType"], extension: jpeg ? "jpg" : png ? "png" : "webp" } };
}

function refreshArticles(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(`/articles/${slug}`);
}

async function uploadImage(supabase: Awaited<ReturnType<typeof createClient>>, articleId: string, image: PreparedImage) {
  const path = `${articleId}/${crypto.randomUUID()}.${image.extension}`;
  const { error } = await supabase.storage.from(articleImagesBucket).upload(path, image.bytes, { cacheControl: "3600", contentType: image.contentType, upsert: false });
  return error ? null : path;
}

async function removeImage(supabase: Awaited<ReturnType<typeof createClient>>, path: string) {
  return (await supabase.storage.from(articleImagesBucket).remove([path])).error;
}

async function replaceReferences(supabase: Awaited<ReturnType<typeof createClient>>, articleId: string, references: Array<{ title: string; url: string; display_order: number }>) {
  const { error: deleteError } = await supabase.from("article_references").delete().eq("article_id", articleId);
  if (deleteError) return deleteError;
  if (!references.length) return null;
  return (await supabase.from("article_references").insert(references.map((reference) => ({ ...reference, article_id: articleId })))).error;
}

export async function createArticleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireContentManager();
  const parsed = parseArticleForm(formData);
  if (!parsed.success) return { status: "error", message: parsed.message };
  const prepared = await prepareImage(formData);
  if (!prepared.success) return { status: "error", message: prepared.message };
  const supabase = await createClient();
  const id = crypto.randomUUID();
  const imagePath = prepared.image ? await uploadImage(supabase, id, prepared.image) : null;
  if (prepared.image && !imagePath) return { status: "error", message: "تعذر رفع صورة المقال." };
  const { error } = await supabase.from("articles").insert({ ...parsed.data, id, image_path: imagePath, is_active: false, published_at: null });
  if (error) {
    if (imagePath) await removeImage(supabase, imagePath);
    return { status: "error", message: error.code === "23505" ? "الرابط المختصر مستخدم لمقال آخر." : genericError };
  }
  const referenceError = await replaceReferences(supabase, id, parsed.references);
  refreshArticles([parsed.data.slug]);
  return { status: referenceError ? "error" : "success", message: referenceError ? "حُفظ المقال كمسودة، لكن تعذر حفظ المراجع." : "تم إنشاء المقال كمسودة مخفية." };
}

export async function updateArticleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireContentManager();
  const id = String(formData.get("articleId") ?? "");
  if (!isUuid(id)) return { status: "error", message: genericError };
  const parsed = parseArticleForm(formData);
  if (!parsed.success) return { status: "error", message: parsed.message };
  const prepared = await prepareImage(formData);
  if (!prepared.success) return { status: "error", message: prepared.message };
  const supabase = await createClient();
  const { data: current, error: readError } = await supabase.from("articles").select("slug,image_path,deleted_at,published_at,is_active").eq("id", id).maybeSingle();
  if (readError || !current) return { status: "error", message: "المقال غير موجود." };
  if (current.deleted_at) return { status: "error", message: "استعد المقال قبل تعديله." };
  const uploadedPath = prepared.image ? await uploadImage(supabase, id, prepared.image) : null;
  if (prepared.image && !uploadedPath) return { status: "error", message: "تعذر رفع الصورة الجديدة." };
  const nextImagePath = uploadedPath ?? (formData.get("removeImage") === "yes" ? null : current.image_path);
  const publishedAt = parsed.data.is_active && !current.is_active && !current.published_at ? new Date().toISOString() : current.published_at;
  const { error } = await supabase.from("articles").update({ ...parsed.data, image_path: nextImagePath, published_at: publishedAt }).eq("id", id);
  if (error) {
    if (uploadedPath) await removeImage(supabase, uploadedPath);
    return { status: "error", message: error.code === "23505" ? "الرابط المختصر مستخدم لمقال آخر." : genericError };
  }
  const referenceError = await replaceReferences(supabase, id, parsed.references);
  let cleanupError = false;
  if (current.image_path && current.image_path !== nextImagePath) cleanupError = Boolean(await removeImage(supabase, current.image_path));
  refreshArticles([current.slug, parsed.data.slug]);
  revalidatePath(`/admin/articles/${id}`);
  return { status: referenceError ? "error" : "success", message: referenceError ? "حُفظ المقال، لكن تعذر تحديث المراجع." : cleanupError ? "حُفظ المقال، لكن تعذر تنظيف الصورة القديمة." : "تم حفظ المقال." };
}

export async function softDeleteArticleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireContentManager();
  const id = String(formData.get("articleId") ?? "");
  if (!isUuid(id) || formData.get("confirmDeletion") !== "yes") return { status: "error", message: "أكد نقل المقال إلى المحذوفات." };
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("slug,deleted_at").eq("id", id).maybeSingle();
  if (!data || data.deleted_at) return { status: "error", message: "المقال غير موجود أو محذوف بالفعل." };
  const { error } = await supabase.from("articles").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
  if (error) return { status: "error", message: genericError };
  refreshArticles([data.slug]);
  return { status: "success", message: "نُقل المقال إلى المحذوفات مع الاحتفاظ بصورته." };
}

export async function restoreArticleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireContentManager();
  const id = String(formData.get("articleId") ?? "");
  if (!isUuid(id)) return { status: "error", message: genericError };
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("slug,deleted_at").eq("id", id).maybeSingle();
  if (!data?.deleted_at) return { status: "error", message: "المقال غير موجود في المحذوفات." };
  const { error } = await supabase.from("articles").update({ deleted_at: null, is_active: false }).eq("id", id);
  if (error) return { status: "error", message: genericError };
  refreshArticles([data.slug]);
  return { status: "success", message: "استُعيد المقال بحالة مخفية." };
}

export async function duplicateArticleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireContentManager();
  const id = String(formData.get("articleId") ?? "");
  if (!isUuid(id)) return { status: "error", message: genericError };
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) return { status: "error", message: "المقال غير موجود." };
  const copyId = crypto.randomUUID();
  const suffix = copyId.slice(0, 8);
  const { id: _id, created_at: _created, updated_at: _updated, deleted_at: _deleted, image_path: _image, ...copy } = data;
  void _id; void _created; void _updated; void _deleted; void _image;
  const { error } = await supabase.from("articles").insert({ ...copy, id: copyId, slug: `${data.slug.slice(0, 85)}-copy-${suffix}`, title_ar: `${data.title_ar} — نسخة`, image_path: null, is_active: false, published_at: null, scheduled_publish_at: null, scheduled_unpublish_at: null, deleted_at: null });
  if (error) return { status: "error", message: genericError };
  const { data: references } = await supabase.from("article_references").select("title,url,display_order").eq("article_id", id);
  if (references?.length) await supabase.from("article_references").insert(references.map((reference) => ({ ...reference, article_id: copyId })));
  refreshArticles([]);
  return { status: "success", message: "أُنشئت نسخة مخفية دون نسخ الصورة." };
}
