import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading";
import TestimonialCard from "../components/TestimonialCard";
import { testimonials } from "../data/testimonials";
import { stagger } from "../utils/motion";

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="التقييمات"
          title="عملاؤنا يحبون السفر معنا"
          description="آراء حقيقية من عملاء الصقور الذين اختاروا الراحة والسرعة في كل رحلة."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
