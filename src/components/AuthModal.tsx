import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, ShieldCheck, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPasswordChecklist, validateEmail, validatePassword } from "../utils/validators";

type AuthMode = "login" | "register";

type AuthModalProps = {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
};

type LoginValues = {
  email: string;
  password: string;
};

type RegisterValues = {
  firstName: string;
  lastName: string;
  userName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: "1" | "2";
};

const inputClass =
  "w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/20";

export default function AuthModal({ open, mode, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthMode>(mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginValues, setLoginValues] = useState<LoginValues>({
    email: "",
    password: ""
  });
  const [registerValues, setRegisterValues] = useState<RegisterValues>({
    firstName: "",
    lastName: "",
    userName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "1"
  });

  useEffect(() => {
    if (!open) return;
    setActiveTab(mode);
    setError(null);
    setSuccess(null);
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setLoginValues({ email: "", password: "" });
    setRegisterValues({
      firstName: "",
      lastName: "",
      userName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "1"
    });
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const passwordChecklist = useMemo(
    () => getPasswordChecklist(registerValues.password),
    [registerValues.password]
  );

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(loginValues.email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    if (!loginValues.password) {
      setError("يرجى إدخال كلمة المرور.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(loginValues.email, loginValues.password);
      setSuccess("تم تسجيل الدخول بنجاح.");
      onClose();
      if (user.userRole === 4) {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!registerValues.firstName || !registerValues.lastName) {
      setError("يرجى إدخال الاسم بالكامل.");
      return;
    }

    if (!registerValues.userName) {
      setError("يرجى إدخال اسم مستخدم.");
      return;
    }

    if (!registerValues.phoneNumber) {
      setError("يرجى إدخال رقم الهاتف.");
      return;
    }

    if (!validateEmail(registerValues.email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    if (!validatePassword(registerValues.password)) {
      setError("كلمة المرور لا تطابق الشروط المطلوبة.");
      return;
    }

    if (registerValues.password !== registerValues.confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: registerValues.firstName,
        lastName: registerValues.lastName,
        userName: registerValues.userName,
        phoneNumber: registerValues.phoneNumber,
        email: registerValues.email,
        password: registerValues.password,
        gender: registerValues.gender === "1" ? 1 : 2
      });
      setSuccess("تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.");
      setActiveTab("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  const benefitItems = [
    "حجوزات أسرع وتتبع مباشر للرحلات",
    "عروض مخصصة لعملاء الصقور",
    "دعم مميز ومتابعة مستمرة"
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 py-8 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-4xl rounded-[2.5rem] border border-white/60 bg-white/80 p-6 shadow-lift"
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute left-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 transition hover:text-brand-red"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">بوابة الصقور</p>
                    <h3 className="text-xl font-semibold text-slate-900">مرحبًا بك</h3>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 rounded-full bg-white/70 p-1 text-sm">
                  <button
                    className={`flex-1 rounded-full px-4 py-2 transition ${
                      activeTab === "login"
                        ? "bg-brand-red text-white"
                        : "text-slate-600 hover:text-brand-red"
                    }`}
                    onClick={() => setActiveTab("login")}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    className={`flex-1 rounded-full px-4 py-2 transition ${
                      activeTab === "register"
                        ? "bg-brand-red text-white"
                        : "text-slate-600 hover:text-brand-red"
                    }`}
                    onClick={() => setActiveTab("register")}
                  >
                    إنشاء حساب
                  </button>
                </div>

                {error ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}
                {success ? (
                  <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                    {success}
                  </div>
                ) : null}

                {activeTab === "login" ? (
                  <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
                    <div>
                      <label className="text-xs text-slate-500">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={loginValues.email}
                        onChange={(event) =>
                          setLoginValues((prev) => ({ ...prev, email: event.target.value }))
                        }
                        className={inputClass}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">كلمة المرور</label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginValues.password}
                          onChange={(event) =>
                            setLoginValues((prev) => ({ ...prev, password: event.target.value }))
                          }
                          className={`${inputClass} pl-12`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          aria-label="عرض كلمة المرور"
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      ) : null}
                      تسجيل الدخول
                    </button>
                  </form>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-slate-500">الاسم الأول</label>
                        <input
                          value={registerValues.firstName}
                          onChange={(event) =>
                            setRegisterValues((prev) => ({
                              ...prev,
                              firstName: event.target.value
                            }))
                          }
                          className={inputClass}
                          placeholder="عبدالرحمن"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">الاسم الأخير</label>
                        <input
                          value={registerValues.lastName}
                          onChange={(event) =>
                            setRegisterValues((prev) => ({
                              ...prev,
                              lastName: event.target.value
                            }))
                          }
                          className={inputClass}
                          placeholder="علي"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-slate-500">اسم المستخدم</label>
                        <input
                          value={registerValues.userName}
                          onChange={(event) =>
                            setRegisterValues((prev) => ({
                              ...prev,
                              userName: event.target.value
                            }))
                          }
                          className={inputClass}
                          placeholder="abdelrhman.ali"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">رقم الهاتف</label>
                        <input
                          value={registerValues.phoneNumber}
                          onChange={(event) =>
                            setRegisterValues((prev) => ({
                              ...prev,
                              phoneNumber: event.target.value
                            }))
                          }
                          className={inputClass}
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={registerValues.email}
                        onChange={(event) =>
                          setRegisterValues((prev) => ({ ...prev, email: event.target.value }))
                        }
                        className={inputClass}
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-slate-500">الجنس</label>
                        <select
                          value={registerValues.gender}
                          onChange={(event) =>
                            setRegisterValues((prev) => ({
                              ...prev,
                              gender: event.target.value as "1" | "2"
                            }))
                          }
                          className={inputClass}
                        >
                          <option value="1">ذكر</option>
                          <option value="2">أنثى</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">كلمة المرور</label>
                        <div className="relative">
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            value={registerValues.password}
                            onChange={(event) =>
                              setRegisterValues((prev) => ({
                                ...prev,
                                password: event.target.value
                              }))
                            }
                            className={`${inputClass} pl-12`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            onClick={() => setShowRegisterPassword((prev) => !prev)}
                            aria-label="عرض كلمة المرور"
                          >
                            {showRegisterPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">تأكيد كلمة المرور</label>
                      <input
                        type="password"
                        value={registerValues.confirmPassword}
                        onChange={(event) =>
                          setRegisterValues((prev) => ({
                            ...prev,
                            confirmPassword: event.target.value
                          }))
                        }
                        className={inputClass}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                      {(
                        [
                          { label: "8 أحرف على الأقل", ok: passwordChecklist.length },
                          { label: "حرف كابيتال", ok: passwordChecklist.upper },
                          { label: "حرف سمول", ok: passwordChecklist.lower },
                          { label: "رقم", ok: passwordChecklist.number },
                          { label: "رمز خاص", ok: passwordChecklist.special }
                        ] as const
                      ).map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              item.ok
                                ? "border-green-500 bg-green-50 text-green-600"
                                : "border-slate-200 text-slate-400"
                            }`}
                          >
                            {item.ok ? <Check className="h-3 w-3" /> : "•"}
                          </span>
                          {item.label}
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      ) : null}
                      إنشاء الحساب
                    </button>
                  </form>
                )}
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-red">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-white/70">عضوية الصقور</p>
                    <p className="text-lg font-semibold">تجربة سفر VIP</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  حسابك يمنحك وصولا سريعًا لخدمات الحجز، مع متابعة مباشرة للرحلات وخيارات
                  مخصصة حسب وجهتك.
                </p>
                <div className="mt-6 space-y-3 text-sm">
                  {benefitItems.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-brand-red">
                        <Check className="h-4 w-4" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
