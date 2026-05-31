import { motion } from "framer-motion";
import { ArrowLeftRight, CheckCircle2, Users } from "lucide-react";
import { fadeInUp } from "../utils/motion";
import type { TripRoute, VehicleType } from "../utils/api";

type TripRouteCardProps = {
  route: TripRoute;
  vehicle?: VehicleType;
  image: string;
  onBook?: (route: TripRoute) => void;
};

export default function TripRouteCard({
  route,
  vehicle,
  image,
  onBook
}: TripRouteCardProps) {
  const capacityLabel = vehicle ? `${vehicle.capacity} راكب` : "سعة مرنة";

  return (
    <motion.article
      variants={fadeInUp}
      className="group overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={image}
          alt={route.vehicleTypeName}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-red">
          {route.price.toLocaleString("ar-EG")} ج.م
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          {route.isActive ? "متاح" : "غير متاح"}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{route.vehicleTypeName}</h3>
          <span className="rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
            VIP
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeftRight className="h-4 w-4 text-brand-red" />
          <span>
            {route.fromGovernorateName} → {route.toGovernorateName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4 text-brand-red" />
          <span>{capacityLabel}</span>
        </div>
        <button
          className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!route.isActive}
          onClick={() => onBook?.(route)}
        >
          احجز الآن
        </button>
      </div>
    </motion.article>
  );
}
