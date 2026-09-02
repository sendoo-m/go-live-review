// ============================================================================
// Daleel Ay Khidma - Subscription & Pricing Plans Modal & Manager (خطط الأسعار والاشتراكات)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import {
  PlanDTO,
  MerchantSubscriptionInfoDTO,
} from "../../../packages/types";
import {
  Modal,
  Button,
  Badge,
} from "../../../packages/ui";
import {
  Sparkles,
  Check,
  X,
  CreditCard,
  Zap,
  ShieldCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Crown,
  CheckCircle2,
} from "lucide-react";

interface SubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionInfo: MerchantSubscriptionInfoDTO | null;
  onSubscriptionUpdated: () => void;
}

export function SubscriptionPlanModal({
  isOpen,
  onClose,
  subscriptionInfo,
  onSubscriptionUpdated,
}: SubscriptionPlanModalProps) {
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscribingPlanId, setSubscribingPlanId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      setSuccessMessage("");
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.getPlans();
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: PlanDTO) => {
    setSubscribingPlanId(plan.id);
    setSuccessMessage("");

    try {
      const res = await api.subscribeMerchantPlan({
        plan_id: plan.id,
        billing_cycle: billingCycle,
      });

      if (res.success) {
        setSuccessMessage(`تهانينا! تم تفعيل اشتراكك في باقة "${plan.name}" بنجاح.`);
        onSubscriptionUpdated();
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء تفعيل الخطة.");
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const currentPlanId = subscriptionInfo?.plan?.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="خطط وباقات اشتراك التجار ومقدمي الخدمات"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Top Header & Billing Switch */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            اختر الخطة المناسبة لحجم أعمالك وطموحك
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            طوّر نشاطك التجاري واجذب المزيد من العملاء
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            جميع الخطط تشمل دعماً فنياً على مدار الساعة ومظهراً متجاوباً على الهواتف والخرائط الذكية
          </p>

          {/* Monthly / Yearly Switch */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 mt-2">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الدفع الشهري
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>الدفع السنوي</span>
              <span className="px-1.5 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-black rounded-md">
                وفر شهرين
              </span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Plan Quota Overview */}
        {subscriptionInfo && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500 font-bold">خطتك الحالية:</span>
                <span className="text-sm font-black text-slate-900">
                  {subscriptionInfo.plan.name}
                </span>
                <Badge variant={subscriptionInfo.subscription?.status === "active" ? "emerald" : "slate"} size="sm">
                  {subscriptionInfo.subscription?.status === "active" ? "نشط" : subscriptionInfo.subscription?.status || "نشط"}
                </Badge>
              </div>

              <div className="text-xs text-slate-500">
                <span>ينتهي الاشتراك في: </span>
                <span className="font-mono font-bold text-slate-800">
                  {subscriptionInfo.subscription?.ends_at ? new Date(subscriptionInfo.subscription.ends_at).toLocaleDateString("ar-EG") : "ساري"}
                </span>
                <span className="mr-2 text-sky-700 font-semibold">
                  (متبقي {subscriptionInfo.days_remaining ?? 365} يوم)
                </span>
              </div>
            </div>

            {/* Quota Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Activities Quota */}
              <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>الأنشطة المضافة</span>
                  <span>
                    {subscriptionInfo.usage.activities_count} / {subscriptionInfo.plan.limits.max_activities >= 999 ? "∞" : subscriptionInfo.plan.limits.max_activities}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (subscriptionInfo.usage.activities_count / (subscriptionInfo.plan.limits.max_activities || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Products Quota */}
              <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>كتالوج المنتجات</span>
                  <span>
                    {subscriptionInfo.usage.products_count} / {subscriptionInfo.plan.limits.max_products >= 999 ? "∞" : subscriptionInfo.plan.limits.max_products}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (subscriptionInfo.usage.products_count / (subscriptionInfo.plan.limits.max_products || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Offers Quota */}
              <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>العروض الترويجية</span>
                  <span>
                    {subscriptionInfo.plan.limits.can_create_offers
                      ? `${subscriptionInfo.usage.offers_count} منشور`
                      : "غير متاح"}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: subscriptionInfo.plan.limits.can_create_offers ? "100%" : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const isPro = plan.slug === "pro" || plan.is_featured;
              const price = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly;
              const periodText = billingCycle === "yearly" ? "سنوياً" : "شهرياً";

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                    isPro
                      ? "bg-gradient-to-b from-sky-900 to-slate-900 text-white border-2 border-sky-500 shadow-xl shadow-sky-900/20"
                      : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  {/* Featured Ribbon */}
                  {isPro && (
                    <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      الأكثر طلباً للتجار
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-black">{plan.name}</h4>
                      <p className={`text-xs mt-1 leading-relaxed ${isPro ? "text-slate-300" : "text-slate-500"}`}>
                        {plan.description}
                      </p>
                    </div>

                    {/* Price Tag */}
                    <div className="pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">
                          {price === 0 ? "مجاناً" : `${price} ${plan.currency}`}
                        </span>
                        {price > 0 && (
                          <span className={`text-xs font-bold ${isPro ? "text-slate-300" : "text-slate-500"}`}>
                            / {periodText}
                          </span>
                        )}
                      </div>
                      {billingCycle === "yearly" && price > 0 && (
                        <span className="text-[11px] text-amber-400 font-bold block mt-1">
                          يعادل {(price / 12).toFixed(0)} {plan.currency} شهرياً فقط
                        </span>
                      )}
                    </div>

                    {/* Limits & Highlights List */}
                    <div className={`space-y-2.5 pt-4 border-t ${isPro ? "border-slate-800" : "border-slate-100"} text-xs`}>
                      <div className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPro ? "text-sky-400" : "text-emerald-600"}`} />
                        <span>
                          عدد الأنشطة: <strong>{plan.limits.max_activities >= 999 ? "غير محدود" : plan.limits.max_activities}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPro ? "text-sky-400" : "text-emerald-600"}`} />
                        <span>
                          المنتجات والخدمات: <strong>{plan.limits.max_products >= 999 ? "غير محدود" : plan.limits.max_products}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.limits.can_create_offers ? (
                          <Check className={`w-4 h-4 shrink-0 ${isPro ? "text-sky-400" : "text-emerald-600"}`} />
                        ) : (
                          <X className="w-4 h-4 shrink-0 text-slate-400" />
                        )}
                        <span className={!plan.limits.can_create_offers ? "text-slate-400 line-through" : ""}>
                          نشر العروض والخصومات الترويجية
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.limits.can_use_import_export ? (
                          <Check className={`w-4 h-4 shrink-0 ${isPro ? "text-sky-400" : "text-emerald-600"}`} />
                        ) : (
                          <X className="w-4 h-4 shrink-0 text-slate-400" />
                        )}
                        <span className={!plan.limits.can_use_import_export ? "text-slate-400 line-through" : ""}>
                          استيراد وتصدير المنتجات CSV
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.limits.can_feature_activity ? (
                          <Check className={`w-4 h-4 shrink-0 ${isPro ? "text-sky-400" : "text-emerald-600"}`} />
                        ) : (
                          <X className="w-4 h-4 shrink-0 text-slate-400" />
                        )}
                        <span className={!plan.limits.can_feature_activity ? "text-slate-400 line-through" : ""}>
                          تمييز وظهور مخصص في صدارة الدليل
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.limits.can_access_advanced_analytics ? (
                          <Check className={`w-4 h-4 shrink-0 ${isPro ? "text-sky-400" : "text-emerald-600"}`} />
                        ) : (
                          <X className="w-4 h-4 shrink-0 text-slate-400" />
                        )}
                        <span className={!plan.limits.can_access_advanced_analytics ? "text-slate-400 line-through" : ""}>
                          لوحة إحصائيات متقدمة ونقرات الاتصال
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subscribe Action Button */}
                  <div className="pt-6">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 cursor-default flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        خطتك الحالية
                      </button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan)}
                        disabled={subscribingPlanId === plan.id}
                        className={`w-full font-bold text-xs py-2.5 rounded-xl shadow-sm ${
                          isPro
                            ? "bg-sky-500 hover:bg-sky-400 text-slate-950 font-black"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        {subscribingPlanId === plan.id
                          ? "جاري التفعيل..."
                          : price === 0
                          ? "التحويل للخطة المجانية"
                          : "ترقية الخطة الآن"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
