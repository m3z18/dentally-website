"use client";

import { useState, type MouseEvent } from "react";

import { useAdminI18n } from "@/components/admin/admin-i18n";
import { formatAdminDate, formatAdminTime } from "@/lib/date";

type SharedInputProps = {
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  className?: string;
  defaultValue?: string;
  name: string;
  required?: boolean;
};

export function AdminDateInput({
  name,
  defaultValue = "",
  min,
  required,
  className,
  ariaDescribedBy,
  ariaInvalid,
}: SharedInputProps & { min?: string }) {
  const { locale, direction, t } = useAdminI18n();
  const [value, setValue] = useState(defaultValue);
  const displayValue = value
    ? formatAdminDate(value, { includeWeekday: true, locale })
    : t("اختر التاريخ", "Choose date");

  function openDatePicker(event: MouseEvent<HTMLInputElement>) {
    event.currentTarget.showPicker?.();
  }

  return (
    <span
      className={`relative flex cursor-pointer items-center focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${className ?? ""}`}
    >
      <span
        className={`pointer-events-none min-w-0 flex-1 truncate text-start ${value ? "pe-8 text-foreground" : "text-muted"}`}
        aria-hidden="true"
      >
        <bdi dir={direction}>{displayValue}</bdi>
      </span>
      <input
        name={name}
        type="date"
        value={value}
        min={min}
        required={required}
        onChange={(event) => setValue(event.target.value)}
        onClick={openDatePicker}
        className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
        dir="ltr"
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-label={value ? `${t("التاريخ", "Date")}: ${displayValue}` : t("اختر التاريخ", "Choose date")}
      />
      {value && (
        <button
          type="button"
          className="absolute end-2 z-20 grid size-7 cursor-pointer place-items-center rounded-full text-base font-normal leading-none text-muted transition-colors hover:bg-surface-muted hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
          aria-label={t("مسح التاريخ", "Clear date")}
          onPointerDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setValue("");
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </span>
  );
}

export function AdminTimeInput({
  name,
  defaultValue = "",
  required,
  className,
  ariaDescribedBy,
  ariaInvalid,
}: SharedInputProps) {
  const { locale, t } = useAdminI18n();
  const [value, setValue] = useState(defaultValue.slice(0, 5));

  return (
    <span className="grid gap-1.5">
      <input
        name={name}
        type="time"
        value={value}
        required={required}
        onChange={(event) => setValue(event.target.value)}
        className={className}
        dir="ltr"
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      />
      <span className="min-h-5 text-[11px] font-normal text-muted" aria-live="polite">
        {value ? <bdi>{formatAdminTime(value, locale)}</bdi> : t("اختر الوقت", "Choose time")}
      </span>
    </span>
  );
}
