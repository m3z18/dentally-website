"use server";

import { revalidatePath } from "next/cache";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/admin";
import type { AdminActionState } from "@/types/admin";

const errorMessage = "تعذر حفظ التصنيف.";
function value(data: FormData, name: string) { return String(data.get(name) ?? "").trim(); }

export async function saveCategoryAction(_state: AdminActionState, data: FormData): Promise<AdminActionState> {
  await requireContentManager(); const id = value(data, "id"); const slug = value(data, "slug").toLowerCase(); const nameAr = value(data, "nameAr"); const nameEn = value(data, "nameEn"); const order = Number(value(data, "displayOrder"));
  if ((id && !isUuid(id)) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || nameAr.length < 2 || nameAr.length > 120 || (nameEn && (nameEn.length < 2 || nameEn.length > 120)) || !Number.isSafeInteger(order) || order < 0) return { status: "error", message: "تحقق من بيانات التصنيف." };
  const payload = { slug, name_ar: nameAr, name_en: nameEn || null, description_ar: value(data, "descriptionAr") || null, description_en: value(data, "descriptionEn") || null, display_order: order, is_active: id ? data.get("isActive") === "on" : false };
  const supabase = await createClient(); const result = id ? await supabase.from("article_categories").update(payload).eq("id", id) : await supabase.from("article_categories").insert(payload);
  if (result.error) return { status: "error", message: result.error.code === "23505" ? "الرابط المختصر مستخدم." : errorMessage };
  revalidatePath("/articles"); revalidatePath("/admin/categories"); return { status: "success", message: id ? "تم تحديث التصنيف." : "أُضيف التصنيف مخفيًا." };
}

export async function toggleCategoryDeletionAction(_state: AdminActionState, data: FormData): Promise<AdminActionState> {
  await requireContentManager(); const id = value(data, "id"); if (!isUuid(id)) return { status: "error", message: errorMessage }; const restore = data.get("restore") === "yes"; const supabase = await createClient(); const { error } = await supabase.from("article_categories").update({ deleted_at: restore ? null : new Date().toISOString(), is_active: false }).eq("id", id); if (error) return { status: "error", message: errorMessage }; revalidatePath("/articles"); revalidatePath("/admin/categories"); return { status: "success", message: restore ? "استُعيد التصنيف مخفيًا." : "نُقل التصنيف إلى المحذوفات." };
}
