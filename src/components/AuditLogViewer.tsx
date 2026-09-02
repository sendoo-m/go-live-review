import React, { useState, useEffect } from "react";
import { History, ShieldCheck, Search, Filter, RefreshCw, User, Globe, Clock, ArrowRight } from "lucide-react";

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const url = filterAction !== "all" ? `/api/v2/admin/audit-logs?action=${filterAction}` : "/api/v2/admin/audit-logs";
      const res = await fetch(url, {
        headers: { "X-User-Id": "1" },
      });
      const data = await res.json();
      setLogs(data.results || []);
      if (data.results?.length > 0 && !selectedLog) {
        setSelectedLog(data.results[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filterAction]);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      (log.user_name || "").toLowerCase().includes(q) ||
      (log.model_type || "").toLowerCase().includes(q) ||
      (log.action || "").toLowerCase().includes(q) ||
      (log.ip_address || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              سجل تدقيق أمني غير قابل للمحو (Append-Only Immutable Ledger)
            </div>
            <h2 className="text-xl font-bold text-slate-900">سجل العمليات والرقابة الأمنية الشاملة (Audit Logs)</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              يقوم الـ <code className="text-emerald-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded">AuditLogObserver</code> بتسجيل كافة التغييرات على النماذج تلقائياً مع تفاصيل
              المستخدم، الـ IP، والقيم السابقة والجديدة. النموذج محمي برمجياً برمي استثناء عند أي محاولة تعديل أو حذف.
            </p>
          </div>
          <button
            onClick={fetchAuditLogs}
            className="p-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-colors cursor-pointer flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? "animate-spin" : ""}`} />
            تحديث السجل
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Log List */}
        <div className="lg:col-span-6 space-y-3">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="بحث في السجلات بالموظف، الـ IP، النموذج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-xs"
            >
              <option value="all">كافة العمليات</option>
              <option value="created">إنشاء (Created)</option>
              <option value="updated">تحديث (Updated)</option>
              <option value="verified">توثيق (Verified)</option>
              <option value="rejected">رفض (Rejected)</option>
              <option value="login">تسجيل دخول (Login)</option>
            </select>
          </div>

          {/* Records List */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[550px] overflow-y-auto shadow-sm">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">لا توجد سجلات مطابقة لمعايير البحث.</div>
            ) : (
              filteredLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-right p-3.5 transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    selectedLog?.id === log.id ? "bg-indigo-50/80 border-r-4 border-indigo-600" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                          log.action === "verified"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : log.action === "created"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : log.action === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">{log.user_name || "النظام"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate ltr text-left font-medium">
                      {log.model_type?.split("\\").pop()} #{log.model_id}
                    </p>
                  </div>

                  <div className="text-left shrink-0 text-[10px] text-slate-400 space-y-0.5">
                    <div className="flex items-center gap-1 font-mono text-slate-600 font-medium">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      {new Date(log.created_at).toLocaleTimeString("ar-EG")}
                    </div>
                    <div className="font-mono text-slate-400">{log.ip_address}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: State Diff Viewer */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {selectedLog ? (
            <>
              {/* Header */}
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    تفاصيل السجل رقم #{selectedLog.id}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {new Date(selectedLog.created_at).toLocaleString("ar-EG")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    {selectedLog.user_name || "النظام"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    IP: {selectedLog.ip_address}
                  </span>
                </div>
              </div>

              {/* Diff Viewer Body */}
              <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[460px] text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 mb-1.5">النموذج المتأثر (Model):</h4>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-emerald-400 ltr text-left">
                    {selectedLog.model_type} (ID: {selectedLog.model_id})
                  </div>
                </div>

                {/* Old Values */}
                {selectedLog.old_values && (
                  <div>
                    <h4 className="font-bold text-red-700 mb-1.5">القيم السابقة (Old State):</h4>
                    <pre className="bg-red-50/80 p-3 rounded-xl border border-red-200 text-red-900 font-mono text-[11px] ltr text-left overflow-x-auto">
                      <code>{JSON.stringify(selectedLog.old_values, null, 2)}</code>
                    </pre>
                  </div>
                )}

                {/* New Values */}
                <div>
                  <h4 className="font-bold text-emerald-700 mb-1.5">القيم الجديدة (New State):</h4>
                  <pre className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-mono text-[11px] ltr text-left overflow-x-auto">
                    <code>{JSON.stringify(selectedLog.new_values, null, 2)}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 mb-1">User-Agent:</h4>
                  <p className="text-[11px] font-mono text-slate-500 break-all">{selectedLog.user_agent}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <History className="w-10 h-10 opacity-30 mb-2" />
              <p className="text-xs">اختر سجلاً من القائمة لمعاينة الفروقات البرمجية.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
