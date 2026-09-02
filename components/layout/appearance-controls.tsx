"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/locale";
import { localeCookieName, ui } from "@/lib/locale";

type Theme = "light" | "dark" | "system";
function applyTheme(theme: Theme) { const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.classList.toggle("dark", dark); document.documentElement.dataset.theme = theme; }
function getThemeSnapshot(): Theme { const stored = localStorage.getItem("dentally-theme"); return stored === "light" || stored === "dark" ? stored : "system"; }
function subscribeToTheme(onStoreChange: () => void) { const media = matchMedia("(prefers-color-scheme: dark)"); const updateSystemTheme = () => { if (getThemeSnapshot() === "system") applyTheme("system"); }; const notify = () => onStoreChange(); window.addEventListener("dentally-theme-change", notify); window.addEventListener("storage", notify); media.addEventListener("change", updateSystemTheme); return () => { window.removeEventListener("dentally-theme-change", notify); window.removeEventListener("storage", notify); media.removeEventListener("change", updateSystemTheme); }; }

export function AppearanceControls({ locale }: { locale: Locale }) {
  const router = useRouter(); const t = ui[locale]; const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "system");
  function changeTheme(next: Theme) { localStorage.setItem("dentally-theme", next); document.documentElement.dataset.themeTransition = "true"; applyTheme(next); window.dispatchEvent(new Event("dentally-theme-change")); window.setTimeout(() => { delete document.documentElement.dataset.themeTransition; }, 220); }
  function changeLanguage() { const next = locale === "ar" ? "en" : "ar"; document.cookie = `${localeCookieName}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`; router.refresh(); }
  return <div className="flex items-center gap-2"><button type="button" onClick={changeLanguage} className="min-h-10 rounded-full border border-line bg-surface px-3 text-xs font-bold text-foreground" lang={locale === "ar" ? "en" : "ar"}>{t.language}</button><label className="sr-only" htmlFor="theme-select">{t.appearance}</label><select id="theme-select" value={theme} onChange={(event) => changeTheme(event.target.value as Theme)} className="min-h-10 rounded-full border border-line bg-surface px-2 text-xs font-bold text-foreground"><option value="light">{t.light}</option><option value="dark">{t.dark}</option><option value="system">{t.system}</option></select></div>;
}
