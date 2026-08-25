"use client";

import { useState } from "react";

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
  const [value, setValue] = useState(defaultValue);

  return (
    <span className="grid gap-1.5">
      <input
        name={name}
        type="date"
        value={value}
        min={min}
        required={required}
        onChange={(event) => setValue(event.target.value)}
        className={className}
        dir="ltr"
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      />
      <span className="min-h-5 text-[11px] font-normal text-muted" aria-live="polite">
        {value ? <bdi>{formatAdminDate(value, { includeWeekday: true })}</bdi> : "اختر التاريخ"}
      </span>
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
        {value ? <bdi>{formatAdminTime(value)}</bdi> : "اختر الوقت"}
      </span>
    </span>
  );
}
