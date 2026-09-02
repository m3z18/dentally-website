import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";
import { getLocale } from "@/lib/i18n";

export async function StorySection() {
  const en = (await getLocale()) === "en";
  return (
    <section className="py-section">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <div className="relative overflow-hidden rounded-card border border-line bg-surface p-8 shadow-soft sm:p-12">
          <span className="block text-xs font-bold tracking-[0.1em] text-brand">{en ? "Founded" : "عام التأسيس"}</span>
          <p className="mt-6 text-[5.5rem] font-bold leading-none tracking-[-0.08em] text-brand sm:text-[8.5rem]">
            <span dir="ltr">2015</span>
          </p>
          <div className="absolute -bottom-20 -end-16 size-56 rounded-full border-[26px] border-brand-soft/60" aria-hidden="true" />
        </div>

        <div>
          <SectionHeading eyebrow={en ? "Our story" : "قصتنا"} title={en ? "The beginning of Dentally" : "بداية قصة Dentally"} />
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg sm:leading-9">
            {en ? "Dentally Dental Complex opened in 2015 under the patronage of Prince Faisal bin Khalid, then Governor of the Asir Region." : "تم افتتاح مجمع دينتالي عام 2015 على يد الأمير فيصل بن خالد، أمير منطقة عسير آنذاك."}
          </p>

          <ol className="mt-10 border-s border-line ps-7">
            <li className="relative pb-9">
              <span className="absolute -start-[2.15rem] top-1 size-3 rounded-full border-[3px] border-background bg-brand" />
              <p className="text-xs font-semibold text-brand">2015</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">{en ? "The beginning" : "الانطلاقة"}</h3>
            </li>
            <li className="relative">
              <span className="absolute -start-[2.15rem] top-1 size-3 rounded-full border-[3px] border-background bg-brand" />
              <p className="text-xs font-semibold text-brand">{en ? "Today" : "اليوم"}</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">{en ? "Integrated dental care" : "رعاية متكاملة لطب الأسنان"}</h3>
            </li>
          </ol>
        </div>
      </Container>
    </section>
  );
}
