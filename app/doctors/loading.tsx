import { Container } from "@/components/ui/container";

export default function DoctorsLoading() {
  return (
    <Container className="py-section" aria-label="جارٍ تحميل الأطباء" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-full bg-brand-soft" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="overflow-hidden rounded-card border border-line bg-surface">
            <div className="aspect-[4/3] animate-pulse bg-surface-muted" />
            <div className="space-y-3 p-7">
              <div className="h-3 w-24 animate-pulse rounded-full bg-brand-soft" />
              <div className="h-6 w-3/4 animate-pulse rounded-full bg-surface-muted" />
              <div className="h-16 animate-pulse rounded-2xl bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
