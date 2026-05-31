import { BadgeDollarSign, Snowflake, Users } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "../utils/motion";

type Car = {
  name: string;
  seats: string;
  ac: string;
  price: string;
  image: string;
};

type CarCardProps = {
  car: Car;
};

export default function CarCard({ car }: CarCardProps) {
  return (
    <motion.article
      variants={fadeInUp}
      className="group overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold text-slate-900">{car.name}</h3>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-red" />
            {car.seats}
          </span>
          <span className="inline-flex items-center gap-2">
            <Snowflake className="h-4 w-4 text-brand-red" />
            {car.ac}
          </span>
          <span className="inline-flex items-center gap-2">
            <BadgeDollarSign className="h-4 w-4 text-brand-red" />
            {car.price}
          </span>
        </div>
        <button className="inline-flex w-full items-center justify-center rounded-2xl border border-brand-red/20 bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red transition hover:bg-brand-red hover:text-white">
          احجز الآن
        </button>
      </div>
    </motion.article>
  );
}
