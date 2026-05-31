import { motion } from "framer-motion";
import FeatureCard from "../components/FeatureCard";
import SectionHeading from "../components/SectionHeading";
import StickyBookingWidget from "../components/StickyBookingWidget";
import { features } from "../data/features";
import { stagger } from "../utils/motion";

export default function WhyChooseUs() {
  return (
    <section id="about" className="scroll-mt-24 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="لماذا الصقور"
            title="معايير رفاهية لا تقبل التنازل"
            description="نركز على التفاصيل الدقيقة لضمان تجربة سفر استثنائية مع خدمات مصممة خصيصًا لاحتياجاتك."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </motion.div>

          <div className="rounded-3xl bg-white/80 p-6 shadow-soft">
            <p className="text-sm font-semibold text-brand-red">عن الصقور</p>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              نحن شركة رحلات ونقل تقدم تجربة حديثة تجمع بين السرعة، الأمان، والخصوصية مع
              خيارات مرنة للرحلات بين المحافظات والـVIP والسياحة.
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-28">
          <StickyBookingWidget />
        </div>
      </div>
    </section>
  );
}
