"use client";

import { useActionState, useEffect, useState } from "react";

import { createDoctorAction, updateDoctorAction } from "@/app/admin/doctors/actions";
import {
  doctorImageMaximumBytes,
  doctorImageMimeTypes,
  getDoctorImagePublicUrl,
} from "@/lib/doctor-images";
import type { AdminActionState, DoctorRow } from "@/types/admin";
import type { SpecialtyRow } from "@/types/catalog";

const initialState: AdminActionState = { status: "idle", message: "" };
const fieldClasses = "min-h-12 rounded-xl border border-line bg-background px-3.5 text-sm font-normal text-foreground outline-none transition-colors focus:border-brand";
const textareaClasses = `${fieldClasses} min-h-32 resize-y py-3 leading-7`;

export function DoctorForm({ doctor, specialties = [] }: { doctor?: DoctorRow; specialties?: SpecialtyRow[] }) {
  const action = doctor ? updateDoctorAction : createDoctorAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const messageId = doctor ? `doctor-form-message-${doctor.id}` : "doctor-form-message-new";
  const hasError = state.status === "error";
  const currentImageUrl = getDoctorImagePublicUrl(doctor?.image_path ?? null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    return () => {
      if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    };
  }, [newImagePreview]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImagePreview(null);
    setImageError("");

    if (!file) return;
    if (!(doctorImageMimeTypes as readonly string[]).includes(file.type)) {
      event.currentTarget.value = "";
      setImageError("اختر صورة JPG أو PNG أو WebP.");
      return;
    }
    if (file.size > doctorImageMaximumBytes) {
      event.currentTarget.value = "";
      setImageError("حجم الصورة يجب ألا يتجاوز 5MB.");
      return;
    }

    setRemoveImage(false);
    setNewImagePreview(URL.createObjectURL(file));
  }

  const imagePreview = newImagePreview ?? (removeImage ? null : currentImageUrl);

  return (
    <form action={formAction} className="mt-8 grid gap-6" aria-busy={pending}>
      {doctor && <input type="hidden" name="doctorId" value={doctor.id} />}

      <section className="rounded-card border border-line bg-surface p-5 sm:p-7">
        <h2 className="text-lg font-bold text-foreground">البيانات العربية</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="اسم الطبيب" hint="من دون اللقب المهني">
            <input name="nameAr" defaultValue={doctor?.name_ar ?? ""} minLength={2} maxLength={120} required aria-invalid={hasError} className={fieldClasses} />
          </Field>
          <Field label="اللقب المهني" hint="مثال: د. أو دكتورة">
            <input name="professionalTitleAr" defaultValue={doctor?.professional_title_ar ?? "د."} minLength={1} maxLength={40} required aria-invalid={hasError} className={fieldClasses} />
          </Field>
          <Field label="التخصص">
            <input name="specialtyAr" defaultValue={doctor?.specialty_ar ?? ""} minLength={2} maxLength={160} required aria-invalid={hasError} className={fieldClasses} />
          </Field>
          <Field label="تصنيف التخصص" hint="ربط محتوى اختياري، لا يؤثر في الحجز">
            <select name="specialtyId" defaultValue={doctor?.specialty_id ?? ""} className={fieldClasses}>
              <option value="">بدون ربط</option>
              {specialties.filter((item) => !item.deleted_at).map((item) => <option key={item.id} value={item.id}>{item.name_ar}</option>)}
            </select>
          </Field>
          <Field label="الرابط المختصر" hint="أحرف إنجليزية صغيرة وأرقام وشرطات">
            <input name="slug" defaultValue={doctor?.slug ?? ""} minLength={2} maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required dir="ltr" spellCheck={false} aria-invalid={hasError} className={fieldClasses} />
          </Field>
        </div>
        <div className="mt-5 grid gap-5">
          <Field label="نبذة مختصرة" hint="تظهر في بطاقة الطبيب وأعلى ملفه">
            <textarea name="shortBioAr" defaultValue={doctor?.short_bio_ar ?? ""} minLength={10} maxLength={320} required rows={4} aria-invalid={hasError} className={textareaClasses} />
          </Field>
          <Field label="السيرة المهنية" hint="اختيارية، حتى 5000 حرف">
            <textarea name="bioAr" defaultValue={doctor?.bio_ar ?? ""} maxLength={5000} rows={8} aria-invalid={hasError} className={`${textareaClasses} min-h-52`} />
          </Field>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-7" dir="ltr">
        <h2 className="text-lg font-bold text-foreground">English content</h2>
        <p className="mt-2 text-xs leading-6 text-muted">Optional for now. It can be completed before the English website is published.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Doctor name">
            <input name="nameEn" defaultValue={doctor?.name_en ?? ""} minLength={2} maxLength={120} className={fieldClasses} />
          </Field>
          <Field label="Professional title" hint="Example: Dr.">
            <input name="professionalTitleEn" defaultValue={doctor?.professional_title_en ?? ""} maxLength={40} className={fieldClasses} />
          </Field>
          <Field label="Specialty">
            <input name="specialtyEn" defaultValue={doctor?.specialty_en ?? ""} minLength={2} maxLength={160} className={fieldClasses} />
          </Field>
        </div>
        <div className="mt-5 grid gap-5">
          <Field label="Short bio" hint="10–320 characters when provided">
            <textarea name="shortBioEn" defaultValue={doctor?.short_bio_en ?? ""} minLength={10} maxLength={320} rows={4} className={textareaClasses} />
          </Field>
          <Field label="Professional bio" hint="Optional, up to 5,000 characters">
            <textarea name="bioEn" defaultValue={doctor?.bio_en ?? ""} maxLength={5000} rows={8} className={`${textareaClasses} min-h-52`} />
          </Field>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-7">
        <h2 className="text-lg font-bold text-foreground">التفاصيل المهنية العربية</h2>
        <p className="mt-2 text-xs leading-6 text-muted">اكتب عنصرًا واحدًا في كل سطر. يمكن ترك أي قائمة فارغة.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Field label="المؤهلات">
            <textarea name="qualificationsAr" defaultValue={doctor?.qualifications_ar.join("\n") ?? ""} rows={6} className={textareaClasses} />
          </Field>
          <Field label="مجالات الخبرة">
            <textarea name="expertiseAr" defaultValue={doctor?.expertise_ar.join("\n") ?? ""} rows={6} className={textareaClasses} />
          </Field>
          <Field label="لغات التواصل">
            <textarea name="languagesAr" defaultValue={doctor?.languages_ar.join("\n") ?? ""} rows={6} className={textareaClasses} />
          </Field>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-7" dir="ltr">
        <h2 className="text-lg font-bold text-foreground">English professional details</h2>
        <p className="mt-2 text-xs leading-6 text-muted">Optional. Enter one item per line.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Field label="Qualifications">
            <textarea name="qualificationsEn" defaultValue={doctor?.qualifications_en.join("\n") ?? ""} rows={6} className={textareaClasses} />
          </Field>
          <Field label="Areas of expertise">
            <textarea name="expertiseEn" defaultValue={doctor?.expertise_en.join("\n") ?? ""} rows={6} className={textareaClasses} />
          </Field>
          <Field label="Languages">
            <textarea name="languagesEn" defaultValue={doctor?.languages_en.join("\n") ?? ""} rows={6} className={textareaClasses} />
          </Field>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-7">
        <h2 className="text-lg font-bold text-foreground">الصورة والظهور</h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-[14rem_1fr]">
          <div className="aspect-square overflow-hidden rounded-3xl border border-line bg-brand-soft">
            {imagePreview ? (
              // Blob previews and the already-validated bucket URL are safe in this admin-only preview.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="معاينة صورة الطبيب" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center px-5 text-center text-xs leading-6 text-muted">لا توجد صورة</div>
            )}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="صورة الطبيب" hint="JPG أو PNG أو WebP، بحد أقصى 5MB">
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className={`${fieldClasses} cursor-pointer py-2 file:me-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-xs file:font-bold file:text-brand-dark`} />
            </Field>
            <Field label="وصف الصورة بالعربية" hint="يُستخدم لقارئات الشاشة">
              <input name="imageAltAr" defaultValue={doctor?.image_alt_ar ?? ""} maxLength={180} className={fieldClasses} />
            </Field>
            <Field label="Image alt text (English)">
              <input name="imageAltEn" defaultValue={doctor?.image_alt_en ?? ""} maxLength={180} dir="ltr" className={fieldClasses} />
            </Field>
            {doctor?.image_path && (
              <label className="flex cursor-pointer items-center gap-3 self-end rounded-2xl border border-line bg-background p-4 text-sm font-semibold text-foreground">
                <input name="removeImage" type="checkbox" value="yes" checked={removeImage} onChange={(event) => setRemoveImage(event.target.checked)} className="size-4 accent-red-700" />
                إزالة الصورة الحالية عند الحفظ
              </label>
            )}
            {imageError && <p className="text-xs text-red-700 md:col-span-2" role="alert">{imageError}</p>}
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="ترتيب العرض" hint="الأصغر يظهر أولًا">
            <input name="displayOrder" type="number" defaultValue={doctor?.display_order ?? 0} min={0} max={2147483647} step={1} required dir="ltr" className={fieldClasses} />
          </Field>
          <fieldset className="grid gap-3 rounded-2xl border border-line bg-background p-4">
            <legend className="px-2 text-xs font-bold text-muted">حالة الملف</legend>
            {doctor ? (
              <CheckField name="isActive" label="منشور في الموقع العام" defaultChecked={doctor.is_active} />
            ) : (
              <p className="text-xs leading-6 text-muted">سيُضاف الطبيب بحالة مخفي. يمكنك نشره بعد فتح السجل ومراجعته.</p>
            )}
          </fieldset>
        </div>
      </section>

      {state.message && (
        <p id={messageId} role={hasError ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ${hasError ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} aria-describedby={state.message ? messageId : undefined} className="min-h-12 w-full cursor-pointer rounded-full bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto">
          {pending ? "جارٍ الحفظ..." : doctor ? "حفظ التغييرات" : "إضافة الطبيب"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-muted">
      <span>{label}</span>
      {children}
      {hint && <span className="text-[11px] font-normal leading-5 text-muted/80">{hint}</span>}
    </label>
  );
}

function CheckField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-foreground">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4 accent-brand" />
      {label}
    </label>
  );
}
