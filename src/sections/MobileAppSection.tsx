import { Apple, Play } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

export default function MobileAppSection() {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-red-50 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="تطبيق الصقور"
            title="احجز رحلتك في ثواني"
            description="تجربة حجز ذكية وسريعة مع إشعارات فورية ومتابعة مباشرة لكل رحلة."
          />
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-soft transition hover:-translate-y-0.5">
              <Apple className="h-6 w-6 text-slate-900" />
              <div>
                <p className="text-xs text-slate-500">Download on</p>
                <p className="text-sm font-semibold text-slate-900">App Store</p>
              </div>
            </button>
            <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-soft transition hover:-translate-y-0.5">
              <Play className="h-6 w-6 text-brand-red" />
              <div>
                <p className="text-xs text-slate-500">Get it on</p>
                <p className="text-sm font-semibold text-slate-900">Google Play</p>
              </div>
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-6 top-10 h-32 w-32 rounded-full bg-brand-red/20 blur-2xl" />
          <div className="mx-auto w-64 rounded-[2.5rem] border border-white/70 bg-white/80 p-3 shadow-lift">
            <div className="rounded-[2rem] bg-gradient-to-br from-slate-900/90 via-slate-800 to-slate-900 p-4 text-white">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>الصقور</span>
                <span>09:41</span>
              </div>
              <div className="mt-4 rounded-2xl bg-white/10 p-3">
                <p className="text-xs text-white/70">رحلة قادمة</p>
                <p className="mt-2 text-sm font-semibold">القاهرة → الغردقة</p>
                <p className="mt-1 text-xs text-white/70">اليوم - 6:30 مساءً</p>
              </div>
              <div className="mt-4 rounded-2xl bg-white/10 p-3">
                <p className="text-xs text-white/70">السائق</p>
                <p className="mt-2 text-sm font-semibold">محمد أحمد</p>
                <p className="mt-1 text-xs text-white/70">BMW X5</p>
              </div>
              <button className="mt-4 w-full rounded-2xl bg-brand-red px-4 py-2 text-sm font-semibold">
                تتبع الرحلة
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
