import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";

const values = [
  {
    number: "01",
    title: "الخبرة",
    description: "كوادر طبية متخصصة ومؤهلة لتقديم رعاية متكاملة في مجالات طب الأسنان.",
  },
  {
    number: "02",
    title: "الأمان",
    description: "اهتمام بالتعقيم وسلامة المريض ضمن بيئة علاجية منظمة وواضحة.",
  },
  {
    number: "03",
    title: "المسؤولية",
    description: "رعاية تتمحور حول المريض، مع وضوح المعلومات والاهتمام باحتياجاته.",
  },
];

export function WhyDentally() {
  return (
    <section id="about" className="px-page py-4 sm:py-8">
      <div className="mx-auto max-w-[90rem] overflow-hidden rounded-[2.5rem] bg-brand-dark text-white shadow-[0_30px_90px_rgb(11_82_66/0.18)]">
        <Container className="relative py-section">
          <div className="absolute -end-32 -top-40 size-[28rem] rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute -end-12 -top-20 size-72 rounded-full border border-white/10" aria-hidden="true" />

          <SectionHeading
            eyebrow="لماذا دينتالي"
            title="أكثر من مجرد عيادة أسنان."
            description="قيم واضحة تقود تجربة الرعاية من لحظة الوصول وحتى اكتمال الزيارة."
            inverse
          />

          <div className="relative mt-14 grid border-t border-white/15 md:grid-cols-3">
            {values.map((item, index) => (
              <article
                key={item.number}
                className={`py-8 md:px-8 md:py-10 ${
                  index > 0 ? "border-t border-white/15 md:border-s md:border-t-0" : ""
                } ${index === 0 ? "md:pe-8 md:ps-0" : ""}`}
              >
                <span className="text-xs font-semibold text-white/45">{item.number}</span>
                <h3 className="mt-8 text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/65">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
