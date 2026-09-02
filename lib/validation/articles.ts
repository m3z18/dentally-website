import type { ArticleInsert } from "@/types/content";
import { parseRiyadhDateTimeInput } from "@/lib/date";

type ArticleFormResult =
  | { success: true; data: ArticleInsert; references: Array<{ title: string; url: string; display_order: number }> }
  | { success: false; message: string };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const htmlPattern = /<[a-z!/][^>]*>/i;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optional(value: string) {
  return value || null;
}

function optionalDate(value: string) {
  if (!value) return null;
  return parseRiyadhDateTimeInput(value) ?? undefined;
}

function parseReferences(value: string) {
  const references: Array<{ title: string; url: string; display_order: number }> = [];
  for (const [index, line] of value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).entries()) {
    const separator = line.indexOf("|");
    if (separator < 1) return null;
    const title = line.slice(0, separator).trim();
    const url = line.slice(separator + 1).trim();
    if (title.length < 2 || title.length > 240 || url.length > 2000) return null;
    try {
      if (new URL(url).protocol !== "https:") return null;
    } catch {
      return null;
    }
    references.push({ title, url, display_order: index });
  }
  return references.length <= 30 ? references : null;
}

export function parseArticleForm(formData: FormData): ArticleFormResult {
  const slug = text(formData, "slug").toLowerCase();
  const titleAr = text(formData, "titleAr");
  const titleEn = text(formData, "titleEn");
  const excerptAr = text(formData, "excerptAr");
  const excerptEn = text(formData, "excerptEn");
  const contentAr = text(formData, "contentAr");
  const contentEn = text(formData, "contentEn");
  const categoryId = text(formData, "categoryId");
  const doctorId = text(formData, "authorDoctorId");
  const displayOrder = Number(text(formData, "displayOrder"));
  const scheduledPublishAt = optionalDate(text(formData, "scheduledPublishAt"));
  const scheduledUnpublishAt = optionalDate(text(formData, "scheduledUnpublishAt"));
  const references = parseReferences(text(formData, "references"));

  if (!slugPattern.test(slug) || slug.length < 2 || slug.length > 100) return { success: false, message: "تحقق من الرابط المختصر." };
  if (titleAr.length < 4 || titleAr.length > 180 || (titleEn && (titleEn.length < 4 || titleEn.length > 180))) return { success: false, message: "تحقق من عنوان المقال." };
  if (excerptAr.length < 20 || excerptAr.length > 500 || (excerptEn && (excerptEn.length < 20 || excerptEn.length > 500))) return { success: false, message: "تحقق من الملخص؛ يجب أن يكون بين 20 و500 حرف." };
  if (contentAr.length < 40 || contentAr.length > 100000 || (contentEn && (contentEn.length < 40 || contentEn.length > 100000))) return { success: false, message: "محتوى المقال قصير جدًا أو تجاوز الحد المسموح." };
  if (htmlPattern.test(contentAr) || htmlPattern.test(contentEn)) return { success: false, message: "HTML غير مسموح. استخدم أدوات التنسيق النصية الآمنة." };
  if (!Number.isSafeInteger(displayOrder) || displayOrder < 0) return { success: false, message: "ترتيب العرض غير صالح." };
  if (scheduledPublishAt === undefined || scheduledUnpublishAt === undefined) return { success: false, message: "تحقق من تواريخ الجدولة." };
  if (scheduledPublishAt && scheduledUnpublishAt && scheduledUnpublishAt <= scheduledPublishAt) return { success: false, message: "موعد إيقاف النشر يجب أن يكون بعد موعد بدء النشر." };
  if (!references) return { success: false, message: "اكتب كل مرجع بصيغة: العنوان | https://example.com" };

  const imageAltAr = text(formData, "imageAltAr");
  const imageAltEn = text(formData, "imageAltEn");
  const seoTitleAr = text(formData, "seoTitleAr");
  const seoTitleEn = text(formData, "seoTitleEn");
  const seoDescriptionAr = text(formData, "seoDescriptionAr");
  const seoDescriptionEn = text(formData, "seoDescriptionEn");
  if (imageAltAr.length > 180 || imageAltEn.length > 180 || seoTitleAr.length > 70 || seoTitleEn.length > 70 || seoDescriptionAr.length > 180 || seoDescriptionEn.length > 180) return { success: false, message: "أحد حقول الصورة أو SEO تجاوز الحد المسموح." };

  return {
    success: true,
    references,
    data: {
      slug,
      title_ar: titleAr,
      title_en: optional(titleEn),
      excerpt_ar: excerptAr,
      excerpt_en: optional(excerptEn),
      content_ar: contentAr,
      content_en: optional(contentEn),
      image_alt_ar: optional(imageAltAr),
      image_alt_en: optional(imageAltEn),
      author_name_ar: optional(text(formData, "authorNameAr")),
      author_name_en: optional(text(formData, "authorNameEn")),
      author_doctor_id: optional(doctorId),
      category_id: optional(categoryId),
      is_featured: formData.get("isFeatured") === "on",
      display_order: displayOrder,
      scheduled_publish_at: scheduledPublishAt,
      scheduled_unpublish_at: scheduledUnpublishAt,
      is_active: formData.get("isActive") === "on",
      seo_title_ar: optional(seoTitleAr),
      seo_title_en: optional(seoTitleEn),
      seo_description_ar: optional(seoDescriptionAr),
      seo_description_en: optional(seoDescriptionEn),
    },
  };
}
