"use server";

import { revalidatePath } from "next/cache";

import { requireContentManager } from "@/lib/auth/admin";
import {
  doctorImageMaximumBytes,
  doctorImageMimeTypes,
  doctorImagesBucket,
} from "@/lib/doctor-images";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/admin";
import { parseDoctorForm } from "@/lib/validation/doctors";
import type { AdminActionState } from "@/types/admin";

const operationError = "تعذر تنفيذ العملية، حاول مرة أخرى.";
const imageTypeError = "الصورة يجب أن تكون JPG أو PNG أو WebP صالحة.";

type PreparedImage = {
  bytes: ArrayBuffer;
  contentType: (typeof doctorImageMimeTypes)[number];
  extension: "jpg" | "png" | "webp";
};

function doctorErrorMessage(message: string, code?: string) {
  if (code === "23505" || message.toLowerCase().includes("duplicate")) {
    return "الرابط المختصر مستخدم لطبيب آخر. اختر رابطًا مختلفًا.";
  }

  return operationError;
}

function revalidateDoctorPages(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/admin/doctors");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/doctors/${slug}`);
  }
}

function bytesMatch(bytes: Uint8Array, expected: number[], offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

async function prepareDoctorImage(formData: FormData): Promise<
  | { success: true; image: PreparedImage | null }
  | { success: false; message: string }
> {
  const value = formData.get("image");
  if (!(value instanceof File) || value.size === 0) {
    return { success: true, image: null };
  }

  if (value.size > doctorImageMaximumBytes) {
    return { success: false, message: "حجم الصورة يجب ألا يتجاوز 5MB." };
  }

  if (!(doctorImageMimeTypes as readonly string[]).includes(value.type)) {
    return { success: false, message: imageTypeError };
  }

  const bytes = await value.arrayBuffer();
  const signature = new Uint8Array(bytes.slice(0, 12));
  const isJpeg = value.type === "image/jpeg" && bytesMatch(signature, [0xff, 0xd8, 0xff]);
  const isPng = value.type === "image/png" && bytesMatch(signature, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isWebp = value.type === "image/webp"
    && bytesMatch(signature, [0x52, 0x49, 0x46, 0x46])
    && bytesMatch(signature, [0x57, 0x45, 0x42, 0x50], 8);

  if (!isJpeg && !isPng && !isWebp) {
    return { success: false, message: imageTypeError };
  }

  return {
    success: true,
    image: {
      bytes,
      contentType: value.type as PreparedImage["contentType"],
      extension: isJpeg ? "jpg" : isPng ? "png" : "webp",
    },
  };
}

async function uploadDoctorImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  doctorId: string,
  image: PreparedImage,
) {
  const imagePath = `${doctorId}/${crypto.randomUUID()}.${image.extension}`;
  const { error } = await supabase.storage.from(doctorImagesBucket).upload(imagePath, image.bytes, {
    cacheControl: "3600",
    contentType: image.contentType,
    upsert: false,
  });

  return error ? { imagePath: null, error } : { imagePath, error: null };
}

async function removeDoctorImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imagePath: string,
) {
  const { error } = await supabase.storage.from(doctorImagesBucket).remove([imagePath]);
  return error;
}

export async function createDoctorAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireContentManager();
  const parsed = parseDoctorForm(formData);
  if (!parsed.success) return { status: "error", message: parsed.message };

  const preparedImage = await prepareDoctorImage(formData);
  if (!preparedImage.success) return { status: "error", message: preparedImage.message };

  const supabase = await createClient();
  const doctorId = crypto.randomUUID();
  let imagePath: string | null = null;

  if (preparedImage.image) {
    const upload = await uploadDoctorImage(supabase, doctorId, preparedImage.image);
    if (upload.error || !upload.imagePath) {
      return { status: "error", message: "تعذر رفع الصورة. تحقق من إعدادات Storage وحاول مرة أخرى." };
    }
    imagePath = upload.imagePath;
  }

  const { error } = await supabase.from("doctors").insert({
    ...parsed.data,
    id: doctorId,
    image_path: imagePath,
    is_active: false,
  });

  if (error) {
    if (imagePath) await removeDoctorImage(supabase, imagePath);
    return { status: "error", message: doctorErrorMessage(error.message, error.code) };
  }

  revalidateDoctorPages([parsed.data.slug]);
  return { status: "success", message: "تمت إضافة الطبيب بنجاح." };
}

export async function updateDoctorAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireContentManager();
  const doctorId = String(formData.get("doctorId") ?? "");
  if (!isUuid(doctorId)) return { status: "error", message: operationError };

  const parsed = parseDoctorForm(formData);
  if (!parsed.success) return { status: "error", message: parsed.message };

  const preparedImage = await prepareDoctorImage(formData);
  if (!preparedImage.success) return { status: "error", message: preparedImage.message };

  const supabase = await createClient();
  const { data: currentDoctor, error: readError } = await supabase
    .from("doctors")
    .select("slug, image_path, deleted_at")
    .eq("id", doctorId)
    .maybeSingle();

  if (readError || !currentDoctor) {
    return { status: "error", message: "لم يعد سجل الطبيب موجودًا أو تعذر الوصول إليه." };
  }

  if (currentDoctor.deleted_at) {
    return { status: "error", message: "استعد سجل الطبيب قبل تعديل بياناته." };
  }

  let uploadedImagePath: string | null = null;
  if (preparedImage.image) {
    const upload = await uploadDoctorImage(supabase, doctorId, preparedImage.image);
    if (upload.error || !upload.imagePath) {
      return { status: "error", message: "تعذر رفع الصورة الجديدة. لم تتغير الصورة الحالية." };
    }
    uploadedImagePath = upload.imagePath;
  }

  const removeCurrentImage = formData.get("removeImage") === "yes";
  const nextImagePath = uploadedImagePath ?? (removeCurrentImage ? null : currentDoctor.image_path);

  const { error } = await supabase
    .from("doctors")
    .update({ ...parsed.data, image_path: nextImagePath })
    .eq("id", doctorId);

  if (error) {
    if (uploadedImagePath) await removeDoctorImage(supabase, uploadedImagePath);
    return { status: "error", message: doctorErrorMessage(error.message, error.code) };
  }

  let imageCleanupFailed = false;
  if (currentDoctor.image_path && currentDoctor.image_path !== nextImagePath) {
    imageCleanupFailed = Boolean(await removeDoctorImage(supabase, currentDoctor.image_path));
  }

  revalidateDoctorPages([currentDoctor.slug, parsed.data.slug]);
  revalidatePath(`/admin/doctors/${doctorId}`);
  return {
    status: "success",
    message: imageCleanupFailed
      ? "تم حفظ بيانات الطبيب، لكن تعذر تنظيف ملف الصورة القديم من Storage."
      : "تم حفظ بيانات الطبيب.",
  };
}

export async function softDeleteDoctorAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireContentManager();
  const doctorId = String(formData.get("doctorId") ?? "");
  const confirmed = formData.get("confirmDeletion") === "yes";

  if (!isUuid(doctorId) || !confirmed) {
    return { status: "error", message: "أكد نقل السجل إلى المحذوفات قبل المتابعة." };
  }

  const supabase = await createClient();
  const { data: currentDoctor, error: readError } = await supabase
    .from("doctors")
    .select("slug, deleted_at")
    .eq("id", doctorId)
    .maybeSingle();

  if (readError || !currentDoctor) {
    return { status: "error", message: "لم يعد سجل الطبيب موجودًا أو تعذر الوصول إليه." };
  }

  if (currentDoctor.deleted_at) {
    return { status: "error", message: "سجل الطبيب موجود بالفعل في المحذوفات." };
  }

  const { error } = await supabase.from("doctors").update({
    deleted_at: new Date().toISOString(),
    is_active: false,
  }).eq("id", doctorId);
  if (error) return { status: "error", message: operationError };

  revalidateDoctorPages([currentDoctor.slug]);
  revalidatePath(`/admin/doctors/${doctorId}`);
  return { status: "success", message: "تم نقل سجل الطبيب إلى المحذوفات دون حذف بياناته." };
}

export async function restoreDoctorAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireContentManager();
  const doctorId = String(formData.get("doctorId") ?? "");
  if (!isUuid(doctorId)) return { status: "error", message: operationError };

  const supabase = await createClient();
  const { data: currentDoctor, error: readError } = await supabase
    .from("doctors")
    .select("slug, deleted_at")
    .eq("id", doctorId)
    .maybeSingle();

  if (readError || !currentDoctor) {
    return { status: "error", message: "لم يعد سجل الطبيب موجودًا أو تعذر الوصول إليه." };
  }

  if (!currentDoctor.deleted_at) {
    return { status: "error", message: "سجل الطبيب غير محذوف." };
  }

  const { error } = await supabase.from("doctors").update({
    deleted_at: null,
    is_active: false,
  }).eq("id", doctorId);

  if (error) return { status: "error", message: operationError };

  revalidateDoctorPages([currentDoctor.slug]);
  revalidatePath(`/admin/doctors/${doctorId}`);
  return { status: "success", message: "تمت استعادة الطبيب بحالة مخفي. يمكنك نشره يدويًا بعد المراجعة." };
}
