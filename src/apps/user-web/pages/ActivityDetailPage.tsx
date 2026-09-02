// ============================================================================
// Daleel Ay Khidma - Activity Detail Page (مع التفاصيل الجغرافية، المنتجات، والأسعار)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { ActivityDTO, ProductDTO, ReviewDTO } from "../../../packages/types";
import { useAuth } from "../../../packages/auth";
import { Button, RatingStars, Badge, Modal, Input, Textarea, Skeleton, SocialShareModal } from "../../../packages/ui";
import { ActivityCard } from "../components/ActivityCard";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Map as MapIcon,
  Phone,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  Share2,
  Bookmark,
  Flag,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Star,
  User,
  Crosshair,
  Package,
  MessageCircle,
  Clock,
  ExternalLink,
  Tag,
  ShoppingBag,
  ArrowUpRight,
  Globe,
  Bike,
  Store,
} from "lucide-react";

interface ActivityDetailPageProps {
  activityId: number;
  onNavigate: (route: string, params?: any) => void;
}

export function ActivityDetailPage({ activityId, onNavigate }: ActivityDetailPageProps) {
  const { user, isAuthenticated } = useAuth();
  const [activity, setActivity] = useState<ActivityDTO | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [similarActivities, setSimilarActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Inquiry Modal State
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<ProductDTO | null>(null);
  const [inquiryName, setInquiryName] = useState(user?.name || "");
  const [inquiryPhone, setInquiryPhone] = useState(user?.phone || "");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("");

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("بيانات النشاط غير مطابقة للواقع");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadActivityAndProducts() {
      setLoading(true);
      try {
        const [actRes, prodRes] = await Promise.all([
          api.getActivityById(activityId),
          api.getProducts({ activity_id: activityId }),
        ]);

        if (actRes.data) {
          setActivity(actRes.data);

          // Load similar activities in same category/location
          const simRes = await api.getActivities({
            category_id: actRes.data.category_id,
            per_page: 3,
          });
          if (simRes.results) {
            setSimilarActivities(simRes.results.filter((a) => a.id !== activityId));
          }
        }

        if (prodRes.data) {
          setProducts(prodRes.data);
        }
      } catch (err) {
        console.error("Failed to load activity details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivityAndProducts();
  }, [activityId]);

  const handleOpenProductInquiry = (prod?: ProductDTO) => {
    setSelectedProductForInquiry(prod || null);
    setInquiryMessage(
      prod
        ? `مرحباً، أستفسر عن توفر وسعر "${prod.name}" وهل يوجد توصيل؟`
        : `مرحباً، أستفسر عن خدمات وأسعار ${activity?.name_ar}...`
    );
    setInquirySuccess(false);
    setInquiryModalOpen(true);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !inquiryName || !inquiryPhone || !inquiryMessage) {
      alert("يرجى ملء الاسم ورقم الهاتف ونص الرسالة.");
      return;
    }

    setSubmittingInquiry(true);
    try {
      await api.createInquiry({
        activity_id: activity.id,
        product_id: selectedProductForInquiry?.id,
        customer_name: inquiryName,
        customer_phone: inquiryPhone,
        message: inquiryMessage,
      });

      setInquirySuccess(true);
      setTimeout(() => {
        setInquiryModalOpen(false);
        setInquirySuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(err.message || "فشل إرسال الاستفسار.");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    setSubmittingReview(true);
    try {
      const res = await api.submitReview(activity.id, newRating, newComment);
      if (res.data) {
        setReviewSuccessMessage("شكراً لك! تم نشر تقييمك ومراجعته بنجاح.");
        // Refresh local activity state
        const refreshed = await api.getActivityById(activity.id);
        if (refreshed.data) setActivity(refreshed.data);
        setTimeout(() => {
          setReviewModalOpen(false);
          setNewComment("");
          setReviewSuccessMessage("");
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || "فشل إرسال التقييم");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    setSubmittingReport(true);
    try {
      await api.reportActivity(activity.id, reportReason, reportDetails);
      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
      }, 1500);
    } catch (err: any) {
      alert(err.message || "فشل إرسال البلاغ");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto text-right pb-16">
        <Skeleton className="h-96 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">النشاط التجاري غير متوفر أو تم حذفه</h2>
        <Button variant="primary" onClick={() => onNavigate("activities")}>
          العودة لدليل الأنشطة
        </Button>
      </div>
    );
  }

  const rawPhone = (activity.whatsapp_number || activity.phone || "").replace(/\D/g, "");

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-right pb-16">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate("activities")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لكافة الأنشطة
        </button>

        <div className="flex items-center gap-2">
          {activity.working_hours && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activity.working_hours}</span>
            </span>
          )}
        </div>
      </div>

      {/* 1. Hero Cover & Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Cover Image */}
        <div className="relative h-72 sm:h-96 bg-slate-900 overflow-hidden">
          <img src={activity.cover_image} alt={activity.name_ar} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Top Floating Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShareModalOpen(true)}
                className="p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-md text-white hover:bg-indigo-600 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="مشاركة النشاط على وسائل التواصل الاجتماعي"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">مشاركة</span>
              </button>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2.5 rounded-xl backdrop-blur-md transition-colors cursor-pointer ${
                  isSaved ? "bg-amber-500 text-white" : "bg-slate-900/60 text-white hover:bg-slate-900/90"
                }`}
                title="حفظ في المفضلة"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-md text-white hover:bg-red-600 transition-colors cursor-pointer"
                title="إبلاغ عن محتوى غير دقيق"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* Status Badge */}
            {activity.status === "verified" ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                نشاط موثق رسمياً
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                قيد المراجعة والتدقيق
              </span>
            )}
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-6 right-6 left-6 text-white space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {activity.section && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-xs text-white border border-indigo-400/40">
                  {activity.section.name_ar}
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white">
                {activity.category?.name_ar || "تصنيف عام"}
              </span>
              {activity.is_featured && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  نشاط مميز
                </span>
              )}
              {activity.has_delivery ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5" />
                  خدمة التوصيل متاحة
                </span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  الاستلام بالفرع فقط
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">{activity.name_ar}</h1>
            {activity.name_en && <p className="text-xs sm:text-sm text-slate-300 font-medium">{activity.name_en}</p>}
            
            {/* Hierarchical Location Tag */}
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold pt-1">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {activity.governorate?.name_ar && `${activity.governorate.name_ar} ← `}
                {activity.city?.name_ar && `${activity.city.name_ar} ← `}
                {activity.neighborhood?.name_ar ? activity.neighborhood.name_ar : activity.location?.name_ar}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Info Bar below image */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <RatingStars rating={activity.rating_avg} reviewsCount={activity.reviews_count} size="lg" />
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Eye className="w-4 h-4 text-slate-400" />
              {activity.views_count.toLocaleString()} مشاهدة
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              مسجل منذ {new Date(activity.created_at).toLocaleDateString("ar-EG")}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 flex-wrap">
            {activity.whatsapp_number && (
              <a
                href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(
                  `مرحباً، أود الاستفسار عن خدمات ومنتجات ${activity.name_ar} عبر منصة دليل أي خدمة.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                واتساب مباشر
              </a>
            )}

            {activity.phone && (
              <a
                href={`tel:${activity.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                اتصال: {activity.phone}
              </a>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenProductInquiry()}
              leftIcon={<MessageSquare className="w-4 h-4 text-indigo-600" />}
            >
              استفسار مباشر
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              leftIcon={<Share2 className="w-4 h-4 text-indigo-600" />}
            >
              مشاركة
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Products & Services Catalog Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-900">قائمة المنتجات، الخدمات، والأسعار المتاحة</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              الأسعار والعروض المحدثة مباشرة من صاحب النشاط التجاري
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 w-fit">
            {products.length} صنف مسجل
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative h-44 bg-slate-200 overflow-hidden">
                    <img
                      src={prod.cover_image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${
                          prod.is_available ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                        }`}
                      >
                        {prod.is_available ? "متوفر" : "غير متوفر"}
                      </span>
                      {prod.sale_price && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black shadow-xs">
                          خصم خاص
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{prod.name}</h3>
                      {prod.sku && (
                        <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {prod.sku}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {prod.short_description || prod.full_description}
                    </p>

                    {/* Price Tag */}
                    <div className="pt-2 flex items-baseline gap-2">
                      {prod.sale_price ? (
                        <>
                          <span className="text-base font-black text-emerald-600">
                            {prod.sale_price} {prod.currency}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {prod.price} {prod.currency}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-black text-slate-900">
                          {prod.price} {prod.currency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 pt-0 mt-2 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(
                      `مرحباً ${activity.name_ar}، أود طلب أو الاستفسار عن "${prod.name}" بسعر (${
                        prod.sale_price || prod.price
                      } ${prod.currency}) المعروض على دليل أي خدمة.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>طلب بالواتساب</span>
                  </a>

                  <button
                    onClick={() => handleOpenProductInquiry(prod)}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    title="استفسار للمحل"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl p-4 space-y-2">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-bold text-slate-700">لا توجد منتجات مسجلة لهذا النشاط حالياً</h3>
            <p className="text-[11px] text-slate-500">يمكنك التواصل مع المحل مباشرة للاستفسار عن الأسعار</p>
          </div>
        )}
      </div>

      {/* 3. Main Content (Description + Map Details + Reviews) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left 2 cols: Description and Reviews */}
        <div className="md:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">عن النشاط التجاري والخدمة</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {activity.description_ar || "لا يوجد وصف مفصل متاح لهذا النشاط حالياً."}
            </p>

            {/* Location & Address with Interactive Leaflet Map */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-slate-700">العنوان والموقع الجغرافي الدقيق:</h3>
                <div className="flex items-center gap-2">
                  {activity.google_maps_url && (
                    <a
                      href={activity.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                    >
                      <span>الاتجاهات على خرائط Google</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => onNavigate("map", { location_id: activity.location_id })}
                    className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>الخريطة الكاملة</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800">{activity.address_ar}</div>
                  {activity.address_line && (
                    <div className="text-xs text-slate-600 mt-0.5">{activity.address_line}</div>
                  )}
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {activity.location?.name_ar} - جمهورية مصر العربية
                  </div>
                </div>
              </div>

              {activity.latitude !== undefined && activity.longitude !== undefined && (
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
                  <MapContainer
                    center={[activity.latitude, activity.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[activity.latitude, activity.longitude]}
                      icon={L.divIcon({
                        html: `
                          <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -50%);">
                            <div style="
                              width: 36px;
                              height: 36px;
                              background: #4f46e5;
                              border-radius: 50% 50% 50% 0;
                              transform: rotate(-45deg);
                              border: 2.5px solid #ffffff;
                              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            ">
                              <div style="transform: rotate(45deg); width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
                            </div>
                          </div>
                        `,
                        className: "detail-map-pin",
                        iconSize: [36, 36],
                        iconAnchor: [18, 36],
                      })}
                    >
                      <Popup>
                        <div className="p-2 text-right" dir="rtl">
                          <strong className="text-xs block text-slate-900">{activity.name_ar}</strong>
                          <span className="text-[10px] text-slate-500">{activity.address_ar}</span>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setReviewModalOpen(true)}
                leftIcon={<Star className="w-4 h-4" />}
              >
                اكتب تقييماً
              </Button>
              <div>
                <h2 className="text-lg font-bold text-slate-900">تقييمات وآراء العملاء</h2>
                <p className="text-xs text-slate-500">مبنية على {activity.reviews_count} تجربة موثقة</p>
              </div>
            </div>

            {/* Reviews List */}
            {activity.reviews && activity.reviews.length > 0 ? (
              <div className="space-y-4 divide-y divide-slate-100">
                {activity.reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {rev.user?.name ? rev.user.name.charAt(0) : "ع"}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{rev.user?.name || "عميل موثق"}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.created_at).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} showText={false} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pr-10">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl p-4 space-y-2">
                <Star className="w-8 h-8 text-amber-400 opacity-60 mx-auto" />
                <h3 className="text-xs font-bold text-slate-700">كن أول من يقيّم هذا النشاط</h3>
                <p className="text-[11px] text-slate-500">مشاركتك تساعد الآخرين في اختيار الخدمة المناسبة</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Verification Authority & Recommendations */}
        <div className="space-y-6">
          {/* Official Verification Certificate Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-950">شهادة التوثيق والرقابة المحلية</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                تم اعتماد هذا النشاط وفق معايير الجودة الصارمة والنطاق الجغرافي لمحافظة ({activity.location?.name_ar}).
              </p>
            </div>

            {activity.verified_at && (
              <div className="pt-3 border-t border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-700">تاريخ الاعتماد:</span>
                  <span className="font-bold">{new Date(activity.verified_at).toLocaleDateString("ar-EG")}</span>
                </div>
                {activity.verification_notes && (
                  <div className="pt-1 text-slate-600 italic">
                    "{activity.verification_notes}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Similar Activities */}
          {similarActivities.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">أنشطة مشابهة مقترحة</h3>
              <div className="space-y-3">
                {similarActivities.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => onNavigate("activity-detail", { id: sim.id })}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100"
                  >
                    <img
                      src={sim.cover_image}
                      alt={sim.name_ar}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{sim.name_ar}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{sim.location?.name_ar}</p>
                      <RatingStars rating={sim.rating_avg} reviewsCount={sim.reviews_count} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Inquiry / Contact Modal */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title={selectedProductForInquiry ? `طلب استفسار عن: ${selectedProductForInquiry.name}` : `استفسار مباشر مع ${activity.name_ar}`}
      >
        {inquirySuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800">تم إرسال استفسارك بنجاح إلى صاحب النشاط!</p>
            <p className="text-xs text-slate-500">سيتم التواصل معك عبر رقم الهاتف أو الواتساب.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitInquiry} className="space-y-4 text-right" dir="rtl">
            <Input
              label="اسمك الكريم"
              required
              placeholder="مثال: أحمد محمد"
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
            />
            <Input
              label="رقم الهاتف للتواصل أو الواتساب"
              required
              placeholder="01012345678"
              value={inquiryPhone}
              onChange={(e) => setInquiryPhone(e.target.value)}
            />
            <Textarea
              label="رسالتك أو طلبك"
              required
              rows={3}
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="اكتب تفاصيل استفسارك أو طلبك..."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setInquiryModalOpen(false)}>
                إلغاء
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={submittingInquiry}>
                إرسال الاستفسار الآن
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 5. Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="إضافة تقييم وتجربة للنشاط">
        {reviewSuccessMessage ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800">{reviewSuccessMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">تقييمك الإجمالي (من 1 إلى 5 نجوم)</label>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-center">
                <RatingStars
                  rating={newRating}
                  size="lg"
                  interactive={true}
                  onRatingChange={(r) => setNewRating(r)}
                />
              </div>
            </div>

            <Textarea
              label="رأيك وتجربتك بالتفصيل"
              required
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب عن جودة الخدمة، الأسعار، التعامل، والموقع..."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setReviewModalOpen(false)}>
                إلغاء
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={submittingReview}>
                نشر التقييم
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 6. Report Modal */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="إبلاغ عن نشاط أو محتوى مخالف">
        {reportSuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800">تم استلام بلاغك وسيتم فحصه من قبل مشرف المحتوى.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">سبب الإبلاغ</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="بيانات النشاط غير مطابقة للواقع">بيانات النشاط غير مطابقة للواقع</option>
                <option value="النشاط مغلق أو غير موجود">النشاط مغلق أو غير موجود</option>
                <option value="محتوى أو صور غير لائقة">محتوى أو صور غير لائقة</option>
                <option value="احتيال أو انتحال شخصية">احتيال أو انتحال شخصية</option>
              </select>
            </div>

            <Textarea
              label="تفاصيل إضافية"
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="يرجى توضيح سبب البلاغ لمساعدة المشرفين..."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setReportModalOpen(false)}>
                إلغاء
              </Button>
              <Button variant="danger" size="sm" type="submit" isLoading={submittingReport}>
                إرسال البلاغ
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 7. Social Share Modal */}
      {activity && (
        <SocialShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          item={{
            id: activity.id,
            title: activity.name_ar,
            description: activity.description_ar,
            type: "activity",
            category: activity.category?.name_ar,
            imageUrl: activity.cover_image,
            address: activity.address_ar || activity.location?.name_ar,
            phone: activity.phone,
            whatsapp: activity.whatsapp_number,
          }}
        />
      )}
    </div>
  );
}
