export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="جارٍ تحميل لوحة الإدارة">
      <div className="h-3 w-28 animate-pulse rounded-full bg-brand-soft" />
      <div className="mt-4 h-10 w-52 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-full bg-surface-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl border border-line bg-surface" />
        ))}
      </div>
      <div className="mt-8 grid gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-3xl border border-line bg-surface" />
        ))}
      </div>
      <p className="sr-only">جارٍ تحميل البيانات...</p>
    </div>
  );
}
