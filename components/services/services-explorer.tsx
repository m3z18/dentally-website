"use client";

import { useMemo, useState } from "react";

import { ServiceCard } from "@/components/services/service-card";
import type { DentalService } from "@/types/service";

type ServicesExplorerProps = {
  services: DentalService[];
};

export function ServicesExplorer({ services }: ServicesExplorerProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("ar");

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        `${service.title} ${service.description} ${service.procedures.join(" ")}`
          .toLocaleLowerCase("ar")
          .includes(normalizedQuery),
      ),
    [normalizedQuery, services],
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 rounded-3xl border border-line bg-surface p-3 shadow-[0_12px_40px_rgb(24_57_48/0.035)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <label className="relative block flex-1">
          <span className="sr-only">ابحث في الخدمات</span>
          <span className="pointer-events-none absolute inset-y-0 start-4 grid place-items-center text-brand" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن خدمة"
            className="min-h-12 w-full rounded-2xl border border-transparent bg-surface-muted pe-4 ps-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand/30 focus:bg-white"
          />
        </label>
        <p className="px-2 text-xs font-medium text-muted" aria-live="polite">
          {filteredServices.length} خدمات متاحة للاستعراض
        </p>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.slug}
              service={service}
              index={services.findIndex((item) => item.id === service.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="font-semibold text-foreground">لم نجد خدمة مطابقة لهذا البحث.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 cursor-pointer text-sm font-bold text-brand hover:text-brand-dark"
          >
            عرض جميع الخدمات
          </button>
        </div>
      )}
    </div>
  );
}
