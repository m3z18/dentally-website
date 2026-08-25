import { BlockedTimeDeleteForm } from "@/components/admin/blocked-time-delete-form";
import { AdminDate, AdminTimeRange } from "@/components/admin/date-time-display";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BlockedTimeForm } from "@/components/admin/blocked-time-form";
import { requireAdmin } from "@/lib/auth/admin";
import { getRiyadhDateValue } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import type { BlockedTimeRow } from "@/types/admin";

export default async function AdminBlockedTimesPage() {
  await requireAdmin();
  const today = getRiyadhDateValue();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocked_times")
    .select("*")
    .gte("block_date", today)
    .order("block_date")
    .order("start_time");
  const blockedTimes = (data ?? []) as BlockedTimeRow[];

  return (
    <>
      <AdminPageHeader eyebrow="إدارة التوفر" title="الأوقات المغلقة" description="أضف فترة مغلقة لمنع ظهور أوقاتها في رحلة الحجز، أو احذفها لإتاحتها مجددًا." />
      <div className="mt-8 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <BlockedTimeForm minDate={today} />
        <section>
          <h2 className="text-lg font-bold text-foreground">الفترات القادمة</h2>
          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">تعذر تحميل الأوقات المغلقة.</p>
          ) : blockedTimes.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {blockedTimes.map((block) => (
                <article key={block.id} className="rounded-3xl border border-line bg-surface p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        <AdminDate value={block.block_date} includeWeekday />
                      </h3>
                      <AdminTimeRange start={block.start_time} end={block.end_time} className="mt-1 block text-xs text-muted" />
                      {block.reason && <p className="mt-2 text-xs leading-6 text-muted">{block.reason}</p>}
                    </div>
                    <BlockedTimeDeleteForm id={block.id} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-3xl border border-dashed border-line bg-surface px-5 py-12 text-center text-sm text-muted">لا توجد فترات مغلقة قادمة.</p>
          )}
        </section>
      </div>
    </>
  );
}
