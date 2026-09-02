// ============================================================================
// Daleel Ay Khidma - Merchant & Vendor Dashboard (لوحة تحكم التجار ومقدمي الخدمات)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../packages/api-client";
import {
  ActivityDTO,
  ProductDTO,
  InquiryDTO,
  CategoryDTO,
  LocationDTO,
  MerchantDashboardDTO,
  MerchantSubscriptionInfoDTO,
} from "../../packages/types";
import { useAuth } from "../../packages/auth";
import {
  Button,
  Badge,
  Input,
  Select,
  Textarea,
  Modal,
  RatingStars,
  Skeleton,
} from "../../packages/ui";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Store,
  Package,
  MessageSquare,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ShoppingBag,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
  DollarSign,
  Tag,
  Check,
  X,
  Compass,
  ArrowUpRight,
  UserCheck,
  Flame,
  FileSpreadsheet,
  Crown,
  Upload,
  Download,
  Layers,
} from "lucide-react";
import { ImportExportModal } from "./components/ImportExportModal";
import { OffersManagement } from "./components/OffersManagement";
import { SubscriptionPlanModal } from "./components/SubscriptionPlanModal";

// Pin for Merchant Location Picker
function MerchantMapPicker({
  coords,
  onChange,
}: {
  coords: { lat: number; lng: number };
  onChange: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    map.flyTo([coords.lat, coords.lng], map.getZoom());
  }, [coords, map]);

  return (
    <Marker
      position={[coords.lat, coords.lng]}
      icon={L.divIcon({
        html: `
          <div style="position: relative; width: 38px; height: 38px; transform: translate(-50%, -50%);">
            <div style="
              width: 38px;
              height: 38px;
              background: #0284c7;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="transform: rotate(45deg); width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        className: "merchant-picker-pin",
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      })}
    />
  );
}

interface MerchantWebAppProps {
  onOpenUserWeb: () => void;
  onOpenAdmin?: () => void;
}

export function MerchantWebApp({ onOpenUserWeb, onOpenAdmin }: MerchantWebAppProps) {
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "products" | "offers" | "inquiries" | "maps" | "subscription">("overview");

  // Main Data States
  const [dashboardData, setDashboardData] = useState<MerchantDashboardDTO | null>(null);
  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [inquiries, setInquiries] = useState<InquiryDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<MerchantSubscriptionInfoDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // New Modals State
  const [importExportModalOpen, setImportExportModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  // Filter States
  const [productSearch, setProductSearch] = useState("");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>("all");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>("all");

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [productForm, setProductForm] = useState({
    activity_id: 0,
    name: "",
    short_description: "",
    full_description: "",
    price: "",
    sale_price: "",
    currency: "ج.م",
    sku: "",
    stock_qty: "",
    is_available: true,
    is_featured: false,
    availability_note: "متوفر للطلب المباشر",
    cover_image: "",
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Activity Modal State
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityDTO | null>(null);
  const [activityForm, setActivityForm] = useState({
    name_ar: "",
    name_en: "",
    category_id: 1,
    location_id: 1,
    description_ar: "",
    address_ar: "",
    address_line: "",
    phone: "",
    whatsapp_number: "",
    website_url: "",
    working_hours: "يومياً من 09:00 ص - 10:00 م",
    cover_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
    latitude: 30.0444,
    longitude: 31.2357,
    is_featured: false,
  });
  const [submittingActivity, setSubmittingActivity] = useState(false);

  // Inquiry Reply / Details Modal
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDTO | null>(null);

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial merchant data
  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, actsRes, prodsRes, inqsRes, catsRes, locsRes, subRes] = await Promise.all([
        api.getMerchantDashboard(),
        api.getMerchantActivities(),
        api.getMerchantProducts(),
        api.getInquiries(),
        api.getCategories(),
        api.getLocations(),
        api.getMerchantSubscription().catch(() => ({ data: null })),
      ]);

      if (dashRes.data) setDashboardData(dashRes.data);
      if (actsRes.data) setActivities(actsRes.data);
      if (prodsRes.data) setProducts(prodsRes.data);
      if (inqsRes.data) setInquiries(inqsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      if (locsRes.data) setLocations(locsRes.data);
      if (subRes.data) setSubscriptionInfo(subRes.data);

      if (actsRes.data && actsRes.data.length > 0 && productForm.activity_id === 0) {
        setProductForm(prev => ({ ...prev, activity_id: actsRes.data![0].id }));
      }
    } catch (err) {
      console.error("Failed to load merchant data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Add Product Modal
  const handleOpenAddProduct = (defaultActivityId?: number) => {
    setEditingProduct(null);
    setProductForm({
      activity_id: defaultActivityId || (activities[0]?.id || 1),
      name: "",
      short_description: "",
      full_description: "",
      price: "",
      sale_price: "",
      currency: "ج.م",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stock_qty: "15",
      is_available: true,
      is_featured: false,
      availability_note: "متوفر للطلب الفوري",
      cover_image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600",
    });
    setProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: ProductDTO) => {
    setEditingProduct(prod);
    setProductForm({
      activity_id: prod.activity_id,
      name: prod.name,
      short_description: prod.short_description,
      full_description: prod.full_description,
      price: String(prod.price),
      sale_price: prod.sale_price ? String(prod.sale_price) : "",
      currency: prod.currency || "ج.م",
      sku: prod.sku || "",
      stock_qty: prod.stock_qty !== null && prod.stock_qty !== undefined ? String(prod.stock_qty) : "",
      is_available: prod.is_available,
      is_featured: prod.is_featured,
      availability_note: prod.availability_note || "",
      cover_image: prod.cover_image,
    });
    setProductModalOpen(true);
  };

  // Save Product Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.activity_id) {
      alert("يرجى ملء اسم المنتج والسعر والنشاط التابع له.");
      return;
    }

    setSubmittingProduct(true);
    try {
      if (editingProduct) {
        // Update
        const res = await api.updateProduct(editingProduct.id, {
          activity_id: Number(productForm.activity_id),
          name: productForm.name,
          short_description: productForm.short_description,
          full_description: productForm.full_description,
          price: parseFloat(productForm.price),
          sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
          currency: productForm.currency,
          sku: productForm.sku,
          stock_qty: productForm.stock_qty ? parseInt(productForm.stock_qty) : null,
          is_available: productForm.is_available,
          is_featured: productForm.is_featured,
          availability_note: productForm.availability_note,
          cover_image: productForm.cover_image,
        });
        showToast("تم تحديث بيانات وسعر المنتج بنجاح!");
      } else {
        // Create
        const res = await api.createProduct({
          activity_id: Number(productForm.activity_id),
          name: productForm.name,
          short_description: productForm.short_description,
          full_description: productForm.full_description,
          price: parseFloat(productForm.price),
          sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
          currency: productForm.currency,
          sku: productForm.sku,
          stock_qty: productForm.stock_qty ? parseInt(productForm.stock_qty) : null,
          is_available: productForm.is_available,
          is_featured: productForm.is_featured,
          availability_note: productForm.availability_note,
          cover_image: productForm.cover_image,
          status: "published",
        });
        showToast("تمت إضافة المنتج الجديد إلى القائمة بنجاح!");
      }
      setProductModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حفظ المنتج.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Toggle Availability
  const handleToggleProductAvailability = async (prodId: number) => {
    try {
      const res = await api.toggleProductAvailability(prodId);
      if (res.data) {
        setProducts(prev => prev.map(p => (p.id === prodId ? res.data! : p)));
        showToast(res.message || "تم تحديث حالة توفر المنتج.");
      }
    } catch (err: any) {
      alert(err.message || "فشل تغيير حالة التوفر.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prodId: number) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من قائمتك؟")) return;
    try {
      await api.deleteProduct(prodId);
      setProducts(prev => prev.filter(p => p.id !== prodId));
      showToast("تم حذف المنتج بنجاح.");
    } catch (err: any) {
      alert(err.message || "فشل حذف المنتج.");
    }
  };

  // Open Add Activity Modal
  const handleOpenAddActivity = () => {
    setEditingActivity(null);
    setActivityForm({
      name_ar: "",
      name_en: "",
      category_id: categories[0]?.id || 1,
      location_id: locations[0]?.id || 1,
      description_ar: "",
      address_ar: "",
      address_line: "",
      phone: user?.phone || "01000000000",
      whatsapp_number: user?.phone || "01000000000",
      website_url: "",
      working_hours: "يومياً من 09:00 ص - 10:00 م",
      cover_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
      latitude: locations[0]?.latitude || 30.0444,
      longitude: locations[0]?.longitude || 31.2357,
      is_featured: false,
    });
    setActivityModalOpen(true);
  };

  // Open Edit Activity Modal
  const handleOpenEditActivity = (act: ActivityDTO) => {
    setEditingActivity(act);
    setActivityForm({
      name_ar: act.name_ar,
      name_en: act.name_en || "",
      category_id: act.category_id,
      location_id: act.location_id,
      description_ar: act.description_ar || "",
      address_ar: act.address_ar,
      address_line: act.address_line || "",
      phone: act.phone || "",
      whatsapp_number: act.whatsapp_number || act.phone || "",
      website_url: act.website_url || "",
      working_hours: act.working_hours || "يومياً من 09:00 ص - 10:00 م",
      cover_image: act.cover_image,
      latitude: act.latitude || 30.0444,
      longitude: act.longitude || 31.2357,
      is_featured: act.is_featured,
    });
    setActivityModalOpen(true);
  };

  // Save Activity Submit
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.name_ar || !activityForm.address_ar) {
      alert("يرجى ملء اسم النشاط والعنوان الرئيسي.");
      return;
    }

    setSubmittingActivity(true);
    try {
      if (editingActivity) {
        // Update
        await api.updateActivity(editingActivity.id, {
          name_ar: activityForm.name_ar,
          name_en: activityForm.name_en,
          category_id: Number(activityForm.category_id),
          location_id: Number(activityForm.location_id),
          description_ar: activityForm.description_ar,
          address_ar: activityForm.address_ar,
          address_line: activityForm.address_line,
          phone: activityForm.phone,
          whatsapp_number: activityForm.whatsapp_number,
          website_url: activityForm.website_url,
          working_hours: activityForm.working_hours,
          cover_image: activityForm.cover_image,
          latitude: activityForm.latitude,
          longitude: activityForm.longitude,
        });
        showToast("تم تحديث بيانات النشاط والموقع الجغرافي بنجاح!");
      } else {
        // Create
        await api.createActivity({
          name_ar: activityForm.name_ar,
          name_en: activityForm.name_en,
          category_id: Number(activityForm.category_id),
          location_id: Number(activityForm.location_id),
          description_ar: activityForm.description_ar,
          address_ar: activityForm.address_ar,
          phone: activityForm.phone,
          cover_image: activityForm.cover_image,
          latitude: activityForm.latitude,
          longitude: activityForm.longitude,
        });
        showToast("تم إرسال النشاط الجديد بنجاح للمراجعة والاعتماد.");
      }
      setActivityModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حفظ النشاط.");
    } finally {
      setSubmittingActivity(false);
    }
  };

  // Change Inquiry Status
  const handleUpdateInquiryStatus = async (inqId: number, status: string) => {
    try {
      const res = await api.updateInquiryStatus(inqId, status);
      if (res.data) {
        setInquiries(prev => prev.map(i => (i.id === inqId ? res.data! : i)));
        showToast("تم تحديث حالة الاستفسار.");
        if (selectedInquiry?.id === inqId) {
          setSelectedInquiry(res.data);
        }
      }
    } catch (err: any) {
      alert(err.message || "فشل تحديث حالة الاستفسار.");
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.short_description.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));

    const matchesActivity = selectedActivityFilter === "all" || p.activity_id === parseInt(selectedActivityFilter);
    return matchesSearch && matchesActivity;
  });

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter(i => {
    if (inquiryStatusFilter === "all") return true;
    return i.status === inquiryStatusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased pb-24" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500 font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-900/40">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">لوحة تحكم التجار والأنشطة</span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-extrabold border border-sky-500/30">
                  Merchant Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">إدارة المنتجات، الأسعار، المواقع الجغرافية، والطلبات</p>
            </div>
          </div>

          {/* Actions & Navigation Links */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setImportExportModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs hidden md:flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>استيراد / تصدير CSV</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenAddProduct()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-950/40 border-0"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              إضافة منتج / سعر
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenAddActivity}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs hidden sm:flex"
              leftIcon={<Plus className="w-3.5 h-3.5 text-sky-400" />}
            >
              نشاط جديد
            </Button>

            <button
              onClick={() => setSubscriptionModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="إدارة الباقة والاشتراك"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{subscriptionInfo?.plan?.name || "الباقة"}</span>
            </button>

            <button
              onClick={onOpenUserWeb}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="معاينة الواجهة كعميل"
            >
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">معاينة المتجر</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-800/60 overflow-x-auto py-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>نظرة عامة ومؤشرات</span>
          </button>

          <button
            onClick={() => setActiveTab("activities")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "activities"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>أنشطتي ومحلاتي ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "products"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>المنتجات والأسعار ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("offers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "offers"
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>العروض والخصومات</span>
          </button>

          <button
            onClick={() => setActiveTab("subscription")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "subscription"
                ? "bg-amber-600 text-white shadow-md shadow-amber-900/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>الباقات والاشتراك</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "inquiries"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>طلبات واستفسارات العملاء</span>
            {inquiries.filter(i => i.status === "new").length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                {inquiries.filter(i => i.status === "new").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("maps")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "maps"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>المواقع الجغرافية والخرائط</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-28 rounded-2xl bg-slate-800" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-2xl bg-slate-800" />
          </div>
        ) : (
          <>
            {/* -------------------------------------------------------------- */}
            {/* TAB 1: OVERVIEW & STATS                                         */}
            {/* -------------------------------------------------------------- */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">إجمالي الأنشطة المعتمدة</span>
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Store className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">
                        {dashboardData?.stats.verified_activities_count || activities.filter(a => a.status === "verified").length}
                      </span>
                      <span className="text-xs text-slate-500">من إجمالي {activities.length}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">المنتجات والخدمات المعروضة</span>
                      <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{products.length}</span>
                      <span className="text-xs text-emerald-400 font-bold">
                        ({products.filter(p => p.is_available).length} متوفر)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">طلبات وتواصل الزبائن</span>
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{inquiries.length}</span>
                      <span className="text-xs text-amber-400 font-bold">
                        ({inquiries.filter(i => i.status === "new").length} جديد)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">إجمالي المشاهدات</span>
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{dashboardData?.stats.total_views || 0}</span>
                      <span className="text-xs text-slate-500">مشاهدة حقيقية</span>
                    </div>
                  </div>
                </div>

                {/* Grid of Merchant Activities + Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Activities List */}
                  <div className="lg:col-span-2 bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-sky-400" />
                        <h2 className="text-sm font-bold text-white">المحلات والأنشطة التجارية التابعة لك</h2>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleOpenAddActivity}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 text-xs"
                      >
                        + إضافة نشاط جديد
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activities.map(act => (
                        <div
                          key={act.id}
                          className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={act.cover_image}
                                  alt={act.name_ar}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                                />
                                <div>
                                  <h3 className="text-xs font-bold text-white">{act.name_ar}</h3>
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    <span>{act.address_ar}</span>
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  act.status === "verified"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}
                              >
                                {act.status === "verified" ? "معتمد" : "قيد المراجعة"}
                              </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                              <span>ساعات العمل: {act.working_hours || "09:00 ص - 10:00 م"}</span>
                              <span className="font-bold text-sky-400">
                                {products.filter(p => p.activity_id === act.id).length} منتج
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenAddProduct(act.id)}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-0 text-xs py-1.5"
                            >
                              + إضافة منتج
                            </Button>
                            <button
                              onClick={() => handleOpenEditActivity(act)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="تعديل النشاط والموقع"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Inquiries List */}
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-bold text-white">أحدث استفسارات العملاء</h2>
                      </div>
                      <button
                        onClick={() => setActiveTab("inquiries")}
                        className="text-xs text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                      >
                        عرض الكل
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {inquiries.slice(0, 4).map(inq => (
                        <div
                          key={inq.id}
                          onClick={() => setSelectedInquiry(inq)}
                          className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{inq.customer_name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                inq.status === "new"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {inq.status === "new" ? "جديد" : inq.status === "contacted" ? "تم التواصل" : "مكتمل"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-1 mt-1">{inq.message}</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                            <span>{inq.customer_phone}</span>
                            <span>{new Date(inq.created_at).toLocaleDateString("ar-EG")}</span>
                          </div>
                        </div>
                      ))}

                      {inquiries.length === 0 && (
                        <div className="py-8 text-center text-slate-500 text-xs">
                          لا توجد استفسارات جديدة في الوقت الحالي.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subscription & Quota Overview Banner */}
                {subscriptionInfo && (
                  <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                          <Crown className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">باقة الحساب:</span>
                            <span className="text-base font-black text-white">{subscriptionInfo.plan.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              نشط
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            تنتهي صلاحية الخطة في {subscriptionInfo.subscription?.ends_at ? new Date(subscriptionInfo.subscription.ends_at).toLocaleDateString("ar-EG") : "ساري"} (متبقي {subscriptionInfo.days_remaining ?? 365} يوم)
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setSubscriptionModalOpen(true)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-md shadow-amber-950/40 text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                        إدارة الباقة والترقية
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-400">الأنشطة والمحلات</span>
                          <span className="text-sky-400">
                            {subscriptionInfo.usage.activities_count} / {subscriptionInfo.plan.limits.max_activities >= 999 ? "غير محدود" : subscriptionInfo.plan.limits.max_activities}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (subscriptionInfo.usage.activities_count / (subscriptionInfo.plan.limits.max_activities || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-400">كتالوج المنتجات</span>
                          <span className="text-emerald-400">
                            {subscriptionInfo.usage.products_count} / {subscriptionInfo.plan.limits.max_products >= 999 ? "غير محدود" : subscriptionInfo.plan.limits.max_products}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (subscriptionInfo.usage.products_count / (subscriptionInfo.plan.limits.max_products || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-400">العروض الترويجية</span>
                          <span className="text-rose-400">
                            {subscriptionInfo.plan.limits.can_create_offers ? `${subscriptionInfo.usage.offers_count} نشط` : "غير متاح"}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all"
                            style={{
                              width: subscriptionInfo.plan.limits.can_create_offers ? "100%" : "0%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 2: ACTIVITIES MANAGEMENT                                    */}
            {/* -------------------------------------------------------------- */}
            {activeTab === "activities" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">إدارة الأنشطة والمحلات التجارية</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تعديل بيانات المحل، أوقات العمل، أرقام التواصل، والموقع الجغرافي الدقيق
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAddActivity}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    إضافة نشاط تجاري جديد
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map(act => (
                    <div
                      key={act.id}
                      className="bg-slate-950 rounded-3xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={act.cover_image}
                            alt={act.name_ar}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">{act.name_ar}</h3>
                              {act.status === "verified" && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{act.address_ar}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                                {act.category?.name_ar || "عام"}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                                {act.location?.name_ar || "المركز"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            act.status === "verified"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {act.status === "verified" ? "معتمد" : "بانتظار المراجعة"}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
                        <div>
                          <span className="text-slate-500 text-[11px] block">الهاتف:</span>
                          <span className="font-mono text-slate-200">{act.phone || "غير محدد"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px] block">واتساب:</span>
                          <span className="font-mono text-emerald-400">{act.whatsapp_number || act.phone || "غير محدد"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px] block">أوقات العمل:</span>
                          <span className="text-slate-200">{act.working_hours || "09:00 ص - 10:00 م"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px] block">الإحداثيات الجغرافية:</span>
                          <span className="font-mono text-sky-400 text-[10px]">
                            {act.latitude.toFixed(4)}, {act.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenAddProduct(act.id)}
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30 text-xs"
                          >
                            + إضافة منتج
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEditActivity(act)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-0 text-xs"
                          >
                            تعديل البيانات
                          </Button>
                        </div>

                        {act.google_maps_url && (
                          <a
                            href={act.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold"
                          >
                            <span>خرائط جوجل</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 3: PRODUCTS & PRICING CATALOG                               */}
            {/* -------------------------------------------------------------- */}
            {activeTab === "products" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Header and Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">كتالوج المنتجات والأسعار</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      إدارة قائمة السلع، الأسعار العادية وأسعار الخصم، وتحديد حالة التوفر في المحل
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setImportExportModalOpen(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs"
                      leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      استيراد / تصدير CSV
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenAddProduct()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      إضافة منتج جديد
                    </Button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="البحث باسم المنتج، الوصف، أو الـ SKU..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-800 pr-9 pl-3 py-2 outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedActivityFilter}
                      onChange={e => setSelectedActivityFilter(e.target.value)}
                      className="bg-slate-900 text-slate-200 text-xs rounded-xl border border-slate-800 px-3 py-2 outline-none font-bold"
                    >
                      <option value="all">كافة الأنشطة والمحلات</option>
                      {activities.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all group"
                    >
                      <div>
                        {/* Cover Image & Badges */}
                        <div className="relative h-40 bg-slate-900 overflow-hidden">
                          <img
                            src={prod.cover_image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md ${
                                prod.is_available
                                  ? "bg-emerald-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {prod.is_available ? "متوفر" : "غير متوفر"}
                            </span>
                            {prod.sale_price && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black shadow-md">
                                عرض خاص
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-slate-300 text-[10px] font-mono border border-slate-700/60">
                            {prod.sku || "PROD"}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-2">
                          <div className="text-[11px] text-sky-400 font-bold">
                            {prod.activity?.name_ar || activities.find(a => a.id === prod.activity_id)?.name_ar}
                          </div>
                          <h3 className="text-sm font-bold text-white line-clamp-1">{prod.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2">{prod.short_description}</p>

                          {/* Pricing block */}
                          <div className="pt-2 flex items-baseline gap-2">
                            {prod.sale_price ? (
                              <>
                                <span className="text-base font-black text-emerald-400">
                                  {prod.sale_price} {prod.currency}
                                </span>
                                <span className="text-xs text-slate-500 line-through">
                                  {prod.price} {prod.currency}
                                </span>
                              </>
                            ) : (
                              <span className="text-base font-black text-white">
                                {prod.price} {prod.currency}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 pt-0 border-t border-slate-900 mt-2 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleProductAvailability(prod.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            prod.is_available
                              ? "bg-slate-900 hover:bg-slate-800 text-slate-300"
                              : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                          }`}
                          title="تبديل حالة التوفر"
                        >
                          {prod.is_available ? "تعيين كغير متوفر" : "تفعيل التوفر"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="تعديل المنتج والسعر"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="py-16 text-center bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
                    <Package className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-white">لا توجد منتجات مطابقة للبحث</h3>
                    <p className="text-xs text-slate-400">يمكنك إضافة منتجات وخدمات وأسعار جديدة في أي وقت</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenAddProduct()}
                      className="mt-2"
                    >
                      + إضافة أول منتج
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 4: INQUIRIES & LEADS                                        */}
            {/* -------------------------------------------------------------- */}
            {activeTab === "inquiries" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">طلبات واستفسارات الزبائن</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      متابعة الرسائل، طلبات الشراء، والاستفسارات مع إمكانية التواصل الفوري عبر واتساب
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inquiryStatusFilter}
                      onChange={e => setInquiryStatusFilter(e.target.value)}
                      className="bg-slate-950 text-slate-200 text-xs rounded-xl border border-slate-800 px-3 py-2 outline-none font-bold"
                    >
                      <option value="all">كافة الحالات</option>
                      <option value="new">الطلبات الجديدة فقط</option>
                      <option value="contacted">تم التواصل</option>
                      <option value="resolved">مكتمل ومغلق</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
                  {filteredInquiries.map(inq => (
                    <div
                      key={inq.id}
                      className="p-4 sm:p-5 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{inq.customer_name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              inq.status === "new"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : inq.status === "contacted"
                                ? "bg-sky-500/20 text-sky-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {inq.status === "new" ? "طلب جديد" : inq.status === "contacted" ? "تم التواصل" : "مغلق"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(inq.created_at).toLocaleDateString("ar-EG")}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                          {inq.message}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-mono text-slate-300">
                            <Phone className="w-3 h-3 text-sky-400" />
                            {inq.customer_phone}
                          </span>
                          {inq.activity_name && (
                            <span className="text-slate-500">النشاط: {inq.activity_name}</span>
                          )}
                          {inq.product_name && (
                            <span className="text-emerald-400 font-bold">المنتج: {inq.product_name}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Direct WhatsApp button */}
                        <a
                          href={`https://wa.me/${inq.customer_phone.replace(/\+/g, "").replace(/\s/g, "")}?text=${encodeURIComponent(
                            `مرحباً ${inq.customer_name}، بخصوص استفسارك على دليل أي خدمة...`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>رد عبر واتساب</span>
                        </a>

                        <select
                          value={inq.status}
                          onChange={e => handleUpdateInquiryStatus(inq.id, e.target.value)}
                          className="bg-slate-900 text-slate-300 text-xs rounded-xl border border-slate-700 px-2.5 py-2 outline-none font-bold"
                        >
                          <option value="new">جديد</option>
                          <option value="contacted">تم التواصل</option>
                          <option value="resolved">مكتمل</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {filteredInquiries.length === 0 && (
                    <div className="py-16 text-center text-slate-500 text-xs">
                      لا توجد طلبات أو استفسارات متطابقة.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 5: GEO-LOCATION & MAPS MANAGER                              */}
            {/* -------------------------------------------------------------- */}
            {activeTab === "maps" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">المواقع الجغرافية وتحديد المحلات على الخريطة</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تأكيد مواقع محلاتك وفروعك على خرائط Google و OpenStreetMap لظهورها بدقة للزبائن في نتائج البحث الجغرافي
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-slate-800 relative">
                    <MapContainer
                      center={[activities[0]?.latitude || 30.0444, activities[0]?.longitude || 31.2357]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {activities.map(act => (
                        <Marker
                          key={act.id}
                          position={[act.latitude, act.longitude]}
                          icon={L.divIcon({
                            html: `
                              <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -50%);">
                                <div style="
                                  width: 36px;
                                  height: 36px;
                                  background: #0284c7;
                                  border-radius: 50% 50% 50% 0;
                                  transform: rotate(-45deg);
                                  border: 2.5px solid #ffffff;
                                  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                ">
                                  <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
                                </div>
                              </div>
                            `,
                            className: "merchant-act-pin",
                            iconSize: [36, 36],
                            iconAnchor: [18, 36],
                          })}
                        >
                          <Popup>
                            <div className="text-right p-1" dir="rtl">
                              <h4 className="font-bold text-xs text-slate-900">{act.name_ar}</h4>
                              <p className="text-[11px] text-slate-600">{act.address_ar}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">
                                {act.latitude.toFixed(4)}, {act.longitude.toFixed(4)}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activities.map(act => (
                      <div
                        key={act.id}
                        className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white">{act.name_ar}</h4>
                          <span className="text-[11px] font-mono text-sky-400 block mt-0.5">
                            {act.latitude.toFixed(4)}, {act.longitude.toFixed(4)}
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditActivity(act)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-0 text-xs"
                        >
                          تعديل الإحداثيات
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* -------------------------------------------------------------- */}
            {/* TAB 4: OFFERS & PROMOTIONS MANAGEMENT                          */}
            {/* -------------------------------------------------------------- */}
            {activeTab === "offers" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <OffersManagement
                  activities={activities}
                  products={products}
                  subscriptionInfo={subscriptionInfo}
                  onUpgradePlan={() => setSubscriptionModalOpen(true)}
                />
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 5: SUBSCRIPTION & PRICING PLANS                            */}
            {/* -------------------------------------------------------------- */}
            {activeTab === "subscription" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      إدارة خطة الاشتراك والباقات المتاحة
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تفاصيل باقتك الحالية، استهلاك الحدود التشغيلية، والترقية لباقات الشركات والـ Pro
                    </p>
                  </div>
                  <Button
                    onClick={() => setSubscriptionModalOpen(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-md shadow-amber-950/40 text-xs"
                  >
                    <Sparkles className="w-4 h-4 ml-1.5" />
                    عرض ومقارنة الباقات والترقية
                  </Button>
                </div>

                {subscriptionInfo && (
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg">
                          <Crown className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-amber-400 font-bold">الاشتراك الحالي:</span>
                            <h3 className="text-xl font-black text-white">{subscriptionInfo.plan.name}</h3>
                            <Badge variant={subscriptionInfo.subscription?.status === "active" ? "emerald" : "slate"} size="sm">
                              {subscriptionInfo.subscription?.status === "active" ? "نشط ومفعل" : subscriptionInfo.subscription?.status || "نشط"}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            الدورة الحالية: {subscriptionInfo.subscription?.billing_cycle === "yearly" ? "سنوية" : "شهرية"} • ينتهي الاشتراك في: {subscriptionInfo.subscription?.ends_at ? new Date(subscriptionInfo.subscription.ends_at).toLocaleDateString("ar-EG") : "اشتراك ساري"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right md:text-left bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">الأيام المتبقية:</span>
                        <span className="text-xl font-black text-amber-400">{subscriptionInfo.days_remaining} يوم</span>
                      </div>
                    </div>

                    {/* Limits comparison cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-xs text-slate-400 font-bold block">حد المحلات والأنشطة</span>
                        <div className="text-xl font-black text-white">
                          {subscriptionInfo.usage.activities_count} / {subscriptionInfo.plan.limits.max_activities >= 999 ? "غير محدود" : subscriptionInfo.plan.limits.max_activities}
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (subscriptionInfo.usage.activities_count / (subscriptionInfo.plan.limits.max_activities || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-xs text-slate-400 font-bold block">حد المنتجات والخدمات</span>
                        <div className="text-xl font-black text-white">
                          {subscriptionInfo.usage.products_count} / {subscriptionInfo.plan.limits.max_products >= 999 ? "غير محدود" : subscriptionInfo.plan.limits.max_products}
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (subscriptionInfo.usage.products_count / (subscriptionInfo.plan.limits.max_products || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-xs text-slate-400 font-bold block">العروض والخصومات</span>
                        <div className="text-xl font-black text-white">
                          {subscriptionInfo.plan.limits.can_create_offers ? "متاح (نشط)" : "غير متاح"}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {subscriptionInfo.plan.limits.can_create_offers ? "يمكنك نشر عروض ترويجية غير محدودة" : "يتطلب الترقية للباقة الاحترافية"}
                        </p>
                      </div>

                      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-xs text-slate-400 font-bold block">استيراد وتصدير CSV</span>
                        <div className="text-xl font-black text-white">
                          {subscriptionInfo.plan.limits.can_use_import_export ? "متاح (نشط)" : "غير متاح"}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {subscriptionInfo.plan.limits.can_use_import_export ? "يمكنك استيراد وتصدير الكتالوجات بضغطة واحدة" : "يتطلب الترقية للباقة الاحترافية"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ADD / EDIT PRODUCT                                          */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? "تعديل بيانات وسعر المنتج" : "إضافة منتج / خدمة جديدة"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-right" dir="rtl">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              النشاط التجاري / المحل التابع له <span className="text-red-500">*</span>
            </label>
            <select
              value={productForm.activity_id}
              onChange={e => setProductForm({ ...productForm, activity_id: parseInt(e.target.value) })}
              required
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none font-bold"
            >
              {activities.map(act => (
                <option key={act.id} value={act.id}>
                  {act.name_ar} ({act.address_ar})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="اسم المنتج أو الخدمة"
              required
              placeholder="مثال: بيتزا مارجريتا إيطالي"
              value={productForm.name}
              onChange={e => setProductForm({ ...productForm, name: e.target.value })}
            />
            <Input
              label="كود الصنف (SKU)"
              placeholder="مثال: PIZZA-001"
              value={productForm.sku}
              onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="السعر الأساسي"
              type="number"
              step="0.5"
              required
              placeholder="مثال: 150"
              value={productForm.price}
              onChange={e => setProductForm({ ...productForm, price: e.target.value })}
            />
            <Input
              label="سعر الخصم / العرض (اختياري)"
              type="number"
              step="0.5"
              placeholder="مثال: 120"
              value={productForm.sale_price}
              onChange={e => setProductForm({ ...productForm, sale_price: e.target.value })}
            />
            <Input
              label="العملة"
              placeholder="ج.م"
              value={productForm.currency}
              onChange={e => setProductForm({ ...productForm, currency: e.target.value })}
            />
          </div>

          <Textarea
            label="وصف موجز للمنتج"
            rows={2}
            placeholder="مكونات المنتج، تفاصيل الخدمة، أو مدة الضمان..."
            value={productForm.short_description}
            onChange={e => setProductForm({ ...productForm, short_description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="رابط صورة الغلاف"
              placeholder="https://images.unsplash.com/..."
              value={productForm.cover_image}
              onChange={e => setProductForm({ ...productForm, cover_image: e.target.value })}
            />
            <Input
              label="ملاحظة التوفر والطلب"
              placeholder="متوفر للطلب الفوري"
              value={productForm.availability_note}
              onChange={e => setProductForm({ ...productForm, availability_note: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-800">حالة التوفر الحالية للزبائن:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.is_available}
                onChange={e => setProductForm({ ...productForm, is_available: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="mr-3 text-xs font-bold text-slate-700">
                {productForm.is_available ? "متوفر للطلب" : "غير متوفر مؤقتاً"}
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setProductModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submittingProduct}>
              {editingProduct ? "حفظ التعديلات" : "إضافة المنتج الآن"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ADD / EDIT ACTIVITY & MAP LOCATION                          */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title={editingActivity ? "تعديل بيانات وموقع النشاط التجاري" : "إضافة محل أو نشاط تجاري جديد"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveActivity} className="space-y-4 text-right" dir="rtl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="اسم النشاط بالعربية"
              required
              placeholder="مثال: مطعم الشرق للمأكولات"
              value={activityForm.name_ar}
              onChange={e => setActivityForm({ ...activityForm, name_ar: e.target.value })}
            />
            <Input
              label="الاسم بالإنجليزية (اختياري)"
              placeholder="Al-Sharq Restaurant"
              value={activityForm.name_en}
              onChange={e => setActivityForm({ ...activityForm, name_en: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التصنيف والقطاع <span className="text-red-500">*</span>
              </label>
              <select
                value={activityForm.category_id}
                onChange={e => setActivityForm({ ...activityForm, category_id: parseInt(e.target.value) })}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none font-bold"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المنطقة / المحافظة <span className="text-red-500">*</span>
              </label>
              <select
                value={activityForm.location_id}
                onChange={e => {
                  const locId = parseInt(e.target.value);
                  const locRec = locations.find(l => l.id === locId);
                  setActivityForm({
                    ...activityForm,
                    location_id: locId,
                    latitude: locRec ? locRec.latitude : activityForm.latitude,
                    longitude: locRec ? locRec.longitude : activityForm.longitude,
                  });
                }}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none font-bold"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="رقم الهاتف للاتصال"
              placeholder="01012345678"
              value={activityForm.phone}
              onChange={e => setActivityForm({ ...activityForm, phone: e.target.value })}
            />
            <Input
              label="رقم واتساب المباشر للطلبات"
              placeholder="01012345678"
              value={activityForm.whatsapp_number}
              onChange={e => setActivityForm({ ...activityForm, whatsapp_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="العنوان المختصر"
              required
              placeholder="الشارع الرئيسي - بجوار البنك الأهلي"
              value={activityForm.address_ar}
              onChange={e => setActivityForm({ ...activityForm, address_ar: e.target.value })}
            />
            <Input
              label="أوقات وساعات العمل"
              placeholder="يومياً من 09:00 ص إلى 11:00 م"
              value={activityForm.working_hours}
              onChange={e => setActivityForm({ ...activityForm, working_hours: e.target.value })}
            />
          </div>

          {/* Interactive Location Picker on Leaflet Map */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>تحديد الموقع الجغرافي الدقيق على الخريطة (GPS):</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {activityForm.latitude.toFixed(4)}, {activityForm.longitude.toFixed(4)}
              </span>
            </div>

            <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-200 relative">
              <MapContainer
                center={[activityForm.latitude, activityForm.longitude]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MerchantMapPicker
                  coords={{ lat: activityForm.latitude, lng: activityForm.longitude }}
                  onChange={(lat, lng) => setActivityForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                />
              </MapContainer>
            </div>
            <p className="text-[11px] text-slate-400">انقر في أي مكان على الخريطة لنقل دبوس موقع المحل بدقة.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setActivityModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submittingActivity}>
              {editingActivity ? "حفظ تعديلات النشاط" : "إرسال النشاط للاعتماد"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: INQUIRY DETAILS                                             */}
      {/* ------------------------------------------------------------------ */}
      {selectedInquiry && (
        <Modal
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title="تفاصيل استفسار العميل"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-right" dir="rtl">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{selectedInquiry.customer_name}</span>
                <span className="text-xs font-mono text-slate-500">{selectedInquiry.customer_phone}</span>
              </div>
              <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                "{selectedInquiry.message}"
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                تاريخ الإرسال: {new Date(selectedInquiry.created_at).toLocaleString("ar-EG")}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${selectedInquiry.customer_phone.replace(/\+/g, "").replace(/\s/g, "")}?text=${encodeURIComponent(
                  `مرحباً ${selectedInquiry.customer_name}، شكراً لتواصلك مع متجرنا على دليل أي خدمة...`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة فورية عبر واتساب</span>
              </a>

              <a
                href={`tel:${selectedInquiry.customer_phone}`}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>اتصال</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: IMPORT / EXPORT CSV PRODUCTS                                */}
      {/* ------------------------------------------------------------------ */}
      <ImportExportModal
        isOpen={importExportModalOpen}
        onClose={() => setImportExportModalOpen(false)}
        activities={activities}
        onImportSuccess={() => {
          loadData();
          showToast("تم استيراد قائمة المنتجات بنجاح إلى الكتالوج!");
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: SUBSCRIPTION & PRICING PLANS UPGRADE                        */}
      {/* ------------------------------------------------------------------ */}
      <SubscriptionPlanModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        subscriptionInfo={subscriptionInfo}
        onSubscriptionUpdated={() => {
          loadData();
          showToast("تم تحديث خطة الاشتراك بنجاح!");
        }}
      />
    </div>
  );
}
