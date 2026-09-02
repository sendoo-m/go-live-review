// ============================================================================
// Daleel Ay Khidma - Public Customer Offers & Deals Page (عروض وخصومات المحلات)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { OfferDTO } from "../../../packages/types";
import {
  Button,
  Badge,
  Skeleton,
} from "../../../packages/ui";
import {
  Flame,
  Sparkles,
  Search,
  Filter,
  Store,
  Tag,
  Copy,
  Check,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  Percent,
} from "lucide-react";

interface OffersPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export function OffersPage({ onNavigate }: OffersPageProps) {
  const [offers, setOffers] = useState<OfferDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [offerTypeFilter, setOfferTypeFilter] = useState("all");

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const res = await api.getOffers();
        if (res.success) {
          // Filter only active offers for public consumers
          setOffers(res.data.filter((o) => o.is_active));
        }
      } catch (err) {
        console.error("Failed to load offers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase()) ||
      o.activity?.name_ar?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      offerTypeFilter === "all" ? true : o.offer_type === offerTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-rose-900/20 relative overflow-hidden text-right">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>عروض حصرية وخصومات يومية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            أقوى العروض والتخفيضات من أفضل المتاجر والخدمات
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
            استفد من كوبونات الخصم، العروض الموسمية، والصفقات المباشرة من المحلات ومقدمي الخدمات المعتمدين في منطقتك.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث باسم العرض، المحل التجاري، أو الخدمة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 pr-10 pl-3 py-2.5 outline-none focus:border-rose-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={offerTypeFilter}
            onChange={(e) => setOfferTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 text-slate-700 text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none font-bold"
          >
            <option value="all">كافة أنواع العروض</option>
            <option value="percentage">نسبة مئوية (%)</option>
            <option value="fixed">خصم بمبلغ ثابت</option>
            <option value="bundle">باقة / باقات مجمعة</option>
          </select>
        </div>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-3xl border border-slate-200" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Flame className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد عروض متاحة حالياً</h3>
          <p className="text-xs text-slate-500">تابعنا قريباً للاطلاع على عروض المحلات الجديدة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => {
            const isFeatured = offer.is_featured;
            const daysLeft = offer.ends_at
              ? Math.max(0, Math.ceil((new Date(offer.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : 30;

            return (
              <div
                key={offer.id}
                className={`bg-white rounded-3xl border flex flex-col justify-between overflow-hidden transition-all text-right ${
                  isFeatured
                    ? "border-rose-400 shadow-lg shadow-rose-500/10 ring-1 ring-rose-400"
                    : "border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div>
                  {/* Top image or banner */}
                  <div className="h-40 bg-slate-900 relative overflow-hidden">
                    {offer.cover_image ? (
                      <img
                        src={offer.cover_image}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-rose-950 via-slate-900 to-amber-950 flex items-center justify-center">
                        <Flame className="w-16 h-16 text-rose-500/40" />
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        {offer.offer_type === "percentage" && offer.discount_percentage
                          ? `خصم ${offer.discount_percentage}%`
                          : offer.offer_type === "fixed" && offer.discount_amount
                          ? `خصم ${offer.discount_amount} ج.م`
                          : offer.offer_price
                          ? `بسعر ${offer.offer_price} ج.م`
                          : "عرض خاص"}
                      </span>
                    </div>

                    {isFeatured && (
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded-lg shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        عرض مميز
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/70 backdrop-blur-md rounded-lg text-slate-300 text-[10px] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>متبقي {daysLeft} يوم</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    {/* Activity Link */}
                    {offer.activity && (
                      <button
                        onClick={() => onNavigate("activity-detail", { id: offer.activity_id })}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>{offer.activity.name_ar}</span>
                      </button>
                    )}

                    <h3 className="text-base font-black text-slate-900 leading-snug">{offer.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {offer.description}
                    </p>

                    {/* Price details if available */}
                    {(offer.original_price || offer.offer_price) && (
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          {offer.offer_price && (
                            <span className="text-base font-black text-rose-600">
                              {offer.offer_price} ج.م
                            </span>
                          )}
                          {offer.original_price && (
                            <span className="text-xs text-slate-400 line-through">
                              {offer.original_price} ج.م
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {offer.product ? `منتج: ${offer.product.name}` : "عرض عام"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  {offer.activity?.whatsapp_number && (
                    <a
                      href={`https://wa.me/${offer.activity.whatsapp_number.replace(/\+/g, "").replace(/\s/g, "")}?text=${encodeURIComponent(
                        `مرحباً، أود الاستفسار والاستفادة من عرض: "${offer.title}" المعروض على دليل أي خدمة...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>طلب عبر واتساب</span>
                    </a>
                  )}

                  {offer.activity?.phone && (
                    <a
                      href={`tel:${offer.activity.phone}`}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center transition-all"
                      title="اتصال بالمتجر"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate("activity-detail", { id: offer.activity_id })}
                    className="border-slate-200 text-slate-700 text-xs font-bold h-10 px-3"
                  >
                    <span>تفاصيل المحل</span>
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
