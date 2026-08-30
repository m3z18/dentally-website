"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logoutAction } from "@/app/admin/login/actions";
import { LogoutButton } from "@/components/admin/logout-button";

const navigation = [
  { label: "نظرة عامة", href: "/admin" },
  { label: "المواعيد", href: "/admin/appointments" },
  { label: "الأطباء", href: "/admin/doctors", contentManagerOnly: true },
  { label: "أوقات العمل", href: "/admin/availability" },
  { label: "الأوقات المغلقة", href: "/admin/blocked-times" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminDesktopNavigation({ canManageContent }: { canManageContent: boolean }) {
  const pathname = usePathname();
  const visibleNavigation = navigation.filter((item) => !item.contentManagerOnly || canManageContent);

  return (
    <nav className="mt-5 grid gap-2" aria-label="التنقل الإداري">
      {visibleNavigation.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${active ? "border-brand/15 bg-brand-soft text-brand-dark" : "border-transparent text-muted hover:bg-brand-soft/50 hover:text-brand-dark"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNavigation({ canManageContent }: { canManageContent: boolean }) {
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
        aria-label={open ? "إغلاق قائمة الإدارة" : "فتح قائمة الإدارة"}
        aria-expanded={open}
        aria-controls="admin-mobile-menu"
        onClick={() => setOpen((current) => !current)}
        className="grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-surface text-lg text-brand-dark"
      >
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
      </button>
      {open && (
        <div id="admin-mobile-menu" className="absolute end-0 top-14 w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-line bg-surface p-3 shadow-soft">
          <nav className="grid gap-1" aria-label="التنقل الإداري للجوال">
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action={logoutAction} className="mt-2 border-t border-line pt-2">
            <LogoutButton className="min-h-11 w-full rounded-2xl px-4 text-start text-sm font-bold text-red-700 hover:bg-red-50" />
          </form>
        </div>
      )}
    </div>
  );
}
