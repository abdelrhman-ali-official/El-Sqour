import { Facebook, Instagram, Linkedin, Mail, PhoneCall } from "lucide-react";

const links = [
  { label: "الرئيسية", href: "/#home" },
  { label: "الرحلات", href: "/#trips" },
  { label: "السيارات", href: "/#cars" },
  { label: "من نحن", href: "/#about" },
  { label: "تواصل معنا", href: "/#contact" }
];
const services = [
  "رحلات بين المحافظات",
  "نقل VIP",
  "حجز رحلات جماعية",
  "Airport Transfer",
  "Trips & Tourism"
];

export default function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1.1fr] lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="الصقور" className="h-10 w-10 rounded-full" />
            <div>
              <p className="text-lg font-semibold text-slate-900">الصقور</p>
              <p className="text-xs text-slate-500">رحلات ونقل فاخر</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            نخلق تجربة سفر مميزة تجمع بين الراحة والموثوقية مع خدمات حجز متطورة ودعم
            متواصل.
          </p>
          <div className="flex items-center gap-3 text-slate-500">
            <a href="#" className="transition hover:text-brand-red">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="transition hover:text-brand-red">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="transition hover:text-brand-red">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">روابط سريعة</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-brand-red">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">خدماتنا</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">النشرة البريدية</p>
          <p className="text-sm text-slate-600">اشترك ليصلك كل جديد عن عروض الصقور.</p>
          <div className="flex items-center gap-2">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none"
              placeholder="بريدك الإلكتروني"
            />
            <button className="rounded-2xl bg-brand-red px-4 py-2 text-sm font-semibold text-white">
              اشتراك
            </button>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-brand-red" />
              +20 100 555 7890
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-red" />
              hello@sqour-travel.com
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/70 py-4 text-center text-xs text-slate-500">
        جميع الحقوق محفوظة © الصقور 2026
      </div>
    </footer>
  );
}
