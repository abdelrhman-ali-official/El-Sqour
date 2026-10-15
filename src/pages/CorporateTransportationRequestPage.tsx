import { AnimatePresence, motion } from "framer-motion";
import { Check, Clipboard, Clock3, Loader2, MapPin, Plus, Route as RouteIcon, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading";
import {
  createCorporateTransportationRequest,
  trackCorporateTransportationRequest,
  type CorporateRoute,
  type CorporateTransportationRequest
} from "../utils/api";
import { validateEmail } from "../utils/validators";

const imagePath = "/Branded Fleet at Sunset Depot.png";
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const serviceTypes = [
  { value: 1, label: "يومي" },
  { value: 2, label: "تعاقد شهري" },
  { value: 3, label: "رحلة واحدة" }
];
const statusMeta: Record<number, { label: string; tone: string }> = {
  1: { label: "قيد الانتظار", tone: "bg-amber-500/10 text-amber-700 ring-amber-500/20" },
  2: { label: "قيد المراجعة", tone: "bg-blue-500/10 text-blue-700 ring-blue-500/20" },
  3: { label: "تم إعداد العرض", tone: "bg-violet-500/10 text-violet-700 ring-violet-500/20" },
  4: { label: "تم القبول", tone: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20" },
  5: { label: "مرفوض", tone: "bg-rose-500/10 text-rose-700 ring-rose-500/20" },
  6: { label: "ملغي", tone: "bg-slate-500/10 text-slate-700 ring-slate-500/20" }
};

type FormState = {
  companyName: string;
  companyIndustry: string;
  companyAddress: string;
  contactPersonName: string;
  businessEmail: string;
  phoneNumber: string;
  totalEmployees: string;
  employeesRequiringTransportation: string;
  serviceType: number;
  additionalNotes: string;
};

const emptyForm: FormState = {
  companyName: "",
  companyIndustry: "",
  companyAddress: "",
  contactPersonName: "",
  businessEmail: "",
  phoneNumber: "",
  totalEmployees: "",
  employeesRequiringTransportation: "",
  serviceType: 1,
  additionalNotes: ""
};

const emptyRoute = (): CorporateRoute => ({
  pickupLocation: "",
  destination: "",
  pickupTime: "08:00",
  dropoffTime: "17:00",
  workingDays: "Sunday, Monday, Tuesday, Wednesday, Thursday"
});

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-xs font-medium text-slate-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

const inputClass = "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/15";

function Message({ children, success = false }: { children: React.ReactNode; success?: boolean }) {
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600"}`}>{children}</div>;
}

function RouteEditor({ route, index, onChange, onRemove, canRemove, error }: { route: CorporateRoute; index: number; onChange: (route: CorporateRoute) => void; onRemove: () => void; canRemove: boolean; error?: string }) {
  const selectedDays = route.workingDays ? route.workingDays.split(", ") : [];
  const toggleDay = (day: string) => {
    const next = selectedDays.includes(day) ? selectedDays.filter((item) => item !== day) : [...selectedDays, day];
    onChange({ ...route, workingDays: next.join(", ") });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-brand-dark"><RouteIcon className="h-5 w-5 text-brand-red" /><h3 className="font-semibold">المسار {index + 1}</h3></div>
        {canRemove ? <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"><Trash2 className="h-4 w-4" /> حذف</button> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="موقع الالتقاط"><input className={inputClass} value={route.pickupLocation} onChange={(event) => onChange({ ...route, pickupLocation: event.target.value })} placeholder="مثال: مدينة نصر" /></Field>
        <Field label="الوجهة"><input className={inputClass} value={route.destination} onChange={(event) => onChange({ ...route, destination: event.target.value })} placeholder="مثال: القرية الذكية" /></Field>
        <Field label="وقت الالتقاط"><input type="time" className={inputClass} value={route.pickupTime} onChange={(event) => onChange({ ...route, pickupTime: event.target.value })} /></Field>
        <Field label="وقت الوصول"><input type="time" className={inputClass} value={route.dropoffTime} onChange={(event) => onChange({ ...route, dropoffTime: event.target.value })} /></Field>
      </div>
      <div className="mt-4">
        <span className="mb-2 block text-xs font-medium text-slate-500">أيام العمل</span>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => <button type="button" key={day} onClick={() => toggleDay(day)} className={`rounded-full px-3 py-2 text-xs transition ${selectedDays.includes(day) ? "bg-brand-red text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-red/30"}`}>{day}</button>)}
        </div>
      </div>
      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function TrackingResult({ request }: { request: CorporateTransportationRequest }) {
  const meta = statusMeta[request.status] ?? statusMeta[1];
  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs text-slate-500">طلب شركة</p><h3 className="mt-1 text-lg font-semibold text-brand-dark">{request.companyName}</h3></div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${meta.tone}`}>{meta.label}</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[1, 2, 3, 4].map((status) => <div key={status} className={`flex items-center gap-2 text-xs ${request.status >= status ? "font-semibold text-brand-red" : "text-slate-400"}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full ${request.status >= status ? "bg-brand-red text-white" : "bg-slate-100"}`}>{request.status > status ? <Check className="h-4 w-4" /> : status}</span>{statusMeta[status].label}</div>)}
      </div>
      <div className="mt-5 space-y-2 text-sm text-slate-600"><p><span className="text-slate-400">آخر تحديث:</span> {new Date(request.updatedAt).toLocaleString("ar-EG")}</p><p><span className="text-slate-400">عدد المسارات:</span> {request.routes?.length ?? 0}</p></div>
    </div>
  );
}

export default function CorporateTransportationRequestPage() {
  const [form, setForm] = useState(emptyForm);
  const [routes, setRoutes] = useState<CorporateRoute[]>([emptyRoute()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<CorporateTransportationRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackedRequest, setTrackedRequest] = useState<CorporateTransportationRequest | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.companyName.trim()) next.companyName = "اسم الشركة مطلوب.";
    if (!form.companyIndustry.trim()) next.companyIndustry = "مجال الشركة مطلوب.";
    if (!form.companyAddress.trim()) next.companyAddress = "عنوان الشركة مطلوب.";
    if (!form.contactPersonName.trim()) next.contactPersonName = "اسم مسؤول التواصل مطلوب.";
    if (!validateEmail(form.businessEmail)) next.businessEmail = "أدخل بريدًا إلكترونيًا صحيحًا.";
    if (!/^01\d{9}$/.test(form.phoneNumber.replace(/\s/g, ""))) next.phoneNumber = "أدخل رقم هاتف مصري صحيحًا.";
    const total = Number(form.totalEmployees);
    const requiring = Number(form.employeesRequiringTransportation);
    if (!Number.isInteger(total) || total < 1) next.totalEmployees = "أدخل عددًا صحيحًا أكبر من صفر.";
    if (!Number.isInteger(requiring) || requiring < 1 || requiring > total) next.employeesRequiringTransportation = "يجب ألا يتجاوز العدد إجمالي الموظفين.";
    routes.forEach((route, index) => {
      if (!route.pickupLocation.trim() || !route.destination.trim()) next[`route-${index}`] = "أدخل موقع الالتقاط والوجهة.";
      if (!route.workingDays) next[`route-${index}`] = "اختر يوم عمل واحدًا على الأقل.";
      if (route.dropoffTime <= route.pickupTime) next[`route-${index}`] = "يجب أن يكون وقت الوصول بعد وقت الالتقاط.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setCreatedRequest(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const request = await createCorporateTransportationRequest({
        ...form,
        totalEmployees: Number(form.totalEmployees),
        employeesRequiringTransportation: Number(form.employeesRequiringTransportation),
        phoneNumber: form.phoneNumber.replace(/\s/g, ""),
        routes: routes.map((route) => ({ ...route, pickupTime: `${route.pickupTime}:00`, dropoffTime: `${route.dropoffTime}:00` }))
      });
      setCreatedRequest(request);
      setTrackingCode(request.trackingCode);
      setTrackedRequest(request);
      setForm(emptyForm);
      setRoutes([emptyRoute()]);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "تعذر إرسال الطلب. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (event: React.FormEvent) => {
    event.preventDefault();
    setTrackingError(null);
    setTrackedRequest(null);
    if (!trackingCode.trim()) { setTrackingError("أدخل رقم التتبع أولًا."); return; }
    setTrackingLoading(true);
    try { setTrackedRequest(await trackCorporateTransportationRequest(trackingCode.trim())); }
    catch (error) { setTrackingError(error instanceof Error ? error.message : "تعذر متابعة الطلب."); }
    finally { setTrackingLoading(false); }
  };

  const copyTrackingCode = async () => {
    if (!createdRequest?.trackingCode) return;
    await navigator.clipboard.writeText(createdRequest.trackingCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="حلول الشركات" title="طلب نقل موظفي الشركات" description="خطط خدمة نقل تناسب فريقك، مع متابعة واضحة لكل طلب." />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr),380px]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-soft sm:p-8">
            <div className="mb-7 grid gap-4 sm:grid-cols-2">
              <Field label="اسم الشركة" error={errors.companyName}><input className={inputClass} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></Field>
              <Field label="مجال الشركة" error={errors.companyIndustry}><input className={inputClass} value={form.companyIndustry} onChange={(e) => setForm({ ...form, companyIndustry: e.target.value })} /></Field>
              <Field label="عنوان الشركة" error={errors.companyAddress}><input className={inputClass} value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} /></Field>
              <Field label="مسؤول التواصل" error={errors.contactPersonName}><input className={inputClass} value={form.contactPersonName} onChange={(e) => setForm({ ...form, contactPersonName: e.target.value })} /></Field>
              <Field label="البريد الإلكتروني للعمل" error={errors.businessEmail}><input type="email" className={inputClass} value={form.businessEmail} onChange={(e) => setForm({ ...form, businessEmail: e.target.value })} /></Field>
              <Field label="رقم الهاتف" error={errors.phoneNumber}><input inputMode="tel" className={inputClass} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="01xxxxxxxxx" /></Field>
              <Field label="إجمالي الموظفين" error={errors.totalEmployees}><input type="number" min="1" className={inputClass} value={form.totalEmployees} onChange={(e) => setForm({ ...form, totalEmployees: e.target.value })} /></Field>
              <Field label="الموظفون المحتاجون للنقل" error={errors.employeesRequiringTransportation}><input type="number" min="1" className={inputClass} value={form.employeesRequiringTransportation} onChange={(e) => setForm({ ...form, employeesRequiringTransportation: e.target.value })} /></Field>
            </div>
            <div className="mb-7"><span className="mb-3 block text-xs font-medium text-slate-500">نوع الخدمة</span><div className="grid gap-3 sm:grid-cols-3">{serviceTypes.map((service) => <button type="button" key={service.value} onClick={() => setForm({ ...form, serviceType: service.value })} className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${form.serviceType === service.value ? "bg-brand-red text-white shadow-soft" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:ring-brand-red/30"}`}>{service.label}</button>)}</div></div>
            <div className="mb-7"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-brand-dark">مسارات الخدمة</h2><p className="mt-1 text-sm text-slate-500">أضف كل مسار ومواعيده وأيام تشغيله.</p></div><button type="button" onClick={() => setRoutes([...routes, emptyRoute()])} className="inline-flex items-center gap-2 rounded-2xl border border-brand-red/20 bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-red/15"><Plus className="h-4 w-4" /> إضافة مسار</button></div><div className="space-y-4">{routes.map((route, index) => <RouteEditor key={index} route={route} index={index} canRemove={routes.length > 1} error={errors[`route-${index}`]} onRemove={() => setRoutes(routes.filter((_, routeIndex) => routeIndex !== index))} onChange={(next) => setRoutes(routes.map((item, routeIndex) => routeIndex === index ? next : item))} />)}</div></div>
            <Field label="ملاحظات إضافية"><textarea rows={4} className={inputClass} value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} placeholder="أي تفاصيل تساعدنا على إعداد الخدمة" /></Field>
            <AnimatePresence>{submitError ? <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-5"><Message>{submitError}</Message></motion.div> : null}</AnimatePresence>
            <button disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-red px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">{submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} إرسال طلب النقل</button>
          </form>
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-soft"><div className="relative h-56"><img src={imagePath} alt="أسطول الصقور" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" /><div className="absolute bottom-5 right-5 text-white"><p className="text-sm text-white/75">أسطول الصقور</p><p className="mt-1 text-xl font-semibold">جاهز لخدمة فريقك</p></div></div><div className="grid gap-4 p-5 text-sm text-slate-600"><p className="flex items-center gap-3"><Users className="h-5 w-5 text-brand-red" /> حلول قابلة للتوسع حسب عدد الموظفين</p><p className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-brand-red" /> جداول مرنة ومسارات متعددة</p><p className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand-red" /> تغطية مخصصة لمواقع العمل</p></div></div>
            {createdRequest ? <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm"><p className="text-sm font-semibold text-emerald-800">تم إرسال طلبك بنجاح</p><p className="mt-1 text-xs text-emerald-700">احتفظ برقم التتبع لمتابعة حالة الطلب.</p><div className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-3"><code className="min-w-0 flex-1 break-all text-xs font-semibold text-slate-800">{createdRequest.trackingCode}</code><button type="button" onClick={copyTrackingCode} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-brand-red px-3 py-2 text-xs font-semibold text-white"><Clipboard className="h-4 w-4" /> {copied ? "تم النسخ" : "نسخ"}</button></div></div> : null}
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-5 shadow-soft"><div className="flex items-start gap-3"><div className="rounded-2xl bg-brand-red/10 p-3 text-brand-red"><RouteIcon className="h-5 w-5" /></div><div><h2 className="font-semibold text-brand-dark">متابعة طلب سابق</h2><p className="mt-1 text-xs leading-6 text-slate-500">أدخل رقم التتبع لمعرفة آخر تحديث.</p></div></div><form onSubmit={handleTrack} className="mt-4 flex gap-2"><input className={`${inputClass} min-w-0`} value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="رقم التتبع" /><button disabled={trackingLoading} className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-brand-dark px-4 text-sm font-semibold text-white disabled:opacity-70">{trackingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "متابعة"}</button></form>{trackingError ? <div className="mt-4"><Message>{trackingError}</Message></div> : null}{trackedRequest ? <TrackingResult request={trackedRequest} /> : null}</div>
            <Link to="/" className="block text-center text-sm font-semibold text-brand-red hover:underline">العودة إلى الصفحة الرئيسية</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
