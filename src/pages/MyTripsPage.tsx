import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Ticket, User2, Phone, Clock3, ArrowLeft, Loader2 } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { fetchMyTripBookings, type TripBooking } from "../utils/api";

const statusMap: Record<number, { label: string; className: string }> = {
  1: { label: "قيد المراجعة", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  2: { label: "مؤكد", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  3: { label: "ملغي", className: "bg-rose-50 text-rose-700 ring-rose-200" }
};

export default function MyTripsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<TripBooking[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token) {
      setLoading(false);
      setError("يجب تسجيل الدخول لعرض رحلاتك.");
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyTripBookings(user.token, pageIndex, pageSize);
        setItems(data.data ?? []);
        setTotalCount(data.totalCount ?? 0);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "تعذر تحميل رحلاتك.");
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [pageIndex, pageSize, user?.token]);

  const upcomingCount = useMemo(
    () => items.filter((item) => new Date(item.travelDate).getTime() >= Date.now()).length,
    [items]
  );

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === 1).length,
    [items]
  );

  const confirmedCount = useMemo(
    () => items.filter((item) => item.status === 2).length,
    [items]
  );

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [pageSize, totalCount]);

  if (!user) {
    return (
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="رحلاتي" title="رحلاتي" description="سجّل الدخول أولاً لعرض حجوزاتك." />
          <div className="mt-8 rounded-3xl bg-white/80 p-6 text-center shadow-soft sm:p-8">
            <p className="text-sm text-slate-600">هذه الصفحة مخصصة لعرض رحلاتك المحجوزة بعد تسجيل الدخول.</p>
            <div className="mt-5 flex justify-center">
              <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-brand-red px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5">
                <ArrowLeft className="h-4 w-4" />
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
          <SectionHeading
            eyebrow="رحلاتي"
            title="حجوزاتك في مكان واحد"
            description="راجع حالة الحجز، تفاصيل الرحلة، واطبع التذكرة وقت ما تحتاج."
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft">
              <p className="text-xs text-slate-500">إجمالي الحجوزات</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{items.length}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft">
              <p className="text-xs text-slate-500">القادمة</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{upcomingCount}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft">
              <p className="text-xs text-slate-500">المؤكدة</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{confirmedCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl bg-white/80 p-8 text-center shadow-soft">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-brand-red" />
              <p className="mt-3 text-sm text-slate-600">جاري تحميل رحلاتك...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white/80 p-8 text-center shadow-soft">
              <p className="text-sm text-red-600">{error}</p>
              <div className="mt-5 flex justify-center gap-3">
                <Link to="/" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          ) : items.length ? (
            <div className="grid gap-5">
              {items.map((item) => {
                const status = statusMap[item.status] ?? { label: "غير معروف", className: "bg-slate-50 text-slate-700 ring-slate-200" };
                return (
                  <article key={item.id} className="overflow-hidden rounded-[28px] bg-white/85 shadow-soft ring-1 ring-white/60 backdrop-blur-sm">
                    <div className="grid gap-0 lg:grid-cols-[280px,1fr]">
                      <div className="relative min-h-56 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-red p-5 text-white">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_30%)]" />
                        <div className="relative flex h-full flex-col justify-between">
                          <div>
                            <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs text-white/90 ring-1 ring-white/20">
                              #{item.id}
                            </div>
                            <h3 className="mt-4 text-2xl font-bold leading-tight">{item.fromGovernorateName}</h3>
                            <p className="mt-1 text-sm text-white/75">إلى</p>
                            <p className="text-2xl font-bold leading-tight">{item.toGovernorateName}</p>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs text-white/60">السعر</p>
                              <p className="text-lg font-semibold">{item.price.toLocaleString("ar-EG")} ج.م</p>
                            </div>
                            <div className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.className}`}>
                              {status.label}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 lg:p-7">
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="text-xs text-slate-400">المركبة</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">{item.vehicleTypeName}</p>
                            </div>
                            <div className="rounded-2xl bg-brand-red/5 px-4 py-3 text-sm text-slate-700 ring-1 ring-brand-red/10">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-brand-red" />
                                <span>{new Date(item.travelDate).toLocaleString("ar-EG")}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="flex items-center gap-2 text-slate-500">
                                <MapPin className="h-4 w-4 text-brand-red" />
                                <span className="text-xs">نقطة الصعود</span>
                              </div>
                              <p className="mt-2 font-semibold text-slate-900">{item.pickupPoint}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="flex items-center gap-2 text-slate-500">
                                <MapPin className="h-4 w-4 text-brand-red" />
                                <span className="text-xs">نقطة النزول</span>
                              </div>
                              <p className="mt-2 font-semibold text-slate-900">{item.dropoffPoint}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Ticket className="h-4 w-4 text-brand-red" />
                                <span className="text-xs">عدد الركاب</span>
                              </div>
                              <p className="mt-2 font-semibold text-slate-900">{item.passengerCount}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Clock3 className="h-4 w-4 text-brand-red" />
                                <span className="text-xs">تاريخ الإنشاء</span>
                              </div>
                              <p className="mt-2 font-semibold text-slate-900">{new Date(item.createdAt).toLocaleString("ar-EG")}</p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                              <div className="flex items-center gap-2 text-slate-500">
                                <User2 className="h-4 w-4 text-brand-red" />
                                <span className="text-xs">جهة الاتصال</span>
                              </div>
                              <p className="mt-2 font-semibold text-slate-900">{item.contactName}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Phone className="h-4 w-4 text-brand-red" />
                                <span className="text-xs">رقم الهاتف</span>
                              </div>
                              <p className="mt-2 font-semibold text-slate-900">{item.contactPhone}</p>
                            </div>
                          </div>

                          {item.notes ? (
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                              {item.notes}
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <p className="text-sm text-slate-500">user: {item.userEmail}</p>
                            <div className="flex flex-wrap gap-3">
                              <Link
                                to={`/booking/success`}
                                state={{ booking: item, route: item }}
                                className="inline-flex items-center justify-center rounded-2xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                              >
                                عرض التذكرة
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white/80 p-4 shadow-soft">
                <button
                  onClick={() => setPageIndex((previous) => Math.max(1, previous - 1))}
                  disabled={pageIndex <= 1 || loading}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  السابق
                </button>
                <span className="text-sm text-slate-600">صفحة {pageIndex} من {totalPages}</span>
                <button
                  onClick={() => setPageIndex((previous) => Math.min(totalPages, previous + 1))}
                  disabled={pageIndex >= totalPages || loading}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white/80 p-8 text-center shadow-soft">
              <p className="text-sm text-slate-600">لا توجد حجوزات حالياً.</p>
              <div className="mt-5 flex justify-center gap-3">
                <Link to="/trips" className="rounded-2xl bg-brand-red px-4 py-2 text-sm font-semibold text-white">
                  احجز رحلة
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
