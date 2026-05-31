type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "right";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "right"
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "text-center items-center" : "text-right items-start";

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-4 py-1 text-sm font-medium text-brand-red">
        {eyebrow}
      </span>
      <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
