// ============================================================================
// Daleel Ay Khidma - Admin Dashboard & Performance Overview
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { useAuth } from "../../../packages/auth";
import { AnalyticsSummaryDTO, ActivityDTO } from "../../../packages/types";
import { Button, RatingStars, Badge, Modal, Textarea, Skeleton } from "../../../packages/ui";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Store,
  CheckCircle2,
  Clock,
  Eye,
  Star,
  Users,
  ShieldCheck,
  TrendingUp,
  MapPin,
  AlertTriangle,
  ArrowUpRight,
  Zap,
} from "lucide-react";

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export function AdminDashboardPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsSummaryDTO | null>(null);
  const [pendingActivities, setPendingActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal
  const [selectedActivity, setSelectedActivity] = useState<ActivityDTO | null>(null);
  const [actionType, setActionType] = useState<"verify" | "reject">("verify");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [dashRes, actsRes] = await Promise.all([
          api.getDashboardAnalytics(user?.requires_geo_scope ? user?.location_id : null),
          api.getActivities({ status: "pending", per_page: 5 }),
        ]);

        if (dashRes.data) setData(dashRes.data);
        if (actsRes.results) setPendingActivities(actsRes.results);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const handleModerate = async () => {
    if (!selectedActivity) return;
    setSubmitting(true);
    try {
      await api.verifyActivity(selectedActivity.id, actionType, notes, actionType === "reject" ? notes : undefined);
      // Refresh pending activities
      const actsRes = await api.getActivities({ status: "pending", per_page: 5 });
      if (actsRes.results) setPendingActivities(actsRes.results);
      setSelectedActivity(null);
      setNotes("");
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء التوثيق");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 text-right pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-8 text-right pb-16">
      {/* 1. Header & Quick Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">لوحة المؤشرات والرقابة الميدانية</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ملخص فوري لجميع الأنشطة، التوثيقات، ونسب التفاعل ومصفوفة الأداء
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate("django-admin")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-600/30 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Django Admin الموحدة
          </button>

          <Button variant="primary" size="sm" onClick={() => onNavigate("activities")}>
            إدارة كافة الأنشطة
          </Button>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Activities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">إجمالي الأنشطة</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{summary?.total_activities || 0}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{summary?.verified_activities || 0} نشاط موثق رسمياً</span>
          </div>
        </div>

        {/* Card 2: Pending Moderation */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold">قيد التدقيق والمراجعة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950">{summary?.pending_activities || 0}</div>
          <div className="text-[11px] text-amber-700 font-semibold">تتطلب تدقيق ميداني من المشرف</div>
        </div>

        {/* Card 3: Total Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">إجمالي المشاهدات</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{summary?.total_views.toLocaleString() || 0}</div>
          <div className="text-[11px] text-slate-500 font-semibold">تفاعل حقيقي وموثق</div>
        </div>

        {/* Card 4: Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">متوسط التقييم العام</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{summary?.average_rating || 0} / 5.0</div>
          <div className="text-[11px] text-slate-500 font-semibold">من {summary?.total_reviews || 0} تقييم عملاء</div>
        </div>
      </div>

      {/* 3. Recharts Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">توزيع الأنشطة حسب القطاع التجاري</h3>
            <span className="text-xs text-slate-400 font-mono">Laravel Query Aggregations</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.category_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category_name_ar" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="activities_count" name="عدد الأنشطة" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Pie Distribution (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">التوزيع الجغرافي</h3>
            <span className="text-xs text-slate-400">المحافظات</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.location_distribution || []}
                  dataKey="activities_count"
                  nameKey="location_name_ar"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  fontSize={10}
                >
                  {(data?.location_distribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Pending Activities Table Requiring Immediate Moderation */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onNavigate("activities")}>
            عرض كافة الأنشطة
          </Button>
          <div>
            <h3 className="text-base font-bold text-slate-900">أنشطة بانتظار التدقيق والاعتماد الميداني</h3>
            <p className="text-xs text-slate-500">تم إرسالها حديثاً من قبل أصحاب الأعمال وتتطلب توثيق رسمي</p>
          </div>
        </div>

        {pendingActivities.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-700 mt-2">لا توجد أنشطة معلقة حالياً في نطاقك الجغرافي.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">النشاط التجاري</th>
                  <th className="p-3">المحافظة</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">تاريخ الإضافة</th>
                  <th className="p-3 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={act.cover_image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{act.name_ar}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{act.phone || "بدون هاتف"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-indigo-700">{act.location?.name_ar}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        {act.category?.name_ar}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(act.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => {
                            setSelectedActivity(act);
                            setActionType("verify");
                            setNotes("تم التحقق الميداني من السجل التجاري ومطابقة العنوان رسمياً.");
                          }}
                        >
                          توثيق واعتماد
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedActivity(act);
                            setActionType("reject");
                            setNotes("بيانات السجل التجاري أو العنوان غير مكتملة.");
                          }}
                        >
                          رفض
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Moderation Action Modal */}
      <Modal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title={actionType === "verify" ? "توثيق واعتماد النشاط التجاري" : "رفض النشاط التجاري"}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            أنت على وشك {actionType === "verify" ? "اعتماد وتوثيق" : "رفض"} النشاط:{" "}
            <strong className="text-slate-900 font-bold">"{selectedActivity?.name_ar}"</strong> في محافظة (
            {selectedActivity?.location?.name_ar}).
          </p>

          <Textarea
            label={actionType === "verify" ? "ملاحظات التوثيق والاعتماد" : "سبب الرفض الإلزامي"}
            required
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="اكتب ملاحظات التدقيق هنا (يتم تسجيلها في الـ Audit Log بصورة غير قابلة للمحو)..."
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedActivity(null)}>
              إلغاء
            </Button>
            <Button
              variant={actionType === "verify" ? "emerald" : "danger"}
              size="sm"
              onClick={handleModerate}
              isLoading={submitting}
            >
              تأكيد القرار وتسجيله في سجل الرقابة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
