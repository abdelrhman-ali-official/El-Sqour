import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

const links = [
  { label: "الرئيسية", href: "/#home" },
  { label: "الرحلات", href: "/#trips" },
  { label: "السيارات", href: "/#cars" },
  { label: "من نحن", href: "/#about" },
  { label: "تواصل معنا", href: "/#contact" }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user, logout } = useAuth();

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const isAdmin = user?.userRole === 4;

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50"
    >
      <div className="glass border-b border-white/60">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="الصقور"
              className="h-11 w-11 rounded-full object-cover shadow-soft"
            />
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900">الصقور</p>
              <p className="text-xs text-slate-500">رحلات ونقل فاخر</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-700 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-brand-red"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <Link to="/my-trips" className="transition hover:text-brand-red">
                رحلاتي
              </Link>
            ) : null}
            {isAdmin ? (
              <Link to="/admin/dashboard" className="transition hover:text-brand-red">
                لوحة الإدارة
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden items-center gap-3 md:flex">
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="rounded-full border border-brand-red/20 bg-brand-red/10 px-4 py-2 text-sm font-medium text-brand-dark transition hover:border-brand-red/40 hover:text-brand-red"
                  >
                    لوحة الإدارة
                  </Link>
                ) : null}
                <div className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700">
                  مرحبا، {user.displayName}
                </div>
                <button
                  className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-red/40 hover:text-brand-red"
                  onClick={logout}
                >
                  تسجيل خروج
                </button>
              </div>
            ) : (
              <>
                <button
                  className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-red/40 hover:text-brand-red md:inline-flex"
                  onClick={() => openAuth("login")}
                >
                  تسجيل الدخول
                </button>
                <button
                  className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                  onClick={() => openAuth("register")}
                >
                  إنشاء حساب
                </button>
              </>
            )}
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-slate-700 transition hover:text-brand-red lg:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="قائمة التنقل"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass border-b border-white/60 lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 text-sm text-slate-700">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl bg-white/70 px-4 py-2 text-right transition hover:text-brand-red"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <Link
                  to="/my-trips"
                  className="rounded-2xl bg-white/70 px-4 py-2 text-right transition hover:text-brand-red"
                  onClick={() => setMenuOpen(false)}
                >
                  رحلاتي
                </Link>
              ) : null}
              {isAdmin ? (
                <Link
                  to="/admin/dashboard"
                  className="rounded-2xl bg-white/70 px-4 py-2 text-right transition hover:text-brand-red"
                  onClick={() => setMenuOpen(false)}
                >
                  لوحة الإدارة
                </Link>
              ) : null}
              {user ? (
                <>
                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-right text-sm">
                    مرحبا، {user.displayName}
                  </div>
                  <button
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-red/40 hover:text-brand-red"
                    onClick={logout}
                  >
                    تسجيل خروج
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-red/40 hover:text-brand-red"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuth("login");
                    }}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    className="rounded-2xl bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-soft"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuth("register");
                    }}
                  >
                    إنشاء حساب
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AuthModal open={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} />
    </motion.header>
  );
}
