// ============================================================================
// Daleel Ay Khidma - Unified Platform Settings Context & Hook
// Single Source of Truth for General Info, Branding, Social, SEO & Mobile Config
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SiteSettingsDTO } from "../types";
import { api } from "../api-client";
import { useI18n } from "../i18n";

export const DEFAULT_SITE_SETTINGS: SiteSettingsDTO = {
  site_name_ar: "دليل أي خدمة",
  site_name_en: "Daleel Ay Khidma",
  tagline_ar: "دليلك التجاري والخدمي الموثوق في مصر",
  tagline_en: "Your Trusted Business & Services Directory in Egypt",
  description_ar: "المنصة الرائدة لربط العملاء بأفضل الأنشطة التجارية والخدمات الموثوقة مع نظام خرائط دقيق، مقارنة أسعار وبوابة تجار معتمدة.",
  description_en: "The leading directory connecting users with trusted shops, medical centers, crafts and services across Egypt with verified ratings and interactive maps.",
  support_email: "sendoo.m@gmail.com",
  support_phone: "+20 100 000 0001",
  support_whatsapp: "+201011122233",
  office_address_ar: "برج النيل الإداري، المعادي، القاهرة، جمهورية مصر العربية",
  office_address_en: "Nile Administrative Tower, Maadi, Cairo, Egypt",
  default_currency: "EGP",
  default_country: "مصر",
  default_governorate_id: 1,

  // Branding
  logo_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150",
  logo_dark_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150",
  favicon_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=32",
  og_image_url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200",
  primary_color: "#4f46e5",
  secondary_color: "#059669",

  // Social & Apps
  facebook_url: "https://facebook.com/daleel.eg",
  x_twitter_url: "https://x.com/daleel_eg",
  instagram_url: "https://instagram.com/daleel_eg",
  youtube_url: "https://youtube.com/@daleel_eg",
  tiktok_url: "https://tiktok.com/@daleel_eg",
  linkedin_url: "https://linkedin.com/company/daleel-eg",
  telegram_channel: "https://t.me/daleel_eg_channel",
  android_user_app_url: "https://play.google.com/store/apps/details?id=com.daleel.user",
  ios_user_app_url: "https://apps.apple.com/app/daleel-ay-khidma/id123456789",
  android_merchant_app_url: "https://play.google.com/store/apps/details?id=com.daleel.vendor",
  ios_merchant_app_url: "https://apps.apple.com/app/daleel-vendor-portal/id987654321",

  // Functional toggles
  allow_visitor_registration: true,
  require_email_verification: false,
  allow_guest_reviews: false,
  price_comparison_enabled: true,
  whatsapp_direct_chat_enabled: true,
  maintenance_mode: false,
  maintenance_message_ar: "المنصة قيد التحديث الدوري المجدول، سنعود للعمل خلال دقائق معدودة.",
  maintenance_message_en: "Scheduled platform maintenance in progress. We will be back online shortly.",
  max_upload_size_mb: 15,

  // SEO & Meta
  meta_title_ar: "دليل أي خدمة • دليل المحلات والخدمات والحرفيين في مصر",
  meta_title_en: "Daleel Ay Khidma • Directory of Shops, Services & Crafts in Egypt",
  meta_description_ar: "اكتشف أفضل المحلات والمراكز الطبية والحرفيين وقارن الأسعار في مصر.",
  meta_description_en: "Discover top shops, clinics, craftsmen and compare product prices across Egypt.",
  meta_keywords: "دليل, خدمات, مصر, محلات, مطاعم, صيانة, أطباء, أسعار, خريطة",
  google_analytics_id: "G-DALEEL2025EG",
  footer_copyright_ar: "جميع الحقوق محفوظة © دليل أي خدمة",
  footer_copyright_en: "All rights reserved © Daleel Ay Khidma",

  // Flutter / Mobile
  mobile_api_version: "2.4.0",
  min_supported_user_app_version: "1.0.0",
  min_supported_merchant_app_version: "1.0.0",
  deep_link_scheme: "daleel",
  user_app_package_id: "com.daleel.userapp",
  merchant_app_package_id: "com.daleel.merchantapp",
};

const STORAGE_KEY = "daleel_platform_settings_v2";

interface SettingsContextType {
  settings: SiteSettingsDTO;
  siteName: string;
  tagline: string;
  description: string;
  officeAddress: string;
  footerCopyright: string;
  maintenanceMessage: string;
  metaTitle: string;
  metaDescription: string;
  isMaintenanceMode: boolean;
  loading: boolean;
  updateSettings: (newSettings: Partial<SiteSettingsDTO>) => Promise<SiteSettingsDTO>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { lang, isRtl } = useI18n();

  // 1. Initial State from localStorage fallback or defaults
  const [settings, setSettings] = useState<SiteSettingsDTO>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_SITE_SETTINGS, ...parsed };
        }
      } catch (e) {
        console.warn("Failed to load settings from storage:", e);
      }
    }
    return DEFAULT_SITE_SETTINGS;
  });

  const [loading, setLoading] = useState(false);

  // 2. Fetch fresh settings from the API on mount
  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      if (res.data) {
        setSettings((prev) => {
          const merged = { ...prev, ...res.data };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {
              console.warn("Failed to save settings to localStorage:", e);
            }
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn("Failed to load platform settings from server:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // 3. Update Settings method (calls API, updates React state, saves locally)
  const updateSettings = async (newSettings: Partial<SiteSettingsDTO>): Promise<SiteSettingsDTO> => {
    // Optimistic / Local update immediately
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn("Failed to save updated settings to storage:", e);
      }
    }

    try {
      const res = await api.updateSettings(merged);
      if (res.data) {
        setSettings(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        }
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update settings on server:", err);
    }
    return merged;
  };

  // 4. Localized getters
  const siteName = lang === "en" ? (settings.site_name_en || settings.site_name_ar) : (settings.site_name_ar || settings.site_name_en);
  const tagline = lang === "en" ? (settings.tagline_en || settings.tagline_ar) : (settings.tagline_ar || settings.tagline_en);
  const description = lang === "en" ? (settings.description_en || settings.description_ar) : (settings.description_ar || settings.description_en);
  const officeAddress = lang === "en" ? (settings.office_address_en || settings.office_address_ar) : (settings.office_address_ar || settings.office_address_en);
  const footerCopyright = lang === "en" ? (settings.footer_copyright_en || settings.footer_copyright_ar) : (settings.footer_copyright_ar || settings.footer_copyright_en);
  const maintenanceMessage = lang === "en" ? (settings.maintenance_message_en || settings.maintenance_message_ar) : (settings.maintenance_message_ar || settings.maintenance_message_en);
  const metaTitle = lang === "en" ? (settings.meta_title_en || settings.meta_title_ar || `${siteName} - ${tagline}`) : (settings.meta_title_ar || `${siteName} • ${tagline}`);
  const metaDescription = lang === "en" ? (settings.meta_description_en || settings.meta_description_ar || description) : (settings.meta_description_ar || description);

  // 5. Dynamic HTML Document Head synchronization (Title, Favicon, Meta Description, Meta OG)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${siteName} • ${tagline}`;

      // Meta Description
      let metaDescEl = document.querySelector('meta[name="description"]');
      if (!metaDescEl) {
        metaDescEl = document.createElement("meta");
        metaDescEl.setAttribute("name", "description");
        document.head.appendChild(metaDescEl);
      }
      metaDescEl.setAttribute("content", metaDescription);

      // OpenGraph Title
      let ogTitleEl = document.querySelector('meta[property="og:title"]');
      if (ogTitleEl) {
        ogTitleEl.setAttribute("content", `${siteName} • ${tagline}`);
      }

      // OpenGraph Description
      let ogDescEl = document.querySelector('meta[property="og:description"]');
      if (ogDescEl) {
        ogDescEl.setAttribute("content", metaDescription);
      }

      // Favicon if provided
      if (settings.favicon_url) {
        let linkIcon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!linkIcon) {
          linkIcon = document.createElement("link");
          linkIcon.rel = "icon";
          document.head.appendChild(linkIcon);
        }
        linkIcon.href = settings.favicon_url;
      }
    }
  }, [siteName, tagline, metaDescription, settings.favicon_url]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        siteName,
        tagline,
        description,
        officeAddress,
        footerCopyright,
        maintenanceMessage,
        metaTitle,
        metaDescription,
        isMaintenanceMode: Boolean(settings.maintenance_mode),
        loading,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
