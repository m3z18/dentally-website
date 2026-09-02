import { logoutAction } from "@/app/admin/login/actions";
import { AdminDesktopNavigation, AdminMobileNavigation } from "@/components/admin/admin-navigation";
import { AdminLanguageSwitcher } from "@/components/admin/admin-i18n";
import { LogoutButton } from "@/components/admin/logout-button";
import { SiteLogo } from "@/components/ui/site-logo";
import type { Locale } from "@/lib/locale";

export function AdminShell({
  adminName,
  canManageContent,
  locale,
  children,
}: {
  adminName: string;
  canManageContent: boolean;
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = locale === "ar" ? {
    skip: "تجاوز إلى المحتوى",
    title: "لوحة الإدارة",
    signedIn: "مسجل باسم",
  } : {
    skip: "Skip to content",
    title: "Admin dashboard",
    signedIn: "Signed in as",
  };

  return (
    <div className="min-h-dvh bg-background lg:grid lg:h-dvh lg:grid-cols-[17rem_1fr] lg:overflow-hidden" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <a href="#admin-content" className="sr-only z-50 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {t.skip}
      </a>
      <aside className="hidden border-e border-line bg-surface p-6 lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden">
        <div className="shrink-0">
          <SiteLogo size="md" locale={locale} priority />
          <p className="mt-8 text-xs font-bold text-brand">{t.title}</p>
        </div>
        <AdminDesktopNavigation canManageContent={canManageContent} locale={locale} />
        <div className="mt-5 shrink-0 border-t border-line pt-5">
          <AdminLanguageSwitcher compact />
          <p className="mt-4 text-xs text-muted">{t.signedIn}</p>
          <p className="mt-1 text-sm font-bold text-foreground">{adminName}</p>
          <form action={logoutAction} className="mt-4">
            <LogoutButton className="text-xs font-bold text-red-700 hover:text-red-900" />
          </form>
        </div>
      </aside>

      <div className="min-w-0 lg:h-dvh lg:overflow-y-auto">
        <header className="sticky top-0 z-40 border-b border-line bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <SiteLogo size="sm" locale={locale} priority />
            <AdminMobileNavigation canManageContent={canManageContent} locale={locale} />
          </div>
        </header>
        <main id="admin-content" className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-14">
          {children}
        </main>
      </div>
    </div>
  );
}
