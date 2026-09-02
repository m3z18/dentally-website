import type { Metadata } from "next";

import { AdminI18nProvider } from "@/components/admin/admin-i18n";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "لوحة الإدارة",
    template: "%s | إدارة Dentally",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const locale = await getLocale();

  return (
    <AdminI18nProvider initialLocale={locale}>
      <div data-admin-root lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
        {children}
      </div>
    </AdminI18nProvider>
  );
}
