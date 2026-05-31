import AnimatedCounter from "../components/AnimatedCounter";

const stats = [
  { label: "رحلات منجزة", value: 5400, suffix: "+" },
  { label: "عملاء سعداء", value: 9800, suffix: "+" },
  { label: "مدن مغطاة", value: 28, suffix: "" },
  { label: "أسطول سيارات", value: 140, suffix: "+" }
];

export default function StatsStrip() {
  return (
    <section className="relative -mt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="glass grid gap-6 rounded-4xl px-6 py-6 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-right">
              <p className="text-2xl font-semibold text-slate-900">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
