"use client";

import { useFormStatus } from "react-dom";

export function LogoutButton({ className = "" }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {pending ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
    </button>
  );
}
