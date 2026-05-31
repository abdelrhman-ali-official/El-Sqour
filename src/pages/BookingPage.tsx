import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SectionHeading from "../components/SectionHeading";
import { fetchVehicleTypes, type VehicleType, fetchAvailableRoutes, type TripRoute } from "../utils/api";
import { getVehicleImage } from "../data/vehicleTypeImages";
import { useAuth } from "../context/AuthContext";

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const routeId = Number(searchParams.get("routeId"));
  const [route, setRoute] = useState<TripRoute | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [pickupPoint, setPickupPoint] = useState("");
  const [dropoffPoint, setDropoffPoint] = useState("");
  const [travelDate, setTravelDate] = useState(searchParams.get("date") ?? "");
  const [passengerCount, setPassengerCount] = useState(Number(searchParams.get("passengers")) || 1);
  const [contactName, setContactName] = useState(user?.displayName ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let active = true;
    fetchVehicleTypes().then((types) => {
      if (!active) return;
      setVehicleTypes(types);
    });

    const fetchRoute = async () => {
      const from = Number(searchParams.get("from"));
      const to = Number(searchParams.get("to"));
      const date = searchParams.get("date") ?? new Date().toISOString();
      try {
        const res = await fetchAvailableRoutes({
          fromGovernorateId: from,
          toGovernorateId: to,
          travelDate: date,
          passengerCount: Number(searchParams.get("passengers")) || 1
        });
        if (!active) return;
        const found = res.data.find((r) => r.id === routeId);
        if (found) setRoute(found);
      } catch (e) {
        // ignore
      }
    };

    fetchRoute();

    return () => {
      active = false;
    };
  }, [routeId, searchParams]);

  const selectedVehicle = useMemo(() => vehicleTypes.find((v) => v.id === route?.vehicleTypeId), [
    vehicleTypes,
    route
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!route) {
      setError("تعذر تحديد الرحلة المطلوبة.");
      return;
    }

    if (!pickupPoint || !dropoffPoint) {
      setError("يرجى إدخال نقاط الانطلاق والوصول.");
      return;
    }

    if (!contactPhone) {
      setError("يرجى إدخال رقم الهاتف للتواصل.");
      return;
    }
    if (!user && !contactName) {
      setError("يرجى إدخال الاسم للتواصل.");
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL ?? "https://sqour.runasp.net"}/api/TripBookings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          tripRouteId: route.id,
          pickupPoint,
          dropoffPoint,
          travelDate: new Date(new Date(travelDate).getTime() + 3 * 60 * 60 * 1000).toISOString(),
          passengerCount,
          contactName: contactName || undefined,
          contactPhone: contactPhone || undefined,
          notes: notes || undefined
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message || "فشل إنشاء الحجز. حاول مرة أخرى.");
        return;
      }

      const booking = await response.json().catch(() => null);
      navigate("/booking/success", { state: { booking, route } });
      return;
    } catch (e) {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى لاحقًا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="حجز" title="إكمال الحجز" description="راجع بيانات الرحلة وأضف تفاصيل الاتصال لتأكيد الحجز." />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,360px]">
          <form className="rounded-3xl bg-white/80 p-6 shadow-soft" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-xs text-slate-400">الرحلة المختارة</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedVehicle?.name || route?.vehicleTypeName}</p>
                <p className="mt-1 text-sm text-slate-600">{route?.fromGovernorateName} → {route?.toGovernorateName}</p>
                <p className="mt-2 text-sm font-semibold text-brand-red">{route ? route.price.toLocaleString('ar-EG') + ' ج.م' : '-'}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">نقطة الصعود</label>
                  <input value={pickupPoint} onChange={(e) => setPickupPoint(e.target.value)} className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none" placeholder="مثال: موقف الرحلات الرئيسي" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">نقطة النزول</label>
                  <input value={dropoffPoint} onChange={(e) => setDropoffPoint(e.target.value)} className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none" placeholder="مثال: الفندق" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">التاريخ والوقت</label>
                  <input type="datetime-local" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">عدد الركاب</label>
                  <input type="number" min={1} value={passengerCount} onChange={(e) => setPassengerCount(Number(e.target.value))} className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {!user ? (
                  <div>
                    <label className="text-xs text-slate-500">الاسم للتواصل</label>
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none"
                      placeholder="الاسم الكامل"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-slate-500">الاسم للتواصل (اختياري)</label>
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none"
                      placeholder="الاسم الكامل"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-500">رقم الهاتف</label>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none"
                    placeholder="01xxxxxxxxx"
                  />
                  <p className="mt-2 text-xs text-slate-400">مطلوب للتواصل لتأكيد الحجز.</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500">ملاحظات (اختياري)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none" placeholder="ملاحظات إضافية حول نقطة التجمع أو الأمتعة" />
              </div>

              {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
              {success ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">{success}</div> : null}

              <div className="pt-2">
                <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" /> : null}
                  تأكيد الحجز
                </button>
              </div>
            </div>
          </form>

          <aside className="rounded-3xl bg-white/80 p-6 shadow-soft">
            <div className="relative h-44 overflow-hidden rounded-2xl">
              <img src={getVehicleImage(route?.vehicleTypeId)} alt="vehicle" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">تفاصيل الرحلة</p>
              <p className="mt-1 font-semibold text-slate-900">{route?.fromGovernorateName} → {route?.toGovernorateName}</p>
              <p className="mt-1 text-sm text-slate-600">{selectedVehicle?.name || route?.vehicleTypeName}</p>
              <p className="mt-3 text-sm font-semibold text-brand-red">{route ? route.price.toLocaleString('ar-EG') + ' ج.م' : '-'}</p>
            </div>
            <div className="mt-6 text-sm text-slate-600">
              <p>خدمة دعم 24/7</p>
              <p className="mt-2">سياسات استرجاع مرنة وإمكانية تعديل الحجز حسب الشروط.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
