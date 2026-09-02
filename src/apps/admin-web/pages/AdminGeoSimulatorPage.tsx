// ============================================================================
// Daleel Ay Khidma - Geographic Scope Simulator & SQL Explain
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { useAuth, SYSTEM_DEMO_USERS } from "../../../packages/auth";
import { ActivityDTO, UserDTO } from "../../../packages/types";
import { Button, Badge, Skeleton } from "../../../packages/ui";
import {
  MapPin,
  ShieldCheck,
  Code2,
  Terminal,
  AlertOctagon,
  CheckCircle2,
  Database,
  ArrowRightLeft,
} from "lucide-react";

export function AdminGeoSimulatorPage() {
  const { user, switchUser } = useAuth();
  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Cross-governorate moderation test state
  const [testActivityId, setTestActivityId] = useState<number>(3); // Asyut activity
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      try {
        const res = await api.getActivities({ per_page: 20 });
        if (res.results) setActivities(res.results);
      } catch (err) {
        console.error("Geo load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [user]);

  const handleTestCrossModeration = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.verifyActivity(testActivityId, "verify", "تجربة توثيق عبر المحافظات");
      setTestResult({
        success: true,
        status: 200,
        message: "تم تنفيذ العملية بنجاح لأن المستخدم يمتلك صلاحية شاملة لكافة المحافظات.",
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        status: err.statusCode || 403,
        message: err.message || "403 Forbidden: النشاط التجاري يقع خارج نطاقك الجغرافي المخصص.",
      });
    } finally {
      setTesting(false);
    }
  };

  const getGeneratedSql = () => {
    if (!user?.requires_geo_scope || !user?.location_id) {
      return `SELECT activities.*, categories.name_ar as category_name, locations.name_ar as location_name 
FROM \`activities\`
LEFT JOIN \`categories\` ON \`categories\`.\`id\` = \`activities\`.\`category_id\`
LEFT JOIN \`locations\` ON \`locations\`.\`id\` = \`activities\`.\`location_id\`
WHERE \`activities\`.\`deleted_at\` IS NULL
ORDER BY \`activities\`.\`created_at\` DESC;
-- [Scope Info]: Unrestricted Global Access (No Location Filter Applied)`;
    }

    return `SELECT activities.*, categories.name_ar as category_name, locations.name_ar as location_name 
FROM \`activities\`
LEFT JOIN \`categories\` ON \`categories\`.\`id\` = \`activities\`.\`category_id\`
LEFT JOIN \`locations\` ON \`locations\`.\`id\` = \`activities\`.\`location_id\`
WHERE \`activities\`.\`deleted_at\` IS NULL
  AND \`activities\`.\`location_id\` = ${user.location_id} /* Injected automatically by App\\Scopes\\ActivityScope */
ORDER BY \`activities\`.\`created_at\` DESC;
-- [Scope Info]: Restricted by Geographic Middleware for User: ${user.name} (${user.location_name_ar})`;
  };

  return (
    <div className="space-y-8 text-right pb-16">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Laravel 11 Eloquent Global Scopes
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">محاكي النطاق الجغرافي التلقائي (Geo-Scope)</h1>
        <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
          نظام حوكمة جغرافي يقوم بحقن شروط الاستعلام <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-amber-300">WHERE location_id = ?</code> تلقائياً على مستوى الـ ORM لمنع تسريب أو تعديل بيانات المحافظات الأخرى.
        </p>
      </div>

      {/* 2. Persona Switcher Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">اختر المشرف لملاحظة تغير الاستعلام والنتائج فوراً:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SYSTEM_DEMO_USERS.slice(0, 4).map((p) => {
            const isSelected = user?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => switchUser(p)}
                className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{p.name}</h3>
                    <p className="text-[11px] text-indigo-600 font-semibold">{p.role_display_name_ar}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    {p.location_name_ar}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                      p.requires_geo_scope ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {p.requires_geo_scope ? "Scoped" : "Global"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Live SQL Query Inspector */}
      <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 border border-slate-800 space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Generated SQL Query via Laravel Eloquent Global Scope</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded">
            Auto Injected
          </span>
        </div>

        <pre className="text-xs text-indigo-300 leading-relaxed overflow-x-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800">
          {getGeneratedSql()}
        </pre>
      </div>

      {/* 4. Cross-Governorate Authorization Stress Test */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <AlertOctagon className="w-5 h-5 text-indigo-600" />
          اختبار محاولة توثيق نشاط في محافظة أخرى (Security & Boundary Stress Test)
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          جرب الضغط على الزر أدناه لمعالجة نشاط في <strong className="text-indigo-700 font-bold">محافظة أسيوط</strong> بحساب المشرف الحالي. إذا كنت مسجلاً كمراجع للقاهرة، سيرفض الخادم العملية بحالة <code className="font-mono bg-slate-100 px-1 py-0.5 rounded font-bold text-red-600">403 Forbidden</code> وسيُسجّل محاولة الوصول غير المصرح في سجل الرقابة.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleTestCrossModeration}
            isLoading={testing}
            leftIcon={<ArrowRightLeft className="w-4 h-4" />}
          >
            تنفيذ محاولة التوثيق عبر النطاقات
          </Button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-3 ${
              testResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                الاستجابة: {testResult.status} {testResult.success ? "OK" : "Forbidden (Access Denied)"}
              </div>
              <div className="mt-1">{testResult.message}</div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Filtered Activities Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            عدد السجلات المسترجعة: <strong className="text-slate-900">{activities.length}</strong>
          </span>
          <h3 className="text-base font-bold text-slate-900">
            الأنشطة المتاحة لـ ({user?.name})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-right"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{act.name_ar}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {act.location?.name_ar}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{act.address_ar}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
