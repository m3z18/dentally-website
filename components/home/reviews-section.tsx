import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";

const reviewSlots = ["مراجعة Google", "مراجعة Google", "مراجعة Google"];

export function ReviewsSection() {
  return (
    <section id="reviews" className="py-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <SectionHeading
            eyebrow="تقييمات Google"
            title="ثقة مرضانا هي الأهم."
            description="مساحة مهيأة لعرض المراجعات الحقيقية مباشرة عند ربطها بالمصدر المعتمد."
          />

          <div className="rounded-card border border-line bg-surface p-7 shadow-soft sm:p-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-muted">تقييم Google</p>
                <p className="mt-2 text-5xl font-bold tracking-[-0.06em] text-foreground sm:text-6xl">
                  <span dir="ltr">4.3 / 5</span>
                </p>
              </div>
              <div className="sm:text-end">
                <p className="text-xl tracking-[0.16em] text-[#c79836]" aria-label="تقييم 4.3 من 5">
                  ★★★★<span className="text-line">★</span>
                </p>
                <p className="mt-2 text-sm text-muted">أكثر من 390 مراجعة</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {reviewSlots.map((slot, index) => (
            <article key={index} className="rounded-3xl border border-dashed border-line bg-surface/60 p-6">
              <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-dark" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="mt-8 text-sm font-bold text-foreground">{slot}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                مساحة مخصصة لمراجعة حقيقية بعد الربط بمصدر التقييمات.
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
