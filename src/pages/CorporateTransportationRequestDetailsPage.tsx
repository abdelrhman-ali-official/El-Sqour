import { ArrowLeft, Building2, CalendarDays, Clock3, Loader2, Mail, MapPin, Phone, Route as RouteIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchCorporateTransportationRequest,
  type CorporateTransportationRequest
} from "../utils/api";

const serviceTypeLabels: Record<number, string> = {
  1: "يومي",
  2: "تعاقد شهري",
  3: "رحلة واحدة"
};

const statusMeta: Record<number, { label: string; className: string }> = {
  1: { label: "Pending", className: "bg-amber-500/10 text-amber-700 ring-amber-500/20" },
  2: { label: "Under review", className: "bg-blue-500/10 text-blue-700 ring-blue-500/20" },
  3: { label: "Quoted", className: "bg-violet-500/10 text-violet-700 ring-violet-500/20" },
  4: { label: "Accepted", className: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20" },
  5: { label: "Rejected", className: "bg-rose-500/10 text-rose-700 ring-rose-500/20" },
  6: { label: "Cancelled", className: "bg-slate-500/10 text-slate-700 ring-slate-500/20" }
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) {
  return (
    <div className="flex min-h-[5.5rem] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">{icon}<span>{label}</span></div>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-900">{value ?? "-"}</p>
    </div>
  );
}

export default function CorporateTransportationRequestDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState<CorporateTransportationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requestId = Number(id);
    if (!user?.token || !Number.isInteger(requestId) || requestId <= 0) {
      setError("رقم الطلب غير صحيح.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    fetchCorporateTransportationRequest(user.token, requestId)
      .then((data) => {
        if (active) setRequest(data);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "تعذر تحميل تفاصيل الطلب.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, user?.token]);

  const status = request ? statusMeta[request.status] ?? statusMeta[1] : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,43,43,0.05),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] pb-16">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/admin/dashboard" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-red/30 hover:text-brand-red sm:w-auto"><ArrowLeft className="h-4 w-4" /> العودة للوحة الإدارة</Link>
          <p className="text-right text-sm font-semibold text-slate-500">تفاصيل طلب نقل الموظفين</p>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-14 text-center text-sm text-slate-500 shadow-soft"><Loader2 className="mx-auto h-7 w-7 animate-spin text-brand-red" /><p className="mt-3">جاري تحميل تفاصيل الطلب...</p></div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 shadow-soft">{error}</div>
        ) : request ? (
          <div className="space-y-6">
            <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-lift sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0"><p className="text-sm text-white/60">طلب رقم #{request.id}</p><h1 className="mt-2 break-words text-2xl font-semibold leading-tight">{request.companyName}</h1><p className="mt-2 break-all text-sm text-white/60">Tracking code: {request.trackingCode}</p></div>
                <span className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ring-1 ${status?.className}`}>{status?.label}</span>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-white/70 sm:grid-cols-2"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> الإنشاء: {formatDate(request.createdAt)}</p><p className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> آخر تحديث: {formatDate(request.updatedAt)}</p></div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-soft sm:p-8">
              <div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-brand-red/10 p-3 text-brand-red"><Building2 className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold text-brand-dark">بيانات الشركة والتواصل</h2><p className="mt-1 text-sm text-slate-500">جميع البيانات التي تم إرسالها مع الطلب.</p></div></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem icon={<Building2 className="h-4 w-4" />} label="اسم الشركة" value={request.companyName} />
                <DetailItem icon={<Building2 className="h-4 w-4" />} label="مجال الشركة" value={request.companyIndustry} />
                <DetailItem icon={<MapPin className="h-4 w-4" />} label="العنوان" value={request.companyAddress} />
                <DetailItem icon={<Users className="h-4 w-4" />} label="مسؤول التواصل" value={request.contactPersonName} />
                <DetailItem icon={<Mail className="h-4 w-4" />} label="البريد الإلكتروني" value={request.businessEmail} />
                <DetailItem icon={<Phone className="h-4 w-4" />} label="رقم الهاتف" value={request.phoneNumber} />
                <DetailItem icon={<Users className="h-4 w-4" />} label="إجمالي الموظفين" value={request.totalEmployees} />
                <DetailItem icon={<Users className="h-4 w-4" />} label="الموظفون المحتاجون للنقل" value={request.employeesRequiringTransportation} />
                <DetailItem icon={<RouteIcon className="h-4 w-4" />} label="نوع الخدمة" value={serviceTypeLabels[request.serviceType ?? 0] ?? request.serviceType} />
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-4"><p className="text-xs text-slate-500">ملاحظات إضافية</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{request.additionalNotes || "لا توجد ملاحظات إضافية."}</p></div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-soft sm:p-8"><div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-brand-red/10 p-3 text-brand-red"><RouteIcon className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold text-brand-dark">مسارات النقل ({request.routes?.length ?? 0})</h2><p className="mt-1 text-sm text-slate-500">المواعيد وأيام العمل لكل مسار.</p></div></div><div className="space-y-4">{request.routes?.length ? request.routes.map((route, index) => <div key={route.id ?? index} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-brand-dark">المسار {index + 1}</p><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">Route #{route.id}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><DetailItem icon={<MapPin className="h-4 w-4" />} label="موقع الالتقاط" value={route.pickupLocation} /><DetailItem icon={<MapPin className="h-4 w-4" />} label="الوجهة" value={route.destination} /><DetailItem icon={<Clock3 className="h-4 w-4" />} label="الوقت" value={`${route.pickupTime} - ${route.dropoffTime}`} /><DetailItem icon={<CalendarDays className="h-4 w-4" />} label="أيام العمل" value={route.workingDays} /></div></div>) : <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد مسارات لهذا الطلب.</p>}</div></section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
