"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { message: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const hasError = Boolean(state.message);

  return (
    <form action={formAction} className="mt-8 grid gap-5" aria-busy={pending}>
      <label className="grid gap-2 text-sm font-bold text-foreground" htmlFor="email">
        البريد الإلكتروني
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className="min-h-13 rounded-2xl border border-line bg-background px-4 font-normal outline-none transition-colors focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-foreground" htmlFor="password">
        كلمة المرور
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className="min-h-13 rounded-2xl border border-line bg-background px-4 font-normal outline-none transition-colors focus:border-brand"
        />
      </label>
      {state.message && (
        <p id="login-error" className="rounded-2xl bg-red-50 px-4 py-3 text-xs leading-6 text-red-800" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-13 cursor-pointer items-center justify-center rounded-full bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}
