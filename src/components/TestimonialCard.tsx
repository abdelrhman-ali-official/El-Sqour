import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "../utils/motion";

type Testimonial = {
  name: string;
  role: string;
  rating: number;
  text: string;
  avatar: string;
};

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.article
      variants={fadeInUp}
      className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft"
    >
      <div className="flex items-center gap-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-slate-900">{testimonial.name}</p>
          <p className="text-xs text-slate-500">{testimonial.role}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-brand-red text-brand-red" />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">{testimonial.text}</p>
    </motion.article>
  );
}
