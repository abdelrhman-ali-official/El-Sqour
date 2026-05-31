import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CardSkeleton } from "../components/LoadingSkeleton";
import SearchBox from "../components/SearchBox";
import SectionHeading from "../components/SectionHeading";
import TripRouteCard from "../components/TripRouteCard";
import { getVehicleImage } from "../data/vehicleTypeImages";
import {
  fetchAvailableRoutes,
  fetchGovernorates,
  fetchVehicleTypes,
  type Governorate,
  type TripRoute,
  type VehicleType
} from "../utils/api";
import { stagger } from "../utils/motion";

const parseNumber = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function TripResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [routes, setRoutes] = useState<TripRoute[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const searchValues = useMemo(() => {
    const fromId = parseNumber(searchParams.get("from"));
    const toId = parseNumber(searchParams.get("to"));
    const date = searchParams.get("date") ?? "";
    const passengers = parseNumber(searchParams.get("passengers"));

    if (!fromId || !toId || !date || !passengers) {
      return null;
    }

    return {
      fromId,
      toId,
      travelDate: date,
      passengers
    };
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    Promise.all([fetchVehicleTypes(), fetchGovernorates()])
      .then(([types, govs]) => {
        if (!active) return;
        setVehicleTypes(types);
        setGovernorates(govs);
      })
      .catch(() => {
        if (!active) return;
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!searchValues) {
      setRoutes([]);
      setTotalCount(0);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchAvailableRoutes({
      fromGovernorateId: searchValues.fromId,
      toGovernorateId: searchValues.toId,
      travelDate: searchValues.travelDate,
      passengerCount: searchValues.passengers
    })
      .then((response) => {
        if (!active) return;
        setRoutes(response.data);
        setTotalCount(response.totalCount ?? response.data.length);
      })
      .catch((err) => {
        if (!active) return;
        setRoutes([]);
        setTotalCount(0);
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchValues]);

  const vehicleMap = useMemo(() => {
    return new Map(vehicleTypes.map((vehicle) => [vehicle.id, vehicle]));
  }, [vehicleTypes]);

  const governorateMap = useMemo(() => {
    return new Map(governorates.map((gov) => [gov.id, gov.name]));
  }, [governorates]);

  const fromLabel =
    (searchValues && governorateMap.get(searchValues.fromId)) ||
    routes[0]?.fromGovernorateName ||
    "-";
  const toLabel =
    (searchValues && governorateMap.get(searchValues.toId)) ||
    routes[0]?.toGovernorateName ||
    "-";
  const dateLabel = searchValues?.travelDate
    ? new Date(searchValues.travelDate).toLocaleDateString("ar-EG")
    : "-";

  const handleBook = (route: TripRoute) => {
    if (!searchValues) return;
    const params = new URLSearchParams({
      routeId: String(route.id),
      from: String(searchValues.fromId),
      to: String(searchValues.toId),
      date: searchValues.travelDate,
      passengers: String(searchValues.passengers)
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <section className="py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="نتائج البحث"
          title="الرحلات المتاحة في الوقت الحالي"
          description="استعرض خيارات السيارات المتوفرة واختر التجربة الأنسب لرحلتك القادمة."
        />

        <div className="glass rounded-3xl p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <MapPin className="h-5 w-5 text-brand-red" />
              <div>
                <p className="text-xs text-slate-400">المسار</p>
                <p className="font-semibold text-slate-900">
                  {fromLabel} → {toLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar className="h-5 w-5 text-brand-red" />
              <div>
                <p className="text-xs text-slate-400">التاريخ</p>
                <p className="font-semibold text-slate-900">{dateLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Users className="h-5 w-5 text-brand-red" />
              <div>
                <p className="text-xs text-slate-400">عدد الركاب</p>
                <p className="font-semibold text-slate-900">
                  {searchValues?.passengers ?? "-"} راكب
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <SearchBox
              variant="default"
              withContainer={false}
              initialValues={
                searchValues
                  ? {
                      fromId: searchValues.fromId,
                      toId: searchValues.toId,
                      travelDate: searchValues.travelDate,
                      passengers: searchValues.passengers
                    }
                  : undefined
              }
              onSearch={(values) => {
                setSearchParams({
                  from: String(values.fromId),
                  to: String(values.toId),
                  date: values.travelDate,
                  passengers: String(values.passengers)
                });
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>عدد النتائج: {totalCount}</p>
          <span className="rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
            تحديث مباشر
          </span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : routes.length ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {routes.map((route) => (
              <TripRouteCard
                key={route.id}
                route={route}
                vehicle={vehicleMap.get(route.vehicleTypeId)}
                image={getVehicleImage(route.vehicleTypeId)}
                onBook={handleBook}
              />
            ))}
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-center text-sm text-slate-600">
            لا توجد رحلات متاحة بهذه البيانات حاليا. جرّب تعديل البحث أو تاريخ آخر.
          </div>
        )}
      </div>
    </section>
  );
}
