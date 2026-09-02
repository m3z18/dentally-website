import type { DoctorInsert } from "@/types/doctor";
import { isUuid } from "@/lib/validation/admin";

export type DoctorFormResult =
  | { success: true; data: DoctorInsert }
  | { success: false; message: string };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function readLines(value: string, maximumItems: number, maximumLength: number) {
  const items = [...new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))];

  if (items.length > maximumItems || items.some((item) => item.length > maximumLength)) {
    return null;
  }

  return items;
}

function optionalText(value: string) {
  return value || null;
}

function hasOptionalLength(value: string, minimum: number, maximum: number) {
  return !value || (value.length >= minimum && value.length <= maximum);
}

export function parseDoctorForm(formData: FormData): DoctorFormResult {
  const slug = readText(formData, "slug").toLowerCase();
  const nameAr = readText(formData, "nameAr");
  const nameEn = readText(formData, "nameEn");
  const professionalTitleAr = readText(formData, "professionalTitleAr");
  const professionalTitleEn = readText(formData, "professionalTitleEn");
  const specialtyAr = readText(formData, "specialtyAr");
  const specialtyEn = readText(formData, "specialtyEn");
  const specialtyId = readText(formData, "specialtyId");
  const shortBioAr = readText(formData, "shortBioAr");
  const shortBioEn = readText(formData, "shortBioEn");
  const bioAr = readText(formData, "bioAr");
  const bioEn = readText(formData, "bioEn");
  const imageAltAr = readText(formData, "imageAltAr");
  const imageAltEn = readText(formData, "imageAltEn");
  const displayOrder = Number(readText(formData, "displayOrder"));
  const qualificationsAr = readLines(readText(formData, "qualificationsAr"), 20, 240);
  const qualificationsEn = readLines(readText(formData, "qualificationsEn"), 20, 240);
  const expertiseAr = readLines(readText(formData, "expertiseAr"), 20, 160);
  const expertiseEn = readLines(readText(formData, "expertiseEn"), 20, 160);
  const languagesAr = readLines(readText(formData, "languagesAr"), 12, 80);
  const languagesEn = readLines(readText(formData, "languagesEn"), 12, 80);

  if (!slugPattern.test(slug) || slug.length < 2 || slug.length > 80) {
    return { success: false, message: "الرابط المختصر يجب أن يتكون من أحرف إنجليزية صغيرة وأرقام وشرطات فقط." };
  }

  if (nameAr.length < 2 || nameAr.length > 120) {
    return { success: false, message: "تحقق من اسم الطبيب؛ يجب أن يكون بين حرفين و120 حرفًا." };
  }

  if (!hasOptionalLength(nameEn, 2, 120)) {
    return { success: false, message: "تحقق من اسم الطبيب بالإنجليزية." };
  }

  if (professionalTitleAr.length < 1 || professionalTitleAr.length > 40) {
    return { success: false, message: "تحقق من اللقب المهني." };
  }

  if (!hasOptionalLength(professionalTitleEn, 1, 40)) {
    return { success: false, message: "تحقق من اللقب المهني بالإنجليزية." };
  }

  if (specialtyAr.length < 2 || specialtyAr.length > 160) {
    return { success: false, message: "تحقق من التخصص؛ يجب أن يكون بين حرفين و160 حرفًا." };
  }

  if (!hasOptionalLength(specialtyEn, 2, 160)) {
    return { success: false, message: "تحقق من التخصص بالإنجليزية." };
  }

  if (specialtyId && !isUuid(specialtyId)) {
    return { success: false, message: "التخصص المختار غير صالح." };
  }

  if (shortBioAr.length < 10 || shortBioAr.length > 320) {
    return { success: false, message: "النبذة المختصرة يجب أن تكون بين 10 و320 حرفًا." };
  }

  if (!hasOptionalLength(shortBioEn, 10, 320)) {
    return { success: false, message: "النبذة الإنجليزية يجب أن تكون بين 10 و320 حرفًا عند إدخالها." };
  }

  if (bioAr.length > 5000 || bioEn.length > 5000) {
    return { success: false, message: "السيرة المهنية يجب ألا تتجاوز 5000 حرف." };
  }

  if (!qualificationsAr || !qualificationsEn || !expertiseAr || !expertiseEn || !languagesAr || !languagesEn) {
    return { success: false, message: "تحقق من القوائم؛ اكتب عنصرًا واحدًا في كل سطر ضمن الحدود المسموحة." };
  }

  if (imageAltAr.length > 180 || imageAltEn.length > 180) {
    return { success: false, message: "وصف الصورة يجب ألا يتجاوز 180 حرفًا." };
  }

  if (!Number.isSafeInteger(displayOrder) || displayOrder < 0 || displayOrder > 2147483647) {
    return { success: false, message: "ترتيب العرض يجب أن يكون عددًا صحيحًا غير سالب." };
  }

  return {
    success: true,
    data: {
      slug,
      name_ar: nameAr,
      name_en: optionalText(nameEn),
      professional_title_ar: professionalTitleAr,
      professional_title_en: optionalText(professionalTitleEn),
      specialty_ar: specialtyAr,
      specialty_en: optionalText(specialtyEn),
      specialty_id: optionalText(specialtyId),
      short_bio_ar: shortBioAr,
      short_bio_en: optionalText(shortBioEn),
      bio_ar: optionalText(bioAr),
      bio_en: optionalText(bioEn),
      qualifications_ar: qualificationsAr,
      qualifications_en: qualificationsEn,
      expertise_ar: expertiseAr,
      expertise_en: expertiseEn,
      languages_ar: languagesAr,
      languages_en: languagesEn,
      image_alt_ar: optionalText(imageAltAr),
      image_alt_en: optionalText(imageAltEn),
      display_order: displayOrder,
      is_active: formData.get("isActive") === "on",
    },
  };
}
