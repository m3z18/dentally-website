"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto max-w-xl rounded-card border border-red-100 bg-surface p-8 text-center" role="alert">
      <p className="text-xs font-bold text-red-700">تعذر إكمال الطلب</p>
      <h1 className="mt-3 text-2xl font-bold text-foreground">حدث خطأ غير متوقع.</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        لم يتم عرض أي تفاصيل تقنية. حاول تحميل الصفحة مرة أخرى.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 cursor-pointer rounded-full bg-brand px-6 text-sm font-bold text-white hover:bg-brand-dark"
      >
        إعادة المحاولة
      </button>
    </section>
  );
}
