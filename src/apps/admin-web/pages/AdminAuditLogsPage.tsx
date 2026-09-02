// ============================================================================
// Daleel Ay Khidma - Immutable Audit Logs Viewer & Diff Inspector
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { AuditLogDTO } from "../../../packages/types";
import { Button, Input, Skeleton, Modal } from "../../../packages/ui";
import { History, Search, ShieldCheck, Eye, Clock, Terminal, User, FileText } from "lucide-react";

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("");

  // Diff Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogDTO | null>(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        action: actionFilter !== "all" ? actionFilter : undefined,
        model_type: modelFilter || undefined,
      });
      if (res.results) setLogs(res.results);
    } catch (err) {
      console.error("Audit log error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, modelFilter]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "verified":
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">توثيق معتمد (Verified)</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">رفض (Rejected)</span>;
      case "created":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">إنشاء (Created)</span>;
      case "updated":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">تعديل (Updated)</span>;
      case "deleted":
        return <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">حذف (Deleted)</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 text-right pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">سجل العمليات غير القابل للمحو (Audit Ledger)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            سجل رقابي مشدد يسجل كل عملية إنشاء، تعديل، توثيق، أو رفض مع الـ IP والتفاصيل الدقيقة
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Immutable Ledger Active</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-semibold outline-none"
        >
          <option value="all">كافة أنواع الإجراءات</option>
          <option value="verified">توثيق (Verified)</option>
          <option value="rejected">رفض (Rejected)</option>
          <option value="created">إنشاء (Created)</option>
          <option value="updated">تعديل (Updated)</option>
          <option value="deleted">حذف (Deleted)</option>
        </select>

        <input
          type="text"
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          placeholder="فلترة بنوع الكيان (مثال: Activity, Role)..."
          className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none w-64"
        />

        <Button variant="secondary" size="sm" onClick={loadAuditLogs}>
          تحديث السجل
        </Button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-semibold">
            لا توجد سجلات مطابقة للفلاتر المحددة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">المعرف</th>
                  <th className="p-3.5">نوع الإجراء</th>
                  <th className="p-3.5">المستخدم المنفذ</th>
                  <th className="p-3.5">الكيان المتأثر</th>
                  <th className="p-3.5">عنوان IP</th>
                  <th className="p-3.5">التاريخ والوقت</th>
                  <th className="p-3.5 text-left">فروقات الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">#{log.id}</td>
                    <td className="p-3.5">{getActionBadge(log.action)}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{log.user_name || `مستخدم #${log.user_id}`}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {log.model_type} #{log.model_id}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{log.ip_address}</td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {new Date(log.created_at).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-3.5 text-left">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedLog(log)}>
                        معاينة الفروقات (Diff)
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diff Inspector Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`معاينة تفاصيل وفروقات العملية #${selectedLog?.id}`}
        maxWidth="max-w-2xl"
      >
        {selectedLog && (
          <div className="space-y-4 text-right">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 text-xs">
              <div>
                <span className="text-slate-400 block">المستخدم:</span>
                <span className="font-bold text-slate-900">{selectedLog.user_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">عنوان IP & المتصفح:</span>
                <span className="font-mono text-slate-700">{selectedLog.ip_address}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">القيم السابقة (Old Values):</span>
              <pre className="p-3 rounded-2xl bg-slate-900 text-red-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {JSON.stringify(selectedLog.old_values || {}, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">القيم الجديدة (New Values):</span>
              <pre className="p-3 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {JSON.stringify(selectedLog.new_values || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
