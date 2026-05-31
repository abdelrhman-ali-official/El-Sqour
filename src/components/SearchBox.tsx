import { Calendar, MapPin, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchableSelect from "./SearchableSelect";
import { fetchGovernorates, type Governorate } from "../utils/api";

type SearchValues = {
  fromId: number;
  toId: number;
  travelDate: string;
  passengers: number;
};

type SearchBoxProps = {
  variant?: "default" | "compact";
  className?: string;
  withContainer?: boolean;
  initialValues?: Partial<SearchValues>;
  onSearch?: (values: SearchValues) => void;
};

const passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14];

export default function SearchBox({
  variant = "default",
  className = "",
  withContainer = true,
  initialValues,
  onSearch
}: SearchBoxProps) {
  const navigate = useNavigate();
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loadingGovs, setLoadingGovs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromId, setFromId] = useState<number | null>(initialValues?.fromId ?? null);
  const [toId, setToId] = useState<number | null>(initialValues?.toId ?? null);
  const [travelDate, setTravelDate] = useState(initialValues?.travelDate ?? "");
  const [passengers, setPassengers] = useState(initialValues?.passengers ?? 1);

  const isCompact = variant === "compact";

  const gridClass = isCompact
    ? "grid-cols-1"
    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,160px)_minmax(0,130px)_auto]";

  const containerClass = withContainer
    ? "glass rounded-2xl p-2 shadow-soft sm:p-2.5 lg:p-2.5"
    : "";

  useEffect(() => {
    let active = true;
    setLoadingGovs(true);
    fetchGovernorates()
      .then((data) => {
        if (!active) return;
        setGovernorates(data);
      })
      .catch(() => {
        if (!active) return;
        setError("تعذر تحميل قائمة المحافظات.");
      })
      .finally(() => {
        if (!active) return;
        setLoadingGovs(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!initialValues) return;
    setFromId(initialValues.fromId ?? null);
    setToId(initialValues.toId ?? null);
    setTravelDate(initialValues.travelDate ?? "");
    setPassengers(initialValues.passengers ?? 1);
  }, [
    initialValues?.fromId,
    initialValues?.toId,
    initialValues?.travelDate,
    initialValues?.passengers
  ]);

  const today = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  const handleSearch = () => {
    setError(null);
    if (!fromId || !toId || !travelDate || !passengers) {
      setError("يرجى إدخال بيانات الرحلة كاملة.");
      return;
    }
    if (fromId === toId) {
      setError("يرجى اختيار وجهة مختلفة.");
      return;
    }

    const values = { fromId, toId, travelDate, passengers };

    if (onSearch) {
      onSearch(values);
      return;
    }

    const params = new URLSearchParams({
      from: String(fromId),
      to: String(toId),
      date: travelDate,
      passengers: String(passengers)
    });
    navigate(`/trips?${params.toString()}`);
  };

  return (
    <div className={`${containerClass} ${className}`}>
      <div className={`grid min-w-0 items-stretch gap-2 lg:gap-2 ${gridClass}`}>

        {/* من */}
        <SearchableSelect
          label="من"
          placeholder="اختر المحافظة"
          icon={MapPin}
          options={governorates}
          value={fromId}
          onChange={setFromId}
          loading={loadingGovs}
          disabled={loadingGovs}
        />

        {/* إلى */}
        <SearchableSelect
          label="إلى"
          placeholder="اختر الوجهة"
          icon={MapPin}
          options={governorates}
          value={toId}
          onChange={setToId}
          loading={loadingGovs}
          disabled={loadingGovs}
        />

        {/* التاريخ */}
        <label className="flex min-w-0 items-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus-within:ring-2 focus-within:ring-brand-red/30">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-red" />
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] text-slate-400">التاريخ</span>
            <input
              type="date"
              value={travelDate}
              min={today}
              onChange={(event) => setTravelDate(event.target.value)}
              className="min-w-0 w-full bg-transparent text-xs font-medium outline-none"
            />
          </div>
        </label>

        {/* الركاب */}
        <label className="flex min-w-0 items-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus-within:ring-2 focus-within:ring-brand-red/30">
          <Users className="h-3.5 w-3.5 shrink-0 text-brand-red" />
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] text-slate-400">الركاب</span>
            <select
              value={passengers}
              onChange={(event) => setPassengers(Number(event.target.value))}
              className="min-w-0 w-full bg-transparent text-xs font-medium outline-none"
            >
              {passengerOptions.map((count) => (
                <option key={count} value={count}>
                  {count} راكب
                </option>
              ))}
            </select>
          </div>
        </label>

        {/* زر البحث */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={loadingGovs}
          className="inline-flex w-full min-h-[42px] min-w-[80px] items-center justify-center gap-1.5 rounded-xl bg-brand-red px-4 py-2.5 text-xs font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          <Search className="h-3.5 w-3.5" />
          بحث
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}