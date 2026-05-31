import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "../utils/motion";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export default function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft transition hover:-translate-y-1"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </motion.div>
  );
}
