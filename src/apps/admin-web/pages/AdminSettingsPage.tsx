// ============================================================================
// Daleel Ay Khidma - Comprehensive Admin Platform Settings Page
// General Info, Branding, Social/Apps, Functional Toggles, SEO, Flutter Mobile Specs
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { SiteSettingsDTO } from "../../../packages/types";
import { useI18n } from "../../../packages/i18n";
import { useSettings } from "../../../packages/settings";
import {
  Settings,
  Globe,
  Palette,
  Share2,
  Sliders,
  Search,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  Code2,
  Download,
  Copy,
  Check,
  HardDrive,
  CloudUpload,
  Image as ImageIcon,
  FolderTree,
  Upload,
  Link2,
} from "lucide-react";

export function AdminSettingsPage() {
  const { t, isRtl } = useI18n();
  const { settings: globalSettings, updateSettings: saveGlobalSettings, loading: globalLoading, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "social_apps" | "toggles" | "seo" | "flutter" | "storage">("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // R2 Diagnostic and Live Upload state
  const [r2Status, setR2Status] = useState<any>(null);
  const [loadingR2Status, setLoadingR2Status] = useState(false);
  const [testUploadFile, setTestUploadFile] = useState<File | null>(null);
  const [testUploadFolder, setTestUploadFolder] = useState<"activities" | "products" | "offers" | "profiles" | "media">("products");
  const [uploadingTest, setUploadingTest] = useState(false);
  const [testUploadResult, setTestUploadResult] = useState<any>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);


  // Settings Local Form State
  const [settings, setSettings] = useState<SiteSettingsDTO>(globalSettings);

  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings);
    }
  }, [globalSettings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await saveGlobalSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setError(err?.message || "فشل حفظ الإعدادات، يرجى التحقق من الخادم.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SiteSettingsDTO, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const copyFlutterConfigJson = () => {
    const config = {
      baseUrl: typeof window !== "undefined" ? window.location.origin + "/api/v2" : "https://daleel.test/api/v2",
      deepLinkScheme: settings.deep_link_scheme,
      apiVersion: settings.mobile_api_version,
      userApp: {
        packageId: settings.user_app_package_id,
        minVersion: settings.min_supported_user_app_version,
        storeUrlAndroid: settings.android_user_app_url,
        storeUrlIos: settings.ios_user_app_url,
      },
      merchantApp: {
        packageId: settings.merchant_app_package_id,
        minVersion: settings.min_supported_merchant_app_version,
        storeUrlAndroid: settings.android_merchant_app_url,
        storeUrlIos: settings.ios_merchant_app_url,
      },
      auth: {
        tokenType: "Bearer",
        allowRegistration: settings.allow_visitor_registration,
        loginEndpoint: "/auth/login",
        registerEndpoint: "/auth/register",
        refreshEndpoint: "/auth/refresh",
        profileEndpoint: "/auth/me",
      },
    };

    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const fetchR2Status = async () => {
    setLoadingR2Status(true);
    try {
      const res = await api.getR2MediaStatus();
      setR2Status(res);
    } catch (err: any) {
      setR2Status({
        success: false,
        diagnostic: { success: false, message: err.message || "تعذر الوصول إلى مسار الفحص" },
      });
    } finally {
      setLoadingR2Status(false);
    }
  };

  useEffect(() => {
    if (activeTab === "storage") {
      fetchR2Status();
    }
  }, [activeTab]);

  const handleTestUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUploadFile) return;

    setUploadingTest(true);
    setTestUploadResult(null);

    try {
      const res = await api.uploadMedia(testUploadFile, {
        folder: testUploadFolder,
        fileName: testUploadFile.name,
      });

      if (res.success && res.data) {
        setTestUploadResult(res.data);
      }
    } catch (err: any) {
      alert(`فشل رفع الصورة: ${err.message || "خطأ غير متوقع"}`);
    } finally {
      setUploadingTest(false);
    }
  };

  const navTabs = [
    { id: "general", label: "معلومات المنصة والاتصال", labelEn: "General & Contact", icon: Globe },
    { id: "branding", label: "الهوية والشعارات", labelEn: "Branding & Logos", icon: Palette },
    { id: "storage", label: "تخزين الوسائط (Cloudflare R2)", labelEn: "R2 Media Storage", icon: CloudUpload },
    { id: "social_apps", label: "السوشيال وتطبيقات المتاجر", labelEn: "Social & App Stores", icon: Share2 },
    { id: "toggles", label: "المفاتيح التشغيلية والصيانة", labelEn: "Functional Toggles", icon: Sliders },
    { id: "seo", label: "محركات البحث والأرشفة", labelEn: "SEO & Metadata", icon: Search },
    { id: "flutter", label: "تجهيز تطبيقات Flutter Mobile", labelEn: "Flutter Architecture", icon: Smartphone },
  ];


  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-600">جاري تحميل إعدادات المنصة الشاملة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Save Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">إعدادات المنصة الشاملة</h1>
              <p className="text-xs text-slate-500">
                لوحة التحكم المركزية للهوية، بيانات التواصل، بوابات الحسابات، وتجهيز تطبيقات الهاتف
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {savedSuccess && (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>تم حفظ كافة التغييرات بنجاح!</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-950/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span>{isRtl ? tab.label : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General Info & Contact */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>مسميات المنصة والوصف (عربي / English)</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">اسم المنصة (بالعربية)</label>
                  <input
                    type="text"
                    value={settings.site_name_ar}
                    onChange={(e) => updateField("site_name_ar", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Site Name (English)</label>
                  <input
                    type="text"
                    value={settings.site_name_en}
                    onChange={(e) => updateField("site_name_en", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الشعار اللفظي (العربية)</label>
                  <input
                    type="text"
                    value={settings.tagline_ar}
                    onChange={(e) => updateField("tagline_ar", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tagline (English)</label>
                  <input
                    type="text"
                    value={settings.tagline_en}
                    onChange={(e) => updateField("tagline_en", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">الوصف التعريفي الشامل (بالعربية)</label>
                <textarea
                  rows={3}
                  value={settings.description_ar}
                  onChange={(e) => updateField("description_ar", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Description (English)</label>
                <textarea
                  rows={3}
                  value={settings.description_en}
                  onChange={(e) => updateField("description_en", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>بيانات الاتصال والمقر الإداري</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">بريد الدعم والمراسلات</label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => updateField("support_email", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">رقم الهاتف الرسمي</label>
                  <input
                    type="tel"
                    value={settings.support_phone}
                    onChange={(e) => updateField("support_phone", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">رقم واتساب خدمة العملاء</label>
                  <input
                    type="tel"
                    value={settings.support_whatsapp}
                    onChange={(e) => updateField("support_whatsapp", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">عنوان المقر الرئيسي (بالعربية)</label>
                <input
                  type="text"
                  value={settings.office_address_ar}
                  onChange={(e) => updateField("office_address_ar", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Headquarters Address (English)</label>
                <input
                  type="text"
                  value={settings.office_address_en}
                  onChange={(e) => updateField("office_address_en", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">العملة الافتراضية</label>
                  <input
                    type="text"
                    value={settings.default_currency}
                    onChange={(e) => updateField("default_currency", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الدولة الأساسية</label>
                  <input
                    type="text"
                    value={settings.default_country}
                    onChange={(e) => updateField("default_country", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Branding & Visuals */}
      {activeTab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>الشعارات والألوان الأساسية</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">رابط الشعار المضيء (Light Mode Logo URL)</label>
                <input
                  type="text"
                  value={settings.logo_url}
                  onChange={(e) => updateField("logo_url", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">رابط أيقونة المتصفح (Favicon 32x32 URL)</label>
                <input
                  type="text"
                  value={settings.favicon_url}
                  onChange={(e) => updateField("favicon_url", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">صورة المشاركة الافتراضية على السوشيال (OG Image 1200x630)</label>
                <input
                  type="text"
                  value={settings.og_image_url}
                  onChange={(e) => updateField("og_image_url", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">اللون الأساسي (Primary Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => updateField("primary_color", e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.primary_color}
                      onChange={(e) => updateField("primary_color", e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">اللون الثانوي (Secondary Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => updateField("secondary_color", e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.secondary_color}
                      onChange={(e) => updateField("secondary_color", e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة حية للشعار والهوية</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">Live Brand</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                {settings.logo_url && (
                  <img src={settings.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-white/20" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">{settings.site_name_ar}</h4>
                  <p className="text-[11px] text-slate-400">{settings.tagline_ar}</p>
                </div>
              </div>

              {settings.og_image_url && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-bold">بطاقة المشاركة الاجتماعية (OG Preview)</span>
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video">
                    <img src={settings.og_image_url} alt="OG" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                      <span className="text-xs font-bold text-white">{settings.site_name_ar}</span>
                      <span className="text-[10px] text-slate-300 truncate">{settings.meta_description_ar}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-[11px] text-indigo-200">
              يتم تطبيق الألوان والشعارات تلقائياً على واجهات المستخدم، لوحة التحكم، وتطبيقات Flutter.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Social & App Stores */}
      {activeTab === "social_apps" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>قنوات التواصل الاجتماعي الرسمية</span>
            </h3>

            <div className="space-y-3.5">
              {[
                { label: "فيسبوك (Facebook Page)", key: "facebook_url" },
                { label: "منصة X (Twitter)", key: "x_twitter_url" },
                { label: "إنستغرام (Instagram)", key: "instagram_url" },
                { label: "يوتيوب (YouTube Channel)", key: "youtube_url" },
                { label: "تيك توك (TikTok)", key: "tiktok_url" },
                { label: "لينكد إن (LinkedIn)", key: "linkedin_url" },
                { label: "قناة تيليجرام (Telegram)", key: "telegram_channel" },
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{item.label}</label>
                  <input
                    type="text"
                    value={(settings as any)[item.key] || ""}
                    onChange={(e) => updateField(item.key as any, e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>روابط تحميل تطبيقات الهواتف (Google Play & App Store)</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                <span className="text-xs font-bold text-indigo-900 block">تطبيق الزوار والعملاء (User App)</span>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">رابط الأندرويد (Google Play)</label>
                    <input
                      type="text"
                      value={settings.android_user_app_url}
                      onChange={(e) => updateField("android_user_app_url", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">رابط الآيفون (Apple App Store)</label>
                    <input
                      type="text"
                      value={settings.ios_user_app_url}
                      onChange={(e) => updateField("ios_user_app_url", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-3">
                <span className="text-xs font-bold text-emerald-900 block">تطبيق التجار ومقدمي الخدمات (Merchant App)</span>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">رابط الأندرويد (Google Play)</label>
                    <input
                      type="text"
                      value={settings.android_merchant_app_url}
                      onChange={(e) => updateField("android_merchant_app_url", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">رابط الآيفون (Apple App Store)</label>
                    <input
                      type="text"
                      value={settings.ios_merchant_app_url}
                      onChange={(e) => updateField("ios_merchant_app_url", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Functional Toggles & Maintenance */}
      {activeTab === "toggles" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>المفاتيح الوظيفية وصلاحيات الزوار</span>
            </h3>

            <div className="space-y-3.5 divide-y divide-slate-100">
              {[
                {
                  id: "allow_visitor_registration",
                  title: "السماح بإنشاء حسابات جديدة للزوار",
                  desc: "تفعيل زر ونموذج التسجيل الذاتي لكافة المستخدمين والعملاء الجدد",
                  checked: settings.allow_visitor_registration,
                },
                {
                  id: "require_email_verification",
                  title: "اشتراط التحقق من البريد / الهاتف قبل التفعيل",
                  desc: "إلزام المستخدمين الجدد بتأكيد رمز OTP قبل إتاحة إضافة تقييمات أو طلبات",
                  checked: settings.require_email_verification,
                },
                {
                  id: "allow_guest_reviews",
                  title: "السماح بالتقييمات دون تسجيل دخول (Guest Reviews)",
                  desc: "إمكانية إرسال التقييمات كزائر مع الاحتفاظ بفحص مكافحة البريد المزعج",
                  checked: settings.allow_guest_reviews,
                },
                {
                  id: "price_comparison_enabled",
                  title: "تفعيل محرك مقارنة الأسعار المباشر",
                  desc: "عرض مؤشرات أرخص سعر وفروقات التكلفة داخل الكتالوج وخريطة الخدمات",
                  checked: settings.price_comparison_enabled,
                },
                {
                  id: "whatsapp_direct_chat_enabled",
                  title: "تفعيل زر محادثة واتساب المباشرة للأنشطة",
                  desc: "تمكين العملاء من بدء محادثة واتساب مباشرة بنقرة واحدة مع المحل أو الحرفي",
                  checked: settings.whatsapp_direct_chat_enabled,
                },
              ].map((toggle) => (
                <div key={toggle.id} className="pt-3.5 first:pt-0 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">{toggle.title}</span>
                    <span className="text-[11px] text-slate-500 block">{toggle.desc}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={toggle.checked}
                      onChange={(e) => updateField(toggle.id as any, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>وضع الصيانة المجدولة وأحجام الملفات</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-amber-950 block">تفعيل وضع الصيانة (Maintenance Mode)</span>
                    <span className="text-[11px] text-amber-800">إظهار شاشة توقف مؤقتة لجميع الزوار باستثناء مديري النظام</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.maintenance_mode}
                      onChange={(e) => updateField("maintenance_mode", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {settings.maintenance_mode && (
                  <div className="space-y-2 pt-2 border-t border-amber-200 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">رسالة الصيانة (بالعربية)</label>
                      <input
                        type="text"
                        value={settings.maintenance_message_ar}
                        onChange={(e) => updateField("maintenance_message_ar", e.target.value)}
                        className="w-full rounded-xl border border-amber-300 px-3 py-1.5 text-xs text-amber-950 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">Maintenance Message (English)</label>
                      <input
                        type="text"
                        value={settings.maintenance_message_en}
                        onChange={(e) => updateField("maintenance_message_en", e.target.value)}
                        className="w-full rounded-xl border border-amber-300 px-3 py-1.5 text-xs text-amber-950 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">الحد الأقصى لحجم رفع الصور والملفات (ميجابايت MB)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.max_upload_size_mb}
                  onChange={(e) => updateField("max_upload_size_mb", parseInt(e.target.value) || 10)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SEO & Metadata */}
      {activeTab === "seo" && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600" />
            <span>تهيئة محركات البحث (SEO) والتحليلات</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">عنوان الميتا الافتراضي (Meta Title AR)</label>
                <input
                  type="text"
                  value={settings.meta_title_ar}
                  onChange={(e) => updateField("meta_title_ar", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Meta Title (English)</label>
                <input
                  type="text"
                  value={settings.meta_title_en}
                  onChange={(e) => updateField("meta_title_en", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">الكلمات الدلالية (Meta Keywords مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={settings.meta_keywords}
                  onChange={(e) => updateField("meta_keywords", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">وصف الميتا الافتراضي (Meta Description AR)</label>
                <textarea
                  rows={2}
                  value={settings.meta_description_ar}
                  onChange={(e) => updateField("meta_description_ar", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Meta Description (English)</label>
                <textarea
                  rows={2}
                  value={settings.meta_description_en}
                  onChange={(e) => updateField("meta_description_en", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">معرف تحليلات جوجل (Google Analytics ID)</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.google_analytics_id}
                  onChange={(e) => updateField("google_analytics_id", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Flutter Mobile Readiness */}
      {activeTab === "flutter" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Flutter Architecture & Mobile Apps Readiness</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">جاهزية كاملة لتطبيقات Flutter (مستخدم وتاجر)</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                الواجهات الخلفية مهيأة بالكامل بنظام RESTful APIs، وتعمل بدون جلسات حالة (Stateless Sanctum Tokens)،
                مع دعم Deep Linking وBootstrap Endpoint لتحميل الإعدادات عند تشغيل التطبيق.
              </p>
            </div>

            <button
              onClick={copyFlutterConfigJson}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? "تم نسخ ملف Config" : "نسخ إعدادات Flutter JSON"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>معاملات حزم الهاتف وروابط Deep Links</span>
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">مخطط الروابط العميقة (Deep Link Scheme)</label>
                  <input
                    type="text"
                    value={settings.deep_link_scheme}
                    onChange={(e) => updateField("deep_link_scheme", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">مثال: daleel://activity/12 أو daleel://offer/5</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">User App Package ID</label>
                    <input
                      type="text"
                      value={settings.user_app_package_id}
                      onChange={(e) => updateField("user_app_package_id", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Merchant Package ID</label>
                    <input
                      type="text"
                      value={settings.merchant_app_package_id}
                      onChange={(e) => updateField("merchant_app_package_id", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">أدنى إصدار مدعوم (User App)</label>
                    <input
                      type="text"
                      value={settings.min_supported_user_app_version}
                      onChange={(e) => updateField("min_supported_user_app_version", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">أدنى إصدار (Merchant App)</label>
                    <input
                      type="text"
                      value={settings.min_supported_merchant_app_version}
                      onChange={(e) => updateField("min_supported_merchant_app_version", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3 font-mono text-xs overflow-x-auto">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-slate-400 font-sans font-bold">API Bootstrap Endpoint Live Response</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">GET /api/v2/app/bootstrap</span>
              </div>
              <pre className="text-emerald-400 text-[11px] leading-relaxed select-all overflow-x-auto">
{`{
  "success": true,
  "data": {
    "app_name": "${settings.site_name_ar}",
    "api_version": "${settings.mobile_api_version}",
    "deep_link_scheme": "${settings.deep_link_scheme}",
    "auth_config": {
      "token_type": "Bearer",
      "allow_registration": ${settings.allow_visitor_registration}
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Cloudflare R2 Media & Storage */}
      {activeTab === "storage" && (
        <div className="space-y-6">
          {/* Top Status & Connection Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">Cloudflare R2 Media Storage</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      r2Status?.config?.isConfigured
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {r2Status?.config?.isConfigured ? "متصل بالإنتاج (Production Ready)" : "وضع المحاكاة السحابية (Sandbox/Simulated)"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    بنية التخزين السحابي للصور والوسائط عالية السرعة المربوطة بالدومين المخصص
                  </p>
                </div>
              </div>

              <button
                onClick={fetchR2Status}
                disabled={loadingR2Status}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingR2Status ? "animate-spin" : ""}`} />
                <span>إعادة فحص الاتصال</span>
              </button>
            </div>

            {/* Diagnostic Message */}
            {r2Status?.diagnostic && (
              <div className={`mt-6 p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 ${
                r2Status.diagnostic.success
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                  : "bg-amber-50/80 border-amber-200 text-amber-800"
              }`}>
                {r2Status.diagnostic.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div>{r2Status.diagnostic.message}</div>
                  {!r2Status.config?.isConfigured && (
                    <div className="text-[11px] font-normal text-amber-700">
                      يتم حفظ واسترجاع الروابط بتنسيق الدومين المخصص <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">https://images.dalilaykhidma.com</code> لضمان استقرار التطبيقات أثناء التطوير. لتفعيل الرفع الحقيقي على R2 أضف بيانات الاعتماد إلى ملف <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env</code>.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configuration Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-500">نطاق تسليم الصور (Custom Domain)</span>
                <div className="text-sm font-black text-slate-900 font-mono flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{r2Status?.config?.publicDomain || "https://images.dalilaykhidma.com"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-500">اسم الحاوية (Bucket Name)</span>
                <div className="text-sm font-black text-slate-900 font-mono flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>{r2Status?.config?.bucketName || "dalil-media"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-500">الحد الأقصى للملف / الصيغ</span>
                <div className="text-xs font-black text-slate-900 font-mono">
                  15 MB (JPG, PNG, WebP, GIF, SVG, AVIF)
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column: Folder Architecture & Live Upload Test */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Folders Structure */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-600" />
                <span>هيكلية مجلدات التخزين المنظمة (Storage Hierarchy)</span>
              </h4>

              <div className="space-y-3">
                {[
                  {
                    folder: "/activities/",
                    desc: "أغلفة وشعارات ومعارض الأنشطة التجارية ومقدمي الخدمات",
                    format: "activities/act_{id}_{timestamp}_{hash}.webp",
                  },
                  {
                    folder: "/products/",
                    desc: "صور المنتجات والكتالوجات وقوائم الأسعار",
                    format: "products/prod_{id}_{timestamp}_{hash}.webp",
                  },
                  {
                    folder: "/offers/",
                    desc: "بانرات العروض الترويجية والخصومات الموسمية",
                    format: "offers/off_{id}_{timestamp}_{hash}.webp",
                  },
                  {
                    folder: "/profiles/",
                    desc: "الصور الرمزية لحسابات المستخدمين والتجار (Avatars)",
                    format: "profiles/usr_{id}_{timestamp}_{hash}.jpg",
                  },
                  {
                    folder: "/reviews/",
                    desc: "مرفقات تقييمات وتجارب العملاء والمستخدمين",
                    format: "reviews/rev_{id}_{timestamp}_{hash}.jpg",
                  },
                  {
                    folder: "/media/",
                    desc: "المكتبة الإعلامية العامة والملفات المشتركة",
                    format: "media/media_{timestamp}_{hash}.jpg",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {item.folder}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">CDN Cached 1-Year</span>
                    </div>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{item.format}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Upload Test Playground */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>منطقة اختبار الرفع المباشر (Interactive Upload Test)</span>
              </h4>

              <form onSubmit={handleTestUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">اختر المجلد المستهدف (Target Folder)</label>
                  <select
                    value={testUploadFolder}
                    onChange={(e) => setTestUploadFolder(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="products">منتجات (/products/)</option>
                    <option value="activities">أنشطة وأغلفة (/activities/)</option>
                    <option value="offers">عروض وخصومات (/offers/)</option>
                    <option value="profiles">ملفات شخصية (/profiles/)</option>
                    <option value="media">مكتبة عامة (/media/)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الملف المراد اختباره</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setTestUploadFile(e.target.files[0]);
                          setTestUploadResult(null);
                        }
                      }}
                      className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {testUploadFile && (
                      <p className="text-[11px] text-emerald-600 font-bold mt-2">
                        الملف المحدد: {testUploadFile.name} ({(testUploadFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!testUploadFile || uploadingTest}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-950/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadingTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>جاري الرفع إلى Cloudflare R2...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <span>رفع واختبار التخزين السحابي</span>
                    </>
                  )}
                </button>
              </form>

              {/* Upload Result Preview */}
              {testUploadResult && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم الرفع والتوليد بنجاح!</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700">
                      {testUploadResult.mime_type} • {(testUploadResult.size_bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-[11px] font-mono text-slate-800 truncate select-all">
                      {testUploadResult.url}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(testUploadResult.url);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2500);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] shrink-0 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? "تم النسخ" : "نسخ الرابط"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Setup Guide Card */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>دليل ربط Cloudflare R2 بالدومين المخصص (Step-by-Step Setup Guide)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-indigo-300">1. إنشاء الـ Bucket في Cloudflare</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  ادخل إلى لوحة Cloudflare &gt; R2 &gt; Create Bucket باسم <code className="text-emerald-300">dalil-media</code> مع ضبط الموقع الجغرافي على Automatic أو أوروپا الشرقية/الشرق الأوسط.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-indigo-300">2. ربط الدومين الفرعي Custom Domain</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  من صفحة الـ Bucket &gt; Settings &gt; Custom Domains &gt; Connect Domain وأدخل <code className="text-emerald-300">images.dalilaykhidma.com</code>. سيقوم Cloudflare بإنشاء سجل DNS تلقائياً وتفعيل SSL المجاني.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-indigo-300">3. إنشاء مفاتيح الـ API Tokens</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  من R2 &gt; Manage R2 API Tokens &gt; Create API Token بصلاحية <code className="text-emerald-300">Object Read & Write</code> للحصول على Access Key ID و Secret Access Key.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-indigo-300">4. تعيين متغيرات البيئة</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono text-[10px] text-emerald-400">
                  R2_ACCOUNT_ID=...<br />
                  R2_ACCESS_KEY_ID=...<br />
                  R2_SECRET_ACCESS_KEY=...<br />
                  R2_BUCKET_NAME=dalil-media<br />
                  R2_PUBLIC_DOMAIN=https://images.dalilaykhidma.com
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

