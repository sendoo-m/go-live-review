// ============================================================================
// Daleel Ay Khidma - Centralized i18n & Localization Engine (Arabic & English)
// ============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SupportedLocale = "ar" | "en";
export type TextDirection = "rtl" | "ltr";

export interface TranslationsDict {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const DICTIONARY: TranslationsDict = {
  // App & Brand
  "app.name": { ar: "دليل أي خدمة", en: "Daleel Ay Khidma" },
  "app.tagline": { ar: "دليلك التجاري والخدمي الموثوق", en: "Your Trusted Business & Services Directory" },
  "app.country_badge": { ar: "مصر", en: "Egypt" },
  "app.official_announcement": {
    ar: "منصة دليل أي خدمة الرسمية • نظام خرائط تفاعلي، كتالوج أسعار، وبوابة تجار",
    en: "Official Daleel Ay Khidma Platform • Interactive Maps, Price Catalog & Vendor Portal",
  },

  // Navigation
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.activities": { ar: "دليل الأنشطة", en: "Directory" },
  "nav.offers": { ar: "العروض والخصومات", en: "Hot Deals & Offers" },
  "nav.map": { ar: "خريطة الخدمات", en: "Services Map" },
  "nav.categories": { ar: "التصنيفات", en: "Categories" },
  "nav.locations": { ar: "المدن والمحافظات", en: "Locations" },
  "nav.add_activity": { ar: "أضف نشاطك التجاري", en: "Add Your Business" },
  "nav.vendor_portal": { ar: "بوابة التجار والخدمات", en: "Vendor Portal" },
  "nav.admin_panel": { ar: "لوحة الإدارة", en: "Admin Dashboard" },
  "nav.profile": { ar: "الملف الشخصي", en: "My Profile" },
  "nav.settings": { ar: "إعدادات المنصة", en: "Platform Settings" },
  "nav.language": { ar: "اللغة", en: "Language" },

  // Auth & Account
  "auth.login": { ar: "تسجيل الدخول", en: "Sign In" },
  "auth.register": { ar: "إنشاء حساب جديد", en: "Create Account" },
  "auth.logout": { ar: "تسجيل الخروج", en: "Sign Out" },
  "auth.forgot_password": { ar: "نسيت كلمة المرور؟", en: "Forgot Password?" },
  "auth.reset_password": { ar: "استعادة كلمة المرور", en: "Reset Password" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email Address" },
  "auth.phone": { ar: "رقم الهاتف", en: "Phone Number" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.confirm_password": { ar: "تأكيد كلمة المرور", en: "Confirm Password" },
  "auth.full_name": { ar: "الاسم الكامل", en: "Full Name" },
  "auth.governorate": { ar: "المحافظة / النطاق السكني", en: "Governorate / Region" },
  "auth.remember_me": { ar: "تذكر بياناتي", en: "Remember me" },
  "auth.dont_have_account": { ar: "ليس لديك حساب بعد؟", en: "Don't have an account?" },
  "auth.already_have_account": { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  "auth.welcome_back": { ar: "أهلاً بك مجدداً!", en: "Welcome Back!" },
  "auth.join_community": { ar: "انضم لمجتمع دليل أي خدمة", en: "Join Daleel Ay Khidma" },
  "auth.login_description": {
    ar: "قم بالدخول لإدارة أنشطتك، حفظ المفضلة، وتقييم الخدمات والمنتجات.",
    en: "Sign in to manage your activities, save favorites, and review services.",
  },
  "auth.send_otp": { ar: "إرسال رمز التحقق", en: "Send Verification Code" },
  "auth.verify_and_continue": { ar: "تحقق ومتابعة", en: "Verify & Continue" },
  "auth.terms_agreement": {
    ar: "أوافق على الشروط والأحكام وسياسة الخصوصية",
    en: "I agree to Terms & Conditions and Privacy Policy",
  },

  // Social & Sharing
  "share.title": { ar: "مشاركة عبر المنصات", en: "Share on Social Media" },
  "share.subtitle": { ar: "شارك هذا المحل أو الخدمة مع أصدقائك وعائلتك", en: "Share this business or service with friends & family" },
  "share.whatsapp": { ar: "واتساب", en: "WhatsApp" },
  "share.facebook": { ar: "فيسبوك", en: "Facebook" },
  "share.x": { ar: "تويتر / X", en: "X (Twitter)" },
  "share.telegram": { ar: "تيليجرام", en: "Telegram" },
  "share.linkedin": { ar: "لينكد إن", en: "LinkedIn" },
  "share.copy_link": { ar: "نسخ الرابط المباشر", en: "Copy Direct Link" },
  "share.link_copied": { ar: "تم نسخ الرابط بنجاح!", en: "Link copied to clipboard!" },
  "share.native_share": { ar: "مشاركة عبر تطبيقات الهاتف", en: "Share via device apps" },
  "share.qr_code": { ar: "رمز الاستجابة السريعة (QR)", en: "QR Code" },
  "share.deep_link": { ar: "رابط التطبيق المباشر (Deep Link)", en: "App Deep Link" },

  // Search & Map
  "search.placeholder": {
    ar: "ابحث عن محل، خدمة، صيدلية، مطعم، نجار، سباك، أو منتج بالاسم...",
    en: "Search for a shop, service, pharmacy, craftsman, doctor, or product...",
  },
  "search.unified_title": { ar: "البحث الشامل والموحد", en: "Unified Live Search" },
  "search.all": { ar: "الكل", en: "All" },
  "search.shops": { ar: "محلات ومتاجر", en: "Shops & Stores" },
  "search.services": { ar: "خدمات وحرف", en: "Services & Crafts" },
  "search.products": { ar: "منتجات وأسعار", en: "Products & Prices" },
  "search.results_count": { ar: "نتائج البحث", en: "Search Results" },
  "search.no_results": { ar: "لم يتم العثور على نتائج مطابقة", en: "No matching results found" },
  "search.filter": { ar: "فلترة وتصفية", en: "Filters" },
  "search.governorate": { ar: "المحافظة", en: "Governorate" },
  "search.city": { ar: "المدينة / المركز", en: "City / District" },
  "search.category": { ar: "التصنيف", en: "Category" },
  "search.delivery_available": { ar: "خدمة التوصيل متاحة", en: "Delivery Available" },
  "search.verified_only": { ar: "أنشطة موثقة فقط", en: "Verified Businesses Only" },
  "search.sort_by": { ar: "ترتيب حسب", en: "Sort By" },
  "search.sort_relevance": { ar: "الأكثر صلة", en: "Most Relevant" },
  "search.sort_rating": { ar: "الأعلى تقييماً", en: "Highest Rated" },
  "search.sort_views": { ar: "الأكثر مشاهدة", en: "Most Viewed" },
  "search.sort_newest": { ar: "الأحدث تسجيلاً", en: "Newest" },

  // Activity Details
  "activity.verified": { ar: "نشاط موثق رسمياً", en: "Officially Verified Business" },
  "activity.pending": { ar: "قيد المراجعة والتدقيق", en: "Under Review" },
  "activity.featured": { ar: "نشاط مميز", en: "Featured Business" },
  "activity.views": { ar: "مشاهدة", en: "views" },
  "activity.reviews": { ar: "تقييم", en: "reviews" },
  "activity.working_hours": { ar: "مواعيد العمل", en: "Working Hours" },
  "activity.phone": { ar: "اتصال هاتفي", en: "Call Phone" },
  "activity.whatsapp_direct": { ar: "واتساب مباشر", en: "WhatsApp Chat" },
  "activity.directions": { ar: "الاتجاهات على الخريطة", en: "Get Directions" },
  "activity.products_catalog": { ar: "قائمة المنتجات والأسعار", en: "Products & Price List" },
  "activity.send_inquiry": { ar: "طلب استفسار أو حجز", en: "Send Inquiry / Order" },
  "activity.add_review": { ar: "أضف تقييمك وتجربتك", en: "Add Your Review" },
  "activity.report": { ar: "إبلاغ عن بيانات غير صحيحة", en: "Report Listing" },
  "activity.save_favorite": { ar: "حفظ في المفضلة", en: "Save to Favorites" },
  "activity.share": { ar: "مشاركة النشاط", en: "Share Listing" },

  // Mobile / Flutter App
  "mobile.user_app": { ar: "تطبيق مستخدم دليل أي خدمة", en: "Daleel User Mobile App" },
  "mobile.merchant_app": { ar: "تطبيق تاجر دليل أي خدمة", en: "Daleel Merchant Mobile App" },
  "mobile.download_android": { ar: "تحميل للأندرويد (Google Play)", en: "Download for Android" },
  "mobile.download_ios": { ar: "تحميل للآيفون (App Store)", en: "Download for iOS" },
  "mobile.flutter_ready": { ar: "معمارية مهيأة لتطبيقات Flutter 100%", en: "100% Flutter Mobile Ready Architecture" },

  // Common UI & Actions
  "common.app_name": { ar: "دليل أي خدمة", en: "Daleel Ay Khidma" },
  "common.tagline": { ar: "دليلك التجاري والخدمي الموثوق", en: "Your Trusted Business & Services Directory" },
  "common.platform_announcement": {
    ar: "منصة دليل أي خدمة الرسمية • نظام خرائط تفاعلي، كتالوج أسعار، وبوابة تجار",
    en: "Official Daleel Ay Khidma Platform • Interactive Maps, Price Catalog & Vendor Portal",
  },
  "common.footer_about": {
    ar: "المنصة التجارية والخدمية الأولى في مصر لاستكشاف المحلات، المراكز الطبية، الحرفيين، مقارنة الأسعار وحجز الخدمات مباشرة.",
    en: "The leading business and service platform in Egypt to discover shops, clinics, craftsmen, compare prices, and connect directly.",
  },
  "common.trust_desc": {
    ar: "نظام تدقيق صارم لبيانات الأنشطة التجارية والتراخيص لمنحك تجربة بحث آمنة وموثوقة 100%.",
    en: "Rigorous verification system for business data and licenses to guarantee a 100% trusted search experience.",
  },
  "common.verified_badge": { ar: "توثيق رسمي معتمد", en: "Officially Verified" },
  "common.all_rights_reserved": { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  "nav.vendor_panel": { ar: "لوحة التجار والخدمات", en: "Vendor Portal" },
  "nav.login": { ar: "تسجيل الدخول", en: "Sign In" },
  "nav.register": { ar: "إنشاء حساب جديد", en: "Register" },
  "nav.logout": { ar: "تسجيل الخروج", en: "Sign Out" },
  "nav.quick_links": { ar: "روابط سريعة", en: "Quick Links" },
  "nav.top_categories": { ar: "أشهر التصنيفات", en: "Top Categories" },
  "nav.trust_security": { ar: "الموثوقية والأمان", en: "Trust & Security" },
  "common.save": { ar: "حفظ التغييرات", en: "Save Changes" },
  "common.saved_successfully": { ar: "تم الحفظ بنجاح!", en: "Saved successfully!" },
  "common.cancel": { ar: "إلغاء", en: "Cancel" },
  "common.close": { ar: "إغلاق", en: "Close" },
  "common.submit": { ar: "إرسال", en: "Submit" },
  "common.loading": { ar: "جاري التحميل...", en: "Loading..." },
  "common.all": { ar: "الكل", en: "All" },
  "common.view_details": { ar: "عرض التفاصيل", en: "View Details" },
  "common.egp": { ar: "ج.م", en: "EGP" },
  "common.currency": { ar: "جنيه مصري", en: "Egyptian Pound" },
  "common.back": { ar: "رجوع", en: "Back" },
  "common.success": { ar: "تمت العملية بنجاح", en: "Operation succeeded" },
  "common.error": { ar: "حدث خطأ غير متوقع", en: "An unexpected error occurred" },
};

interface I18nContextType {
  locale: SupportedLocale;
  lang: SupportedLocale;
  language: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  setLanguage: (locale: SupportedLocale) => void;
  toggleLocale: () => void;
  dir: TextDirection;
  isRtl: boolean;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    try {
      const stored = localStorage.getItem("daleel_locale");
      if (stored === "en" || stored === "ar") return stored;
    } catch (e) {
      // ignore
    }
    return "ar";
  });

  const dir: TextDirection = locale === "ar" ? "rtl" : "ltr";
  const isRtl = locale === "ar";

  useEffect(() => {
    try {
      localStorage.setItem("daleel_locale", locale);
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
    } catch (e) {
      // ignore
    }
  }, [locale, dir]);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
  };

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const t = (key: string, fallback?: string): string => {
    const entry = DICTIONARY[key];
    if (!entry) {
      return fallback || key;
    }
    return entry[locale] || fallback || entry.ar || key;
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        lang: locale,
        language: locale,
        setLocale,
        setLanguage: setLocale,
        toggleLocale,
        dir,
        isRtl,
        t,
      }}
    >
      <div dir={dir} className={locale === "ar" ? "font-sans" : "font-sans"}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
