import { Mail, MapPin, PhoneCall } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

export default function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-24 py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="تواصل معنا"
          title="نحن جاهزون لأي استفسار"
          description="تواصل مع فريق الصقور لتخطيط رحلتك القادمة أو تخصيص خدمات النقل للشركات."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="grid gap-4">
            <div className="glass rounded-3xl p-5 shadow-soft">
              <div className="flex items-center gap-3 text-brand-red">
                <PhoneCall className="h-5 w-5" />
                <span className="text-sm font-semibold">اتصل بنا</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">+20 100 555 7890</p>
            </div>
            <div className="glass rounded-3xl p-5 shadow-soft">
              <div className="flex items-center gap-3 text-brand-red">
                <Mail className="h-5 w-5" />
                <span className="text-sm font-semibold">البريد الإلكتروني</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">hello@sqour-travel.com</p>
            </div>
            <div className="glass rounded-3xl p-5 shadow-soft">
              <div className="flex items-center gap-3 text-brand-red">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-semibold">المقر الرئيسي</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">القاهرة الجديدة، مصر</p>
            </div>
          </div>

          <form className="glass rounded-3xl p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-brand-red/40"
                placeholder="الاسم الكامل"
              />
              <input
                className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-brand-red/40"
                placeholder="رقم الهاتف"
              />
            </div>
            <input
              className="mt-4 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-brand-red/40"
              placeholder="البريد الإلكتروني"
            />
            <textarea
              rows={4}
              className="mt-4 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-brand-red/40"
              placeholder="كيف يمكننا مساعدتك؟"
            />
            <button className="mt-4 w-full rounded-2xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5">
              إرسال الرسالة
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
