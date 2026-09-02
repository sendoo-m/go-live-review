// ============================================================================
// Daleel Ay Khidma - Interactive API v2 Console & Contract Explorer
// ============================================================================

import React, { useState } from "react";
import { Button } from "../../../packages/ui";
import { Terminal, Send, CheckCircle2, Copy, Play } from "lucide-react";
import { useAuth } from "../../../packages/auth";

interface EndpointDef {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description_ar: string;
  defaultPayload?: any;
}

const ENDPOINTS: EndpointDef[] = [
  {
    method: "GET",
    path: "/api/v2/activities",
    description_ar: "استعراض الأنشطة مع الفلترة والنطاق الجغرافي والتحميل المسبق",
  },
  {
    method: "GET",
    path: "/api/v2/activities/1",
    description_ar: "جلب تفاصيل نشاط تجاري محدد مع التصنيف والتقييمات",
  },
  {
    method: "POST",
    path: "/api/v2/activities",
    description_ar: "إنشاء نشاط تجاري جديد (يتطلب تصريح create_activity)",
    defaultPayload: {
      name_ar: "مختبر البرج للتحاليل الطبية",
      category_id: 2,
      location_id: 1,
      address_ar: "شارع مصطفى النحاس، مدينة نصر",
      phone: "+201099887766",
      description_ar: "أحدث التقنيات الطبية للتحاليل الدقيقة",
    },
  },
  {
    method: "POST",
    path: "/api/v2/activities/1/verify",
    description_ar: "توثيق واعتماد نشاط تجاري (يتطلب verify_activities مع مراعاة النطاق الجغرافي)",
    defaultPayload: {
      action: "verify",
      notes: "تم مراجعة السجل التجاري والتحقق الميداني بنجاح.",
    },
  },
  {
    method: "GET",
    path: "/api/v2/categories",
    description_ar: "استعراض قائمة التصنيفات والقطاعات",
  },
  {
    method: "GET",
    path: "/api/v2/locations",
    description_ar: "استعراض المحافظات والنطاقات الجغرافية",
  },
  {
    method: "GET",
    path: "/api/v2/audit-logs",
    description_ar: "استعلام سجل الرقابة المالي والإداري غير القابل للمحو",
  },
  {
    method: "GET",
    path: "/api/v2/analytics/dashboard",
    description_ar: "لوحة مؤشرات الأداء والتحليلات الجغرافية",
  },
];

export function AdminApiConsolePage() {
  const { user } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(ENDPOINTS[0].defaultPayload || {}, null, 2)
  );
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setRequestBody(JSON.stringify(ep.defaultPayload || {}, null, 2));
    setResponse(null);
    setResponseStatus(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    setResponseStatus(null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-User-Id": String(user?.id || 1),
    };

    const options: RequestInit = {
      method: selectedEndpoint.method,
      headers,
    };

    if (["POST", "PUT", "DELETE"].includes(selectedEndpoint.method) && requestBody.trim()) {
      try {
        options.body = requestBody;
      } catch (err) {
        alert("صيغة JSON غير صالحة");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(selectedEndpoint.path, options);
      setResponseStatus(res.status);
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-right pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">مستكشف عقود الـ API v2 (API Console)</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          تجربة حية لجميع مسارات الـ RESTful API v2 مع محاكاة الترويسات والصلاحيات
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2 h-[560px] overflow-y-auto">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider block">
            المسارات المتاحة (API v2 Endpoints)
          </span>
          {ENDPOINTS.map((ep, idx) => {
            const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(ep)}
                className={`w-full text-right p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/70 shadow-xs"
                    : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      ep.method === "GET"
                        ? "bg-emerald-100 text-emerald-800"
                        : ep.method === "POST"
                        ? "bg-blue-100 text-blue-800"
                        : ep.method === "PUT"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-800 dir-ltr text-left">
                    {ep.path}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{ep.description_ar}</p>
              </button>
            );
          })}
        </div>

        {/* Request & Response Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {/* Request Header */}
          <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto">
                <span className="px-2 py-1 rounded bg-indigo-600 font-bold text-[10px]">
                  {selectedEndpoint.method}
                </span>
                <span className="text-slate-300">{selectedEndpoint.path}</span>
              </div>

              <Button
                variant="emerald"
                size="sm"
                onClick={handleExecute}
                isLoading={loading}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                إرسال الطلب (Execute)
              </Button>
            </div>

            {/* Simulated Headers */}
            <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2 space-y-1">
              <div>Content-Type: application/json</div>
              <div>X-User-Id: {user?.id} ({user?.name} - {user?.role_display_name_ar})</div>
              <div>X-Geo-Scope: {user?.location_name_ar}</div>
            </div>

            {/* Request Payload Editor for POST/PUT */}
            {["POST", "PUT"].includes(selectedEndpoint.method) && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 font-mono">Request JSON Body:</span>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-900 text-emerald-300 font-mono text-xs p-3 rounded-xl border border-slate-800 outline-none"
                />
              </div>
            )}
          </div>

          {/* Response Box */}
          <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300 font-bold">Response Inspector</span>
              </div>
              {responseStatus && (
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    responseStatus >= 200 && responseStatus < 300
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  Status: {responseStatus}
                </span>
              )}
            </div>

            <pre className="text-xs text-indigo-200 leading-relaxed overflow-x-auto max-h-72 p-2 bg-slate-900/80 rounded-2xl border border-slate-800/80">
              {response ? JSON.stringify(response, null, 2) : "// اضغط على 'إرسال الطلب' لعرض استجابة الـ API الحية..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
