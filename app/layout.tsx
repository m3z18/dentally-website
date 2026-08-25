import type { Metadata, Viewport } from "next";

import { SiteShell } from "@/components/layout/site-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dentally Dental | مجمع دينتالي لطب الأسنان",
    template: "%s | Dentally Dental",
  },
  description:
    "رعاية متكاملة لصحة وجمال ابتسامتك في مجمع دينتالي لطب الأسنان بخميس مشيط.",
};

export const viewport: Viewport = {
  themeColor: "#f8f7f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
