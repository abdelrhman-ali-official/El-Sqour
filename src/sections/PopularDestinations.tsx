import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DestinationCard from "../components/DestinationCard";
import SectionHeading from "../components/SectionHeading";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { destinations } from "../data/destinations";
import { stagger } from "../utils/motion";

export default function PopularDestinations() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="trips" className="scroll-mt-24 py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="وجهاتنا"
          title="الوجهات الأكثر طلبا"
          description="اكتشف المدن التي يفضلها عملاؤنا مع تجربة سفر فاخرة وخيارات متعددة تناسب رحلات العمل والسياحة."
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
