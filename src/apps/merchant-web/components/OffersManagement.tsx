// ============================================================================
// Daleel Ay Khidma - Merchant Offers & Promotions Management (إدارة العروض الترويجية)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import {
  OfferDTO,
  ActivityDTO,
  ProductDTO,
  MerchantSubscriptionInfoDTO,
} from "../../../packages/types";
import {
  Button,
  Badge,
  Input,
  Select,
  Textarea,
  Modal,
} from "../../../packages/ui";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  Percent,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Flame,
  ArrowRight,
  Lock,
  Search,
  Filter,
} from "lucide-react";

interface OffersManagementProps {
  activities: ActivityDTO[];
  products: ProductDTO[];
  subscriptionInfo?: MerchantSubscriptionInfoDTO | null;
  onUpgradePlan?: () => void;
}

export function OffersManagement({
  activities,
  products,
  subscriptionInfo,
  onUpgradePlan,
}: OffersManagementProps) {
  const [offers, setOffers] = useState<OfferDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    activity_id: activities.length > 0 ? activities[0].id : 0,
    product_id: "" as string | number,
    title: "",
    description: "",
    offer_type: "percentage" as "percentage" | "fixed_price" | "bundle",
    discount_percentage: "20",
    discount_amount: "",
    original_price: "",
    offer_price: "",
    starts_at: new Date().toISOString().slice(0, 16),
    ends_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 16),
    is_active: true,
    is_featured: false,
    cover_image: "",
    terms: "العرض ساري حتى نفاد الكمية أو انتهاء المدة المحددة.",
  });

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await api.getMerchantOffers();
      if (res.success) {
        setOffers(res.data);
      }
    } catch (err) {
      console.error("Failed to load offers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const canCreateOffers = subscriptionInfo?.plan?.limits?.can_create_offers ?? true;

  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    setFormError("");
    setFormData({
      activity_id: activities.length > 0 ? activities[0].id : 0,
      product_id: "",
      title: "",
      description: "",
      offer_type: "percentage",
      discount_percentage: "20",
      discount_amount: "",
      original_price: "",
      offer_price: "",
      starts_at: new Date().toISOString().slice(0, 16),
      ends_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 16),
      is_active: true,
      is_featured: false,
      cover_image: "",
      terms: "العرض ساري حتى نفاد الكمية أو انتهاء المدة المحددة.",
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (offer: OfferDTO) => {
    setEditingOffer(offer);
    setFormError("");
    setFormData({
      activity_id: offer.activity_id,
      product_id: offer.product_id || "",
      title: offer.title,
      description: offer.description,
      offer_type: offer.offer_type,
      discount_percentage: offer.discount_percentage ? String(offer.discount_percentage) : "",
      discount_amount: offer.discount_amount ? String(offer.discount_amount) : "",
      original_price: offer.original_price ? String(offer.original_price) : "",
      offer_price: offer.offer_price ? String(offer.offer_price) : "",
      starts_at: offer.starts_at.slice(0, 16),
      ends_at: offer.ends_at.slice(0, 16),
      is_active: offer.is_active,
      is_featured: offer.is_featured,
      cover_image: offer.cover_image,
      terms: offer.terms || "",
    });
    setModalOpen(true);
  };

  // Product Selection auto fills price & image
  const handleProductSelect = (productIdStr: string) => {
    const pId = productIdStr ? Number(productIdStr) : "";
    setFormData((prev) => {
      const selectedProd = products.find((p) => p.id === pId);
      if (selectedProd) {
        const origPrice = selectedProd.price;
        const discountPct = Number(prev.discount_percentage) || 20;
        const calcOfferPrice = Math.round(origPrice * (1 - discountPct / 100));
        return {
          ...prev,
          product_id: pId,
          title: prev.title || `خصم خاص على ${selectedProd.name}`,
          description: prev.description || `استمتع بخصم رائع على ${selectedProd.name} لفترة محدودة!`,
          original_price: String(origPrice),
          offer_price: String(calcOfferPrice),
          cover_image: selectedProd.cover_image,
        };
      }
      return { ...prev, product_id: pId };
    });
  };

  // Discount percentage auto calculate offer price
  const handleDiscountPctChange = (pctStr: string) => {
    const pct = Number(pctStr) || 0;
    setFormData((prev) => {
      const orig = Number(prev.original_price) || 0;
      const calcOffer = orig > 0 ? Math.round(orig * (1 - pct / 100)) : "";
      return {
        ...prev,
        discount_percentage: pctStr,
        offer_price: String(calcOffer),
      };
    });
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity_id || !formData.title || !formData.description) {
      setFormError("يرجى ملء جميع الحقول الإلزامية (النشاط، العنوان، والوصف).");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const payload: any = {
        activity_id: formData.activity_id,
        product_id: formData.product_id ? Number(formData.product_id) : undefined,
        title: formData.title,
        description: formData.description,
        offer_type: formData.offer_type,
        discount_percentage: formData.discount_percentage ? Number(formData.discount_percentage) : undefined,
        discount_amount: formData.discount_amount ? Number(formData.discount_amount) : undefined,
        original_price: formData.original_price ? Number(formData.original_price) : undefined,
        offer_price: formData.offer_price ? Number(formData.offer_price) : undefined,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString(),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        cover_image: formData.cover_image || undefined,
        terms: formData.terms,
      };

      if (editingOffer) {
        const res = await api.updateOffer(editingOffer.id, payload);
        if (res.success) {
          setModalOpen(false);
          loadOffers();
        }
      } else {
        const res = await api.createOffer(payload);
        if (res.success) {
          setModalOpen(false);
          loadOffers();
        }
      }
    } catch (err: any) {
      setFormError(err.message || "حدث خطأ أثناء حفظ العرض الترويجي.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (offer: OfferDTO) => {
    try {
      await api.toggleOfferActive(offer.id);
      loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeature = async (offer: OfferDTO) => {
    try {
      await api.toggleOfferFeatured(offer.id);
      loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا العرض الترويجي نهائياً؟")) {
      try {
        await api.deleteOffer(offerId);
        loadOffers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filtered List
  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase());
    const matchesActivity =
      selectedActivityFilter === "all" || o.activity_id === Number(selectedActivityFilter);
    return matchesSearch && matchesActivity;
  });

  return (
    <div className="space-y-6">
      {/* Header & Limits Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" />
            إدارة العروض الترويجية والخصومات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أنشئ تخفيضات وعروضاً موسمية لجذب آلاف العملاء في منطقتك وزيادة مبيعاتك
          </p>
        </div>

        {canCreateOffers ? (
          <Button
            onClick={handleOpenCreateModal}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            إنشاء عرض ترويجي جديد
          </Button>
        ) : (
          <Button
            onClick={onUpgradePlan}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-sm"
          >
            <Sparkles className="w-4 h-4 ml-1.5" />
            ترقية الخطة لإضافة العروض
          </Button>
        )}
      </div>

      {/* Plan Feature Notice */}
      {!canCreateOffers && (
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/50 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-bold text-slate-900">
              قسم العروض والخصومات متاح في الخطة الاحترافية (Pro)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              تتيح لك الخطة الاحترافية نشر عروض حصرية تظهر في شريط الصفحة الرئيسية المتميز، وتنبيهات العملاء القريبين، مما يضاعف زيارات وتواصل العملاء لنشاطك.
            </p>
            {onUpgradePlan && (
              <Button
                size="sm"
                onClick={onUpgradePlan}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                <Sparkles className="w-4 h-4 ml-1" />
                ترقية خطتك الآن
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
          <input
            type="text"
            placeholder="بحث في العروض المنشورة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            label=""
            value={selectedActivityFilter}
            onChange={(e) => setSelectedActivityFilter(e.target.value)}
            options={[
              { value: "all", label: "جميع الأنشطة والمحلات" },
              ...activities.map((a) => ({ value: a.id, label: a.name_ar })),
            ]}
          />
        </div>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Flame className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800">لا توجد عروض ترويجية منشورة حالياً</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              أضف أول عرض ترويجي أو خصم خاص على منتجاتك ليظهر للعملاء في دليل أي خدمة!
            </p>
          </div>
          {canCreateOffers && (
            <Button
              onClick={handleOpenCreateModal}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              <Plus className="w-4 h-4 ml-1" />
              إنشاء أول عرض الآن
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const isExpired = offer.ends_at ? new Date(offer.ends_at).getTime() < Date.now() : false;
            const daysLeft = offer.ends_at ? Math.ceil((new Date(offer.ends_at).getTime() - Date.now()) / (1000 * 3600 * 24)) : 30;

            return (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between ${
                  !offer.is_active || isExpired ? "border-slate-200 opacity-75" : "border-slate-200 hover:border-rose-300"
                }`}
              >
                <div>
                  {/* Banner Image & Badges */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden group">
                    <img
                      src={offer.cover_image}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                    {/* Discount Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {offer.discount_percentage ? (
                        <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-full shadow-md flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          خصم {offer.discount_percentage}%
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full shadow-md">
                          عرض خاص
                        </span>
                      )}

                      {offer.is_featured && (
                        <span className="px-2.5 py-1 bg-amber-400 text-amber-950 text-xs font-black rounded-full shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          مميز
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div className="absolute top-3 left-3">
                      {isExpired ? (
                        <Badge variant="red" size="sm">
                          منتهي الصلاحية
                        </Badge>
                      ) : !offer.is_active ? (
                        <Badge variant="slate" size="sm">
                          معطل مؤقتاً
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="sm">
                          ساري (متبقي {daysLeft} يوم)
                        </Badge>
                      )}
                    </div>

                    {/* Pricing in overlay */}
                    <div className="absolute bottom-3 right-3 text-white">
                      <div className="flex items-baseline gap-2">
                        {offer.offer_price !== null && (
                          <span className="text-xl font-black text-white">
                            {offer.offer_price} ج.م
                          </span>
                        )}
                        {offer.original_price !== null && (
                          <span className="text-xs line-through text-slate-300 font-semibold">
                            {offer.original_price} ج.م
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-xs text-sky-600 font-bold block mb-1">
                        {offer.activity?.name_ar || "النشاط التجاري"}
                        {offer.product ? ` • منتج: ${offer.product.name}` : ""}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {offer.description}
                      </p>
                    </div>

                    {/* Dates & Views Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        حتى: {offer.ends_at ? new Date(offer.ends_at).toLocaleDateString("ar-EG") : "مستمر"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {offer.views_count} مشاهدة
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(offer)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        offer.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {offer.is_active ? "تفعيل: نشط" : "معطل"}
                    </button>
                    <button
                      onClick={() => handleToggleFeature(offer)}
                      title="تمييز في أعلى الدليل"
                      className={`p-1.5 rounded-lg border transition-colors ${
                        offer.is_featured
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-white text-slate-400 border-slate-200 hover:text-amber-600"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(offer)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300"
                      title="تعديل العرض"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT OFFER MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOffer ? "تعديل العرض الترويجي" : "إنشاء عرض ترويجي جديد"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveOffer} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Activity Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="النشاط التجاري المرتبط *"
              value={formData.activity_id}
              onChange={(e) => setFormData({ ...formData, activity_id: Number(e.target.value) })}
              options={activities.map((a) => ({ value: a.id, label: a.name_ar }))}
              required
            />

            <Select
              label="ربط بمنتج محدد (اختياري)"
              value={formData.product_id}
              onChange={(e) => handleProductSelect(e.target.value)}
              options={[
                { value: "", label: "عرض عام على النشاط / الخدمات" },
                ...products
                  .filter((p) => p.activity_id === formData.activity_id)
                  .map((p) => ({ value: p.id, label: `${p.name} (${p.price} ج.م)` })),
              ]}
            />
          </div>

          {/* Offer Title */}
          <Input
            label="عنوان العرض الترويجي *"
            placeholder="مثال: خصم 30% على جميع وجبات الغداء العائلية"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          {/* Description */}
          <Textarea
            label="تفاصيل ووصف العرض *"
            placeholder="اكتب وصفاً جذاباً يشرح مزايا العرض وما يتضمنه..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          {/* Pricing & Discount Math */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-rose-500" />
              حساب الخصم والأسعار
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="نسبة الخصم (%)"
                type="number"
                placeholder="20"
                value={formData.discount_percentage}
                onChange={(e) => handleDiscountPctChange(e.target.value)}
              />

              <Input
                label="السعر الأصلي (ج.م)"
                type="number"
                placeholder="100"
                value={formData.original_price}
                onChange={(e) => {
                  const orig = e.target.value;
                  const pct = Number(formData.discount_percentage) || 0;
                  const calcOffer = Number(orig) > 0 && pct > 0 ? Math.round(Number(orig) * (1 - pct / 100)) : "";
                  setFormData({ ...formData, original_price: orig, offer_price: String(calcOffer) });
                }}
              />

              <Input
                label="سعر العرض النهائي (ج.م)"
                type="number"
                placeholder="80"
                value={formData.offer_price}
                onChange={(e) => setFormData({ ...formData, offer_price: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="تاريخ ووقت بدء العرض *"
              type="datetime-local"
              value={formData.starts_at}
              onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
              required
            />

            <Input
              label="تاريخ ووقت انتهاء العرض *"
              type="datetime-local"
              value={formData.ends_at}
              onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
              required
            />
          </div>

          {/* Image & Terms */}
          <Input
            label="رابط صورة العرض الترويجي (Banner URL)"
            placeholder="https://images.unsplash.com/..."
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
          />

          <Input
            label="الشروط والأحكام (Terms)"
            placeholder="مثال: يسري العرض للطلبات داخل المحل فقط ولا يشمل التوصيل"
            value={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
          />

          {/* Checkboxes */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span>تفعيل ونشر العرض فوراً</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                تمييز العرض في الصفحة الأولى
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={formLoading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 shadow-sm"
            >
              {formLoading ? "جاري الحفظ..." : editingOffer ? "حفظ التعديلات" : "نشر العرض الآن"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
