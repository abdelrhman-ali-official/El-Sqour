import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import SearchBox from "../components/SearchBox";

const services = [
  "رحلات بين المحافظات",
  "حجز عربيات خاصة",
  "Trips & Tourism",
  "نقل VIP",
  "رحلات جماعية",
  "Airport Transfer"
];

export default function Hero() {
  return (
    <section id="home" className="relative">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1800&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80" />
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-brand-red/30 blur-3xl" />
        <div className="absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-24 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.8fr]">

          {/* النص — اليمين */}
          <div className="text-white">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white"
            >
              <Sparkles className="h-4 w-4 text-brand-red" />
              تجربة سفر فاخرة ومريحة
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl"
            >
              سافر براحة وسرعة مع الصقور
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 max-w-xl text-base leading-relaxed text-white/80"
            >
              خدمات نقل فاخرة داخل وخارج المحافظات، سيارات حديثة، وسائقين محترفين مع دعم
              كامل على مدار الساعة.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {services.map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-white/30 px-3 py-1 text-xs text-white/90"
                >
                  {service}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Search Box — الشمال */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="min-w-0 w-full"
          >
            <SearchBox className="w-full" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}