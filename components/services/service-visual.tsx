type ServiceVisualProps = {
  index: number;
  compact?: boolean;
};

export function ServiceVisual({ index, compact = false }: ServiceVisualProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] bg-brand-soft/55 ${
        compact ? "h-28" : "h-40 sm:h-48"
      }`}
      aria-hidden="true"
    >
      <span className="absolute -end-6 -top-8 size-28 rounded-full border-[14px] border-white/75" />
      <span className="absolute bottom-5 start-6 size-14 rounded-full bg-brand/10" />
      <span className="absolute bottom-0 start-1/2 h-[78%] w-px -translate-x-1/2 rotate-[28deg] bg-brand/20" />
      <span className="absolute end-6 bottom-5 text-4xl font-light tracking-[-0.06em] text-brand/35">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}
