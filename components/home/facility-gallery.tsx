import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/ui/container";
import { getLocale } from "@/lib/i18n";

const facilitySlots = [
  { label: "العيادات", className: "md:col-span-2 md:row-span-2" },
  { label: "التجهيزات", className: "md:col-span-1" },
  { label: "الاستقبال", className: "md:col-span-1" },
  { label: "بيئة المجمع", className: "md:col-span-2" },
];

export async function FacilityGallery() {
  const en = (await getLocale()) === "en";
  const slots = en ? [{ label: "Clinics", className: "md:col-span-2 md:row-span-2" }, { label: "Equipment", className: "md:col-span-1" }, { label: "Reception", className: "md:col-span-1" }, { label: "Our environment", className: "md:col-span-2" }] : facilitySlots;
  return (
    <section className="bg-surface-muted/70 py-section">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={en ? "Dentally environment" : "بيئة دينتالي"}
            title={en ? "Technology supporting your smile." : "التقنية في خدمة ابتسامتك."}
            description={en ? "Prepared spaces for approved photos of the clinics, equipment, and facility." : "مساحات مجهزة لاستقبال الصور الحقيقية للعيادات والتجهيزات وبيئة المجمع."}
          />
          <p className="max-w-xs text-xs leading-6 text-muted">
            {en ? "Placeholders will be replaced when approved facility photos are available." : "سيتم استبدال المساحات البصرية بصور المجمع المعتمدة عند توفرها."}
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[13rem] gap-4 md:grid-cols-4 md:auto-rows-[12rem]">
          {slots.map((slot, index) => (
            <article
              key={slot.label}
              className={`facility-placeholder group relative isolate overflow-hidden rounded-card border border-white/80 bg-surface p-6 shadow-[0_16px_45px_rgb(25_58_49/0.05)] ${slot.className}`}
            >
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,#ffffff_0%,#edf4f1_52%,#dcebe5_100%)]" />
              <span className="text-xs font-semibold text-brand/60">0{index + 1}</span>
              <div className="absolute bottom-6 start-6">
                <h3 className="text-xl font-bold text-brand-dark">{slot.label}</h3>
                <p className="mt-1 text-xs text-muted">{en ? "Image placeholder" : "مساحة صورة مخصصة"}</p>
              </div>
              <div className="absolute -end-12 -top-12 size-40 rounded-full border-[18px] border-white/55 transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
