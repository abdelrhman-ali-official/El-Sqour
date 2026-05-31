import { motion } from "framer-motion";
import { fadeInUp } from "../utils/motion";

type Destination = {
  name: string;
  trips: string;
  price: string;
  image: string;
};

type DestinationCardProps = {
  destination: Destination;
};

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <motion.article
      variants={fadeInUp}
      className="group overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
        <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-red">
          {destination.price}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">{destination.name}</h3>
        <p className="mt-2 text-sm text-slate-600">{destination.trips}</p>
      </div>
    </motion.article>
  );
}
