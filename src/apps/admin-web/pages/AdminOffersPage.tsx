// ============================================================================
// Daleel Ay Khidma - Admin Offers & Promotions Management (إدارة العروض الترويجية والخصومات)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { OfferDTO } from "../../../packages/types";
import {
  Button,
  Badge,
  Input,
  Modal,
  Skeleton,
} from "../../../packages/ui";
import {
  Flame,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Clock,
  Calendar,
  Store,
  Tag,
  Percent,
} from "lucide-react";

export function AdminOffersPage() {
  const [offers, setOffers] = useState<OfferDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await api.getOffers();
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

  const handleToggleActive = async (offer: OfferDTO) => {
    try {
      const res = await api.updateOffer(offer.id, { is_active: !offer.is_active });
      if (res.success) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, is_active: !o.is_active } : o))
        );
      }
    } catch (err) {
      alert("فشل تحديث حالة العرض");
    }
  };

  const handleToggleFeatured = async (offer: OfferDTO) => {
    try {
      const res = await api.updateOffer(offer.id, { is_featured: !offer.is_featured });
      if (res.success) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, is_featured: !o.is_featured } : o))
        );
      }
    } catch (err) {
      alert("فشل تمييز العرض");
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض نهائياً؟")) return;
    try {
      const res = await api.deleteOffer(id);
      if (res.success) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      alert("فشل حذف العرض");
    }
  };

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.activity?.name_ar?.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? o.is_active
        : !o.is_active;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-rose-500" />
            إدارة ومراجعة العروض والخصومات (Offers Moderation)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة العروض المنشورة بواسطة التجار، تفعيل أو إيقاف العروض، وتمييز الخصومات في الصفحة الرئيسية
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadOffers}
          className="border-slate-300 text-slate-700 font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
          تحديث العروض
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث بعنوان العرض، اسم المحل، أو التفاصيل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 pr-9 pl-3 py-2.5 outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 text-slate-700 text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none font-bold"
        >
          <option value="all">كافة الحالات</option>
          <option value="active">العروض النشطة فقط</option>
          <option value="inactive">العروض المعطلة أو المؤرشفة</option>
        </select>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Flame className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد عروض ترويجية مطابقة للبحث</h3>
          <p className="text-xs text-slate-500">جرب تغيير كلمات البحث أو الفلاتر المحددة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl border flex flex-col justify-between overflow-hidden transition-all ${
                offer.is_featured
                  ? "border-rose-400 shadow-md shadow-rose-500/10 ring-1 ring-rose-300"
                  : "border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="p-5 space-y-3">
                {/* Banner Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                      <Flame className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 line-clamp-1">{offer.title}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold mt-0.5">
                        <Store className="w-3 h-3 text-slate-400" />
                        <span>{offer.activity?.name_ar || `محل #${offer.activity_id}`}</span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      offer.discount_type === "percentage"
                        ? "red"
                        : offer.discount_type === "fixed_amount"
                        ? "amber"
                        : "blue"
                    }
                    size="sm"
                  >
                    {offer.discount_type === "percentage"
                      ? `خصم ${offer.discount_value}%`
                      : offer.discount_type === "fixed_amount"
                      ? `خصم ${offer.discount_value} ج.م`
                      : "عرض مجاني"}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {offer.description}
                </p>

                {/* Dates & Status info */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>فترة العرض:</span>
                    <span className="font-mono font-bold text-slate-700">
                      {new Date(offer.start_date).toLocaleDateString("ar-EG")} -{" "}
                      {new Date(offer.end_date).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  {offer.code && (
                    <div className="flex items-center justify-between">
                      <span>كوبون الخصم:</span>
                      <span className="font-mono font-black text-indigo-600">{offer.code}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={offer.is_active ? "outline" : "secondary"}
                    onClick={() => handleToggleActive(offer)}
                    className="text-[11px] font-bold h-8"
                  >
                    {offer.is_active ? "تعطيل العرض" : "تفعيل العرض"}
                  </Button>

                  <Button
                    size="sm"
                    variant={offer.is_featured ? "primary" : "outline"}
                    onClick={() => handleToggleFeatured(offer)}
                    className={`text-[11px] font-bold h-8 ${
                      offer.is_featured
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "border-slate-300 text-slate-700"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 ml-1" />
                    {offer.is_featured ? "مميز" : "تمييز"}
                  </Button>
                </div>

                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                  title="حذف العرض"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
