"use client";

import { useState } from "react";

export function ArticleShare({ title, locale = "ar" }: { title: string; locale?: "ar" | "en" }) {
  const [copied, setCopied] = useState(false);
  function url() { return window.location.href; }
  async function copy() { await navigator.clipboard.writeText(url()); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
  const button = "rounded-full border border-line bg-surface px-4 py-2 text-xs font-bold hover:border-brand/40";
  const en = locale === "en";
  return <div className="print:hidden flex flex-wrap gap-2" aria-label={en ? "Share article" : "مشاركة المقال"}><button type="button" onClick={copy} className={button}>{copied ? (en ? "Copied" : "تم النسخ") : (en ? "Copy link" : "نسخ الرابط")}</button><button type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}`, "_blank", "noopener,noreferrer")} className={button}>WhatsApp</button><button type="button" onClick={() => window.open(`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}`, "_blank", "noopener,noreferrer")} className={button}>X</button><button type="button" onClick={() => window.print()} className={button}>{en ? "Print" : "طباعة"}</button></div>;
}
