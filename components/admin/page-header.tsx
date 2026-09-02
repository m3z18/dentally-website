import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n";

const english = new Map<string, string>([
  ["نظرة عامة", "Overview"],
  ["المواعيد", "Appointments"],
  ["تفاصيل الموعد", "Appointment details"],
  ["أوقات العمل", "Availability"],
  ["الأوقات المغلقة", "Blocked times"],
  ["الأطباء", "Doctors"],
  ["إضافة طبيب", "Add doctor"],
  ["الخدمات", "Services"],
  ["التخصصات", "Specialties"],
  ["الفروع", "Branches"],
  ["المقالات", "Articles"],
  ["إضافة مقال", "Add article"],
  ["تصنيفات المقالات", "Article categories"],
  ["الأسئلة الشائعة", "FAQ"],
  ["إعدادات الموقع", "Site settings"],
  ["شركات التأمين", "Insurance providers"],
  ["العروض والتنبيهات", "Offers and announcements"],
  ["آراء المرضى", "Testimonials"],
  ["معرض المجمع", "Clinic gallery"],
  ["مكتبة الوسائط", "Media library"],
  ["سجل التدقيق", "Audit log"],
  ["Dentally Admin", "Dentally Admin"],
  ["إدارة الحجوزات", "Booking management"],
  ["إدارة التوفر", "Availability management"],
  ["جدول المواعيد", "Appointment schedule"],
  ["فريق المجمع", "Clinic team"],
  ["ملف مهني جديد", "New professional profile"],
  ["تحرير الملف المهني", "Edit professional profile"],
  ["إدارة المحتوى", "Content management"],
  ["المركز التوعوي", "Education center"],
  ["الأمان والمراجعة", "Security and review"],
  ["محتوى الموقع", "Site content"],
  ["محتوى موثق", "Verified content"],
  ["مسودة جديدة", "New draft"],
  ["تحرير المقال", "Edit article"],
  ["معاينة إدارية", "Admin preview"],
  ["ملخص حي للحجوزات وجدول الأسبوع الحالي.", "A live summary of bookings and the current week schedule."],
  ["اعرض المواعيد القادمة، وابحث وفلتر دون كشف البيانات خارج لوحة الإدارة.", "View, search, and filter appointments securely within the admin dashboard."],
  ["حدد أيام العمل ووقت البداية والنهاية ومدة كل موعد. أي تعديل ينعكس على المواعيد المتاحة الجديدة.", "Set working days, start and end times, and appointment duration. Changes affect newly available appointments."],
  ["أضف فترة مغلقة لمنع ظهور أوقاتها في رحلة الحجز، أو احذفها لإتاحتها مجددًا.", "Add a blocked period to hide its times from booking, or remove it to make them available again."],
  ["إدارة الملفات المهنية وترتيب ظهورها في الموقع العام، بصورة مستقلة عن نظام الحجوزات.", "Manage professional profiles and their public display order independently from bookings."],
  ["أدخل البيانات المعتمدة، ثم فعّل النشر عندما يصبح الملف جاهزًا للظهور العام.", "Enter the approved information, then publish the profile when it is ready for public display."],
  ["حدّث البيانات وحالة الظهور وترتيب الملف في الموقع العام.", "Update the profile information, visibility, and public display order."],
  ["إدارة المركز التوعوي والمسودات والنشر والجدولة.", "Manage the education center, drafts, publishing, and scheduling."],
  ["يُحفظ المقال مخفيًا افتراضيًا حتى تراجعه وتنشره.", "Articles are hidden by default until reviewed and published."],
  ["راجع المحتوى والصورة وحالة النشر.", "Review the content, image, and publishing status."],
  ["التصنيف الجديد مخفي افتراضيًا، والحذف منطقي.", "New categories are hidden by default and use soft deletion."],
  ["أسئلة عامة أو مرتبطة بخدمة، مع نشر اختياري وحذف منطقي.", "General or service-related questions with optional publishing and soft deletion."],
  ["محتوى صفحات الخدمات مع بقاء اختيار الخدمة الحالي في الحجز متوافقًا ودون تغيير منطق الحجز.", "Service page content while preserving the current booking service selection and booking logic."],
  ["تصنيف محتوى الأطباء والخدمات فقط، دون أي ربط بالحجز أو التوافر.", "Classifies doctor and service content only, without linking to booking or availability."],
  ["معلومات عامة للفروع فقط. الفروع غير مرتبطة بالحجز الحالي.", "Public branch information only. Branches are not linked to the current booking flow."],
  ["مصدر منظم لبيانات المنشأة والتواصل وSEO والتنبيه الطبي. لا تُخزن أسرار هنا.", "A structured source for organization, contact, SEO, and medical disclaimer content. Do not store secrets here."],
  ["لا تضف أو تنشر شركة قبل اعتمادها.", "Do not add or publish a provider before approval."],
  ["العروض خارج الفترة لا تظهر للعامة.", "Offers outside their date range are not shown publicly."],
  ["لا تنشر إلا آراء حقيقية موثقة ومصرحًا باستخدامها.", "Publish only genuine, verified reviews with permission for use."],
  ["صور المنشأة المعتمدة فقط؛ صور المرضى غير مفعلة.", "Approved facility images only; patient images are disabled."],
  ["عرض وبحث آمن للصور الموجودة في buckets الحالية. الإزالة تتم فقط من نموذج السجل المرتبط لتجنب كسر المحتوى.", "Safely view and search images in the current buckets. Removal is only available from the related record form."],
  ["بيانات وصفية للعمليات الإدارية المهمة دون تخزين محتوى أو أسرار أو بيانات مرضى.", "Metadata for important admin actions without storing content, secrets, or patient data."],
]);

export async function AdminPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
}) {
  const locale = await getLocale();
  const translate = (value: string) => locale === "en" ? (english.get(value) ?? value) : value;

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold text-brand">{translate(eyebrow)}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">{translate(title)}</h1>
      <p className="mt-3 text-sm leading-7 text-muted">{typeof description === "string" ? translate(description) : description}</p>
    </div>
  );
}
