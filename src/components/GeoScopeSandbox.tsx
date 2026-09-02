import React, { useState, useEffect } from "react";
import { MapPin, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Database, RefreshCw, Eye } from "lucide-react";

export const GeoScopeSandbox: React.FC = () => {
  const [selectedReviewer, setSelectedReviewer] = useState<"cairo" | "asyut" | "admin">("asyut");
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<any>(null);

  const reviewerProfiles = {
    admin: {
      id: 1,
      name: "م. طارق الخالدي (المدير العام)",
      role: "مدير عام",
      location: "كافة المحافظات (وصول شامل)",
      scope: "إعفاء كامل من النطاق الجغرافي (Global Access)",
      sqlQuery: "SELECT * FROM `activities` WHERE `deleted_at` IS NULL",
    },
    cairo: {
      id: 3,
      name: "خالد محمود (مراجع القاهرة)",
      role: "مراجع أنشطة",
      location: "القاهرة (EGY-CAI)",
      scope: "مقيد جغرافياً بالقاهرة فقط (Location ID: 1)",
      sqlQuery: "SELECT * FROM `activities` WHERE `activities`.`location_id` = 1 AND `deleted_at` IS NULL",
    },
    asyut: {
      id: 4,
      name: "عمر الصعيدي (مراجع أسيوط)",
      role: "مراجع أنشطة",
      location: "أسيوط (EGY-ASY)",
      scope: "مقيد جغرافياً بأسيوط فقط (Location ID: 4)",
      sqlQuery: "SELECT * FROM `activities` WHERE `activities`.`location_id` = 4 AND `deleted_at` IS NULL",
    },
  };

  const currentProfile = reviewerProfiles[selectedReviewer];

  const fetchScopedActivities = async () => {
    setLoading(true);
    setActionResult(null);
    try {
      const res = await fetch("/api/v2/activities", {
        headers: {
          "X-User-Id": String(currentProfile.id),
        },
      });
      const data = await res.json();
      setActivities(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScopedActivities();
  }, [selectedReviewer]);

  const attemptVerification = async (activityId: number, targetName: string, targetLocation: string) => {
    setLoading(true);
    setActionResult(null);
    try {
      const res = await fetch(`/api/v2/activities/${activityId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(currentProfile.id),
        },
        body: JSON.stringify({
          action: "verify",
          notes: `محاولة اعتماد بواسطة ${currentProfile.name}`,
        }),
      });

      const data = await res.json();
      setActionResult({
        status: res.status,
        success: data.success,
        message: data.message,
        targetName,
        targetLocation,
        data,
      });

      if (res.ok) {
        fetchScopedActivities();
      }
    } catch (err: any) {
      setActionResult({
        status: 500,
        success: false,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold mb-2.5">
              <MapPin className="w-3.5 h-3.5" />
              حماية البيانات بالعزل الجغرافي الصارم (Geographic Multi-Tenancy)
            </div>
            <h2 className="text-xl font-bold text-slate-900">محاكي النطاق الجغرافي التلقائي (Geographic Global Scope)</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              يوضح هذا المحاكي كيف تقوم طبقة الـ Eloquent Global Scope بحقن شرط الـ WHERE الجغرافي تلقائياً على كل
              استعلام لحماية بيانات المحافظات، وكيف يمنع الميدلوير المراجعين من التدخل في أنشطة المحافظات الأخرى.
            </p>
          </div>
        </div>
      </div>

      {/* Reviewer Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Asyut */}
        <button
          onClick={() => setSelectedReviewer("asyut")}
          className={`p-5 rounded-xl border text-right transition-all cursor-pointer ${
            selectedReviewer === "asyut"
              ? "bg-purple-50/90 border-purple-400 shadow-xs ring-2 ring-purple-400/20"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 font-bold">
              مراجع أسيوط
            </span>
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">عمر الصعيدي</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">مقيد بأسيوط (Location ID: 4)</p>
          <div className="mt-3 text-[11px] text-purple-900 bg-purple-100/70 p-2.5 rounded-lg border border-purple-200 font-medium">
            يرى ويعتمد أنشطة أسيوط فقط، وممنوع من أنشطة القاهرة والإسكندرية.
          </div>
        </button>

        {/* Cairo */}
        <button
          onClick={() => setSelectedReviewer("cairo")}
          className={`p-5 rounded-xl border text-right transition-all cursor-pointer ${
            selectedReviewer === "cairo"
              ? "bg-blue-50/90 border-blue-400 shadow-xs ring-2 ring-blue-400/20"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 font-bold">
              مراجع القاهرة
            </span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">خالد محمود</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">مقيد بالقاهرة (Location ID: 1)</p>
          <div className="mt-3 text-[11px] text-blue-900 bg-blue-100/70 p-2.5 rounded-lg border border-blue-200 font-medium">
            يرى ويعتمد أنشطة القاهرة فقط، وممنوع من أنشطة أسيوط والإسكندرية.
          </div>
        </button>

        {/* General Manager */}
        <button
          onClick={() => setSelectedReviewer("admin")}
          className={`p-5 rounded-xl border text-right transition-all cursor-pointer ${
            selectedReviewer === "admin"
              ? "bg-indigo-50/90 border-indigo-400 shadow-xs ring-2 ring-indigo-400/20"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold">
              المدير العام
            </span>
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">م. طارق الخالدي</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">وصول شامل لكافة المحافظات</p>
          <div className="mt-3 text-[11px] text-indigo-900 bg-indigo-100/70 p-2.5 rounded-lg border border-indigo-200 font-medium">
            مستثنى من الـ Scope، يرى ويعتمد أنشطة كافة محافظات الجمهورية.
          </div>
        </button>
      </div>

      {/* SQL Inspection Box */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-2.5 text-white shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-200">
            <Database className="w-4 h-4 text-amber-400" />
            استعلام الـ Eloquent الناتج تلقائياً على قاعدة البيانات:
          </span>
          <span className="font-mono text-emerald-400 text-xs font-semibold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {currentProfile.scope}
          </span>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 ltr text-left leading-relaxed">
          {currentProfile.sqlQuery}
        </div>
      </div>

      {/* Interactive Verification Test Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">تجربة الاعتماد المتقاطع (Cross-Region Verification Test):</h3>
        <p className="text-xs text-slate-500">
          اضغط على أحد الأزرار لتجربة اعتماد نشاط في محافظة معينة بحساب المستخدم النشط حالياً (
          <span className="text-indigo-700 font-bold">{currentProfile.name}</span>):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => attemptVerification(3, "مجمع الشفاء الطبي", "القاهرة")}
            disabled={loading}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-right flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <span className="text-xs font-bold text-slate-800 block">اعتماد نشاط في القاهرة (مجمع الشفاء)</span>
              <span className="text-[11px] text-slate-500">مدينة نصر • المعلق بانتظار الاعتماد</span>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 rotate-180" />
          </button>

          <button
            onClick={() => attemptVerification(4, "حلول التقنية والبرمجيات", "أسيوط")}
            disabled={loading}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-right flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <span className="text-xs font-bold text-slate-800 block">اعتماد نشاط في أسيوط (حلول التقنية)</span>
              <span className="text-[11px] text-slate-500">شارع الهلالي • المعلق بانتظار الاعتماد</span>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 shrink-0 rotate-180" />
          </button>
        </div>

        {/* Action Result Notification */}
        {actionResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
              actionResult.status === 200
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {actionResult.status === 200 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm mb-1">
                {actionResult.status === 200 ? "تم قبول العملية بنجاح (200 OK)" : `تم رفض العملية ومنع الوصول (${actionResult.status} Forbidden)`}
              </div>
              <p className="font-medium">{actionResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Visible Activities for Current Reviewer */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              الأنشطة المتاحة في الواجهة لحساب ({currentProfile.name}):
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">تمت تصفية القائمة عبر GeographicScope</p>
          </div>
          <button
            onClick={fetchScopedActivities}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activities.map((act) => (
            <div key={act.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900">{act.name_ar}</h4>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    act.status === "verified"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : act.status === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {act.status === "verified" ? "موثق" : act.status === "pending" ? "بانتظار المراجعة" : act.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-600" />
                  {act.location?.name_ar || `موقع #${act.location_id}`}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-blue-600" />
                  {act.views_count} مشاهدة
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">{act.address_ar}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
