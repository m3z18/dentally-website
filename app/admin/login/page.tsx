import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { AdminLanguageSwitcher } from "@/components/admin/admin-i18n";
import { SiteLogo } from "@/components/ui/site-logo";
import { getLocale } from "@/lib/i18n";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "دخول الإدارة",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const locale = await getLocale();
  const isConfigured = hasSupabasePublicEnv();
  const t = locale === "ar" ? {
    eyebrow: "لوحة الإدارة", title: "تسجيل الدخول", description: "الدخول مخصص لفريق إدارة Dentally المخوّل فقط.",
    configuration: "لم يتم ربط Supabase بعد. أضف متغيرات البيئة ثم أعد تشغيل المشروع.", unauthorized: "يلزم حساب إدارة نشط للوصول إلى هذه الصفحة.", back: "العودة إلى الموقع",
  } : {
    eyebrow: "Admin dashboard", title: "Sign in", description: "Access is restricted to authorized Dentally administrators.",
    configuration: "Supabase is not configured yet. Add the environment variables, then restart the project.", unauthorized: "An active admin account is required to access this page.", back: "Back to website",
  };

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="absolute end-4 top-4 z-10"><AdminLanguageSwitcher /></div>
      <section className="relative w-full max-w-md rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-9">
        <div className="flex justify-center"><SiteLogo size="lg" locale={locale} priority /></div>
        <div className="mt-9 text-center">
          <p className="text-xs font-bold text-brand">{t.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground">{t.title}</h1>
          <p className="mt-3 text-sm leading-7 text-muted">{t.description}</p>
        </div>
        {(!isConfigured || error === "configuration") && (
          <p className="mt-7 rounded-2xl border border-brand/15 bg-brand-soft/45 px-4 py-3 text-xs leading-6 text-brand-dark">
            {t.configuration}
          </p>
        )}
        {error === "unauthorized" && isConfigured && (
          <p className="mt-7 rounded-2xl bg-red-50 px-4 py-3 text-xs leading-6 text-red-800">
            {t.unauthorized}
          </p>
        )}
        <LoginForm />
        <Link href="/" className="mt-6 block text-center text-xs font-bold text-muted transition-colors hover:text-brand">
          {t.back}
        </Link>
      </section>
    </main>
  );
}
