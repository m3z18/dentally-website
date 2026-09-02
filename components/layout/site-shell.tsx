"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import type { Locale } from "@/lib/locale";
import { ui } from "@/lib/locale";

export function SiteShell({ children, locale, whatsapp, contact }: { children: React.ReactNode; locale: Locale; whatsapp: string | null; contact: { phone: string | null; email: string | null; addressAr: string | null; addressEn: string | null } }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return children;
  }

  const t = ui[locale];
  return (
    <>
      <a
        href="#main-content"
        className="fixed start-4 top-3 z-[100] -translate-y-20 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        {t.skip}
      </a>
      <SiteNavbar locale={locale} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale} contact={contact} />
      {whatsapp && /^\+?[0-9]{8,15}$/.test(whatsapp.replace(/[\s()-]/g, "")) && <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="print:hidden fixed bottom-5 end-5 z-40 rounded-full bg-brand px-5 py-3 text-xs font-bold text-white shadow-soft" aria-label={locale === "ar" ? "تواصل عبر واتساب" : "Contact us on WhatsApp"}>WhatsApp</a>}
    </>
  );
}
