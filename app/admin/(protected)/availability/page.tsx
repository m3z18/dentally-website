import { AdminPageHeader } from "@/components/admin/page-header";
import { AvailabilityForm } from "@/components/admin/availability-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilityRow } from "@/types/admin";

const days = [
  { value: 6, label: "السبت" },
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
];

export default async function AdminAvailabilityPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("availability").select("*").order("day_of_week");
  const schedules = (data ?? []) as AvailabilityRow[];

  return (
    <>
      <AdminPageHeader eyebrow="جدول المواعيد" title="أوقات العمل" description="حدد أيام العمل ووقت البداية والنهاية ومدة كل موعد. أي تعديل ينعكس على المواعيد المتاحة الجديدة." />
      <p className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900">
        ساعات العمل المزروعة أوليًا مؤقتة، ويجب تحديثها هنا بعد اعتماد الساعات الرسمية.
      </p>
      {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">تعذر تحميل أوقات العمل الآن.</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => {
          const schedule = schedules.find((item) => item.day_of_week === day.value);
          return (
            <AvailabilityForm
              key={day.value}
              dayOfWeek={day.value}
              dayName={day.label}
              startTime={schedule?.start_time ?? "14:00"}
              endTime={schedule?.end_time ?? "22:00"}
              duration={schedule?.slot_duration_minutes ?? 30}
              isActive={schedule?.is_active ?? false}
            />
          );
        })}
      </div>
    </>
  );
}
