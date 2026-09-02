import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  const [profile, locale] = await Promise.all([requireAdmin(), getLocale()]);
  const canManageContent = profile.role === "admin" || profile.role === "manager";
  return <AdminShell adminName={profile.full_name} canManageContent={canManageContent} locale={locale}>{children}</AdminShell>;
}
