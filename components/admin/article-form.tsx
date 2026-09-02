"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { createArticleAction, updateArticleAction } from "@/app/admin/articles/actions";
import { articleImageMaximumBytes, articleImageMimeTypes, getArticleImagePublicUrl } from "@/lib/article-images";
import { formatRiyadhDateTimeInput } from "@/lib/date";
import type { ArticleCategoryRow, ArticleReferenceRow, ArticleRow } from "@/types/content";
import type { DoctorRow } from "@/types/doctor";
import type { AdminActionState } from "@/types/admin";

const initialState: AdminActionState = { status: "idle", message: "" };
const input = "min-h-12 rounded-xl border border-line bg-background px-3.5 text-sm font-normal text-foreground outline-none focus:border-brand";
const area = `${input} min-h-28 resize-y py-3 leading-7`;

export function ArticleForm({ article, categories, doctors, references = [] }: { article?: ArticleRow; categories: ArticleCategoryRow[]; doctors: DoctorRow[]; references?: ArticleReferenceRow[] }) {
  const [state, formAction, pending] = useActionState(article ? updateArticleAction : createArticleAction, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const currentImage = getArticleImagePublicUrl(article?.image_path ?? null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function imageChanged(event: React.ChangeEvent<HTMLInputElement>) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!(articleImageMimeTypes as readonly string[]).includes(file.type) || file.size > articleImageMaximumBytes) {
      event.currentTarget.value = "";
      return;
    }
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="mt-8 grid gap-6" aria-busy={pending}>
      {article && <input type="hidden" name="articleId" value={article.id} />}
      <Panel title="المحتوى العربي">
        <Grid>
          <Field label="العنوان"><input className={input} name="titleAr" required minLength={4} maxLength={180} defaultValue={article?.title_ar ?? ""} /></Field>
          <Field label="الرابط المختصر"><input className={input} name="slug" required dir="ltr" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={100} defaultValue={article?.slug ?? ""} /></Field>
        </Grid>
        <Field label="الملخص"><textarea className={area} name="excerptAr" required minLength={20} maxLength={500} defaultValue={article?.excerpt_ar ?? ""} /></Field>
        <MarkdownEditor name="contentAr" label="المحتوى" defaultValue={article?.content_ar ?? ""} required />
      </Panel>

      <Panel title="English content" ltr>
        <Grid>
          <Field label="Title"><input className={input} name="titleEn" minLength={4} maxLength={180} defaultValue={article?.title_en ?? ""} /></Field>
          <Field label="Excerpt"><textarea className={area} name="excerptEn" minLength={20} maxLength={500} defaultValue={article?.excerpt_en ?? ""} /></Field>
        </Grid>
        <MarkdownEditor name="contentEn" label="Content" defaultValue={article?.content_en ?? ""} />
      </Panel>

      <Panel title="التصنيف والكاتب">
        <Grid>
          <Field label="التصنيف"><select className={input} name="categoryId" defaultValue={article?.category_id ?? ""}><option value="">بدون تصنيف</option>{categories.filter((item) => !item.deleted_at).map((item) => <option key={item.id} value={item.id}>{item.name_ar}</option>)}</select></Field>
          <Field label="ربط الكاتب بطبيب"><select className={input} name="authorDoctorId" defaultValue={article?.author_doctor_id ?? ""}><option value="">بدون ربط</option>{doctors.filter((item) => !item.deleted_at).map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.professional_title_ar} {doctor.name_ar}</option>)}</select></Field>
          <Field label="اسم الكاتب بالعربية"><input className={input} name="authorNameAr" maxLength={120} defaultValue={article?.author_name_ar ?? ""} /></Field>
          <Field label="Author name"><input className={input} name="authorNameEn" dir="ltr" maxLength={120} defaultValue={article?.author_name_en ?? ""} /></Field>
        </Grid>
      </Panel>

      <Panel title="الصورة">
        <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-brand-soft">{preview || (!removeImage && currentImage) ? (
            // Blob URLs used by the local file preview are not supported by next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview ?? currentImage ?? ""} alt="معاينة" className="h-full w-full object-cover" />
          ) : <div className="grid h-full place-items-center text-xs text-muted">لا توجد صورة</div>}</div>
          <Grid>
            <Field label="صورة المقال" hint="JPG أو PNG أو WebP، حتى 5MB"><input className={`${input} py-2`} type="file" name="image" accept={articleImageMimeTypes.join(",")} onChange={imageChanged} /></Field>
            <Field label="وصف الصورة بالعربية"><input className={input} name="imageAltAr" maxLength={180} defaultValue={article?.image_alt_ar ?? ""} /></Field>
            <Field label="Image alt text"><input className={input} name="imageAltEn" dir="ltr" maxLength={180} defaultValue={article?.image_alt_en ?? ""} /></Field>
            {article?.image_path && <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="removeImage" value="yes" checked={removeImage} onChange={(event) => setRemoveImage(event.target.checked)} /> إزالة الصورة الحالية</label>}
          </Grid>
        </div>
      </Panel>

      <Panel title="النشر والجدولة">
        <Grid>
          <Field label="ترتيب العرض"><input className={input} type="number" name="displayOrder" min={0} defaultValue={article?.display_order ?? 0} /></Field>
          <Field label="بدء النشر المجدول"><input className={input} type="datetime-local" name="scheduledPublishAt" defaultValue={toLocalInput(article?.scheduled_publish_at)} /></Field>
          <Field label="إيقاف النشر المجدول"><input className={input} type="datetime-local" name="scheduledUnpublishAt" defaultValue={toLocalInput(article?.scheduled_unpublish_at)} /></Field>
          <div className="grid content-center gap-3"><Check name="isFeatured" label="مقال مميز" checked={article?.is_featured ?? false} />{article ? <Check name="isActive" label="مفعّل للنشر العام" checked={article.is_active} /> : <p className="text-xs text-muted">المقال الجديد يُحفظ مسودة مخفية.</p>}</div>
        </Grid>
        <p className="mt-4 text-xs leading-6 text-muted">الجدولة تُفرض عند القراءة العامة فور وصول الوقت، ولا تحتاج cron. تفعيل المقال يدويًا مطلوب؛ الموعد وحده لا ينشر مسودة مخفية.</p>
      </Panel>

      <Panel title="SEO والمراجع">
        <Grid>
          <Field label="عنوان SEO بالعربية"><input className={input} name="seoTitleAr" maxLength={70} defaultValue={article?.seo_title_ar ?? ""} /></Field>
          <Field label="SEO title"><input className={input} name="seoTitleEn" dir="ltr" maxLength={70} defaultValue={article?.seo_title_en ?? ""} /></Field>
          <Field label="وصف SEO بالعربية"><textarea className={area} name="seoDescriptionAr" maxLength={180} defaultValue={article?.seo_description_ar ?? ""} /></Field>
          <Field label="SEO description"><textarea className={area} name="seoDescriptionEn" dir="ltr" maxLength={180} defaultValue={article?.seo_description_en ?? ""} /></Field>
        </Grid>
        <Field label="المراجع" hint="كل سطر: عنوان المرجع | https://example.com"><textarea className={area} name="references" dir="ltr" defaultValue={references.map((item) => `${item.title} | ${item.url}`).join("\n")} /></Field>
      </Panel>

      {state.message && <p role={state.status === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ${state.status === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{state.message}</p>}
      <button disabled={pending} className="min-h-12 justify-self-end rounded-full bg-brand px-7 text-sm font-bold text-white disabled:opacity-60">{pending ? "جارٍ الحفظ..." : article ? "حفظ المقال" : "إنشاء المسودة"}</button>
    </form>
  );
}

function MarkdownEditor({ name, label, defaultValue, required }: { name: string; label: string; defaultValue: string; required?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  function wrap(before: string, after = before) {
    const element = ref.current;
    if (!element) return;
    const start = element.selectionStart; const end = element.selectionEnd;
    element.setRangeText(`${before}${element.value.slice(start, end) || "نص"}${after}`, start, end, "select");
    element.focus();
  }
  return <Field label={label} hint="Markdown آمن: عناوين، عريض، مائل، قوائم، روابط، واقتباسات. HTML مرفوض."><div className="mb-2 flex flex-wrap gap-2" role="toolbar" aria-label="أدوات التنسيق"><Tool onClick={() => wrap("**")}>عريض</Tool><Tool onClick={() => wrap("*")}>مائل</Tool><Tool onClick={() => wrap("## ", "")}>عنوان</Tool><Tool onClick={() => wrap("- ", "")}>قائمة</Tool><Tool onClick={() => wrap("> ", "")}>اقتباس</Tool><Tool onClick={() => wrap("[", "](https://)")}>رابط</Tool></div><textarea ref={ref} className={`${area} min-h-80 font-mono text-sm`} name={name} required={required} minLength={required ? 40 : undefined} maxLength={100000} defaultValue={defaultValue} /></Field>;
}

function Tool({ onClick, children }: { onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className="rounded-lg border border-line bg-background px-3 py-2 text-xs font-bold">{children}</button>; }
function Panel({ title, ltr, children }: { title: string; ltr?: boolean; children: React.ReactNode }) { return <section dir={ltr ? "ltr" : undefined} className="grid gap-5 rounded-card border border-line bg-surface p-5 sm:p-7"><h2 className="text-lg font-bold">{title}</h2>{children}</section>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-5 md:grid-cols-2">{children}</div>; }
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-xs font-bold text-muted"><span>{label}</span>{children}{hint && <span className="font-normal leading-5">{hint}</span>}</label>; }
function Check({ name, label, checked }: { name: string; label: string; checked: boolean }) { return <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" name={name} defaultChecked={checked} className="size-4 accent-brand" />{label}</label>; }
const toLocalInput = formatRiyadhDateTimeInput;
