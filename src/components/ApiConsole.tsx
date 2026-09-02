import React, { useState } from "react";
import { Persona } from "../types";
import { Play, Send, CheckCircle2, AlertTriangle, Clock, RefreshCw, Code2, ShieldAlert } from "lucide-react";

interface ApiConsoleProps {
  activePersona: Persona;
}

interface EndpointPreset {
  id: string;
  name: string;
  category: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  body?: string;
  description: string;
  expectedBehavior?: string;
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({ activePersona }) => {
  const presets: EndpointPreset[] = [
    {
      id: "get_activities",
      name: "استعراض الأنشطة (مع النطاق الجغرافي والترتيب بالمشاهدات)",
      category: "Activities",
      method: "GET",
      url: "/api/v2/activities?sort_by=views&sort_order=desc&page=1&per_page=10",
      description: "طلب قائمة الأنشطة المفعلة مع الفرز حسب عدد المشاهدات وحساب الإحصائيات.",
      expectedBehavior: "إذا كان المستخدم مراجع أسيوط، سيتم تطبيق GeographicScope تلقائياً وإرجاع أنشطة أسيوط فقط!",
    },
    {
      id: "get_activity_details",
      name: "تفاصيل نشاط في القاهرة (مع التحقق الجغرافي)",
      category: "Activities",
      method: "GET",
      url: "/api/v2/activities/1",
      description: "عرض بيانات مطعم واحة النيل (القاهرة) مع زيادة عداد المشاهدات.",
      expectedBehavior: "إذا كان المستخدم مراجع أسيوط، سيرفض النظام الطلب بكود 403 لمنع انتهاك النطاق الجغرافي.",
    },
    {
      id: "verify_cairo_activity",
      name: "اعتماد نشاط في القاهرة (مجمع الشفاء الطبي)",
      category: "Activities",
      method: "POST",
      url: "/api/v2/activities/3/verify",
      body: JSON.stringify({ action: "verify", notes: "تم فحص التراخيص الطبية والموقع الجغرافي" }, null, 2),
      description: "اعتماد مجمع الشفاء الطبي الواقع في القاهرة وتحويل حالته إلى verified.",
      expectedBehavior: "يُقبل من المدير العام ومراجع القاهرة، ويُرفض بكود 403 لمراجع أسيوط لوقوعه خارج نطاقه!",
    },
    {
      id: "verify_asyut_activity",
      name: "اعتماد نشاط في أسيوط (حلول التقنية)",
      category: "Activities",
      method: "POST",
      url: "/api/v2/activities/4/verify",
      body: JSON.stringify({ action: "verify", notes: "تمت المعاينة الميدانية في شارع الهلالي بأسيوط" }, null, 2),
      description: "اعتماد مركز أسيوط للتقنية وتحويل حالته إلى verified.",
      expectedBehavior: "يقبله مراجع أسيوط والمدير العام، ويرفضه مراجع القاهرة بكود 403.",
    },
    {
      id: "create_activity",
      name: "إنشاء نشاط تجاري جديد (مع التحقق من الصلاحيات)",
      category: "Activities",
      method: "POST",
      url: "/api/v2/activities",
      body: JSON.stringify(
        {
          name_ar: "مختبر البرمجيات السحابية الحديثة",
          name_en: "Cloud Lab Tech",
          category_id: 4,
          location_id: activePersona.locationId || 1,
          description_ar: "حلول سحابية متقدمة ودعم فني على مدار الساعة.",
          address_ar: "الشارع التجاري الرئيسي",
          phone: "+201022334455",
        },
        null,
        2
      ),
      description: "إرسال طلب إنشاء نشاط جديد ليدخل دورة المراجعة والاعتماد.",
    },
    {
      id: "get_analytics_dashboard",
      name: "لوحة التحليلات المحسنة (2 استعلامات بدلاً من 48)",
      category: "Analytics",
      method: "GET",
      url: "/api/v2/analytics/dashboard",
      description: "استخراج المؤشرات العامة، توزيع الأنشطة حسب المحافظة والتصنيف.",
    },
    {
      id: "get_roles",
      name: "استعراض الأدوار ومصفوفة الصلاحيات (RBAC)",
      category: "Admin",
      method: "GET",
      url: "/api/v2/admin/roles",
      description: "عرض كافة الأدوار الستة والصلاحيات المسندة لكل منها مع عدد الموظفين.",
    },
    {
      id: "create_custom_role",
      name: "إنشاء دور مخصص جديد (مشرف الدلتا)",
      category: "Admin",
      method: "POST",
      url: "/api/v2/admin/roles",
      body: JSON.stringify(
        {
          name: "مشرف_منطقة_الدلتا",
          display_name_ar: "مشرف منطقة الدلتا",
          description_ar: "متابعة وتدقيق الأنشطة في محافظات الدلتا",
          requires_geo_scope: true,
          permissions: ["view_activities", "review_activities", "manage_content"],
        },
        null,
        2
      ),
      description: "إنشاء دور وظيفي جديد وربط الصلاحيات به (حصري للمدير العام).",
      expectedBehavior: "ينجح مع المدير العام، ويُرفض مع باقي الأدوار (مثل الدعم الفني أو المراجعين) بكود 403.",
    },
    {
      id: "get_audit_logs",
      name: "استعراض سجل العمليات الشامل (Audit Logs)",
      category: "Admin",
      method: "GET",
      url: "/api/v2/admin/audit-logs",
      description: "استعراض السجل المحمي غير القابل للمحو مع فروقات الحالة (old/new diff).",
    },
    {
      id: "get_auth_me",
      name: "الملف التعريفي والصلاحيات للمستخدم الحالي",
      category: "Auth",
      method: "GET",
      url: "/api/v2/auth/me",
      description: "معلومات الحساب، الصلاحيات الفعالة، والتقييد الجغرافي المسند.",
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<EndpointPreset>(presets[0]);
  const [method, setMethod] = useState<string>(presets[0].method);
  const [url, setUrl] = useState<string>(presets[0].url);
  const [body, setBody] = useState<string>(presets[0].body || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedPreset(preset);
    setMethod(preset.method);
    setUrl(preset.url);
    setBody(preset.body || "");
    setResponse(null);
    setStatus(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    const start = performance.now();

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-User-Id": String(activePersona.id),
        Authorization: `Bearer sanctum_token_user_${activePersona.id}`,
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (method !== "GET" && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const end = performance.now();
      setExecutionTime(Math.round(end - start));
      setStatus(res.status);

      const json = await res.json();
      setResponse(json);
    } catch (err: any) {
      const end = performance.now();
      setExecutionTime(Math.round(end - start));
      setStatus(500);
      setResponse({
        error: true,
        message: err.message || "Failed to execute request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold mb-2.5">
              <Code2 className="w-3.5 h-3.5" />
              مختبر تفاعلي حي لمعمارية الـ RESTful v2
            </div>
            <h2 className="text-xl font-bold text-slate-900">مختبر مسارات وعقود الـ API</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              قم بتنفيذ طلبات حية لكافة الـ Endpoints. يتم إرسال طلبات الـ HTTP تلقائياً بحساب المستخدم النشط (
              <span className="text-indigo-700 font-bold">{activePersona.name}</span>)، مما يتيح لك اختبار استجابة
              الصلاحيات والنطاق الجغرافي بدقة ووضوح.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Endpoints Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>نماذج الطلبات السريعة (Endpoints Presets):</span>
          <span className="text-slate-500 font-normal">اختر لتعبئة بيانات الطلب تلقائياً</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`text-right p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                selectedPreset.id === preset.id
                  ? "bg-indigo-50/80 border-indigo-400 text-indigo-950 shadow-xs"
                  : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    preset.method === "GET"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : preset.method === "POST"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {preset.method}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-medium">{preset.category}</span>
              </div>
              <p className="font-bold truncate text-slate-800">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Request & Response Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Request Configuration */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-800">بيانات الطلب (HTTP Request)</h3>
            <span className="text-xs text-slate-500 font-mono">Sanctum Token: Active</span>
          </div>

          {/* Method & URL Input */}
          <div className="flex items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-slate-50 text-slate-800 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ltr text-left font-medium"
            />
          </div>

          {/* Behavior Note */}
          {selectedPreset.expectedBehavior && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">سلوك التحقق المتوقع: </span>
                <span>{selectedPreset.expectedBehavior}</span>
              </div>
            </div>
          )}

          {/* Request Body Editor */}
          {method !== "GET" && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 font-bold">محتوى الطلب (JSON Body):</label>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-slate-950 text-emerald-400 text-xs font-mono p-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed ltr text-left"
              />
            </div>
          )}

          {/* Execute Button */}
          <button
            id="btn-execute-api"
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "جاري الإرسال والمعالجة..." : "تنفيذ الطلب (Execute Request)"}
          </button>
        </div>

        {/* Right: Response Output */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[420px] flex flex-col">
          {/* Header */}
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">الاستجابة (HTTP Response)</h3>
            {status !== null && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {executionTime} ms
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    status >= 200 && status < 300
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : status === 403
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  HTTP {status}
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-4 flex-1 bg-slate-950 overflow-x-auto font-mono text-xs max-h-[460px]">
            {response ? (
              <pre className="text-emerald-400 leading-relaxed ltr text-left">
                <code>{JSON.stringify(response, null, 2)}</code>
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                <Play className="w-10 h-10 mb-3 opacity-30 text-slate-500" />
                <p className="text-xs text-slate-400">اضغط على زر «تنفيذ الطلب» لمعاينة الاستجابة الحية من خادم Laravel 11.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
