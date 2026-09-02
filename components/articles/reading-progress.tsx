"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function update() { const total = document.documentElement.scrollHeight - window.innerHeight; setProgress(total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 0); }
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div className="print:hidden fixed inset-x-0 top-0 z-[70] h-1 bg-transparent" aria-hidden="true"><div className="h-full bg-brand transition-[width]" style={{ width: `${progress}%` }} /></div>;
}
