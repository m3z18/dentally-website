"use client";

import { useFormStatus } from "react-dom";
import { useAdminI18n } from "@/components/admin/admin-i18n";

export function LogoutButton({ className = "" }: { className?: string }) {
  const { pending } = useFormStatus();
  const { t } = useAdminI18n();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {pending ? t("جارٍ تسجيل الخروج...", "Logging out...") : t("تسجيل الخروج", "Log out")}
    </button>
  );
}
