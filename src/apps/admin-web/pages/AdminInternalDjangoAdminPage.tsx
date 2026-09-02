// ============================================================================
// Daleel Ay Khidma - Internal Django Admin (Universal Super-Admin Console)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import {
  Shield,
  Search,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Users,
  Key,
  History,
  Globe,
  Building2,
  MapPin,
  Layers,
  Tags,
  Store,
  ShoppingBag,
  Flame,
  Crown,
  CreditCard,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { ExcelImportExportModal } from "../components/ExcelImportExportModal";

const ICON_MAP: Record<string, any> = {
  Users,
  Shield,
  Key,
  History,
  Globe,
  Building2,
  MapPin,
  Layers,
  Tags,
  Store,
  ShoppingBag,
  Flame,
  Crown,
  CreditCard,
  MessageSquare,
  PhoneCall,
  FileSpreadsheet,
};

interface AppModelItem {
  key: string;
  name: string;
  verbose_name_plural: string;
  count: number;
  icon: string;
  readonly?: boolean;
}

interface AppSection {
  app_label: string;
  app_key: string;
  models: AppModelItem[];
}

export function AdminInternalDjangoAdminPage() {
  // Navigation State
  const [view, setView] = useState<"index" | "changelist" | "changeform">("index");
  const [currentApp, setCurrentApp] = useState<AppSection | null>(null);
  const [currentModel, setCurrentModel] = useState<AppModelItem | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  // App Summary Data
  const [modelsSummary, setModelsSummary] = useState<AppSection[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [totalSystemRecords, setTotalSystemRecords] = useState(0);

  // Changelist Data
  const [listData, setListData] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listMeta, setListMeta] = useState<{ total_count: number; page: number; page_size: number; total_pages: number }>({
    total_count: 0,
    page: 1,
    page_size: 25,
    total_pages: 1,
  });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Changeform Data
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loadingForm, setLoadingForm] = useState(false);
  const [savingForm, setSavingForm] = useState(false);

  // Excel Modal
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Load Summary
  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await api.getInternalAdminModelsSummary();
      if (res.data) {
        setModelsSummary(res.data.app_models || []);
        setTotalSystemRecords(res.data.total_records || 0);
      }
    } catch (err: any) {
      showToast(err.message || "فشل تحميل ملخص نماذج النظام", "error");
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  // 2. Load Changelist
  const loadChangelist = async (modelKey: string, page = 1, query = "") => {
    setLoadingList(true);
    setSelectedIds([]);
    try {
      const res = await api.getInternalAdminModelList(modelKey, {
        page,
        page_size: 25,
        q: query,
      });
      if (res.data) {
        setListData(res.data);
        if (res.meta) setListMeta(res.meta);
      }
    } catch (err: any) {
      showToast(err.message || "فشل تحميل السجلات", "error");
    } finally {
      setLoadingList(false);
    }
  };

  // 3. Open Changelist View
  const handleOpenChangelist = (app: AppSection, model: AppModelItem) => {
    setCurrentApp(app);
    setCurrentModel(model);
    setSearchQuery("");
    setView("changelist");
    loadChangelist(model.key, 1, "");
  };

  // 4. Open Change/Add Form
  const handleOpenForm = async (id?: number | string) => {
    if (!currentModel) return;
    setEditingId(id || null);
    setView("changeform");

    if (id) {
      setLoadingForm(true);
      try {
        const res = await api.getInternalAdminModelItem(currentModel.key, id);
        if (res.data) {
          setFormData(res.data);
        }
      } catch (err: any) {
        showToast("فشل جلب بيانات السجل: " + err.message, "error");
      } finally {
        setLoadingForm(false);
      }
    } else {
      // New Item template based on model
      setFormData({
        name_ar: "",
        name_en: "",
        is_active: true,
        sort_order: 1,
      });
      setLoadingForm(false);
    }
  };

  // 5. Save Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModel) return;
    setSavingForm(true);

    try {
      if (editingId) {
        await api.updateInternalAdminModelItem(currentModel.key, editingId, formData);
        showToast(`تم تحديث السجل #${editingId} بنجاح`);
      } else {
        const res = await api.createInternalAdminModelItem(currentModel.key, formData);
        showToast(`تم إنشاء سجل جديد #${res.data?.id || ""} بنجاح`);
      }
      setView("changelist");
      loadChangelist(currentModel.key, listMeta.page, searchQuery);
      loadSummary();
    } catch (err: any) {
      showToast(err.message || "فشل حفظ السجل", "error");
    } finally {
      setSavingForm(false);
    }
  };

  // 6. Delete Record
  const handleDeleteItem = async (id: number | string) => {
    if (!currentModel) return;
    if (!confirm(`هل أنت متأكد من رغبتك في حذف السجل #${id} نهائياً؟`)) return;

    try {
      await api.deleteInternalAdminModelItem(currentModel.key, id);
      showToast(`تم حذف السجل #${id} بنجاح`);
      loadChangelist(currentModel.key, listMeta.page, searchQuery);
      loadSummary();
    } catch (err: any) {
      showToast(err.message || "فشل حذف السجل", "error");
    }
  };

  // 7. Bulk Actions
  const handleExecuteBulkAction = async () => {
    if (!currentModel || !bulkAction || selectedIds.length === 0) return;
    if (!confirm(`تنفيذ الإجراء '${bulkAction}' على ${selectedIds.length} سجل محدد؟`)) return;

    setActionLoading(true);
    try {
      const res = await api.executeInternalAdminBulkAction(currentModel.key, bulkAction, selectedIds);
      showToast(res.message || "اكتمل الإجراء الجماعي بنجاح");
      setSelectedIds([]);
      setBulkAction("");
      loadChangelist(currentModel.key, listMeta.page, searchQuery);
      loadSummary();
    } catch (err: any) {
      showToast(err.message || "فشل الإجراء الجماعي", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === listData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listData.map((d) => d.id));
    }
  };

  const toggleSelectRow = (id: number | string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 text-right pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl px-5 py-3 shadow-xl text-xs font-bold text-white transition animate-in fade-in duration-200 ${
            toastMessage.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toastMessage.text}
        </div>
      )}

      {/* Django Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-inner font-black text-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wide text-white">
                  Django Administration
                </h1>
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-mono text-2xs font-bold text-indigo-300 border border-indigo-400/30">
                  Django Admin Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                لوحة التحكم الإدارية الموحدة — وصول مباشر وقوي لكافة الجداول والكيانات والنماذج بدون قيود
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setView("index");
                loadSummary();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              الرئيسية (Site Administration)
            </button>
            <div className="rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-mono text-emerald-400 border border-slate-800">
              {totalSystemRecords} Total DB Records
            </div>
          </div>
        </div>

        {/* Django Breadcrumb Bar */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800 pt-3 flex-wrap">
          <button
            onClick={() => setView("index")}
            className="text-indigo-400 hover:underline font-bold"
          >
            Home
          </button>
          {currentApp && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600 rotate-180" />
              <span className="text-slate-300 font-semibold">{currentApp.app_label}</span>
            </>
          )}
          {currentModel && view !== "index" && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600 rotate-180" />
              <button
                onClick={() => {
                  setView("changelist");
                  loadChangelist(currentModel.key);
                }}
                className="text-indigo-400 hover:underline font-bold"
              >
                {currentModel.verbose_name_plural}
              </button>
            </>
          )}
          {view === "changeform" && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600 rotate-180" />
              <span className="text-slate-200 font-bold">
                {editingId ? `Change #${editingId}` : "Add New Record"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DJANGO ADMIN HOME (SITE ADMINISTRATION) */}
      {/* ========================================================================= */}
      {view === "index" && (
        <div className="space-y-6">
          {loadingSummary ? (
            <div className="space-y-4">
              <div className="h-36 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-36 rounded-2xl bg-slate-200 animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modelsSummary.map((app) => (
                <div
                  key={app.app_key}
                  className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden"
                >
                  {/* App Header */}
                  <div className="bg-slate-800 px-5 py-3 text-white flex items-center justify-between">
                    <h3 className="text-sm font-black tracking-wide">{app.app_label}</h3>
                    <span className="text-2xs font-mono bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                      app: {app.app_key}
                    </span>
                  </div>

                  {/* Models Table */}
                  <div className="divide-y divide-slate-100">
                    {app.models.map((model) => {
                      const IconComp = ICON_MAP[model.icon] || Layers;
                      return (
                        <div
                          key={model.key}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              <IconComp className="h-4 w-4" />
                            </div>
                            <div>
                              <button
                                onClick={() => handleOpenChangelist(app, model)}
                                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline block text-right"
                              >
                                {model.verbose_name_plural}
                              </button>
                              <span className="text-2xs font-mono text-slate-400">
                                {model.name} (model: {model.key})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700">
                              {model.count}
                            </span>
                            {!model.readonly && (
                              <button
                                onClick={() => {
                                  setCurrentApp(app);
                                  setCurrentModel(model);
                                  handleOpenForm();
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-2xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
                                title={`Add new ${model.name}`}
                              >
                                <Plus className="h-3 w-3" />
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CHANGELIST (SELECT MODEL TO CHANGE) */}
      {/* ========================================================================= */}
      {view === "changelist" && currentModel && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">
                Select {currentModel.verbose_name_plural} to change
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-600">
                {listMeta.total_count} records
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Excel Import/Export Trigger */}
              {["categories", "locations", "products", "activities"].includes(currentModel.key) && (
                <button
                  onClick={() => setExcelModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Excel Import / Export
                </button>
              )}

              {!currentModel.readonly && (
                <button
                  onClick={() => handleOpenForm()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add {currentModel.name}
                </button>
              )}
            </div>
          </div>

          {/* Search and Bulk Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${currentModel.verbose_name_plural}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  loadChangelist(currentModel.key, 1, e.target.value);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-4 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Bulk Actions Dropdown */}
            {!currentModel.readonly && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-semibold">Action:</span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="">-------------------</option>
                  <option value="activate">تفعيل السجلات المحددة (Activate)</option>
                  <option value="deactivate">تعطيل السجلات المحددة (Deactivate)</option>
                  {currentModel.key === "activities" && (
                    <option value="verify">توثيق الأنشطة المحددة (Verify)</option>
                  )}
                  <option value="delete">حذف السجلات المحددة (Delete Selected)</option>
                </select>

                <button
                  disabled={!bulkAction || selectedIds.length === 0 || actionLoading}
                  onClick={handleExecuteBulkAction}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-40 transition shadow-2xs"
                >
                  {actionLoading ? "Processing..." : `Go (${selectedIds.length} selected)`}
                </button>
              </div>
            )}
          </div>

          {/* Changelist Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {loadingList ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
                <p className="text-xs font-bold">جاري تحميل سجلات النموذج...</p>
              </div>
            ) : listData.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">لا توجد سجلات مطابقة</p>
                <p className="text-xs text-slate-400 mt-1">جرّب تغيير كلمات البحث أو أضف سجلات جديدة.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="w-10 px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          {selectedIds.length === listData.length && listData.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">الاسم / العنوان</th>
                      <th className="px-4 py-3">البيانات الإضافية</th>
                      <th className="px-4 py-3">الحالة / التاريخ</th>
                      <th className="px-4 py-3 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listData.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      const title =
                        item.name_ar ||
                        item.name ||
                        item.title ||
                        item.code ||
                        item.email ||
                        `Record #${item.id}`;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50 transition ${
                            isSelected ? "bg-indigo-50/40" : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSelectRow(item.id)}
                              className="text-slate-400 hover:text-slate-800"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            #{item.id}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <button
                              onClick={() => handleOpenForm(item.id)}
                              className="text-indigo-600 hover:text-indigo-900 hover:underline font-bold text-right"
                            >
                              {title}
                            </button>
                            {item.name_en && (
                              <div className="text-2xs text-slate-400 font-mono mt-0.5">
                                {item.name_en}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.slug && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-2xs text-slate-600 mr-1">
                                /{item.slug}
                              </span>
                            )}
                            {item.code && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-2xs text-slate-600 mr-1">
                                {item.code}
                              </span>
                            )}
                            {item.phone && (
                              <span className="text-2xs text-slate-500 mr-1">
                                📞 {item.phone}
                              </span>
                            )}
                            {item.price !== undefined && (
                              <span className="text-2xs font-bold text-emerald-700 mr-1">
                                {item.price} ج.م
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {item.is_active !== undefined ? (
                              <span
                                className={`rounded-full px-2 py-0.5 text-2xs font-bold ${
                                  item.is_active
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {item.is_active ? "Active" : "Disabled"}
                              </span>
                            ) : item.created_at ? (
                              <span className="text-2xs font-mono text-slate-400">
                                {item.created_at.substring(0, 10)}
                              </span>
                            ) : (
                              <span className="text-2xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenForm(item.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {!currentModel.readonly && (
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {listMeta.total_pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Showing page {listMeta.page} of {listMeta.total_pages} ({listMeta.total_count} total entries)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={listMeta.page <= 1}
                    onClick={() => loadChangelist(currentModel.key, listMeta.page - 1, searchQuery)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    السابق
                  </button>
                  <button
                    disabled={listMeta.page >= listMeta.total_pages}
                    onClick={() => loadChangelist(currentModel.key, listMeta.page + 1, searchQuery)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CHANGE FORM / ADD FORM */}
      {/* ========================================================================= */}
      {view === "changeform" && currentModel && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {editingId ? `Change ${currentModel.name} #${editingId}` : `Add new ${currentModel.name}`}
              </h2>
              <p className="text-xs text-slate-500">
                قم بتعديل الحقول أدناه ثم اضغط حفظ لتطبيق التغييرات وتحديث سجل التدقيق
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView("changelist")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              العودة للقائمة
            </button>
          </div>

          {loadingForm ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
              <p className="text-xs font-bold">جاري تحميل بيانات السجل...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveForm} className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                  الحقول الأساسية (Model Fieldsets)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(formData).map(([key, val]) => {
                    if (["id", "created_at", "updated_at"].includes(key)) return null;

                    const isBool = typeof val === "boolean" || key.startsWith("is_") || key.startsWith("has_");
                    const isNum = typeof val === "number" || key.endsWith("_id") || key.endsWith("_count");

                    if (isBool) {
                      return (
                        <div key={key} className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id={`field-${key}`}
                            checked={Boolean(formData[key])}
                            onChange={(e) =>
                              setFormData({ ...formData, [key]: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor={`field-${key}`}
                            className="text-xs font-bold text-slate-700 cursor-pointer"
                          >
                            {key} (نعم / لا)
                          </label>
                        </div>
                      );
                    }

                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          {key}
                        </label>
                        {typeof val === "string" && val.length > 80 ? (
                          <textarea
                            rows={3}
                            value={formData[key] || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, [key]: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:bg-white outline-none"
                          />
                        ) : (
                          <input
                            type={isNum ? "number" : "text"}
                            value={formData[key] !== undefined ? formData[key] : ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [key]: isNum ? Number(e.target.value) : e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:bg-white outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions Toolbar (Django Admin Style) */}
              <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl shadow-md text-white">
                <div>
                  {editingId && !currentModel.readonly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(editingId)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-red-600/80 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setView("changelist")}
                    className="rounded-xl border border-slate-600 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingForm}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
                  >
                    {savingForm ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Excel Modal if triggered from Django Admin */}
      {currentModel && ["categories", "locations", "products", "activities"].includes(currentModel.key) && (
        <ExcelImportExportModal
          isOpen={excelModalOpen}
          onClose={() => setExcelModalOpen(false)}
          resourceType={currentModel.key as any}
          resourceTitleAr={currentModel.verbose_name_plural}
          onImportPreview={async (rows) => {
            if (currentModel.key === "categories") return await api.previewCategoriesImport({ rows });
            if (currentModel.key === "locations") return await api.previewLocationsImport({ rows });
            return await api.previewProductImport({ activity_id: 1, rows });
          }}
          onImportExecute={async (rows) => {
            if (currentModel.key === "categories") return await api.executeCategoriesImport({ rows });
            if (currentModel.key === "locations") return await api.executeLocationsImport({ rows });
            return await api.executeProductImport({ activity_id: 1, rows });
          }}
          onExportFetch={async ({ format }) => {
            if (currentModel.key === "categories") return await api.exportCategories({ format });
            if (currentModel.key === "locations") return await api.exportLocations({ format });
            return await api.exportProducts({ format });
          }}
          onSuccessRefresh={() => {
            loadChangelist(currentModel.key, listMeta.page, searchQuery);
            loadSummary();
          }}
        />
      )}
    </div>
  );
}
