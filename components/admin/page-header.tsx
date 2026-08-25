import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold text-brand">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}
