import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  const profile = await requireAdmin();
  return <AdminShell adminName={profile.full_name}>{children}</AdminShell>;
}
