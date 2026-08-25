import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { SiteLogo } from "@/components/ui/site-logo";
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
  const isConfigured = hasSupabasePublicEnv();

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <section className="relative w-full max-w-md rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-9">
        <div className="flex justify-center"><SiteLogo size="lg" /></div>
        <div className="mt-9 text-center">
          <p className="text-xs font-bold text-brand">لوحة الإدارة</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground">تسجيل الدخول</h1>
          <p className="mt-3 text-sm leading-7 text-muted">الدخول مخصص لفريق إدارة Dentally المخوّل فقط.</p>
        </div>
        {(!isConfigured || error === "configuration") && (
          <p className="mt-7 rounded-2xl border border-brand/15 bg-brand-soft/45 px-4 py-3 text-xs leading-6 text-brand-dark">
            لم يتم ربط Supabase بعد. أضف متغيرات البيئة ثم أعد تشغيل المشروع.
          </p>
        )}
        {error === "unauthorized" && isConfigured && (
          <p className="mt-7 rounded-2xl bg-red-50 px-4 py-3 text-xs leading-6 text-red-800">
            يلزم حساب إدارة نشط للوصول إلى هذه الصفحة.
          </p>
        )}
        <LoginForm />
        <Link href="/" className="mt-6 block text-center text-xs font-bold text-muted transition-colors hover:text-brand">
          العودة إلى الموقع
        </Link>
      </section>
    </main>
  );
}
