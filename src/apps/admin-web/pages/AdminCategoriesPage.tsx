// ============================================================================
// Daleel Ay Khidma - Admin Categories Management
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { CategoryDTO } from "../../../packages/types";
import { Button, Input, Textarea, Modal, Skeleton } from "../../../packages/ui";
import {
  Tags,
  PlusCircle,
  Edit,
  Trash2,
  UtensilsCrossed,
  Stethoscope,
  CarFront,
  Laptop,
  Wrench,
  ShoppingBag,
  Building2,
  Sparkles,
  FileSpreadsheet,
  Download,
  Upload,
} from "lucide-react";
import { ExcelImportExportModal } from "../components/ExcelImportExportModal";

const ICON_MAP: Record<string, any> = {
  UtensilsCrossed,
  Stethoscope,
  CarFront,
  Laptop,
  Wrench,
  ShoppingBag,
};

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Excel Modal State
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("Building2");
  const [descAr, setDescAr] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);


  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (cat?: CategoryDTO) => {
    if (cat) {
      setEditingId(cat.id);
      setNameAr(cat.name_ar);
      setNameEn(cat.name_en);
      setSlug(cat.slug);
      setIcon(cat.icon);
      setDescAr(cat.description_ar);
      setSortOrder(cat.sort_order);
      setIsActive(cat.is_active);
    } else {
      setEditingId(null);
      setNameAr("");
      setNameEn("");
      setSlug("");
      setIcon("Building2");
      setDescAr("");
      setSortOrder(categories.length + 1);
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.updateCategory(editingId, {
          name_ar: nameAr,
          name_en: nameEn,
          slug,
          icon,
          description_ar: descAr,
          sort_order: sortOrder,
          is_active: isActive,
        });
      } else {
        await api.createCategory({
          name_ar: nameAr,
          name_en: nameEn,
          slug: slug || nameEn.toLowerCase().replace(/\s+/g, "-"),
          icon,
          description_ar: descAr,
          sort_order: sortOrder,
          is_active: isActive,
        });
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      alert(err.message || "فشل حفظ التصنيف");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف التصنيف: "${name}"؟`)) return;
    try {
      await api.deleteCategory(id);
      await loadCategories();
    } catch (err: any) {
      alert(err.message || "فشل حذف التصنيف");
    }
  };

  return (
    <div className="space-y-6 text-right pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة التصنيفات والقطاعات التجارية</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إضافة، تعديل، وترتيب القطاعات الخدمية وتعيين الأيقونات مع إمكانية الاستيراد والتصدير عبر Excel
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="open-categories-excel-modal-btn"
            onClick={() => setExcelModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            استيراد / تصدير Excel
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenModal()}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            إضافة تصنيف جديد
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const IconComp = ICON_MAP[cat.icon] || Building2;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name_ar)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{cat.name_ar}</h3>
                    <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{cat.description_ar}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>الأنشطة المسجلة: <strong className="text-slate-800">{cat.activities_count || 0}</strong></span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${cat.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {cat.is_active ? "نشط" : "معطل"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "تعديل بيانات التصنيف" : "إضافة تصنيف جديد"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="اسم التصنيف بالعربية"
            required
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
          />

          <Input
            label="اسم التصنيف بالإنجليزية"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />

          <Input
            label="الاسم اللطيف (Slug)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. medical-centers"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">الأيقونة</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-semibold outline-none"
            >
              <option value="UtensilsCrossed">مطاعم ومقاهي (UtensilsCrossed)</option>
              <option value="Stethoscope">طبي وصيدليات (Stethoscope)</option>
              <option value="CarFront">سيارات وصيانة (CarFront)</option>
              <option value="Laptop">تقنية وإلكترونيات (Laptop)</option>
              <option value="Wrench">حرف وصيانة منزلية (Wrench)</option>
              <option value="ShoppingBag">تسوق وتجزئة (ShoppingBag)</option>
            </select>
          </div>

          <Textarea
            label="الوصف"
            rows={3}
            value={descAr}
            onChange={(e) => setDescAr(e.target.value)}
          />

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>تفعيل التصنيف في الموقع</span>
            </label>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setModalOpen(false)}>
                إلغاء
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
                حفظ
              </Button>
            </div>
          </div>
        </form>
      </Modal>
      {/* Excel Import & Export Modal */}
      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        resourceType="categories"
        resourceTitleAr="التصنيفات والقطاعات التجارية"
        onImportPreview={async (rows) => {
          return await api.previewCategoriesImport({ rows });
        }}
        onImportExecute={async (rows) => {
          return await api.executeCategoriesImport({ rows });
        }}
        onExportFetch={async ({ format }) => {
          return await api.exportCategories({ format });
        }}
        onSuccessRefresh={() => {
          loadCategories();
        }}
      />
    </div>
  );
}
