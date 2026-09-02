"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logoutAction } from "@/app/admin/login/actions";
import { AdminLanguageSwitcher } from "@/components/admin/admin-i18n";
import { LogoutButton } from "@/components/admin/logout-button";
import type { Locale } from "@/lib/locale";

const navigation = [
  { ar: "نظرة عامة", en: "Overview", href: "/admin" },
  { ar: "المواعيد", en: "Appointments", href: "/admin/appointments" },
  { ar: "الأطباء", en: "Doctors", href: "/admin/doctors", contentManagerOnly: true },
  { ar: "الخدمات", en: "Services", href: "/admin/services", contentManagerOnly: true },
  { ar: "التخصصات", en: "Specialties", href: "/admin/specialties", contentManagerOnly: true },
  { ar: "الفروع", en: "Branches", href: "/admin/branches", contentManagerOnly: true },
  { ar: "المقالات", en: "Articles", href: "/admin/articles", contentManagerOnly: true },
  { ar: "التصنيفات", en: "Categories", href: "/admin/categories", contentManagerOnly: true },
  { ar: "الأسئلة الشائعة", en: "FAQ", href: "/admin/faq", contentManagerOnly: true },
  { ar: "إعدادات الموقع", en: "Site settings", href: "/admin/settings", contentManagerOnly: true },
  { ar: "التأمين", en: "Insurance", href: "/admin/insurance", contentManagerOnly: true },
  { ar: "العروض", en: "Offers", href: "/admin/offers", contentManagerOnly: true },
  { ar: "آراء المرضى", en: "Testimonials", href: "/admin/testimonials", contentManagerOnly: true },
  { ar: "المعرض", en: "Gallery", href: "/admin/gallery", contentManagerOnly: true },
  { ar: "مكتبة الوسائط", en: "Media library", href: "/admin/media", contentManagerOnly: true },
  { ar: "سجل التدقيق", en: "Audit log", href: "/admin/audit-log", contentManagerOnly: true },
  { ar: "أوقات العمل", en: "Availability", href: "/admin/availability" },
  { ar: "الأوقات المغلقة", en: "Blocked times", href: "/admin/blocked-times" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminDesktopNavigation({ canManageContent, locale }: { canManageContent: boolean; locale: Locale }) {
  const pathname = usePathname();
  const visibleNavigation = navigation.filter((item) => !item.contentManagerOnly || canManageContent);

  return (
    <nav className="mt-5 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain pe-2" aria-label={locale === "ar" ? "التنقل الإداري" : "Admin navigation"}>
      {visibleNavigation.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${active ? "border-brand/15 bg-brand-soft text-brand-dark" : "border-transparent text-muted hover:bg-brand-soft/50 hover:text-brand-dark"}`}
          >
            {locale === "ar" ? item.ar : item.en}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNavigation({ canManageContent, locale }: { canManageContent: boolean; locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibleNavigation = navigation.filter((item) => !item.contentManagerOnly || canManageContent);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? (locale === "ar" ? "إغلاق قائمة الإدارة" : "Close admin menu") : (locale === "ar" ? "فتح قائمة الإدارة" : "Open admin menu")}
        aria-expanded={open}
        aria-controls="admin-mobile-menu"
        onClick={() => setOpen((current) => !current)}
        className="grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-surface text-lg text-brand-dark"
      >
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
      </button>
      {open && (
        <div id="admin-mobile-menu" className="absolute end-0 top-14 flex max-h-[calc(100dvh-5rem)] w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-surface p-3 shadow-soft">
          <nav className="grid min-h-0 flex-1 gap-1 overflow-y-auto overscroll-contain pe-1" aria-label={locale === "ar" ? "التنقل الإداري للجوال" : "Mobile admin navigation"}>
            {visibleNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${active ? "bg-brand-soft text-brand-dark" : "text-foreground hover:bg-surface-muted"}`}
                >
                  {locale === "ar" ? item.ar : item.en}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 shrink-0 border-t border-line pt-3"><AdminLanguageSwitcher compact /></div>
          <form action={logoutAction} className="mt-2 shrink-0 border-t border-line pt-2">
            <LogoutButton className="min-h-11 w-full rounded-2xl px-4 text-start text-sm font-bold text-red-700 hover:bg-red-50" />
          </form>
        </div>
      )}
    </div>
  );
}
