import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CarCard from "../components/CarCard";
import SectionHeading from "../components/SectionHeading";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { cars } from "../data/cars";
import { stagger } from "../utils/motion";

export default function CarsSection() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="cars" className="scroll-mt-24 bg-white py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="أسطول الصقور"
          title="سيارات تناسب كل رحلة"
          description="اختر من بين سيارات اقتصادية، فاخرة، وVIP مع أعلى درجات الراحة."
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
