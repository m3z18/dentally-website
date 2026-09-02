import { AdminPageHeader } from "@/components/admin/page-header";
import { SiteSettingsForm } from "@/components/admin/content-foundation-forms";
import { requireContentManager } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettingsRow } from "@/types/content";

export default async function AdminSettingsPage() { await requireContentManager(); const supabase = await createClient(); const { data, error } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle(); return <><AdminPageHeader eyebrow="إدارة المحتوى" title="إعدادات الموقع" description="مصدر منظم لبيانات المنشأة والتواصل وSEO والتنبيه الطبي. لا تُخزن أسرار هنا." />{error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">تعذر تحميل الإعدادات. راجع تطبيق Migration الجديدة.</p>}<SiteSettingsForm settings={(data as SiteSettingsRow | null) ?? null} /></>; }
