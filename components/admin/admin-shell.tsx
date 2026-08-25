import { logoutAction } from "@/app/admin/login/actions";
import { AdminDesktopNavigation, AdminMobileNavigation } from "@/components/admin/admin-navigation";
import { LogoutButton } from "@/components/admin/logout-button";
import { SiteLogo } from "@/components/ui/site-logo";

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#admin-content" className="sr-only z-50 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        تجاوز إلى المحتوى
      </a>
      <aside className="hidden border-e border-line bg-surface p-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <SiteLogo size="md" />
        <p className="mt-8 text-xs font-bold text-brand">لوحة الإدارة</p>
        <AdminDesktopNavigation />
        <div className="mt-auto border-t border-line pt-5">
          <p className="text-xs text-muted">مسجل باسم</p>
          <p className="mt-1 text-sm font-bold text-foreground">{adminName}</p>
          <form action={logoutAction} className="mt-4">
            <LogoutButton className="text-xs font-bold text-red-700 hover:text-red-900" />
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-line bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <SiteLogo size="sm" />
            <AdminMobileNavigation />
          </div>
        </header>
        <main id="admin-content" className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-14">
          {children}
        </main>
      </div>
    </div>
  );
}
