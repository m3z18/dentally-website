import "server-only";

import { cookies } from "next/headers";
import { localeCookieName, type Locale } from "@/lib/locale";

export type { Locale } from "@/lib/locale";
export { localized } from "@/lib/locale";

export async function getLocale(): Promise<Locale> {
  return (await cookies()).get(localeCookieName)?.value === "en" ? "en" : "ar";
}
