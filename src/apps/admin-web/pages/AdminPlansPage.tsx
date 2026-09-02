// ============================================================================
// Daleel Ay Khidma - Admin Subscriptions & Plans Management (إدارة خطط الأسعار والاشتراكات)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { PlanDTO, SubscriptionDTO } from "../../../packages/types";
import {
  Button,
  Badge,
  Input,
  Modal,
  Skeleton,
} from "../../../packages/ui";
import {
  Crown,
  Sparkles,
  Edit,
  Check,
  X,
  Plus,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Users,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Flame,
  Calendar,
} from "lucide-react";

export function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Plan Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_monthly: 0,
    price_yearly: 0,
    currency: "ج.م",
    is_active: true,
    is_featured: false,
    max_activities: 1,
    max_products: 10,
    can_create_offers: false,
    can_use_import_export: false,
    can_feature_activity: false,
    can_feature_products: false,
    can_access_advanced_analytics: false,
    can_have_multiple_branches: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes] = await Promise.all([
        api.getPlans(),
        api.getSubscriptions().catch(() => ({ success: true, data: [] })),
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (subsRes.success) setSubscriptions(subsRes.data);
    } catch (err) {
      console.error("Failed to load plans or subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditModal = (plan: PlanDTO) => {
    setSelectedPlan(plan);
    setFormError("");
    setFormData({
      name: plan.name,
      description: plan.description,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      currency: plan.currency,
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      max_activities: plan.limits.max_activities,
      max_products: plan.limits.max_products,
      can_create_offers: plan.limits.can_create_offers,
      can_use_import_export: plan.limits.can_use_import_export,
      can_feature_activity: plan.limits.can_feature_activity,
      can_feature_products: plan.limits.can_feature_products,
      can_access_advanced_analytics: plan.limits.can_access_advanced_analytics,
      can_have_multiple_branches: plan.limits.can_have_multiple_branches,
    });
    setEditModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setFormLoading(true);
    setFormError("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price_monthly: Number(formData.price_monthly),
        price_yearly: Number(formData.price_yearly),
        currency: formData.currency,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        limits: {
          max_activities: Number(formData.max_activities),
          max_products: Number(formData.max_products),
          can_create_offers: formData.can_create_offers,
          can_use_import_export: formData.can_use_import_export,
          can_feature_activity: formData.can_feature_activity,
          can_feature_products: formData.can_feature_products,
          can_access_advanced_analytics: formData.can_access_advanced_analytics,
          can_have_multiple_branches: formData.can_have_multiple_branches,
        },
      };

      const res = await api.updatePlan(selectedPlan.id, payload);
      if (res.success) {
        setEditModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setFormError(err.message || "حدث خطأ أثناء حفظ الخطة.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Crown className="w-7 h-7 text-amber-500" />
            إدارة باقات وخطط الاشتراكات (Pricing Plans)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            التحكم في أسعار الباقات، حدود الأنشطة والمنتجات، وصلاحيات الاستيراد ونشر العروض الترويجية
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="border-slate-300 text-slate-700 font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
          تحديث البيانات
        </Button>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                plan.is_featured
                  ? "border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400"
                  : "border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              {plan.is_featured && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 bg-amber-500 text-amber-950 text-[10px] font-black rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  الباقة المميزة للترويج
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{plan.description}</p>
                  </div>
                  <Badge variant={plan.is_active ? "emerald" : "slate"} size="sm">
                    {plan.is_active ? "نشطة" : "معطلة"}
                  </Badge>
                </div>

                {/* Pricing summary */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-bold">الاشتراك الشهري:</span>
                    <span className="text-base font-black text-slate-900">
                      {plan.price_monthly === 0 ? "مجاناً" : `${plan.price_monthly} ${plan.currency}`}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-xs text-slate-500 font-bold">الاشتراك السنوي:</span>
                    <span className="text-sm font-black text-indigo-600">
                      {plan.price_yearly === 0 ? "مجاناً" : `${plan.price_yearly} ${plan.currency}`}
                    </span>
                  </div>
                </div>

                {/* Quotas & Features checklist */}
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>الأنشطة المسموحة:</span>
                    <span className="font-bold text-slate-900">
                      {plan.limits.max_activities >= 999 ? "غير محدود" : plan.limits.max_activities}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span>المنتجات في الكتالوج:</span>
                    <span className="font-bold text-slate-900">
                      {plan.limits.max_products >= 999 ? "غير محدود" : plan.limits.max_products}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span>العروض والخصومات:</span>
                    {plan.limits.can_create_offers ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> متاح
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> غير متاح
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span>استيراد وتصدير CSV:</span>
                    {plan.limits.can_use_import_export ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> متاح
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> غير متاح
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span>تمييز في صدارة الدليل:</span>
                    {plan.limits.can_feature_activity ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> متاح
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> غير متاح
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <div className="pt-5 border-t border-slate-100 mt-4">
                <Button
                  onClick={() => handleOpenEditModal(plan)}
                  variant="outline"
                  className="w-full text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Edit className="w-3.5 h-3.5 ml-1" />
                  تعديل الأسعار والحدود
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">سجل اشتراكات التجار ومقدمي الخدمات</h2>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              إجمالي الاشتراكات: {subscriptions.length}
            </span>
          </div>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">معرف الاشتراك</th>
                  <th className="p-3.5">التاجر / المستخدم</th>
                  <th className="p-3.5">الخطة / الباقة</th>
                  <th className="p-3.5">دورة الدفع</th>
                  <th className="p-3.5">تاريخ البدء</th>
                  <th className="p-3.5">تاريخ الانتهاء</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {subscriptions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">#SUB-{sub.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {sub.user?.name || `تاجر #${sub.user_id}`}
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {sub.user?.phone}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-indigo-600">{sub.plan?.name}</span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="slate" size="sm">
                        {sub.billing_cycle === "yearly" ? "سنوي" : "شهري"}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString("ar-EG") : "-"}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString("ar-EG") : "-"}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          sub.status === "active"
                            ? "emerald"
                            : sub.status === "expired"
                            ? "red"
                            : "amber"
                        }
                        size="sm"
                      >
                        {sub.status === "active"
                          ? "نشط"
                          : sub.status === "expired"
                          ? "منتهي"
                          : sub.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT PLAN MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedPlan ? `تعديل خطة: ${selectedPlan.name}` : "تعديل الخطة"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="اسم الخطة"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="العملة"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              required
            />
          </div>

          <Input
            label="وصف الخطة والمزايا"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="السعر الشهري (ج.م)"
              type="number"
              value={formData.price_monthly}
              onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
              required
            />
            <Input
              label="السعر السنوي (ج.م)"
              type="number"
              value={formData.price_yearly}
              onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
              required
            />
          </div>

          {/* Limits Config Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              الحدود التشغيلية والميزات للباقة
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="الحد الأقصى للأنشطة والمحلات"
                type="number"
                value={formData.max_activities}
                onChange={(e) => setFormData({ ...formData, max_activities: Number(e.target.value) })}
                required
              />
              <Input
                label="الحد الأقصى للمنتجات والخدمات"
                type="number"
                value={formData.max_products}
                onChange={(e) => setFormData({ ...formData, max_products: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.can_create_offers}
                  onChange={(e) => setFormData({ ...formData, can_create_offers: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>السماح بنشر العروض والخصومات</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.can_use_import_export}
                  onChange={(e) => setFormData({ ...formData, can_use_import_export: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>السماح باستيراد وتصدير CSV</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.can_feature_activity}
                  onChange={(e) => setFormData({ ...formData, can_feature_activity: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>تمييز النشاط في صدارة الدليل</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.can_feature_products}
                  onChange={(e) => setFormData({ ...formData, can_feature_products: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>السماح بتمييز المنتجات</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.can_access_advanced_analytics}
                  onChange={(e) => setFormData({ ...formData, can_access_advanced_analytics: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>لوحة التحليلات والإحصائيات المتقدمة</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.can_have_multiple_branches}
                  onChange={(e) => setFormData({ ...formData, can_have_multiple_branches: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>إدارة الفروع المتعددة للنشاط</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <span>تمييز الخطة في قائمة الأسعار (Best Value)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={formLoading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6"
            >
              {formLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
