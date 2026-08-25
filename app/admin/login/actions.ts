"use server";

import { redirect } from "next/navigation";

import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  message: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!hasSupabasePublicEnv()) {
    return { message: "أكمل إعداد Supabase أولًا لتفعيل تسجيل الدخول." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!/^\S+@\S+\.\S+$/.test(email) || password.length === 0 || password.length > 128) {
    return { message: "تحقق من البريد الإلكتروني وكلمة المرور." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { message: "بيانات الدخول غير صحيحة." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .eq("is_active", true)
    .in("role", ["admin", "manager", "receptionist"])
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { message: "هذا الحساب غير مخوّل للدخول إلى لوحة الإدارة." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect("/admin/login");
}
