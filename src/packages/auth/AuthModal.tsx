// ============================================================================
// Daleel Ay Khidma - Visitor Authentication Modal & Flow
// Login, Register, Forgot Password & OTP Simulation with i18n
// ============================================================================

import React, { useState } from "react";
import { useAuth, SYSTEM_DEMO_USERS } from "./index";
import { useI18n } from "../i18n";
import { api } from "../api-client";
import { Button, Input } from "../ui";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  X,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register" | "forgot";
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}: AuthModalProps) {
  const { login, register, switchUser } = useAuth();
  const { t, isRtl } = useI18n();

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorateId, setGovernorateId] = useState<number>(1);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password / OTP Fields
  const [otpCode, setOtpCode] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) {
      setError("يرجى إدخال البريد الإلكتروني أو رقم الهاتف.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Call typed API or auth provider
      await login(emailOrPhone);
      setSuccessMsg("تم تسجيل الدخول بنجاح!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setError(err?.message || "فشل تسجيل الدخول، يرجى التأكد من صحة البيانات.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !emailOrPhone || !phone) {
      setError("يرجى ملء كافة الحقول الأساسية.");
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (!agreeTerms) {
      setError("يجب الموافقة على الشروط والأحكام للمتابعة.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(name, emailOrPhone, phone, governorateId);
      setSuccessMsg("تم إنشاء الحساب بنجاح وتم تسجيل الدخول تلقائياً!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err: any) {
      setError(err?.message || "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) {
      setError("يرجى إدخال البريد الإلكتروني أو رقم الهاتف لاستعادة الحساب.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword({ email_or_phone: emailOrPhone });
      setDemoOtp(res.data?.demo_otp || (res as any).demo_otp || "4829");
      setSuccessMsg(res.data?.message || res.message || "تم إرسال رمز التحقق بنجاح.");
      setMode("reset");
    } catch (err: any) {
      setError(err?.message || "فشل إرسال رمز التحقق.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !password) {
      setError("يرجى إدخال رمز التحقق وكلمة المرور الجديدة.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.resetPassword({
        email_or_phone: emailOrPhone,
        code: otpCode,
        new_password: password,
      });
      setSuccessMsg(res.message || "تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
      setTimeout(() => {
        setMode("login");
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "رمز التحقق غير صحيح أو منتهي الصلاحية.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (userDemo: any) => {
    switchUser(userDemo);
    setSuccessMsg(`تم تسجيل الدخول كـ ${userDemo.name}`);
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 text-right animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between relative shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{t("app.name")}</span>
            </div>
            <h3 className="text-lg font-black text-white">
              {mode === "login" && t("auth.login")}
              {mode === "register" && t("auth.register")}
              {mode === "forgot" && t("auth.forgot_password")}
              {mode === "reset" && t("auth.reset_password")}
            </h3>
            <p className="text-xs text-slate-300">
              {mode === "login" && t("auth.login_description")}
              {mode === "register" && "أنشئ حسابك المجاني للوصول إلى كافة الخدمات وتتبع الأنشطة."}
              {mode === "forgot" && "أدخل بريدك أو رقمك المسجل لاستلام رمز التحقق الفوري."}
              {mode === "reset" && "أدخل رمز التحقق وقم بتعيين كلمة مرور جديدة."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Mode Tabs (Login / Register) */}
          {(mode === "login" || mode === "register") && (
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === "login" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("auth.login")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === "register" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("auth.register")}
              </button>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t("auth.email")} أو {t("auth.phone")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="user@daleel.test أو 01088889999"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent pr-9"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">{t("auth.password")}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    {t("auth.forgot_password")}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent pr-9 pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>{t("auth.remember_me")}</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-xs font-bold"
                isLoading={loading}
              >
                {t("auth.login")}
              </Button>

              {/* Quick Demo Visitor Access */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  دخول سريع تجريبي (One-Click Visitor Sign-In)
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(SYSTEM_DEMO_USERS[4])}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer text-right text-xs"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={SYSTEM_DEMO_USERS[4].avatar_url}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-800">{SYSTEM_DEMO_USERS[4].name}</div>
                      <div className="text-[10px] text-slate-500">حساب مستخدم وزائر عادي</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
                    دخول فوري
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">{t("auth.full_name")}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: سارة أحمد محمود"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent pr-9"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">{t("auth.email")}</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent pr-9"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">{t("auth.phone")}</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent pr-9"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">{t("auth.governorate")}</label>
                <select
                  value={governorateId}
                  onChange={(e) => setGovernorateId(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
                >
                  <option value={1}>القاهرة</option>
                  <option value={2}>الجيزة</option>
                  <option value={3}>الإسكندرية</option>
                  <option value={4}>أسيوط</option>
                  <option value={5}>الدقهلية</option>
                  <option value={6}>الأقصر</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">{t("auth.password")}</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">{t("auth.confirm_password")}</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-600 pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>{t("auth.terms_agreement")}</span>
              </label>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-xs font-bold"
                isLoading={loading}
              >
                {t("auth.register")}
              </Button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  البريد الإلكتروني أو رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="user@daleel.test أو 01088889999"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent pr-9"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-xs font-bold"
                isLoading={loading}
              >
                {t("auth.send_otp")}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer inline-flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>العودة لتسجيل الدخول</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD FORM WITH OTP */}
          {mode === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {demoOtp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-semibold space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>رمز التحقق التجريبي (Demo OTP Code):</span>
                  </div>
                  <div className="font-mono text-base font-black tracking-widest text-indigo-700 bg-white px-3 py-1 rounded-lg border border-amber-200 inline-block">
                    {demoOtp}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">رمز التحقق (OTP)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="أدخل الرمز المكون من 4 إلى 6 أرقام"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 text-center font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-xs font-bold"
                isLoading={loading}
              >
                تأكيد وتغيير كلمة المرور
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
