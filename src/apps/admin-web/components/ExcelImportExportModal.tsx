// ============================================================================
// Daleel Ay Khidma - Universal Excel Import & Export Modal Component
// ============================================================================

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Check,
  Building2,
  MapPin,
  Package,
} from "lucide-react";
import {
  downloadExcelTemplate,
  parseExcelFile,
  CATEGORIES_EXCEL_COLUMNS,
  LOCATIONS_EXCEL_COLUMNS,
  PRODUCTS_EXCEL_COLUMNS,
  ACTIVITIES_EXCEL_COLUMNS,
  ColumnDefinition,
  exportToExcel,
  exportToCSV,
} from "../../../packages/core";

export interface ExcelImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: "categories" | "locations" | "products" | "activities";
  resourceTitleAr: string;
  onImportPreview: (rows: any[]) => Promise<any>;
  onImportExecute: (rows: any[]) => Promise<any>;
  onExportFetch?: (params: { format: "xlsx" | "csv" }) => Promise<{ data?: any[]; blob?: Blob; filename?: string }>;
  onSuccessRefresh?: () => void;
  extraContext?: {
    activityId?: number;
    activityName?: string;
  };
}

export const ExcelImportExportModal: React.FC<ExcelImportExportModalProps> = ({
  isOpen,
  onClose,
  resourceType,
  resourceTitleAr,
  onImportPreview,
  onImportExecute,
  onExportFetch,
  onSuccessRefresh,
  extraContext,
}) => {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  
  // Import Flow States
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Preview, 3: Completed Report
  const [isParsing, setIsParsing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Validation Preview State
  const [validationData, setValidationData] = useState<{
    total_rows: number;
    valid_rows_count: number;
    invalid_rows_count: number;
    will_create_count: number;
    will_update_count: number;
    rows: any[];
  } | null>(null);

  // Filter in Preview Table
  const [previewFilter, setPreviewFilter] = useState<"all" | "valid" | "errors" | "creates" | "updates">("all");
  const [previewSearch, setPreviewSearch] = useState("");

  // Final Execution Results
  const [executionResult, setExecutionResult] = useState<{
    created_count: number;
    updated_count: number;
    failed_count: number;
    failed_rows: { row_number: number; reason: string }[];
  } | null>(null);

  // Export options
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const getColumns = (): ColumnDefinition[] => {
    switch (resourceType) {
      case "categories": return CATEGORIES_EXCEL_COLUMNS;
      case "locations": return LOCATIONS_EXCEL_COLUMNS;
      case "products": return PRODUCTS_EXCEL_COLUMNS;
      case "activities": return ACTIVITIES_EXCEL_COLUMNS;
      default: return [];
    }
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(resourceType, `daleel_template`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setParseError(null);
    setSelectedFile(file);
    setIsParsing(true);

    try {
      const columns = getColumns();
      const parsed = await parseExcelFile(file, columns);

      if (parsed.missingRequiredHeaders.length > 0) {
        setParseError(`الملف يفتقر لأعمدة إجبارية أساسية: (${parsed.missingRequiredHeaders.join("، ")}). يرجى التأكد من تطابق عناوين الأعمدة مع القالب الرسمي.`);
        setIsParsing(false);
        return;
      }

      // Send to backend for business dry-run validation
      const previewRes = await onImportPreview(parsed.normalizedRows);
      if (previewRes?.data) {
        setValidationData(previewRes.data);
        setStep(2);
      } else {
        setParseError(previewRes?.message || "حدث خطأ أثناء فحص البيانات من الخادم.");
      }
    } catch (err: any) {
      setParseError(err.message || "فشل قراءة الملف. تأكد من أن صيغة الملف صالحة (.xlsx أو .csv)");
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationData || validationData.valid_rows_count === 0) return;
    setIsExecuting(true);
    setParseError(null);

    try {
      // Send valid rows or all rows to execute
      const validRowsToImport = validationData.rows.filter((r: any) => r.is_valid);
      const res = await onImportExecute(validRowsToImport);

      if (res?.success) {
        setExecutionResult(res.data);
        setStep(3);
        if (onSuccessRefresh) onSuccessRefresh();
      } else {
        setParseError(res?.message || "فشل إتمام عملية الاستيراد.");
      }
    } catch (err: any) {
      setParseError(err.message || "حدث خطأ غير متوقع أثناء حفظ البيانات.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExport = async () => {
    if (!onExportFetch) return;
    setIsExporting(true);
    try {
      const result = await onExportFetch({ format: exportFormat });
      if (result.blob) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(result.blob);
        link.download = result.filename || `export_${resourceType}_${Date.now()}.${exportFormat}`;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء التصدير: " + (err.message || ""));
    } finally {
      setIsExporting(false);
    }
  };

  const resetImportFlow = () => {
    setStep(1);
    setSelectedFile(null);
    setValidationData(null);
    setExecutionResult(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Filter preview rows
  const filteredPreviewRows = (validationData?.rows || []).filter((r: any) => {
    if (previewFilter === "valid" && !r.is_valid) return false;
    if (previewFilter === "errors" && r.is_valid) return false;
    if (previewFilter === "creates" && (!r.is_valid || r.action !== "create")) return false;
    if (previewFilter === "updates" && (!r.is_valid || r.action !== "update")) return false;

    if (previewSearch.trim()) {
      const term = previewSearch.toLowerCase().trim();
      const strData = JSON.stringify(r.data || {}).toLowerCase();
      return strData.includes(term) || (r.errors || []).some((e: string) => e.toLowerCase().includes(term));
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                استيراد وتصدير Excel - {resourceTitleAr}
              </h2>
              <p className="text-xs text-slate-500">
                دعم صيغ XLSX و CSV مع فحص مسبق للبيانات قبل الحفظ وتحديث السجلات القائمة
              </p>
            </div>
          </div>
          <button
            id="close-excel-modal-btn"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 px-6 pt-2">
          <button
            id="tab-import-btn"
            onClick={() => { setActiveTab("import"); resetImportFlow(); }}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "import"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="h-4 w-4" />
            استيراد ملف Excel / CSV
          </button>
          <button
            id="tab-export-btn"
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "export"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Download className="h-4 w-4" />
            تصدير البيانات الحالية
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "import" ? (
            <div>
              {/* Step indicator */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    step >= 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    1
                  </span>
                  <span className={`text-sm font-medium ${step >= 1 ? "text-slate-900 font-bold" : "text-slate-400"}`}>
                    اختيار الملف والقالب
                  </span>
                </div>
                <div className="h-0.5 w-12 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    step >= 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    2
                  </span>
                  <span className={`text-sm font-medium ${step >= 2 ? "text-slate-900 font-bold" : "text-slate-400"}`}>
                    المعاينة والتحقق (Dry Run)
                  </span>
                </div>
                <div className="h-0.5 w-12 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    step === 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    3
                  </span>
                  <span className={`text-sm font-medium ${step === 3 ? "text-slate-900 font-bold" : "text-slate-400"}`}>
                    تقرير الحفظ النهائي
                  </span>
                </div>
              </div>

              {/* STEP 1: Upload & Template */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Template Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800 mt-0.5">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">
                          حمّل قالب Excel الجاهز والمُنسّق
                        </h4>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          يحتوي القالب على ورقة بيانات تجريبية جاهزة للتعبئة، مع ورقة تعليمات توضح الشروط والأعمدة الإجبارية.
                        </p>
                      </div>
                    </div>
                    <button
                      id="download-template-action-btn"
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      <Download className="h-4 w-4" />
                      تنزيل القالب (XLSX)
                    </button>
                  </div>

                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
                      isParsing
                        ? "border-emerald-400 bg-emerald-50/30"
                        : "border-slate-300 bg-slate-50/50 hover:border-emerald-500 hover:bg-emerald-50/20"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {isParsing ? (
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin" />
                        <p className="text-sm font-bold text-slate-800">
                          جاري قراءة الملف وفحص الجداول والأعمدة...
                        </p>
                        <p className="text-xs text-slate-500">
                          يتم التحقق من مطابقة الحقول ومطابقة المعرفات القائمة للتحديث
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                          <Upload className="h-7 w-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">
                          اسحب وأسقط ملف Excel هنا، أو انقر للاختيار من جهازك
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          يدعم ملفات .xlsx و .xls و .csv (بحد أقصى 5000 صف في العملية الواحدة)
                        </p>
                      </>
                    )}
                  </div>

                  {parseError && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <h5 className="text-sm font-bold">تنبيه أثناء معالجة الملف</h5>
                        <p className="text-xs mt-1 leading-relaxed">{parseError}</p>
                      </div>
                    </div>
                  )}

                  {/* Summary of Columns */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      الأعمدة المعترف بها في النظام لهذا القسم:
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {getColumns().map((col) => (
                        <span
                          key={col.key}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
                            col.required
                              ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                              : "bg-white text-slate-700 border border-slate-200"
                          }`}
                          title={col.descriptionAr}
                        >
                          {col.labelAr}
                          {col.required && <span className="text-red-500 text-xs">*</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Preview & Validation */}
              {step === 2 && validationData && (
                <div className="space-y-4">
                  {/* Metric Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs text-slate-500 font-medium">إجمالي الصفوف</div>
                      <div className="text-xl font-black text-slate-900 mt-1">
                        {validationData.total_rows}
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                      <div className="text-xs text-emerald-700 font-medium">صفوف صالحة للاستيراد</div>
                      <div className="text-xl font-black text-emerald-800 mt-1">
                        {validationData.valid_rows_count}
                      </div>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3">
                      <div className="text-xs text-sky-700 font-medium">إنشاء جديد / تحديث</div>
                      <div className="text-xl font-black text-sky-800 mt-1">
                        {validationData.will_create_count} <span className="text-xs font-normal text-slate-500">جديد</span> / {validationData.will_update_count} <span className="text-xs font-normal text-slate-500">تحديث</span>
                      </div>
                    </div>
                    <div className={`rounded-xl border p-3 ${
                      validationData.invalid_rows_count > 0 ? "border-red-200 bg-red-50/50" : "border-slate-200 bg-slate-50"
                    }`}>
                      <div className={`text-xs font-medium ${validationData.invalid_rows_count > 0 ? "text-red-700 font-bold" : "text-slate-500"}`}>
                        صفوف بها أخطاء
                      </div>
                      <div className={`text-xl font-black mt-1 ${validationData.invalid_rows_count > 0 ? "text-red-800" : "text-slate-600"}`}>
                        {validationData.invalid_rows_count}
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-y border-slate-200 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setPreviewFilter("all")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          previewFilter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        الكل ({validationData.total_rows})
                      </button>
                      <button
                        onClick={() => setPreviewFilter("valid")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          previewFilter === "valid" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        الصالح فقط ({validationData.valid_rows_count})
                      </button>
                      {validationData.invalid_rows_count > 0 && (
                        <button
                          onClick={() => setPreviewFilter("errors")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            previewFilter === "errors" ? "bg-red-700 text-white" : "bg-red-50 text-red-800 hover:bg-red-100"
                          }`}
                        >
                          الأخطاء ({validationData.invalid_rows_count})
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewFilter("creates")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          previewFilter === "creates" ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                        }`}
                      >
                        إنشاء ({validationData.will_create_count})
                      </button>
                      <button
                        onClick={() => setPreviewFilter("updates")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          previewFilter === "updates" ? "bg-amber-700 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                        }`}
                      >
                        تحديث قائم ({validationData.will_update_count})
                      </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="بحث في المعاينة..."
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-8 pl-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="max-h-72 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-right text-xs">
                      <thead className="sticky top-0 bg-slate-100 text-slate-700 shadow-xs">
                        <tr>
                          <th className="px-3 py-2"># الصف</th>
                          <th className="px-3 py-2">الإجراء المتوقع</th>
                          {resourceType === "categories" && (
                            <>
                              <th className="px-3 py-2">اسم التصنيف</th>
                              <th className="px-3 py-2">القطاع الرئيسي</th>
                              <th className="px-3 py-2">الاسم اللطيف (Slug)</th>
                            </>
                          )}
                          {resourceType === "locations" && (
                            <>
                              <th className="px-3 py-2">المحافظة</th>
                              <th className="px-3 py-2">المدينة / المركز</th>
                              <th className="px-3 py-2">الحي / المنطقة</th>
                            </>
                          )}
                          {resourceType === "products" && (
                            <>
                              <th className="px-3 py-2">اسم المنتج</th>
                              <th className="px-3 py-2">رمز الصنف (SKU)</th>
                              <th className="px-3 py-2">السعر</th>
                            </>
                          )}
                          {resourceType === "activities" && (
                            <>
                              <th className="px-3 py-2">اسم النشاط</th>
                              <th className="px-3 py-2">التصنيف</th>
                              <th className="px-3 py-2">المحافظة</th>
                              <th className="px-3 py-2">التوصيل</th>
                            </>
                          )}
                          <th className="px-3 py-2">الملاحظات والأخطاء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPreviewRows.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                              لا توجد صفوف مطابقة للفلتر المحدد
                            </td>
                          </tr>
                        ) : (
                          filteredPreviewRows.map((r: any) => (
                            <tr
                              key={r.row_number}
                              className={
                                !r.is_valid
                                  ? "bg-red-50/50 hover:bg-red-50"
                                  : r.action === "update"
                                  ? "bg-amber-50/30 hover:bg-amber-50/60"
                                  : "hover:bg-slate-50"
                              }
                            >
                              <td className="px-3 py-2 font-mono font-bold text-slate-600">
                                #{r.row_number}
                              </td>
                              <td className="px-3 py-2">
                                {!r.is_valid ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-2xs font-bold text-red-800">
                                    <AlertCircle className="h-3 w-3" />
                                    خطأ بالبيانات
                                  </span>
                                ) : r.action === "update" ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-2xs font-bold text-amber-800">
                                    <RefreshCw className="h-3 w-3" />
                                    تحديث قائم (#{r.matched_id || "موجود"})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-2xs font-bold text-emerald-800">
                                    <Check className="h-3 w-3" />
                                    إنشاء جديد
                                  </span>
                                )}
                              </td>

                              {/* Columns Preview */}
                              {resourceType === "categories" && (
                                <>
                                  <td className="px-3 py-2 font-bold text-slate-900">
                                    {r.data.name_ar || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                                      {r.data.section_name_ar || r.data.section_name || "المحلات"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-500">
                                    {r.data.slug || "—"}
                                  </td>
                                </>
                              )}

                              {resourceType === "locations" && (
                                <>
                                  <td className="px-3 py-2 font-bold text-slate-900">
                                    {r.data.governorate_name_ar || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700">
                                    {r.data.city_name_ar || "— (محافظة فقط)"}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {r.data.neighborhood_name_ar || "—"}
                                  </td>
                                </>
                              )}

                              {resourceType === "products" && (
                                <>
                                  <td className="px-3 py-2 font-bold text-slate-900">
                                    {r.data.name || "—"}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-500">
                                    {r.data.sku || "تلقائي"}
                                  </td>
                                  <td className="px-3 py-2 font-bold text-emerald-700">
                                    {r.data.price} {r.data.currency || "ج.م"}
                                  </td>
                                </>
                              )}

                              {resourceType === "activities" && (
                                <>
                                  <td className="px-3 py-2 font-bold text-slate-900">
                                    {r.data.name_ar || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {r.data.category_name_ar || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {r.data.governorate_name_ar || "—"}
                                  </td>
                                  <td className="px-3 py-2">
                                    {r.data.has_delivery ? (
                                      <span className="text-emerald-700 font-bold">نعم</span>
                                    ) : (
                                      <span className="text-slate-400">لا</span>
                                    )}
                                  </td>
                                </>
                              )}

                              <td className="px-3 py-2">
                                {r.errors && r.errors.length > 0 ? (
                                  <span className="text-red-600 font-medium">
                                    {r.errors.join(" | ")}
                                  </span>
                                ) : r.warnings && r.warnings.length > 0 ? (
                                  <span className="text-amber-600">
                                    {r.warnings.join(" | ")}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-2xs">جاهز للاستيراد</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={resetImportFlow}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <ArrowRight className="h-4 w-4" />
                      اختيار ملف آخر
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        id="confirm-execute-import-btn"
                        disabled={isExecuting || validationData.valid_rows_count === 0}
                        onClick={handleExecuteImport}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        {isExecuting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            جاري الحفظ في قاعدة البيانات...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            تأكيد واعتماد استيراد {validationData.valid_rows_count} سجل
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Final Report */}
              {step === 3 && executionResult && (
                <div className="space-y-6 py-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      اكتملت عملية الاستيراد بنجاح!
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      تم حفظ السجلات وتحديث قاعدة البيانات وسجل العمليات الرقابي (Audit Log)
                    </p>
                  </div>

                  {/* Metrics Badge */}
                  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="text-xs text-emerald-700 font-bold">تم إنشاؤه جديداً</div>
                      <div className="text-2xl font-black text-emerald-900 mt-1">
                        {executionResult.created_count}
                      </div>
                    </div>
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <div className="text-xs text-blue-700 font-bold">تم تحديثه قائماً</div>
                      <div className="text-2xl font-black text-blue-900 mt-1">
                        {executionResult.updated_count}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs text-slate-600 font-bold">الصفوف المرفوضة</div>
                      <div className="text-2xl font-black text-slate-800 mt-1">
                        {executionResult.failed_count}
                      </div>
                    </div>
                  </div>

                  {executionResult.failed_rows && executionResult.failed_rows.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-right max-w-lg mx-auto">
                      <h5 className="text-xs font-bold text-red-800 mb-2">صفوف فشلت أثناء المعالجة:</h5>
                      <div className="space-y-1 max-h-32 overflow-y-auto text-xs text-red-700">
                        {executionResult.failed_rows.map((f, i) => (
                          <div key={i}>• صف #{f.row_number}: {f.reason}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={resetImportFlow}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      استيراد ملف آخر
                    </button>
                    <button
                      id="finish-excel-import-btn"
                      onClick={onClose}
                      className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                    >
                      إغلاق والعودة للوحة التحكم
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: Export */
            <div className="space-y-6 py-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  تصدير بيانات {resourceTitleAr}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  يمكنك استخراج كامل سجلات هذا القسم بضغطة زر وتنزيلها بصيغة XLSX متوافقة مع Excel أو CSV للربط مع أنظمة أخرى.
                </p>

                {/* Format selection */}
                <div className="mt-6 space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">اختر صيغة الملف:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                    <button
                      type="button"
                      onClick={() => setExportFormat("xlsx")}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-right transition ${
                        exportFormat === "xlsx"
                          ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Microsoft Excel (.xlsx)</div>
                        <div className="text-2xs text-slate-500 mt-0.5">منسق بالكامل مع عناوين واضحة</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat("csv")}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-right transition ${
                        exportFormat === "csv"
                          ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">CSV UTF-8 (.csv)</div>
                        <div className="text-2xs text-slate-500 mt-0.5">مناسب للمعالجة السريعة والـ Scripts</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    id="trigger-export-btn"
                    disabled={isExporting}
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        جاري تجهيز وتنزيل الملف...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        بدء تصدير وتنزيل الملف ({exportFormat.toUpperCase()})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
