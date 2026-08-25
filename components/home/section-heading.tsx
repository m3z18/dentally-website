type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  inverse = false,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto items-center text-center" : "items-start";

  return (
    <div className={`flex max-w-3xl flex-col ${alignment}`}>
      <p
        className={`text-xs font-bold tracking-[0.08em] ${
          inverse ? "text-white/65" : "text-brand"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-3xl font-bold leading-[1.3] tracking-[-0.035em] sm:text-4xl lg:text-5xl ${
          inverse ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 ${
            inverse ? "text-white/65" : "text-muted"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
