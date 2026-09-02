// ============================================================================
// Daleel Ay Khidma - Admin Activities Management & Verification
// (Hierarchical Geography, Directory Sections & Delivery Management)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { useAuth } from "../../../packages/auth";
import { ActivityDTO, CategoryDTO, LocationDTO, CityDTO, NeighborhoodDTO, DirectorySectionDTO } from "../../../packages/types";
import { ACTIVITY_STATUS_MAP } from "../../../packages/core";
import { Button, Input, Select, Textarea, Modal, Pagination, Badge, Skeleton, RatingStars } from "../../../packages/ui";
import {
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Filter,
  PlusCircle,
  Eye,
  Trash2,
  Edit,
  ShieldCheck,
  AlertTriangle,
  Bike,
  Building2,
  Home,
  Tag,
  Clock,
  Phone,
  MessageCircle,
  FileSpreadsheet,
} from "lucide-react";
import { ExcelImportExportModal } from "../components/ExcelImportExportModal";

export function AdminActivitiesPage() {
  const { user, isGeoRestricted, can } = useAuth();
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityDTO[]>([]);

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [cities, setCities] = useState<CityDTO[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodDTO[]>([]);
  const [sections, setSections] = useState<DirectorySectionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [locationId, setLocationId] = useState<string>("all");
  const [cityId, setCityId] = useState<string>("all");
  const [neighborhoodId, setNeighborhoodId] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Moderate Modal
  const [selectedActivity, setSelectedActivity] = useState<ActivityDTO | null>(null);
  const [moderateAction, setModerateAction] = useState<"verify" | "reject" | "suspend">("verify");
  const [moderateNotes, setModerateNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit / Create Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNameAr, setFormNameAr] = useState("");
  const [formCategory, setFormCategory] = useState<number>(1);
  const [formLocation, setFormLocation] = useState<number>(1);
  const [formCity, setFormCity] = useState<number>(1);
  const [formNeighborhood, setFormNeighborhood] = useState<number>(1);
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCover, setFormCover] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);

  // Delivery Form Fields
  const [formHasDelivery, setFormHasDelivery] = useState(true);
  const [formDeliveryFeeFrom, setFormDeliveryFeeFrom] = useState<number>(15);
  const [formDeliveryFeeTo, setFormDeliveryFeeTo] = useState<number>(30);
  const [formDeliveryEstTime, setFormDeliveryEstTime] = useState("30 - 45 دقيقة");
  const [formDeliveryNotes, setFormDeliveryNotes] = useState("توصيل سريع لكافة أرجاء الحي");
  const [formWhatsappOrders, setFormWhatsappOrders] = useState(true);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, lRes, citRes, neiRes, secRes] = await Promise.all([
          api.getCategories(),
          api.getLocations(),
          api.getCities(),
          api.getNeighborhoods(),
          api.getSections().catch(() => ({ success: true, data: [] })),
        ]);
        if (cRes.data) setCategories(cRes.data);
        if (lRes.data) setLocations(lRes.data);
        if (citRes.data) setCities(citRes.data);
        if (neiRes.data) setNeighborhoods(neiRes.data);
        if (secRes.data) setSections(secRes.data);
      } catch (err) {
        console.error("Meta error:", err);
      }
    }
    loadMeta();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await api.getActivities({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category_id: categoryId !== "all" ? categoryId : undefined,
        location_id: locationId !== "all" ? locationId : undefined,
        city_id: cityId !== "all" ? cityId : undefined,
        neighborhood_id: neighborhoodId !== "all" ? neighborhoodId : undefined,
        section_id: sectionFilter !== "all" ? sectionFilter : undefined,
        has_delivery: deliveryFilter === "yes" ? true : deliveryFilter === "no" ? false : undefined,
        page: currentPage,
        per_page: 10,
      });
      if (res.results) {
        setActivities(res.results);
        setTotalCount(res.count);
        setLastPage(res.last_page);
      }
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [
    search,
    statusFilter,
    sectionFilter,
    categoryId,
    locationId,
    cityId,
    neighborhoodId,
    deliveryFilter,
    currentPage,
    user,
  ]);

  const handleModerateSubmit = async () => {
    if (!selectedActivity) return;
    setSubmitting(true);
    try {
      await api.verifyActivity(selectedActivity.id, moderateAction, moderateNotes, moderateNotes);
      await loadActivities();
      setSelectedActivity(null);
      setModerateNotes("");
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء تنفيذ الإجراء");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (act?: ActivityDTO) => {
    if (act) {
      setEditingId(act.id);
      setFormNameAr(act.name_ar);
      setFormCategory(act.category_id);
      setFormLocation(act.governorate_id || act.location_id);
      setFormCity(act.city_id || cities.find(c => c.governorate_id === (act.governorate_id || act.location_id))?.id || 1);
      setFormNeighborhood(act.neighborhood_id || neighborhoods.find(n => n.city_id === act.city_id)?.id || 1);
      setFormAddress(act.address_ar);
      setFormPhone(act.phone || "");
      setFormDesc(act.description_ar || "");
      setFormCover(act.cover_image);
      setFormFeatured(act.is_featured);

      // Delivery values
      setFormHasDelivery(act.has_delivery ?? true);
      setFormDeliveryFeeFrom(act.delivery_fee_from ?? 15);
      setFormDeliveryFeeTo(act.delivery_fee_to ?? 30);
      setFormDeliveryEstTime(act.delivery_estimated_time || "30 - 45 دقيقة");
      setFormDeliveryNotes(act.delivery_notes || "");
      setFormWhatsappOrders(act.whatsapp_orders_enabled ?? true);
    } else {
      const defaultGov = user?.location_id || locations[0]?.id || 1;
      const defaultCity = cities.find(c => c.governorate_id === defaultGov)?.id || cities[0]?.id || 1;
      const defaultNeigh = neighborhoods.find(n => n.city_id === defaultCity)?.id || neighborhoods[0]?.id || 1;

      setEditingId(null);
      setFormNameAr("");
      setFormCategory(categories[0]?.id || 1);
      setFormLocation(defaultGov);
      setFormCity(defaultCity);
      setFormNeighborhood(defaultNeigh);
      setFormAddress("");
      setFormPhone("");
      setFormDesc("");
      setFormCover("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800");
      setFormFeatured(false);

      // Default Delivery values
      setFormHasDelivery(true);
      setFormDeliveryFeeFrom(15);
      setFormDeliveryFeeTo(30);
      setFormDeliveryEstTime("25 - 40 دقيقة");
      setFormDeliveryNotes("خدمة توصيل فورية متاحة");
      setFormWhatsappOrders(true);
    }
    setEditModalOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name_ar: formNameAr,
        category_id: formCategory,
        location_id: formLocation,
        governorate_id: formLocation,
        city_id: formCity,
        neighborhood_id: formNeighborhood,
        address_ar: formAddress,
        phone: formPhone,
        description_ar: formDesc,
        cover_image: formCover,
        is_featured: formFeatured,
        has_delivery: formHasDelivery,
        delivery_fee_from: formHasDelivery ? Number(formDeliveryFeeFrom) : 0,
        delivery_fee_to: formHasDelivery ? Number(formDeliveryFeeTo) : 0,
        delivery_estimated_time: formHasDelivery ? formDeliveryEstTime : "",
        delivery_notes: formHasDelivery ? formDeliveryNotes : "",
        whatsapp_orders_enabled: formWhatsappOrders,
      };

      if (editingId) {
        await api.updateActivity(editingId, payload);
      } else {
        await api.createActivity(payload);
      }
      setEditModalOpen(false);
      await loadActivities();
    } catch (err: any) {
      alert(err.message || "فشل حفظ النشاط التجاري");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف النشاط: "${name}" نهائياً؟`)) return;
    try {
      await api.deleteActivity(id);
      await loadActivities();
    } catch (err: any) {
      alert(err.message || "فشل حذف النشاط");
    }
  };

  // Filtered Cities and Neighborhoods for Modal
  const availableModalCities = cities.filter(c => c.governorate_id === formLocation);
  const availableModalNeighborhoods = neighborhoods.filter(n => n.city_id === formCity);

  return (
    <div className="space-y-6 text-right pb-16">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة وتوثيق الأنشطة والمتاجر</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة الهيكل الجغرافي بالأحياء، الأقسام الرئيسية، وحالات التوصيل السريع والتوثيق
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="open-activities-excel-modal-btn"
            onClick={() => setExcelModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            استيراد / تصدير الأنشطة والمتاجر (Excel)
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenEdit()}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            إضافة نشاط تجاري جديد
          </Button>
        </div>
      </div>

      {/* Geo-Scope Warning when active */}
      {isGeoRestricted && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">تنبيه النطاق الجغرافي النشط: </span>
              أنت مقيّد بمحافظة ({user?.location_name_ar}). يتم تطبيق فلتر النطاق تلقائياً على كافة الاستعلامات.
            </div>
          </div>
          <span className="font-mono bg-amber-100 px-2 py-0.5 rounded text-[11px] font-bold">
            WHERE location_id = {user?.location_id}
          </span>
        </div>
      )}

      {/* Advanced Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="بحث باسم النشاط أو الهاتف أو العنوان..."
              className="w-full bg-slate-50 text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Directory Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-900"
          >
            <option value="all">📂 كافة الأقسام الرئيسية (5)</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_ar}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة الحالات</option>
            <option value="verified">موثق ومعتمد</option>
            <option value="pending">قيد المراجعة</option>
            <option value="rejected">مرفوض</option>
            <option value="suspended">موقوف مؤقتاً</option>
          </select>

          {/* Delivery Filter */}
          <select
            value={deliveryFilter}
            onChange={(e) => {
              setDeliveryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500 text-emerald-800"
          >
            <option value="all">🛵 خدمة التوصيل (الكل)</option>
            <option value="yes">🛵 خدمة التوصيل متاحة فقط</option>
            <option value="no">🏬 استلام من الفرع فقط</option>
          </select>
        </div>

        {/* 3-Tier Geo Hierarchy Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          {!isGeoRestricted && (
            <select
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                setCityId("all");
                setNeighborhoodId("all");
                setCurrentPage(1);
              }}
              className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">📍 1. كافة المحافظات</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name_ar}
                </option>
              ))}
            </select>
          )}

          <select
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
              setNeighborhoodId("all");
              setCurrentPage(1);
            }}
            className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">🏙️ 2. كافة المدن / المراكز</option>
            {cities
              .filter((c) => locationId === "all" || c.governorate_id === Number(locationId))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                </option>
              ))}
          </select>

          <select
            value={neighborhoodId}
            onChange={(e) => {
              setNeighborhoodId(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">🏘️ 3. كافة الأحياء السكنية</option>
            {neighborhoods
              .filter((n) => {
                if (cityId !== "all") return n.city_id === Number(cityId);
                if (locationId !== "all") return n.governorate_id === Number(locationId);
                return true;
              })
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name_ar}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-semibold">
            لم يتم العثور على أنشطة مطابقة لشروط البحث أو النطاق الجغرافي المحدد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">النشاط التجاري</th>
                  <th className="p-3.5">القسم / التصنيف</th>
                  <th className="p-3.5">النطاق الجغرافي (محافظة / مدينة / حي)</th>
                  <th className="p-3.5">خدمة التوصيل</th>
                  <th className="p-3.5">حالة التوثيق</th>
                  <th className="p-3.5">التقييم / المشاهدات</th>
                  <th className="p-3.5 text-left">إجراءات الإشراف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activities.map((act) => {
                  const statusInfo = ACTIVITY_STATUS_MAP[act.status] || ACTIVITY_STATUS_MAP.pending;
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={act.cover_image} alt="" className="w-11 h-11 rounded-xl object-cover" />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{act.name_ar}</span>
                              {act.is_featured && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  مميز
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{act.address_ar}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {act.section && (
                            <span className="block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                              {act.section.name_ar}
                            </span>
                          )}
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                            {act.category?.name_ar}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{act.neighborhood?.name_ar || act.city?.name_ar || act.location?.name_ar}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {act.city?.name_ar} • {act.governorate?.name_ar || act.location?.name_ar}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {act.has_delivery ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Bike className="w-3 h-3" />
                              <span>توصيل متاح</span>
                            </span>
                            {act.delivery_estimated_time && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{act.delivery_estimated_time}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            🏢 بالفرع فقط
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <RatingStars rating={act.rating_avg} reviewsCount={act.reviews_count} size="sm" />
                          <div className="text-[10px] text-slate-400">{act.views_count.toLocaleString()} مشاهدة</div>
                        </div>
                      </td>
                      <td className="p-3.5 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {act.status !== "verified" && (
                            <Button
                              variant="emerald"
                              size="sm"
                              onClick={() => {
                                setSelectedActivity(act);
                                setModerateAction("verify");
                                setModerateNotes("تم استيفاء شروط التوثيق الميداني والسجل التجاري.");
                              }}
                            >
                              توثيق
                            </Button>
                          )}
                          {act.status !== "rejected" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedActivity(act);
                                setModerateAction("reject");
                                setModerateNotes("بيانات غير مستوفية للشروط الميدانية.");
                              }}
                            >
                              رفض
                            </Button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(act)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                            title="تعديل النشاط"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(act.id, act.name_ar)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            totalItems={totalCount}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Moderation Decision Modal */}
      <Modal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title={moderateAction === "verify" ? "اعتماد وتوثيق رسمي" : "رفض / إيقاف النشاط"}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            تأكيد الإجراء للنشاط: <strong className="font-bold text-slate-900">{selectedActivity?.name_ar}</strong>
          </p>

          <Textarea
            label="ملاحظات القرار والتدقيق (تسجل في الـ Audit Log)"
            rows={3}
            value={moderateNotes}
            onChange={(e) => setModerateNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedActivity(null)}>
              إلغاء
            </Button>
            <Button
              variant={moderateAction === "verify" ? "emerald" : "danger"}
              size="sm"
              onClick={handleModerateSubmit}
              isLoading={submitting}
            >
              تأكيد القرار
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit / Create Activity Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={editingId ? "تعديل بيانات النشاط التجاري" : "إضافة نشاط تجاري جديد"}
      >
        <form onSubmit={handleSaveActivity} className="space-y-4 max-h-[80vh] overflow-y-auto pl-1 pr-1">
          <Input
            label="اسم النشاط بالعربية"
            required
            value={formNameAr}
            onChange={(e) => setFormNameAr(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">التصنيف التجاري</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(Number(e.target.value))}
              className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* 3-Tier Geography Cascading Pickers */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>الموقع الجغرافي التفصيلي (محافظة ← مدينة ← حي)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">المحافظة</label>
                <select
                  value={formLocation}
                  onChange={(e) => {
                    const newGovId = Number(e.target.value);
                    setFormLocation(newGovId);
                    const matchingCity = cities.find(c => c.governorate_id === newGovId);
                    if (matchingCity) {
                      setFormCity(matchingCity.id);
                      const matchingNeigh = neighborhoods.find(n => n.city_id === matchingCity.id);
                      if (matchingNeigh) setFormNeighborhood(matchingNeigh.id);
                    }
                  }}
                  className="w-full bg-white text-xs px-2.5 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">المدينة / المركز</label>
                <select
                  value={formCity}
                  onChange={(e) => {
                    const newCityId = Number(e.target.value);
                    setFormCity(newCityId);
                    const matchingNeigh = neighborhoods.find(n => n.city_id === newCityId);
                    if (matchingNeigh) setFormNeighborhood(matchingNeigh.id);
                  }}
                  className="w-full bg-white text-xs px-2.5 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableModalCities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">الحي السكني</label>
                <select
                  value={formNeighborhood}
                  onChange={(e) => setFormNeighborhood(Number(e.target.value))}
                  className="w-full bg-white text-xs px-2.5 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableModalNeighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Input
            label="العنوان التفصيلي واسم الشارع"
            required
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="رقم الهاتف"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
            <Input
              label="رابط صورة الغلاف"
              value={formCover}
              onChange={(e) => setFormCover(e.target.value)}
            />
          </div>

          <Textarea
            label="الوصف التجاري"
            rows={2}
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />

          {/* Delivery & Ordering Options */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-emerald-600" />
                <span>إعدادات خدمة التوصيل (Delivery Options)</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800">
                <input
                  type="checkbox"
                  checked={formHasDelivery}
                  onChange={(e) => setFormHasDelivery(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>خدمة التوصيل متاحة للعملاء</span>
              </label>
            </div>

            {formHasDelivery && (
              <div className="space-y-3 pt-2 border-t border-emerald-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="رسوم التوصيل التقديرية (من ج.م)"
                    type="number"
                    value={formDeliveryFeeFrom}
                    onChange={(e) => setFormDeliveryFeeFrom(Number(e.target.value))}
                  />
                  <Input
                    label="رسوم التوصيل التقديرية (إلى ج.م)"
                    type="number"
                    value={formDeliveryFeeTo}
                    onChange={(e) => setFormDeliveryFeeTo(Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="مدة التوصيل المتوقعة"
                    value={formDeliveryEstTime}
                    onChange={(e) => setFormDeliveryEstTime(e.target.value)}
                    placeholder="مثال: 30 - 45 دقيقة"
                  />
                  <Input
                    label="ملاحظات ونطاق التوصيل"
                    value={formDeliveryNotes}
                    onChange={(e) => setFormDeliveryNotes(e.target.value)}
                    placeholder="مثال: توصيل مجاني للطلبات فوق 200 ج"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 bg-white p-2 rounded-xl border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={formWhatsappOrders}
                    onChange={(e) => setFormWhatsappOrders(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تفعيل استقبال طلبات التوصيل عبر واتساب مباشرة</span>
                  </span>
                </label>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={formFeatured}
              onChange={(e) => setFormFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>تمييز النشاط (Featured) في الواجهة الرئيسية</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              حفظ النشاط
            </Button>
          </div>
        </form>
      </Modal>

      {/* Excel Import & Export Modal */}
      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        resourceType="activities"
        resourceTitleAr="الأنشطة والمتاجر التجارية"
        onImportPreview={async (rows) => {
          return await api.previewProductImport({ activity_id: 1, rows });
        }}
        onImportExecute={async (rows) => {
          return await api.executeProductImport({ activity_id: 1, rows });
        }}
        onExportFetch={async ({ format }) => {
          return await api.exportProducts({ format });
        }}
        onSuccessRefresh={() => {
          loadActivities();
        }}
      />
    </div>
  );
}

