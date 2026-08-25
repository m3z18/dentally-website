import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";

export function StorySection() {
  return (
    <section className="py-section">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <div className="relative overflow-hidden rounded-card border border-line bg-surface p-8 shadow-soft sm:p-12">
          <span className="block text-xs font-bold tracking-[0.1em] text-brand">عام التأسيس</span>
          <p className="mt-6 text-[5.5rem] font-bold leading-none tracking-[-0.08em] text-brand sm:text-[8.5rem]">
            <span dir="ltr">2015</span>
          </p>
          <div className="absolute -bottom-20 -end-16 size-56 rounded-full border-[26px] border-brand-soft/60" aria-hidden="true" />
        </div>

        <div>
          <SectionHeading eyebrow="قصتنا" title="بداية قصة Dentally" />
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg sm:leading-9">
            تم افتتاح مجمع دينتالي عام 2015 على يد الأمير فيصل بن خالد، أمير منطقة عسير
            آنذاك.
          </p>

          <ol className="mt-10 border-s border-line ps-7">
            <li className="relative pb-9">
              <span className="absolute -start-[2.15rem] top-1 size-3 rounded-full border-[3px] border-background bg-brand" />
              <p className="text-xs font-semibold text-brand">2015</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">الانطلاقة</h3>
            </li>
            <li className="relative">
              <span className="absolute -start-[2.15rem] top-1 size-3 rounded-full border-[3px] border-background bg-brand" />
              <p className="text-xs font-semibold text-brand">اليوم</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">رعاية متكاملة لطب الأسنان</h3>
            </li>
          </ol>
        </div>
      </Container>
    </section>
  );
}
