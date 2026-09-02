// ============================================================================
// Daleel Ay Khidma - Product Import & Export Modal (نظام استيراد وتصدير المنتجات)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import {
  ActivityDTO,
  ProductImportPreviewResultDTO as ProductImportPreviewDTO,
  ProductImportPreviewRowDTO as ProductImportRowPreviewDTO,
  ImportExportLogDTO,
  MerchantSubscriptionInfoDTO,
} from "../../../packages/types";
import {
  Modal,
  Button,
  Badge,
  Select,
  Textarea,
  Input,
} from "../../../packages/ui";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RefreshCw,
  Info,
  Check,
  X,
  History,
  Lock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
} from "lucide-react";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityDTO[];
  selectedActivityId?: number;
  subscriptionInfo?: MerchantSubscriptionInfoDTO | null;
  onSuccess?: () => void;
  onImportSuccess?: () => void;
  onUpgradePlan?: () => void;
}

export function ImportExportModal({
  isOpen,
  onClose,
  activities,
  selectedActivityId,
  subscriptionInfo,
  onSuccess,
  onImportSuccess,
  onUpgradePlan,
}: ImportExportModalProps) {
  const triggerSuccess = () => {
    if (onSuccess) onSuccess();
    if (onImportSuccess) onImportSuccess();
  };
  const [activeSubTab, setActiveSubTab] = useState<"import" | "export" | "history">("import");
  const [targetActivityId, setTargetActivityId] = useState<number>(
    selectedActivityId || (activities.length > 0 ? activities[0].id : 0)
  );

  // Import State
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ProductImportPreviewDTO | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    created_count?: number;
    updated_count?: number;
    failed_count?: number;
  } | null>(null);

  // History State
  const [logs, setLogs] = useState<ImportExportLogDTO[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Export State
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (selectedActivityId) {
      setTargetActivityId(selectedActivityId);
    } else if (activities.length > 0 && !targetActivityId) {
      setTargetActivityId(activities[0].id);
    }
  }, [selectedActivityId, activities]);

  useEffect(() => {
    if (isOpen && activeSubTab === "history") {
      loadLogs();
    }
  }, [isOpen, activeSubTab]);

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.getImportExportLogs();
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const isFeatureAllowed = subscriptionInfo?.plan?.limits?.can_use_import_export ?? true;

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      // Auto run preview
      handlePreview(content);
    };
    reader.readAsText(file, "UTF-8");
  };

  // Run Preview Validation
  const handlePreview = async (contentToPreview?: string) => {
    const text = contentToPreview || csvContent;
    if (!text.trim() || !targetActivityId) return;

    setPreviewLoading(true);
    setImportResult(null);
    try {
      const res = await api.previewProductImport({
        activity_id: targetActivityId,
        csv_content: text,
      });

      if (res.success) {
        setPreviewData(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setImportResult({
        success: false,
        message: err.message || "حدث خطأ أثناء فحص ملف الـ CSV.",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (!previewData || !targetActivityId) return;

    const validRows = previewData.rows.filter((r) => r.is_valid);
    if (validRows.length === 0) return;

    setExecuteLoading(true);
    try {
      const res = await api.executeProductImport({
        activity_id: targetActivityId,
        rows: validRows,
      });

      if (res.success) {
        setImportResult({
          success: true,
          message: res.message || "تم استيراد المنتجات بنجاح!",
          created_count: res.data.created_count,
          updated_count: res.data.updated_count,
          failed_count: res.data.failed_count,
        });
        setPreviewData(null);
        setCsvContent("");
        setFileName("");
        triggerSuccess();
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        message: err.message || "فشل تنفيذ عملية الاستيراد.",
      });
    } finally {
      setExecuteLoading(false);
    }
  };

  // Handle Export
  const handleExport = () => {
    setExportLoading(true);
    try {
      const url = `/api/v2/products/export?activity_id=${targetActivityId}&format=${exportFormat}`;
      window.open(url, "_blank");
      setTimeout(() => {
        setExportLoading(false);
      }, 1000);
    } catch (err) {
      setExportLoading(false);
    }
  };

  // Download Sample CSV Template
  const handleDownloadSample = () => {
    const headers = "name,sku,price,sale_price,currency,short_description,full_description,stock_qty,availability_note,cover_image";
    const sampleRow1 = 'بيتزا مارجريتا إيطالي,PIZZA-001,120,99,ج.م,جبنة موتزاريلا طبيعية مع صوص طماطم ريحان,بيتزا نابوليتان بأجود المكونات الطازجة,25,متوفر يومياً,https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600';
    const sampleRow2 = 'برجر لحم بلدي دبل,BURGER-002,150,,ج.م,شريحتين لحم مع جبنة شيدر وبطاطس,برجر مشوي على الفحم مع صوص مدخن,10,كميات محدودة,https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600';
    const sampleRow3 = 'عصير مانجو فريش,DRINK-003,45,35,ج.م,مانجو طبيعي بدون سكر مضاف,عصير مثلج منعش طبيعي 100%,50,جاهز للتوصيل الفوري,https://images.unsplash.com/photo-1546173159-315724a31696?w=600';

    const csvContent = "\uFEFF" + [headers, sampleRow1, sampleRow2, sampleRow3].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="استيراد وتصدير كتالوج المنتجات والخدمات"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("import")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeSubTab === "import"
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              استيراد منتجات (CSV)
            </button>
            <button
              onClick={() => setActiveSubTab("export")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeSubTab === "export"
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              تصدير الكتالوج
            </button>
            <button
              onClick={() => setActiveSubTab("history")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeSubTab === "history"
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <History className="w-4 h-4" />
              سجل العمليات
            </button>
          </div>

          <div className="w-64">
            <Select
              label=""
              value={targetActivityId}
              onChange={(e) => {
                setTargetActivityId(Number(e.target.value));
                setPreviewData(null);
              }}
              options={activities.map((a) => ({
                value: a.id,
                label: `النشاط: ${a.name_ar}`,
              }))}
            />
          </div>
        </div>

        {/* Feature Lock Check for Free Plan */}
        {!isFeatureAllowed && activeSubTab === "import" && (
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/40 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-amber-500 text-white rounded-lg shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-slate-900">
                ميزة الاستيراد السريع متاحة في الخطة الاحترافية (Pro)
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                استيراد الكتالوجات الكبيرة بملفات Excel و CSV وتحديث آلاف المنتجات بضغطة زر مخصص لمشتركي باقة التجار المحترفين.
              </p>
              {onUpgradePlan && (
                <Button
                  size="sm"
                  onClick={onUpgradePlan}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  <Sparkles className="w-4 h-4 ml-1" />
                  ترقية الخطة الآن
                </Button>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: IMPORT CSV */}
        {activeSubTab === "import" && isFeatureAllowed && (
          <div className="space-y-6">
            {/* Top Helper Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    هل تحتاج إلى نموذج جاهز للبدء؟
                  </h4>
                  <p className="text-xs text-slate-500">
                    قم بتحميل ملف Excel / CSV النموذجي واملأ بيانات منتجاتك ثم ارفعه هنا.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                className="shrink-0 border-slate-300 hover:bg-white text-slate-700 font-semibold"
              >
                <Download className="w-4 h-4 ml-1.5 text-sky-600" />
                تحميل نموذج CSV التجريبي
              </Button>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 text-center transition-colors bg-white hover:bg-sky-50/20 relative">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  {fileName ? `الملف المختار: ${fileName}` : "اسحب ملف الـ CSV وأفلته هنا أو اضغط للاختيار"}
                </h4>
                <p className="text-xs text-slate-500">
                  يدعم ملفات CSV بترميز UTF-8 وعناوين الأعمدة باللغة العربية أو الإنجليزية
                </p>
              </div>
            </div>

            {/* Direct Paste Alternative */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>أو الصق محتوى الـ CSV مباشرة هنا:</span>
                {csvContent && (
                  <button
                    onClick={() => {
                      setCsvContent("");
                      setFileName("");
                      setPreviewData(null);
                    }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    مسح المحتوى
                  </button>
                )}
              </label>
              <Textarea
                rows={3}
                placeholder="name,sku,price,sale_price,currency..."
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="font-mono text-xs"
              />
              {csvContent && !previewData && (
                <Button
                  size="sm"
                  onClick={() => handlePreview()}
                  disabled={previewLoading}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  {previewLoading ? "جاري الفحص والمعاينة..." : "فحص ومعاينة البيانات قبل الاستيراد"}
                </Button>
              )}
            </div>

            {/* Result / Success Notice */}
            {importResult && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  importResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                {importResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-bold">{importResult.message}</p>
                  {importResult.created_count !== undefined && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-emerald-700">
                        جديد: {importResult.created_count}
                      </span>
                      <span className="font-semibold text-sky-700">
                        تحديث: {importResult.updated_count}
                      </span>
                      {importResult.failed_count ? (
                        <span className="font-semibold text-rose-700">
                          فشل: {importResult.failed_count}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PREVIEW REPORT & TABLE */}
            {previewData && (
              <div className="space-y-4 border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-sky-600" />
                      معاينة البيانات والتحقق الذكي ({previewData.total_rows} صف)
                    </h4>
                    <p className="text-xs text-slate-500">
                      تم فحص سلامة الأسعار، أكواد الـ SKU، ومطابقة المنتجات الحالية لتحديثها بدقة
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                      صالحة: {previewData.valid_rows_count}
                    </span>
                    <span className="px-2.5 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-lg">
                      منتجات جديدة: {previewData.will_create_count}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                      تحديث منتج قائم: {previewData.will_update_count}
                    </span>
                    {previewData.invalid_rows_count > 0 && (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg">
                        غير صالحة: {previewData.invalid_rows_count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Capacity warning */}
                {previewData.capacity_warning && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{previewData.capacity_warning}</span>
                  </div>
                )}

                {/* Preview Table */}
                <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl bg-white">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">اسم المنتج</th>
                        <th className="p-3">الرمز (SKU)</th>
                        <th className="p-3">السعر</th>
                        <th className="p-3">سعر الخصم</th>
                        <th className="p-3">الإجراء</th>
                        <th className="p-3">الحالة والملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.rows.map((row) => (
                        <tr
                          key={row.row_number}
                          className={row.is_valid ? "hover:bg-slate-50" : "bg-rose-50/50"}
                        >
                          <td className="p-3 font-mono text-slate-500">{row.row_number}</td>
                          <td className="p-3 font-bold text-slate-800">{row.data.name || "—"}</td>
                          <td className="p-3 font-mono text-slate-600">{row.data.sku || "—"}</td>
                          <td className="p-3 font-bold text-slate-900">{row.data.price} {row.data.currency}</td>
                          <td className="p-3 text-emerald-600 font-semibold">
                            {row.data.sale_price ? `${row.data.sale_price} ${row.data.currency}` : "—"}
                          </td>
                          <td className="p-3">
                            {row.action === "update" ? (
                              <Badge variant="amber" size="sm">
                                تحديث قائم
                              </Badge>
                            ) : (
                              <Badge variant="emerald" size="sm">
                                إضافة جديد
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            {row.errors.length > 0 ? (
                              <span className="text-rose-600 font-semibold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                {row.errors.join("، ")}
                              </span>
                            ) : row.warnings.length > 0 ? (
                              <span className="text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {row.warnings.join("، ")}
                              </span>
                            ) : (
                              <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                سليم وجاهز
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Confirm Action Button */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500">
                    سيتم استيراد {previewData.valid_rows_count} منتج صالح وتجاهل أي صفوف تحتوي على أخطاء حرجة.
                  </p>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewData(null)}
                      disabled={executeLoading}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleExecuteImport}
                      disabled={executeLoading || previewData.valid_rows_count === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-sm"
                    >
                      {executeLoading ? "جاري الاستيراد والتحديث..." : `تنفيذ الاستيراد (${previewData.valid_rows_count} منتج)`}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPORT CATALOG */}
        {activeSubTab === "export" && (
          <div className="space-y-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-600 text-white rounded-xl shadow-sm">
                <ArrowUpFromLine className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  تصدير كتالوج المنتجات والأسعار
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  يمكنك استخراج كافة بيانات منتجاتك الحالية مع الأسعار وأكواد الـ SKU والكميات بصيغة ملف CSV متوافق مع برامج Excel أو بصيغة JSON لربطه مع برامج المحاسبة و ERP.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">صيغة التصدير المطلوبة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat("csv")}
                    className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                      exportFormat === "csv"
                        ? "bg-sky-50 border-sky-500 text-sky-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    CSV (Excel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat("json")}
                    className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                      exportFormat === "json"
                        ? "bg-sky-50 border-sky-500 text-sky-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    JSON Data
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <Button
                  onClick={handleExport}
                  disabled={exportLoading || !targetActivityId}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold h-11"
                >
                  <Download className="w-4 h-4 ml-2" />
                  {exportLoading ? "جاري التصدير..." : "تحميل ملف التصدير الآن"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOGS HISTORY */}
        {activeSubTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                سجل عمليات الاستيراد والتصدير السابقة
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={loadLogs}
                disabled={logsLoading}
              >
                <RefreshCw className={`w-3.5 h-3.5 ml-1 ${logsLoading ? "animate-spin" : ""}`} />
                تحديث
              </Button>
            </div>

            {logsLoading ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                جاري تحميل السجلات...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                لا توجد عمليات استيراد أو تصدير سابقة حتى الآن.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">العملية</th>
                      <th className="p-3">النشاط</th>
                      <th className="p-3">الصيغة</th>
                      <th className="p-3">العدد الكلي</th>
                      <th className="p-3">النجاح / الفشل</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-500">
                          {new Date(log.created_at).toLocaleString("ar-EG")}
                        </td>
                        <td className="p-3 font-bold">
                          {log.operation_type === "import" ? (
                            <span className="text-sky-700 flex items-center gap-1">
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                              استيراد CSV
                            </span>
                          ) : (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <ArrowUpFromLine className="w-3.5 h-3.5" />
                              تصدير كتالوج
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {log.activity_name || "جميع الأنشطة"}
                        </td>
                        <td className="p-3 font-mono uppercase text-slate-600">{log.format}</td>
                        <td className="p-3 font-bold text-slate-900">{log.total_records}</td>
                        <td className="p-3 font-semibold">
                          <span className="text-emerald-600">{log.success_count} نجاح</span>
                          {log.fail_count > 0 && (
                            <span className="text-rose-600 mr-2">{log.fail_count} فشل</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              log.status === "success"
                                ? "emerald"
                                : log.status === "warning"
                                ? "amber"
                                : "red"
                            }
                            size="sm"
                          >
                            {log.status === "success"
                              ? "مكتمل"
                              : log.status === "warning"
                              ? "مكتمل جزئياً"
                              : "فشل"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
