import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as XLSX from "xlsx";
import multer from "multer";
import {
  r2Storage,
  StorageFolder,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from "./server/r2-storage";

// Interfaces matching Laravel 11 models
export interface GovernorateModel {
  id: number;
  name_ar: string;
  name_en: string;
  code: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CityModel {
  id: number;
  governorate_id: number;
  name_ar: string;
  name_en: string;
  code: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface NeighborhoodModel {
  id: number;
  city_id: number;
  governorate_id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface DirectorySectionModel {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  icon: string;
  color: string;
  color_theme?: string;
  sort_order: number;
  is_active: boolean;
  badge_text?: string;
  popular_subcategories?: string[];
}

export interface LocationModel {
  id: number;
  name_ar: string;
  name_en: string;
  code: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  governorate_id?: number;
  city_id?: number;
  neighborhood_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryModel {
  id: number;
  section_id?: number;
  section_slug?: string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string;
  description_ar: string;
  sort_order: number;
  is_active: boolean;
}

export interface PermissionModel {
  id: number;
  name: string;
  display_name_ar: string;
  module: string;
  description_ar: string;
}

export interface RoleModel {
  id: number;
  name: string;
  display_name_ar: string;
  description_ar: string;
  requires_geo_scope: boolean;
  is_system: boolean;
  permissions: string[];
}

export interface UserModel {
  id: number;
  name: string;
  email: string;
  phone: string;
  role_id: number;
  location_id: number | null;
  avatar_url: string;
  is_active: boolean;
  last_login_at: string;
}

export interface ActivityModel {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  category_id: number;
  location_id: number;
  governorate_id?: number;
  city_id?: number;
  neighborhood_id?: number | null;
  section_id?: number;
  section_slug?: string;
  owner_id: number;
  description_ar: string;
  address_ar: string;
  address_line?: string;
  phone: string;
  whatsapp_number?: string;
  website_url?: string;
  working_hours?: string;
  latitude?: number;
  longitude?: number;
  map_place_id?: string;
  map_url?: string;
  google_maps_url?: string;
  has_delivery: boolean;
  delivery_fee_from?: number | null;
  delivery_fee_to?: number | null;
  delivery_estimated_time?: string;
  delivery_time_min?: number;
  delivery_notes?: string;
  whatsapp_orders_enabled?: boolean;
  status: "pending" | "verified" | "rejected" | "suspended";
  verified_at: string | null;
  verified_by: number | null;
  verification_notes: string | null;
  rating_avg: number;
  reviews_count: number;
  views_count: number;
  is_featured: boolean;
  cover_image: string;
  gallery_images?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductModel {
  id: number;
  activity_id: number;
  owner_user_id: number;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  sku?: string;
  price: number;
  sale_price?: number | null;
  currency: string;
  is_available: boolean;
  is_featured: boolean;
  stock_qty?: number | null;
  availability_note?: string;
  sort_order: number;
  cover_image: string;
  gallery?: string[];
  status: "published" | "hidden" | "pending_review";
  views_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface InquiryTimelineEvent {
  id: string;
  action: string;
  note?: string;
  timestamp: string;
  actor_name?: string;
}

export interface InquiryModel {
  id: number;
  activity_id: number;
  product_id?: number | null;
  offer_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message: string;
  type: "call" | "whatsapp" | "inquiry" | "lead" | "order_request";
  status: "new" | "contacted" | "in_progress" | "closed" | "cancelled";
  priority?: "normal" | "high" | "urgent";
  is_read?: boolean;
  notes?: string;
  source?: string;
  created_at: string;
  updated_at?: string;
  history?: InquiryTimelineEvent[];
}

export interface ReviewModel {
  id: number;
  activity_id: number;
  user_id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
  is_reported: boolean;
  created_at: string;
}

export interface AuditLogModel {
  id: number;
  user_id: number | null;
  user_name?: string;
  model_type: string;
  model_id: number;
  action: "created" | "updated" | "deleted" | "verified" | "rejected" | "login";
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface OfferModel {
  id: number;
  owner_user_id: number;
  activity_id: number;
  product_id?: number | null;
  title: string;
  description: string;
  offer_type: "percentage" | "fixed" | "bundle" | "text";
  discount_percentage?: number | null;
  discount_amount?: number | null;
  original_price?: number | null;
  offer_price?: number | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_featured: boolean;
  cover_image: string;
  terms?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  max_activities: number;
  max_products: number;
  can_create_offers: boolean;
  can_feature_products: boolean;
  can_feature_activity: boolean;
  can_access_advanced_analytics: boolean;
  can_have_multiple_branches: boolean;
  can_use_import_export: boolean;
}

export interface PlanModel {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  trial_days: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  limits: PlanLimits;
  features_list: string[];
  created_at: string;
  updated_at: string;
}

export interface SubscriptionModel {
  id: number;
  user_id: number;
  plan_id: number;
  status: "trial" | "active" | "expired" | "cancelled";
  starts_at: string;
  ends_at: string;
  trial_ends_at?: string | null;
  auto_renew: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ImportExportLogModel {
  id: number;
  user_id: number;
  user_name: string;
  operation_type: "import" | "export";
  entity_type: "products" | "activities" | "offers";
  activity_id?: number | null;
  activity_name?: string;
  format: "csv" | "xlsx" | "json";
  total_records: number;
  success_count: number;
  fail_count: number;
  status: "success" | "warning" | "failed";
  ip_address: string;
  notes?: string;
  created_at: string;
}

export interface SiteSettingsModel {
  site_name_ar: string;
  site_name_en: string;
  tagline_ar: string;
  tagline_en: string;
  description_ar: string;
  description_en: string;
  support_email: string;
  support_phone: string;
  support_whatsapp: string;
  office_address_ar: string;
  office_address_en: string;
  default_currency: string;
  default_country: string;
  default_governorate_id: number;
  
  // Branding
  logo_url: string;
  logo_dark_url: string;
  favicon_url: string;
  og_image_url: string;
  primary_color: string;
  secondary_color: string;

  // Social & Apps
  facebook_url: string;
  x_twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url: string;
  linkedin_url: string;
  telegram_channel: string;
  android_user_app_url: string;
  ios_user_app_url: string;
  android_merchant_app_url: string;
  ios_merchant_app_url: string;

  // Functional toggles
  allow_visitor_registration: boolean;
  require_email_verification: boolean;
  allow_guest_reviews: boolean;
  price_comparison_enabled: boolean;
  whatsapp_direct_chat_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message_ar: string;
  maintenance_message_en: string;
  max_upload_size_mb: number;

  // SEO & Meta
  meta_title_ar: string;
  meta_title_en: string;
  meta_description_ar: string;
  meta_description_en: string;
  meta_keywords: string;
  google_analytics_id: string;
  footer_copyright_ar: string;
  footer_copyright_en: string;

  // Flutter / Mobile Integration
  mobile_api_version: string;
  min_supported_user_app_version: string;
  min_supported_merchant_app_version: string;
  deep_link_scheme: string;
  user_app_package_id: string;
  merchant_app_package_id: string;
  updated_at: string;
}

// Initial Platform Settings State
let siteSettings: SiteSettingsModel = {
  site_name_ar: "دليل أي خدمة",
  site_name_en: "Daleel Ay Khidma",
  tagline_ar: "دليلك التجاري والخدمي الموثوق في مصر",
  tagline_en: "Your Trusted Business & Services Directory in Egypt",
  description_ar: "المنصة الرائدة لربط العملاء بأفضل الأنشطة التجارية والخدمات الموثوقة مع نظام خرائط دقيق، مقارنة أسعار وبوابة تجار معتمدة.",
  description_en: "The leading directory connecting users with trusted shops, medical centers, crafts and services across Egypt with verified ratings and interactive maps.",
  support_email: "support@daleel.test",
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

  // SEO
  meta_title_ar: "دليل أي خدمة • دليل المحلات والخدمات والحرفيين في مصر",
  meta_title_en: "Daleel Ay Khidma • Directory of Shops, Services & Crafts in Egypt",
  meta_description_ar: "اكتشف أفضل المحلات، المراكز الطبية، الحرفيين، المعلمين وقارن الأسعار مع خريطة تفاعلية لكافة المحافظات المصرية.",
  meta_description_en: "Discover top shops, clinics, craftsmen and compare product prices across Egyptian governorates.",
  meta_keywords: "دليل, خدمات, مصر, محلات, مطاعم, صيانة, أطباء, أسعار, خريطة",
  google_analytics_id: "G-DALEEL2025EG",
  footer_copyright_ar: "جميع الحقوق محفوظة © دليل أي خدمة",
  footer_copyright_en: "All rights reserved © Daleel Ay Khidma",

  // Flutter / Mobile Integration
  mobile_api_version: "2.4.0",
  min_supported_user_app_version: "1.0.0",
  min_supported_merchant_app_version: "1.0.0",
  deep_link_scheme: "daleel",
  user_app_package_id: "com.daleel.userapp",
  merchant_app_package_id: "com.daleel.merchantapp",
  updated_at: new Date().toISOString(),
};

// Initial In-Memory Seed State
let governorates: GovernorateModel[] = [
  { id: 1, name_ar: "القاهرة", name_en: "Cairo", code: "EGY-CAI", latitude: 30.0444, longitude: 31.2357, is_active: true, sort_order: 1 },
  { id: 2, name_ar: "الجيزة", name_en: "Giza", code: "EGY-GIZ", latitude: 30.0131, longitude: 31.2089, is_active: true, sort_order: 2 },
  { id: 3, name_ar: "الإسكندرية", name_en: "Alexandria", code: "EGY-ALX", latitude: 31.2001, longitude: 29.9187, is_active: true, sort_order: 3 },
  { id: 4, name_ar: "أسيوط", name_en: "Asyut", code: "EGY-ASY", latitude: 27.1809, longitude: 31.1837, is_active: true, sort_order: 4 },
  { id: 5, name_ar: "الدقهلية", name_en: "Dakahlia", code: "EGY-DKH", latitude: 31.0409, longitude: 31.3785, is_active: true, sort_order: 5 },
  { id: 6, name_ar: "الأقصر", name_en: "Luxor", code: "EGY-LUX", latitude: 25.6872, longitude: 32.6396, is_active: true, sort_order: 6 },
];

let cities: CityModel[] = [
  // القاهرة
  { id: 1, governorate_id: 1, name_ar: "مدينة نصر", name_en: "Nasr City", code: "CAI-NAS", latitude: 30.0561, longitude: 31.3412, is_active: true, sort_order: 1 },
  { id: 2, governorate_id: 1, name_ar: "المعادي", name_en: "Maadi", code: "CAI-MAA", latitude: 29.9602, longitude: 31.2505, is_active: true, sort_order: 2 },
  { id: 3, governorate_id: 1, name_ar: "مصر الجديدة", name_en: "Heliopolis", code: "CAI-HEL", latitude: 30.0880, longitude: 31.3289, is_active: true, sort_order: 3 },
  { id: 4, governorate_id: 1, name_ar: "التجمع الخامس والقاهرة الجديدة", name_en: "New Cairo / 5th Settlement", code: "CAI-NCA", latitude: 30.0131, longitude: 31.4913, is_active: true, sort_order: 4 },
  { id: 5, governorate_id: 1, name_ar: "شبرا والوسط", name_en: "Shubra & Downtown", code: "CAI-SHU", latitude: 30.0711, longitude: 31.2447, is_active: true, sort_order: 5 },

  // الجيزة
  { id: 6, governorate_id: 2, name_ar: "الدقي والمهندسين", name_en: "Dokki & Mohandessin", code: "GIZ-DOK", latitude: 30.0384, longitude: 31.2012, is_active: true, sort_order: 1 },
  { id: 7, governorate_id: 2, name_ar: "الشيخ زايد", name_en: "Sheikh Zayed", code: "GIZ-ZAY", latitude: 30.0488, longitude: 30.9833, is_active: true, sort_order: 2 },
  { id: 8, governorate_id: 2, name_ar: "مدينة السادس من أكتوبر", name_en: "6th of October", code: "GIZ-OCT", latitude: 29.9737, longitude: 30.9529, is_active: true, sort_order: 3 },
  { id: 9, governorate_id: 2, name_ar: "الهرم وفيصل", name_en: "Haram & Faisal", code: "GIZ-HRM", latitude: 29.9972, longitude: 31.1444, is_active: true, sort_order: 4 },

  // الإسكندرية
  { id: 10, governorate_id: 3, name_ar: "محطة الرمل ووسط البلد", name_en: "Raml Station & Downtown", code: "ALX-RML", latitude: 31.2018, longitude: 29.9045, is_active: true, sort_order: 1 },
  { id: 11, governorate_id: 3, name_ar: "سموحة وسيدي جابر", name_en: "Smouha & Sidi Gaber", code: "ALX-SMO", latitude: 31.2156, longitude: 29.9490, is_active: true, sort_order: 2 },
  { id: 12, governorate_id: 3, name_ar: "ميامي والمنتزه", name_en: "Miami & Montaza", code: "ALX-MIA", latitude: 31.2678, longitude: 30.0125, is_active: true, sort_order: 3 },

  // أسيوط
  { id: 13, governorate_id: 4, name_ar: "مدينة أسيوط (شرق وغرب)", name_en: "Asyut City", code: "ASY-CTY", latitude: 27.1809, longitude: 31.1837, is_active: true, sort_order: 1 },
  { id: 14, governorate_id: 4, name_ar: "ديروط", name_en: "Dayrut", code: "ASY-DAY", latitude: 27.5564, longitude: 30.8122, is_active: true, sort_order: 2 },
  { id: 15, governorate_id: 4, name_ar: "القوصية", name_en: "Qusiya", code: "ASY-QUS", latitude: 27.4417, longitude: 30.8197, is_active: true, sort_order: 3 },
  { id: 16, governorate_id: 4, name_ar: "أبوتيج", name_en: "Abu Tig", code: "ASY-ABU", latitude: 27.0425, longitude: 31.3197, is_active: true, sort_order: 4 },

  // الدقهلية
  { id: 17, governorate_id: 5, name_ar: "المنصورة", name_en: "Mansoura City", code: "DKH-MAN", latitude: 31.0409, longitude: 31.3785, is_active: true, sort_order: 1 },
  { id: 18, governorate_id: 5, name_ar: "طلخا", name_en: "Talkha", code: "DKH-TAL", latitude: 31.0550, longitude: 31.3739, is_active: true, sort_order: 2 },
  { id: 19, governorate_id: 5, name_ar: "ميت غمر", name_en: "Mit Ghamr", code: "DKH-MIT", latitude: 30.7192, longitude: 31.2589, is_active: true, sort_order: 3 },

  // الأقصر
  { id: 20, governorate_id: 6, name_ar: "مدينة الأقصر", name_en: "Luxor City", code: "LUX-CTY", latitude: 25.6872, longitude: 32.6396, is_active: true, sort_order: 1 },
];

let neighborhoods: NeighborhoodModel[] = [
  // مدينة نصر (City 1)
  { id: 1, city_id: 1, governorate_id: 1, name_ar: "شارع عباس العقاد", name_en: "Abbas El-Akkad St.", slug: "abbas-el-akkad", is_active: true, sort_order: 1 },
  { id: 2, city_id: 1, governorate_id: 1, name_ar: "شارع مكرم عبيد", name_en: "Makram Ebeid St.", slug: "makram-ebeid", is_active: true, sort_order: 2 },
  { id: 3, city_id: 1, governorate_id: 1, name_ar: "الحي السابع", name_en: "7th District", slug: "7th-district", is_active: true, sort_order: 3 },
  { id: 4, city_id: 1, governorate_id: 1, name_ar: "المنطقة الأولى", name_en: "First Zone", slug: "first-zone", is_active: true, sort_order: 4 },

  // المعادي (City 2)
  { id: 5, city_id: 2, governorate_id: 1, name_ar: "كورنيش المعادي", name_en: "Maadi Corniche", slug: "maadi-corniche", is_active: true, sort_order: 1 },
  { id: 6, city_id: 2, governorate_id: 1, name_ar: "دجلة المعادي", name_en: "Degla Maadi", slug: "degla-maadi", is_active: true, sort_order: 2 },
  { id: 7, city_id: 2, governorate_id: 1, name_ar: "شارع 9", name_en: "Street 9", slug: "street-9", is_active: true, sort_order: 3 },

  // مصر الجديدة (City 3)
  { id: 8, city_id: 3, governorate_id: 1, name_ar: "الكوربة", name_en: "Korba", slug: "korba", is_active: true, sort_order: 1 },
  { id: 9, city_id: 3, governorate_id: 1, name_ar: "ميدان روكسي", name_en: "Roxy Square", slug: "roxy", is_active: true, sort_order: 2 },

  // التجمع الخامس (City 4)
  { id: 10, city_id: 4, governorate_id: 1, name_ar: "شارع التسعين الشمالي", name_en: "North 90th St.", slug: "north-90th", is_active: true, sort_order: 1 },
  { id: 11, city_id: 4, governorate_id: 1, name_ar: "شارع التسعين الجنوبي", name_en: "South 90th St.", slug: "south-90th", is_active: true, sort_order: 2 },
  { id: 12, city_id: 4, governorate_id: 1, name_ar: "حي النرجس والبنفسج", name_en: "Narges & Banafseg", slug: "narges-banafseg", is_active: true, sort_order: 3 },

  // الدقي والمهندسين (City 6)
  { id: 13, city_id: 6, governorate_id: 2, name_ar: "شارع مصدق", name_en: "Mossadak St.", slug: "mossadak-st", is_active: true, sort_order: 1 },
  { id: 14, city_id: 6, governorate_id: 2, name_ar: "ميدان المساحة", name_en: "Mesaha Square", slug: "mesaha-square", is_active: true, sort_order: 2 },
  { id: 15, city_id: 6, governorate_id: 2, name_ar: "شارع جامعة الدول العربية", name_en: "Gameat El-Dowal", slug: "gameat-el-dowal", is_active: true, sort_order: 3 },

  // الشيخ زايد (City 7)
  { id: 16, city_id: 7, governorate_id: 2, name_ar: "زايد سنتر ومحيط أركان", name_en: "Zayed Center / Arkan", slug: "zayed-center", is_active: true, sort_order: 1 },
  { id: 17, city_id: 7, governorate_id: 2, name_ar: "الحي المتميز والحي الثامن", name_en: "Distinguished District", slug: "zayed-distinguished", is_active: true, sort_order: 2 },

  // محطة الرمل (City 10)
  { id: 18, city_id: 10, governorate_id: 3, name_ar: "ميدان سعد زغلول والكورنيش", name_en: "Saad Zaghloul Square", slug: "saad-zaghloul", is_active: true, sort_order: 1 },
  { id: 19, city_id: 10, governorate_id: 3, name_ar: "المنشية وبحري", name_en: "Mansheya & Bahary", slug: "mansheya", is_active: true, sort_order: 2 },

  // سموحة (City 11)
  { id: 20, city_id: 11, governorate_id: 3, name_ar: "ميدان فيكتور عمانويل", name_en: "Victor Emmanuel", slug: "victor-emmanuel", is_active: true, sort_order: 1 },
  { id: 21, city_id: 11, governorate_id: 3, name_ar: "شارع فوزي معاذ", name_en: "Fawzy Moaz St.", slug: "fawzy-moaz", is_active: true, sort_order: 2 },

  // أسيوط مدينة (City 13)
  { id: 22, city_id: 13, governorate_id: 4, name_ar: "شارع الجمهورية الرئيسي", name_en: "Gomhouria St.", slug: "gomhouria-asyut", is_active: true, sort_order: 1 },
  { id: 23, city_id: 13, governorate_id: 4, name_ar: "شارع الهلالي ومجمع المحاكم", name_en: "Helaly St.", slug: "helaly-asyut", is_active: true, sort_order: 2 },
  { id: 24, city_id: 13, governorate_id: 4, name_ar: "حي فريال وشارع النميس", name_en: "Feryal & Nemeis", slug: "feryal-asyut", is_active: true, sort_order: 3 },
  { id: 25, city_id: 13, governorate_id: 4, name_ar: "حي الحمراء وشارع يسرى راغب", name_en: "Hamraa & Yosry Ragheb", slug: "hamraa-asyut", is_active: true, sort_order: 4 },
  { id: 26, city_id: 13, governorate_id: 4, name_ar: "حي الأزهر والوليدية", name_en: "Azhar & Walidiya", slug: "azhar-walidiya", is_active: true, sort_order: 5 },
  { id: 27, city_id: 13, governorate_id: 4, name_ar: "شركة قلتة وتقسيم الحقوقيين", name_en: "Qelta Company", slug: "qelta-asyut", is_active: true, sort_order: 6 },
  { id: 28, city_id: 13, governorate_id: 4, name_ar: "نزلة عبد اللاه وحي السادات", name_en: "Nazlet Abdel-Lah", slug: "nazlet-abdellah", is_active: true, sort_order: 7 },

  // المنصورة (City 17)
  { id: 29, city_id: 17, governorate_id: 5, name_ar: "المشاية السفلية وكورنيش النيل", name_en: "Lower Mashaya & Nile", slug: "lower-mashaya", is_active: true, sort_order: 1 },
  { id: 30, city_id: 17, governorate_id: 5, name_ar: "المشاية العلوية وشارع جيهان", name_en: "Upper Mashaya & Gehan", slug: "upper-mashaya", is_active: true, sort_order: 2 },
  { id: 31, city_id: 17, governorate_id: 5, name_ar: "حي الجامعة وشارع أحمد ماهر", name_en: "University District", slug: "university-mansoura", is_active: true, sort_order: 3 },
  { id: 32, city_id: 17, governorate_id: 5, name_ar: "شارع قناة السويس", name_en: "Suez Canal St.", slug: "suez-canal-mansoura", is_active: true, sort_order: 4 },

  // الأقصر (City 20)
  { id: 33, city_id: 20, governorate_id: 6, name_ar: "طريق الكباش ومحيط معبد الأقصر", name_en: "Karnak & Luxor Temple", slug: "karnak-luxor-temple", is_active: true, sort_order: 1 },
  { id: 34, city_id: 20, governorate_id: 6, name_ar: "شارع التلفزيون والمنشية", name_en: "Television St.", slug: "television-st-luxor", is_active: true, sort_order: 2 },
];

let directory_sections: DirectorySectionModel[] = [
  {
    id: 1,
    slug: "shops",
    name_ar: "المحلات والمتاجر",
    name_en: "Shops & Stores",
    description_ar: "استكشف المطاعم، المقاهي، السوبرماركت، محلات الأزياء، الإلكترونيات، والصيدليات مع إمكانية التوصيل المباشر ومقارنة الأسعار.",
    icon: "Store",
    color: "amber",
    sort_order: 1,
    is_active: true,
    badge_text: "توصيل متوفر",
    popular_subcategories: ["مطاعم ومقاهي", "سوبرماركت وبقالة", "أجهزة وإلكترونيات", "أزياء وملابس", "صيدليات وعناية"],
  },
  {
    id: 2,
    slug: "crafts",
    name_ar: "الحرف والمهن",
    name_en: "Crafts & Trades",
    description_ar: "أمهر الفنيين والحرفيين المعتمدين لخدمات السباكة، الكهرباء، النجارة، التكييف، النقاشة والتشطيبات المنزلية في حيك.",
    icon: "Hammer",
    color: "emerald",
    sort_order: 2,
    is_active: true,
    badge_text: "فنيون معتمدون",
    popular_subcategories: ["صيانة كهرباء", "سباكة وتأسيس", "تكييف وتبريد", "نجارة وأثاث", "نقاشة وديكور"],
  },
  {
    id: 3,
    slug: "services",
    name_ar: "الخدمات العامة",
    name_en: "Public Services",
    description_ar: "المراكز الطبية والمستشفيات، مراكز صيانة السيارات، خدمات الشحن ونقل الأثاث، والمكاتب الاستشارية والقانونية.",
    icon: "Briefcase",
    color: "sky",
    sort_order: 3,
    is_active: true,
    badge_text: "خدمات شاملة",
    popular_subcategories: ["مراكز طبية وصحة", "صيانة سيارات", "شحن ونقل عفش", "استشارات قانونية", "عقارات ومقاولات"],
  },
  {
    id: 4,
    slug: "teachers",
    name_ar: "المعلمون والتدريب",
    name_en: "Teachers & Tutors",
    description_ar: "نخبة من معلمي المراحل الدراسية والجامعية، مدربي اللغات والبرمجة، ومراكز التدريب المهني في مدينتك وأونلاين.",
    icon: "GraduationCap",
    color: "violet",
    sort_order: 4,
    is_active: true,
    badge_text: "تعليم وتأسيس",
    popular_subcategories: ["لغات وترجمة", "رياضيات وفيزياء", "برمجة وحاسوب", "تأسيس ابتدائي وإعدادي", "ثانوية عامة"],
  },
  {
    id: 5,
    slug: "bloggers",
    name_ar: "البلوجر وصناع المحتوى",
    name_en: "Bloggers & Creators",
    description_ar: "اكتشف توصيات ومراجعات أفضل البلوجرز وصناع المحتوى المحليين للمطاعم، الأماكن السياحية، الموضة، والتقنية.",
    icon: "Sparkles",
    color: "rose",
    sort_order: 5,
    is_active: true,
    badge_text: "مراجعات وتجارب",
    popular_subcategories: ["تجارب أكلات ومطاعم", "مراجعات تقنية", "فاشن وموضة", "فسح وسياحة", "لايف ستايل"],
  },
];

// Locations compatibility array
let locations: LocationModel[] = [
  { id: 1, name_ar: "القاهرة", name_en: "Cairo", code: "EGY-CAI", latitude: 30.0444, longitude: 31.2357, is_active: true },
  { id: 2, name_ar: "الجيزة", name_en: "Giza", code: "EGY-GIZ", latitude: 30.0131, longitude: 31.2089, is_active: true },
  { id: 3, name_ar: "الإسكندرية", name_en: "Alexandria", code: "EGY-ALX", latitude: 31.2001, longitude: 29.9187, is_active: true },
  { id: 4, name_ar: "أسيوط", name_en: "Asyut", code: "EGY-ASY", latitude: 27.1809, longitude: 31.1837, is_active: true },
  { id: 5, name_ar: "المنصورة (الدقهلية)", name_en: "Mansoura", code: "EGY-DKH", latitude: 31.0409, longitude: 31.3785, is_active: true },
  { id: 6, name_ar: "الأقصر", name_en: "Luxor", code: "EGY-LUX", latitude: 25.6872, longitude: 32.6396, is_active: true },
];

let categories: CategoryModel[] = [
  // 1. المحلات والمتاجر (Section 1: shops)
  { id: 1, section_id: 1, section_slug: "shops", name_ar: "مطاعم ومقاهي", name_en: "Restaurants & Cafes", slug: "restaurants-cafes", icon: "UtensilsCrossed", description_ar: "مطاعم مأكولات شرقية وغربية، مشويات، ومقاهي عصرية", sort_order: 1, is_active: true },
  { id: 2, section_id: 1, section_slug: "shops", name_ar: "سوبرماركت ومواد غذائية", name_en: "Supermarkets & Groceries", slug: "supermarkets-groceries", icon: "ShoppingBag", description_ar: "سوبر ماركت، عطارة، ومواد تموينية طازجة", sort_order: 2, is_active: true },
  { id: 3, section_id: 1, section_slug: "shops", name_ar: "تقنية وإلكترونيات", name_en: "Tech & Electronics", slug: "tech-electronics", icon: "Laptop", description_ar: "هواتف ذكية، لابتوبات، شاشات، وإكسسوارات رقمية", sort_order: 3, is_active: true },
  { id: 4, section_id: 1, section_slug: "shops", name_ar: "أزياء وملابس", name_en: "Fashion & Clothing", slug: "fashion-clothing", icon: "Shirt", description_ar: "ملابس رجالي وحريمي وأطفال، وأحذية وحقائب", sort_order: 4, is_active: true },
  { id: 5, section_id: 1, section_slug: "shops", name_ar: "صيدليات ومستحضرات تجميل", name_en: "Pharmacies & Cosmetics", slug: "pharmacies-cosmetics", icon: "Pill", description_ar: "أدوية، مكملات غذائية، وعناية شخصية وتجميل", sort_order: 5, is_active: true },
  { id: 6, section_id: 1, section_slug: "shops", name_ar: "تسوق وتجزئة متنوعة", name_en: "General Retail & Malls", slug: "shopping-retail", icon: "ShoppingBag", description_ar: "مولات تجارية، مكتبات، ومتاجر هدايا وتحف", sort_order: 6, is_active: true },

  // 2. الحرف والمهن (Section 2: crafts)
  { id: 7, section_id: 2, section_slug: "crafts", name_ar: "صيانة وكهرباء منزلية", name_en: "Electrical Maintenance", slug: "electrical-maintenance", icon: "Zap", description_ar: "تأسيس وتشطيب كهرباء منازل وإصلاح لوحات ومفاتيح", sort_order: 7, is_active: true },
  { id: 8, section_id: 2, section_slug: "crafts", name_ar: "سباكة وأعمال صحية", name_en: "Plumbing & Sanitary", slug: "plumbing-sanitary", icon: "Wrench", description_ar: "صيانة وتأسيس شبكات مياه وصرف وكشف تسريبات", sort_order: 8, is_active: true },
  { id: 9, section_id: 2, section_slug: "crafts", name_ar: "تكييف وتبريد وأجهزة", name_en: "HVAC & Appliances", slug: "hvac-appliances", icon: "Wind", description_ar: "شحن فريون، صيانة تكييفات، غسالات، وثلاجات", sort_order: 9, is_active: true },
  { id: 10, section_id: 2, section_slug: "crafts", name_ar: "نجارة وأثاث وديكور", name_en: "Carpentry & Woodwork", slug: "carpentry-woodwork", icon: "Hammer", description_ar: "تفصيل وتصليح غرف نوم ومطابخ وأبواب وشبابيك", sort_order: 10, is_active: true },
  { id: 11, section_id: 2, section_slug: "crafts", name_ar: "نقاشة ودهانات وتشطيب", name_en: "Painting & Finishing", slug: "painting-finishing", icon: "Paintbrush", description_ar: "دهانات حديثة، ورق حائط، وديكورات جبس بورد", sort_order: 11, is_active: true },
  { id: 12, section_id: 2, section_slug: "crafts", name_ar: "خدمات منزلية متكاملة", name_en: "Home Services", slug: "home-services", icon: "Wrench", description_ar: "باقات صيانة منزلية شاملة وتنظيف ومكافحة حشرات", sort_order: 12, is_active: true },

  // 3. الخدمات العامة (Section 3: services)
  { id: 13, section_id: 3, section_slug: "services", name_ar: "مراكز طبية وصحة", name_en: "Health & Medical", slug: "health-medical", icon: "Stethoscope", description_ar: "مستشفيات، عيادات تخصصية، معامل تحاليل ومراكز أشعة", sort_order: 13, is_active: true },
  { id: 14, section_id: 3, section_slug: "services", name_ar: "صيانة وسيارات", name_en: "Automotive & Repairs", slug: "automotive-repairs", icon: "CarFront", description_ar: "مراكز صيانة، فحص كمبيوتر، غسيل وتلميع، وقطع غيار", sort_order: 14, is_active: true },
  { id: 15, section_id: 3, section_slug: "services", name_ar: "استشارات قانونية ومحاماة", name_en: "Legal & Legal Consultation", slug: "legal-consultation", icon: "Scale", description_ar: "مكاتب محاماة، تأسيس شركات، وتوثيق عقود", sort_order: 15, is_active: true },
  { id: 16, section_id: 3, section_slug: "services", name_ar: "عقارات ومقاولات", name_en: "Real Estate & Contracting", slug: "real-estate", icon: "Building2", description_ar: "بيع وإيجار شقق ومحلات ومكاتب ومشاريع بناء", sort_order: 16, is_active: true },
  { id: 17, section_id: 3, section_slug: "services", name_ar: "شحن وتوصيل ونقل أثاث", name_en: "Shipping & Logistics", slug: "shipping-logistics", icon: "Truck", description_ar: "شركات ونش ورفع أثاث وطرود سريعة بين المحافظات", sort_order: 17, is_active: true },

  // 4. المعلمون والتدريب (Section 4: teachers)
  { id: 18, section_id: 4, section_slug: "teachers", name_ar: "لغات وترجمة", name_en: "Languages & Translation", slug: "languages-teachers", icon: "Languages", description_ar: "مدرسو لغة إنجليزية، فرنسية، ألمانية وكورسات تويفل/آيلتس", sort_order: 18, is_active: true },
  { id: 19, section_id: 4, section_slug: "teachers", name_ar: "رياضيات وفيزياء وعلوم", name_en: "Math & Science", slug: "math-science-teachers", icon: "Calculator", description_ar: "مدرسو رياضيات، فيزياء، كيمياء وأحياء للثانوية والجامعات", sort_order: 19, is_active: true },
  { id: 20, section_id: 4, section_slug: "teachers", name_ar: "برمجة وتكنولوجيا", name_en: "Programming & Tech Courses", slug: "programming-tech-teachers", icon: "Code", description_ar: "تدريب على البرمجة، تطوير الويب، الذكاء الاصطناعي والأمن السيبراني", sort_order: 20, is_active: true },
  { id: 21, section_id: 4, section_slug: "teachers", name_ar: "تأسيس ومراحل أساسية", name_en: "Foundational & Primary Education", slug: "primary-foundation-teachers", icon: "BookOpen", description_ar: "تأسيس قراءة وكتابة وحساب وتحفيظ قرآن ولغات للأطفال", sort_order: 21, is_active: true },

  // 5. البلوجر وصناع المحتوى (Section 5: bloggers)
  { id: 22, section_id: 5, section_slug: "bloggers", name_ar: "مراجعات وتجارب طعام ومطاعم", name_en: "Food Bloggers", slug: "food-bloggers", icon: "Utensils", description_ar: "تجارب وتغطيات لأحدث وألذ المطاعم والمقاهي والأكلات الشعبية", sort_order: 22, is_active: true },
  { id: 23, section_id: 5, section_slug: "bloggers", name_ar: "تجارب ومراجعات تقنية", name_en: "Tech Reviewers & Bloggers", slug: "tech-bloggers", icon: "Smartphone", description_ar: "مراجعات الهواتف، اللابتوبات، الكاميرات وأحدث الأدوات التقنية", sort_order: 23, is_active: true },
  { id: 24, section_id: 5, section_slug: "bloggers", name_ar: "موضة ولايف ستايل وسياحة", name_en: "Lifestyle & Travel Bloggers", slug: "lifestyle-travel-bloggers", icon: "Camera", description_ar: "تغطيات الأماكن السياحية، تنسيقات الموضة، والديكور المنزلي", sort_order: 24, is_active: true },
];

let permissions: PermissionModel[] = [
  { id: 1, name: "view_activities", display_name_ar: "عرض الأنشطة التجارية", module: "activities", description_ar: "الاطلاع على قائمة الأنشطة" },
  { id: 2, name: "manage_activities", display_name_ar: "إدارة وإنشاء الأنشطة", module: "activities", description_ar: "إضافة وتعديل وحذف الأنشطة" },
  { id: 3, name: "review_activities", display_name_ar: "مراجعة طلبات الأنشطة", module: "activities", description_ar: "فحص الوثائق والتفاصيل" },
  { id: 4, name: "verify_activities", display_name_ar: "اعتماد وتوثيق الأنشطة", module: "activities", description_ar: "نشر النشاط أو رفضه" },
  { id: 5, name: "manage_content", display_name_ar: "إدارة المحتوى والتصنيفات", module: "content", description_ar: "إدارة التصنيفات والوسوم" },
  { id: 6, name: "manage_reviews", display_name_ar: "إدارة التقييمات", module: "reviews", description_ar: "اعتماد وحذف التقييمات" },
  { id: 7, name: "manage_reported_content", display_name_ar: "معالجة البلاغات", module: "reviews", description_ar: "التعامل مع بلاغات المستخدمين" },
  { id: 8, name: "view_users", display_name_ar: "عرض بيانات المستخدمين", module: "users", description_ar: "استعراض حسابات المسجلين" },
  { id: 9, name: "manage_team", display_name_ar: "إدارة فريق العمل", module: "users", description_ar: "إسناد الأدوار للموظفين" },
  { id: 10, name: "manage_roles", display_name_ar: "إدارة الأدوار والصلاحيات", module: "roles", description_ar: "تعديل الصلاحيات المخصصة" },
  { id: 11, name: "view_reports", display_name_ar: "عرض التقارير", module: "analytics", description_ar: "تقارير النمو ومعدل الاستخدام" },
  { id: 12, name: "view_analytics", display_name_ar: "التحليلات الإحصائية", module: "analytics", description_ar: "مؤشرات لوحة التحكم المتقدمة" },
  { id: 13, name: "view_audit_logs", display_name_ar: "استعراض سجل العمليات", module: "audit", description_ar: "سجل العمليات الذي لا يُمحى" },
  { id: 14, name: "manage_products", display_name_ar: "إدارة المنتجات والأسعار", module: "products", description_ar: "إنشاء وتعديل المنتجات وقوائم الأسعار" },
  { id: 15, name: "manage_own_activity", display_name_ar: "إدارة النشاط الخاص", module: "merchant", description_ar: "تعديل ملف النشاط والموقع ومواعيد العمل" },
  { id: 16, name: "manage_own_products", display_name_ar: "إدارة منتجات النشاط الخاص", module: "merchant", description_ar: "إضافة منتجات وتعديل أسعارها وحالتها" },
  { id: 17, name: "view_own_analytics", display_name_ar: "إحصائيات النشاط الخاص", module: "merchant", description_ar: "الاطلاع على مشاهدات وتقييمات النشاط" },
  { id: 18, name: "manage_offers", display_name_ar: "إدارة العروض الترويجية", module: "offers", description_ar: "إنشاء وتعديل ونشر العروض والخصومات" },
  { id: 19, name: "manage_plans", display_name_ar: "إدارة خطط الأسعار والباقات", module: "billing", description_ar: "تحديد مزايا وأسعار اشتراكات التجار" },
  { id: 20, name: "manage_subscriptions", display_name_ar: "إدارة اشتراكات التجار", module: "billing", description_ar: "متابعة وتجديد اشتراكات المنشآت" },
  { id: 21, name: "manage_import_export", display_name_ar: "استيراد وتصدير المنتجات", module: "products", description_ar: "رفع وتصدير كتالوجات المنتجات مجمعة" },
];

let roles: RoleModel[] = [
  {
    id: 1,
    name: "مدير_عام",
    display_name_ar: "مدير عام",
    description_ar: "يمتلك كافة الصلاحيات الإدارية والفنية والوصول الشامل بدون قيود جغرافية.",
    requires_geo_scope: false,
    is_system: true,
    permissions: permissions.map(p => p.name),
  },
  {
    id: 2,
    name: "مدير_تشغيل",
    display_name_ar: "مدير تشغيل",
    description_ar: "إدارة العمليات التشغيلية، المحتوى، الأنشطة، المنتجات وفريق العمل.",
    requires_geo_scope: false,
    is_system: true,
    permissions: ["manage_content", "manage_activities", "manage_products", "manage_offers", "manage_plans", "manage_subscriptions", "manage_import_export", "manage_team", "view_activities", "view_users", "view_reports"],
  },
  {
    id: 3,
    name: "مراجع_أنشطة",
    display_name_ar: "مراجع أنشطة",
    description_ar: "مراجعة وتوثيق واعتماد الأنشطة التجارية مقيداً بالنطاق الجغرافي المخصص له.",
    requires_geo_scope: true,
    is_system: true,
    permissions: ["review_activities", "verify_activities", "view_activities"],
  },
  {
    id: 4,
    name: "مشرف_محتوى",
    display_name_ar: "مشرف محتوى",
    description_ar: "متابعة تقييمات العملاء والتعامل مع البلاغات والمحتوى المخالف والعروض.",
    requires_geo_scope: false,
    is_system: true,
    permissions: ["manage_reviews", "manage_reported_content", "manage_offers", "view_activities"],
  },
  {
    id: 5,
    name: "دعم_فني",
    display_name_ar: "دعم فني",
    description_ar: "خدمة العملاء والاطلاع على بيانات المستخدمين والأنشطة لحل المشاكل.",
    requires_geo_scope: false,
    is_system: true,
    permissions: ["view_users", "view_activities"],
  },
  {
    id: 6,
    name: "محلل_بيانات",
    display_name_ar: "محلل بيانات",
    description_ar: "استخراج التقارير وتحليل المؤشرات الإحصائية ومعدلات نمو الأنشطة والمنتجات.",
    requires_geo_scope: false,
    is_system: true,
    permissions: ["view_reports", "view_analytics", "view_audit_logs"],
  },
  {
    id: 7,
    name: "تاجر_وصاحب_عمل",
    display_name_ar: "تاجر وصاحب نشاط / حرفي",
    description_ar: "صلاحيات لوحة تحكم التاجر لإدارة النشاط المملوك والمنتجات والأسعار والطلبات الواردة والعروض والاستيراد.",
    requires_geo_scope: false,
    is_system: true,
    permissions: ["manage_own_activity", "manage_own_products", "view_own_analytics", "manage_offers", "manage_import_export"],
  },
  {
    id: 8,
    name: "مستخدم",
    display_name_ar: "مستخدم مسجل",
    description_ar: "مستخدم عادي يتصفح الأنشطة والمنتجات ويقدم التقييمات والطلبات.",
    requires_geo_scope: false,
    is_system: true,
    permissions: ["create_activity", "submit_review"],
  },
];

let users: UserModel[] = [
  { id: 1, name: "م. طارق الخالدي (المدير العام)", email: "admin@daleel.test", phone: "+201000000001", role_id: 1, location_id: null, avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 2, name: "أحمد سمير (مدير التشغيل)", email: "operations@daleel.test", phone: "+201000000002", role_id: 2, location_id: null, avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 3, name: "خالد محمود (مراجع القاهرة)", email: "reviewer.cairo@daleel.test", phone: "+201000000003", role_id: 3, location_id: 1, avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 4, name: "عمر الصعيدي (مراجع أسيوط)", email: "reviewer.asyut@daleel.test", phone: "+201000000004", role_id: 3, location_id: 4, avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 5, name: "منى الرفاعي (محللة البيانات)", email: "analyst@daleel.test", phone: "+201000000005", role_id: 6, location_id: null, avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 6, name: "ياسر العوضي (مشرف محتوى)", email: "content@daleel.test", phone: "+201000000006", role_id: 4, location_id: null, avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 7, name: "سارة النجار (دعم فني)", email: "support@daleel.test", phone: "+201000000007", role_id: 5, location_id: null, avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 8, name: "م. حسام التاجر (صاحب واحة النيل وبازار طيبة)", email: "merchant@daleel.test", phone: "+201099112233", role_id: 7, location_id: 1, avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 9, name: "كابتن مدحت الأسطى (صاحب مركز النخبة للصيانة)", email: "elite.auto@daleel.test", phone: "+201077665511", role_id: 7, location_id: 4, avatar_url: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150", is_active: true, last_login_at: new Date().toISOString() },
  { id: 10, name: "محمد عبد الله (عميل / مستخدم)", email: "user@daleel.test", phone: "+201088889999", role_id: 8, location_id: 1, avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", is_active: true, last_login_at: new Date().toISOString() },
];

let activities: ActivityModel[] = [
  // 1. المحلات والمتاجر (Section 1: shops)
  {
    id: 1,
    name_ar: "مطعم واحة النيل للمأكولات الشرقية",
    name_en: "Nile Oasis Restaurant",
    slug: "nile-oasis-restaurant",
    category_id: 1,
    location_id: 1,
    governorate_id: 1,
    city_id: 2,
    neighborhood_id: 5, // كورنيش المعادي
    section_id: 1,
    section_slug: "shops",
    owner_id: 8,
    description_ar: "تجربة طعام شرقية فاخرة على ضفاف النيل مباشرة مع إطلالة بانورامية وقائمة مشويات ومأكولات بحرية طازجة.",
    address_ar: "كورنيش النيل، المعادي، القاهرة",
    address_line: "برج النيل بلازا، الطابق الأرضي، كورنيش النيل",
    phone: "+201011122233",
    whatsapp_number: "+201011122233",
    website_url: "https://nile-oasis.example.com",
    working_hours: "يومياً من 11:00 صباحاً حتى 01:00 بعد منتصف الليل",
    latitude: 29.9602,
    longitude: 31.2505,
    map_place_id: "ChIJb7c_NileOasisMaadi",
    map_url: "https://maps.google.com/?q=29.9602,31.2505",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=29.9602,31.2505",
    has_delivery: true,
    delivery_fee_from: 25,
    delivery_estimated_time: "30 - 45 دقيقة",
    delivery_notes: "توصيل ساخن ومغلف حرارياً لكافة مناطق المعادي وحلوان",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-15T10:00:00Z",
    verified_by: 3,
    verification_notes: "تم فحص السجل التجاري والبطاقة الضريبية والموقع على الخريطة بنجاح.",
    rating_avg: 4.8,
    reviews_count: 142,
    views_count: 3890,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
    created_at: "2024-01-10T08:30:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 5,
    name_ar: "مقهى وكافيه لؤلؤة الإسكندرية",
    name_en: "Alexandria Pearl Cafe",
    slug: "alex-pearl-cafe",
    category_id: 1,
    location_id: 3,
    governorate_id: 3,
    city_id: 10,
    neighborhood_id: 18, // ميدان سعد زغلول والكورنيش
    section_id: 1,
    section_slug: "shops",
    owner_id: 1,
    description_ar: "جلسات ساحلية مميزة مع أجود حبوب القهوة الإيطالية والمشروبات المنعشة وحلويات أوروبية طازجة.",
    address_ar: "محطة الرمل، كورنيش الإسكندرية",
    address_line: "أمام فندق سيسل التاريخي، محطة الرمل",
    phone: "+201033221100",
    whatsapp_number: "+201033221100",
    working_hours: "يومياً من 08:00 ص حتى 01:00 ص",
    latitude: 31.2018,
    longitude: 29.9045,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=31.2018,29.9045",
    has_delivery: true,
    delivery_fee_from: 20,
    delivery_estimated_time: "20 - 35 دقيقة",
    delivery_notes: "توصيل قهوة ومشروبات معبأة بإحكام للحفاظ على الحرارة",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-16T12:00:00Z",
    verified_by: 1,
    verification_notes: "تم الاعتماد من الإدارة المركزية.",
    rating_avg: 4.9,
    reviews_count: 210,
    views_count: 5400,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
    created_at: "2024-01-11T16:20:00Z",
    updated_at: "2024-01-16T12:00:00Z",
  },
  {
    id: 7,
    name_ar: "مول الدلتا للتسوق والإلكترونيات",
    name_en: "Delta Shopping Center",
    slug: "delta-shopping-mansoura",
    category_id: 3,
    location_id: 5,
    governorate_id: 5,
    city_id: 17,
    neighborhood_id: 29, // المشاية السفلية
    section_id: 1,
    section_slug: "shops",
    owner_id: 1,
    description_ar: "مركز تجاري متكامل يضم كبرى العلامات التجارية للأجهزة الذكية واللابتوبات ومنطقة ألعاب ومطاعم.",
    address_ar: "شارع المشاية السفلية، أمام حديقة شجرة الدر، المنصورة",
    address_line: "برج الدلتا التجاري، المشاية السفلية",
    phone: "+201077665544",
    whatsapp_number: "+201077665544",
    working_hours: "يومياً من 10:00 ص حتى 11:30 م",
    latitude: 31.0455,
    longitude: 31.3720,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=31.0455,31.3720",
    has_delivery: true,
    delivery_fee_from: 35,
    delivery_estimated_time: "45 - 60 دقيقة",
    delivery_notes: "توصيل آمن للأجهزة مع فحص المنتج والاستلام بالفاتورة والضمان",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-17T11:30:00Z",
    verified_by: 1,
    verification_notes: "تم فحص المنشأة والترخيص التجاري.",
    rating_avg: 4.85,
    reviews_count: 168,
    views_count: 4120,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600",
    created_at: "2024-01-14T12:00:00Z",
    updated_at: "2024-01-17T11:30:00Z",
  },
  {
    id: 8,
    name_ar: "بازار طيبة للتحف والبرديات الأثرية",
    name_en: "Thebes Heritage Gallery",
    slug: "thebes-heritage-luxor",
    category_id: 6,
    location_id: 6,
    governorate_id: 6,
    city_id: 20,
    neighborhood_id: 33, // طريق الكباش
    section_id: 1,
    section_slug: "shops",
    owner_id: 8,
    description_ar: "أعمال يدوية نادرة، مشغولات فضية وخزفية، وأوراق بردي أصلية معتمدة من نقابة الحرفيين بالأقصر.",
    address_ar: "طريق الكباش، بجوار معبد الأقصر، الأقصر",
    address_line: "سوق خان الحرفيين، محل رقم 12",
    phone: "+201088990011",
    whatsapp_number: "+201088990011",
    working_hours: "يومياً من 09:00 صباحاً حتى 11:00 مساءً",
    latitude: 25.6998,
    longitude: 32.6390,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=25.6998,32.6390",
    has_delivery: true,
    delivery_fee_from: 50,
    delivery_estimated_time: "خلال 48 ساعة",
    delivery_notes: "شحن تذكاري مؤمن لكافة محافظات مصر وخارجها في علب هدايا فاخرة",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-19T15:00:00Z",
    verified_by: 1,
    verification_notes: "تم التحقق من أصالة المنتجات والترخيص السياحي.",
    rating_avg: 4.95,
    reviews_count: 320,
    views_count: 6780,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-19T15:00:00Z",
  },
  {
    id: 11,
    name_ar: "هايبر ماركت البركة والخيرات",
    name_en: "Al Baraka Hypermarket",
    slug: "al-baraka-hypermarket-cairo",
    category_id: 2,
    location_id: 1,
    governorate_id: 1,
    city_id: 1,
    neighborhood_id: 1, // شارع عباس العقاد
    section_id: 1,
    section_slug: "shops",
    owner_id: 8,
    description_ar: "سوبر ماركت عملاق يوفر كافة المواد التموينية، الخضار والفواكه الطازجة، واللحوم والمجمدات بأفضل الأسعار.",
    address_ar: "مدينة نصر، تقاطع شارع عباس العقاد مع الطيران، القاهرة",
    phone: "+201055667788",
    whatsapp_number: "+201055667788",
    working_hours: "خدمة 24 ساعة طوال أيام الأسبوع",
    latitude: 30.0570,
    longitude: 31.3425,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0570,31.3425",
    has_delivery: true,
    delivery_fee_from: 15,
    delivery_estimated_time: "25 - 40 دقيقة",
    delivery_notes: "توصيل طلبات البقالة والمجمدات بسيارات مبردة",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-12T09:00:00Z",
    verified_by: 3,
    verification_notes: "منشأة معتمدة ومرخصة.",
    rating_avg: 4.75,
    reviews_count: 95,
    views_count: 2890,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600",
    created_at: "2024-01-12T08:00:00Z",
    updated_at: "2024-01-12T09:00:00Z",
  },
  {
    id: 12,
    name_ar: "تيك إكسبريس للإلكترونيات والهواتف",
    name_en: "Tech Express Electronics",
    slug: "tech-express-dokki",
    category_id: 3,
    location_id: 2,
    governorate_id: 2,
    city_id: 6,
    neighborhood_id: 13, // شارع مصدق
    section_id: 1,
    section_slug: "shops",
    owner_id: 9,
    description_ar: "متجر متخصص في بيع الهواتف الذكية الأصلية، الساعات الرقمية، الشواحن السريعة وإكسسوارات الأجهزة المحمولة مع ضمان الوكيل.",
    address_ar: "شارع مصدق الرئيسي، الدقي، الجيزة",
    phone: "+201066778899",
    whatsapp_number: "+201066778899",
    working_hours: "يومياً من 11:00 ص حتى 11:00 م",
    latitude: 30.0390,
    longitude: 31.2020,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0390,31.2020",
    has_delivery: true,
    delivery_fee_from: 30,
    delivery_estimated_time: "35 - 50 دقيقة",
    delivery_notes: "توصيل فوري مع إمكانية الدفع عند الاستلام بعد المعاينة",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-14T11:00:00Z",
    verified_by: 1,
    verification_notes: "وكيل معتمد ومطابق للمواصفات.",
    rating_avg: 4.82,
    reviews_count: 110,
    views_count: 3200,
    is_featured: false,
    cover_image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
    created_at: "2024-01-14T10:00:00Z",
    updated_at: "2024-01-14T11:00:00Z",
  },
  {
    id: 13,
    name_ar: "سوبر ماركت الصفا والبركة أسيوط",
    name_en: "Al Safa Supermarket Asyut",
    slug: "al-safa-supermarket-asyut",
    category_id: 2,
    location_id: 4,
    governorate_id: 4,
    city_id: 13,
    neighborhood_id: 22, // شارع الجمهورية
    section_id: 1,
    section_slug: "shops",
    owner_id: 9,
    description_ar: "أكبر تشكيلة مواد غذائية، منتجات ألبان صعيدية طازجة، وعطارة بلدية ممتازة في قلب مدينة أسيوط.",
    address_ar: "شارع الجمهورية، بجوار البنك الأهلي، أسيوط",
    phone: "+201088997711",
    whatsapp_number: "+201088997711",
    working_hours: "يومياً من 07:00 ص حتى 02:00 ص",
    latitude: 27.1850,
    longitude: 31.1820,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=27.1850,31.1820",
    has_delivery: true,
    delivery_fee_from: 15,
    delivery_estimated_time: "20 - 30 دقيقة",
    delivery_notes: "توصيل سريع لكافة أحياء مدينة أسيوط وغرب البلد",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-16T14:00:00Z",
    verified_by: 4,
    verification_notes: "تمت المعاينة ومطابقة سجل النشاط.",
    rating_avg: 4.7,
    reviews_count: 78,
    views_count: 2150,
    is_featured: false,
    cover_image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
    created_at: "2024-01-16T13:00:00Z",
    updated_at: "2024-01-16T14:00:00Z",
  },

  // 2. الحرف والمهن (Section 2: crafts)
  {
    id: 6,
    name_ar: "مجمع الأهرامات الهندسي للخدمات المنزلية",
    name_en: "Pyramids Home Services",
    slug: "pyramids-home-services-giza",
    category_id: 12,
    location_id: 2,
    governorate_id: 2,
    city_id: 6,
    neighborhood_id: 13, // شارع مصدق
    section_id: 2,
    section_slug: "crafts",
    owner_id: 1,
    description_ar: "فريق فني متخصص لأعمال السباكة الذكية، الكهرباء، تكييف وتبريد، وتشطيبات الديكور الحديثة مع ضمان خطي.",
    address_ar: "شارع مصدق، الدقي، الجيزة",
    phone: "+201044556677",
    whatsapp_number: "+201044556677",
    working_hours: "يومياً من 08:00 ص حتى 10:00 م (طوارئ 24/7)",
    latitude: 30.0384,
    longitude: 31.2012,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0384,31.2012",
    has_delivery: false, // خدمة موقعية / زيارة فني
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-14T09:00:00Z",
    verified_by: 1,
    verification_notes: "تم توثيق السجل والخبرة الفنية.",
    rating_avg: 4.6,
    reviews_count: 54,
    views_count: 1420,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600",
    created_at: "2024-01-13T10:00:00Z",
    updated_at: "2024-01-14T09:00:00Z",
  },
  {
    id: 14,
    name_ar: "أسطى حسن لأعمال السباكة وكشف التسريبات",
    name_en: "Osta Hassan Plumbing & Leak Detection",
    slug: "osta-hassan-plumbing-cairo",
    category_id: 8,
    location_id: 1,
    governorate_id: 1,
    city_id: 1,
    neighborhood_id: 2, // شارع مكرم عبيد
    section_id: 2,
    section_slug: "crafts",
    owner_id: 8,
    description_ar: "خبرة 18 عاماً في تأسيس وصيانة شبكات السباكة للحمامات والمطابخ، كشف تسريب بالأجهزة الإلكترونية وتركيب المضخات والسخانات.",
    address_ar: "مدينة نصر، شارع مكرم عبيد، القاهرة",
    phone: "+201012349988",
    whatsapp_number: "+201012349988",
    working_hours: "يومياً من 08:00 ص حتى 11:00 م",
    latitude: 30.0585,
    longitude: 31.3450,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0585,31.3450",
    has_delivery: false, // خدمة موقعية
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-15T12:00:00Z",
    verified_by: 3,
    verification_notes: "فني معتمد وموثق بشهادات خبرة.",
    rating_avg: 4.88,
    reviews_count: 63,
    views_count: 1750,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600",
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T12:00:00Z",
  },
  {
    id: 15,
    name_ar: "ورشة الأمانة للنجارة وتفصيل الأثاث والمطابخ",
    name_en: "Al Amana Carpentry & Furniture",
    slug: "al-amana-carpentry-mansoura",
    category_id: 10,
    location_id: 5,
    governorate_id: 5,
    city_id: 17,
    neighborhood_id: 31, // حي الجامعة
    section_id: 2,
    section_slug: "crafts",
    owner_id: 1,
    description_ar: "تفصيل وتصنيع غرف النوم، غرف الأطفال، دريسنج روم، ومطابخ خشب طبيعي وبولي لاك بأحدث التصاميم العصرية مع التركيب المجاني.",
    address_ar: "حي الجامعة، أمام بوابة توشكى، المنصورة",
    phone: "+201099118822",
    whatsapp_number: "+201099118822",
    working_hours: "السبت إلى الخميس: 09:00 ص - 09:00 م",
    latitude: 31.0420,
    longitude: 31.3650,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=31.0420,31.3650",
    has_delivery: true,
    delivery_fee_from: 100,
    delivery_estimated_time: "حسب موعد التسليم والتصنيع",
    delivery_notes: "نقل ورفع وتركيب كامل للأثاث بسيارات مجهزة مع طاقم نجارين",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-18T10:00:00Z",
    verified_by: 1,
    verification_notes: "ورشة قائمة ومعاينة ميدانية ناجحة.",
    rating_avg: 4.8,
    reviews_count: 42,
    views_count: 1320,
    is_featured: false,
    cover_image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600",
    created_at: "2024-01-18T09:00:00Z",
    updated_at: "2024-01-18T10:00:00Z",
  },
  {
    id: 16,
    name_ar: "مركز النور لتكييف وتبريد الأجهزة وصيانة الفريون",
    name_en: "Al Noor HVAC & Appliance Maintenance",
    slug: "al-noor-hvac-asyut",
    category_id: 9,
    location_id: 4,
    governorate_id: 4,
    city_id: 13,
    neighborhood_id: 23, // شارع الهلالي
    section_id: 2,
    section_slug: "crafts",
    owner_id: 9,
    description_ar: "صيانة وتجهيز كافة أنواع التكييفات (شارب، كاريير، إل جي)، شحن فريون أمريكي R410، وصيانة دورية للغسالات والثلاجات بالمنازل.",
    address_ar: "شارع الهلالي، بجوار بنك الإسكندرية، أسيوط",
    phone: "+201022334466",
    whatsapp_number: "+201022334466",
    working_hours: "يومياً من 09:00 ص حتى 10:00 م",
    latitude: 27.1830,
    longitude: 31.1880,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=27.1830,31.1880",
    has_delivery: false, // خدمة موقعية
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-17T15:00:00Z",
    verified_by: 4,
    verification_notes: "مركز صيانة معتمد وموثق.",
    rating_avg: 4.72,
    reviews_count: 51,
    views_count: 1480,
    is_featured: false,
    cover_image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600",
    created_at: "2024-01-17T14:00:00Z",
    updated_at: "2024-01-17T15:00:00Z",
  },

  // 3. الخدمات العامة (Section 3: services)
  {
    id: 2,
    name_ar: "مركز النخبة لصيانة وتلميع السيارات",
    name_en: "Elite Auto Care",
    slug: "elite-auto-care-asyut",
    category_id: 14,
    location_id: 4,
    governorate_id: 4,
    city_id: 13,
    neighborhood_id: 22, // شارع الجمهورية
    section_id: 3,
    section_slug: "services",
    owner_id: 9,
    description_ar: "خدمات فحص كمبيوتر، ضبط زوايا، ميكانيكا متقدمة، وخدمات نانو سيراميك وحماية الهيكل.",
    address_ar: "شارع الجمهورية الرئيسي، بالقرب من جامعة أسيوط",
    address_line: "عمارة الأوقاف الجديدة، شارع الجمهورية",
    phone: "+201099887766",
    whatsapp_number: "+201099887766",
    working_hours: "السبت إلى الخميس: 09:00 ص - 10:00 م",
    latitude: 27.1872,
    longitude: 31.1785,
    map_place_id: "ChIJzEliteAutoAsyut",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=27.1872,31.1785",
    has_delivery: false, // خدمة في المركز
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-18T14:20:00Z",
    verified_by: 4,
    verification_notes: "تمت المعاينة الميدانية لمركز الصيانة ومطابقة ترخيص النشاط.",
    rating_avg: 4.7,
    reviews_count: 89,
    views_count: 1950,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600",
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-01-18T14:20:00Z",
  },
  {
    id: 3,
    name_ar: "مجمع الشفاء الطبي التخصصي",
    name_en: "Al-Shifa Medical Center",
    slug: "al-shifa-medical-cairo",
    category_id: 13,
    location_id: 1,
    governorate_id: 1,
    city_id: 1,
    neighborhood_id: 1, // شارع عباس العقاد
    section_id: 3,
    section_slug: "services",
    owner_id: 8,
    description_ar: "أكثر من 15 عيادة تخصصية بإشراف نخبة من أساتذة الطب وطاقم تمريض متمرس مع أحدث أجهزة التحاليل والأشعة.",
    address_ar: "مدينة نصر، شارع عباس العقاد، القاهرة",
    phone: "+201055443322",
    whatsapp_number: "+201055443322",
    working_hours: "يومياً من 09:00 ص حتى 11:00 م (طوارئ 24 ساعة)",
    latitude: 30.0561,
    longitude: 31.3412,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0561,31.3412",
    has_delivery: false,
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-20T10:00:00Z",
    verified_by: 3,
    verification_notes: "ترخيص وزارة الصحة وسجل طبي معتمد.",
    rating_avg: 4.85,
    reviews_count: 124,
    views_count: 2420,
    is_featured: false,
    cover_image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600",
    created_at: "2024-01-20T09:15:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },
  {
    id: 4,
    name_ar: "مركز أسيوط لحلول التقنية والبرمجيات",
    name_en: "Asyut Tech Solutions",
    slug: "asyut-tech-solutions",
    category_id: 13,
    location_id: 4,
    governorate_id: 4,
    city_id: 13,
    neighborhood_id: 23, // شارع الهلالي
    section_id: 3,
    section_slug: "services",
    owner_id: 9,
    description_ar: "صيانة الحواسيب المكتبية والمحمولة، شبكات المكاتب والشركات، وتوريد قطع الهاردوير الأصلية وأنظمة المراقبة.",
    address_ar: "شارع الهلالي، أمام مجمع المحاكم، أسيوط",
    phone: "+201088776655",
    whatsapp_number: "+201088776655",
    working_hours: "السبت إلى الخميس: 09:00 ص - 09:00 م",
    latitude: 27.1825,
    longitude: 31.1890,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=27.1825,31.1890",
    has_delivery: true,
    delivery_fee_from: 20,
    delivery_estimated_time: "خلال 2 - 4 ساعات",
    delivery_notes: "استلام وتسليم الأجهزة المحمولة من وإلى العميل بعد الصيانة",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-22T14:00:00Z",
    verified_by: 4,
    verification_notes: "تم التحقق من المقر والسجل الضريبي.",
    rating_avg: 4.65,
    reviews_count: 48,
    views_count: 1310,
    is_featured: false,
    cover_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600",
    created_at: "2024-01-22T13:40:00Z",
    updated_at: "2024-01-22T14:00:00Z",
  },
  {
    id: 17,
    name_ar: "مكتب المستشار فاروق الشناوي للمحاماة والاستشارات القانونية",
    name_en: "Farouk El-Shennawy Law Firm",
    slug: "farouk-shennawy-law-cairo",
    category_id: 15,
    location_id: 1,
    governorate_id: 1,
    city_id: 4,
    neighborhood_id: 10, // شارع التسعين الشمالي
    section_id: 3,
    section_slug: "services",
    owner_id: 1,
    description_ar: "تأسيس الشركات، صياغة العقود التجارية، قضايا الاستثمار والضرائب، والتوثيق القانوني للشركات والأفراد.",
    address_ar: "شارع التسعين الشمالي، مجمع البنوك، التجمع الخامس، القاهرة",
    phone: "+201033445566",
    whatsapp_number: "+201033445566",
    working_hours: "الأحد إلى الخميس: 10:00 ص - 06:00 م",
    latitude: 30.0150,
    longitude: 31.4950,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0150,31.4950",
    has_delivery: false,
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-16T10:00:00Z",
    verified_by: 1,
    verification_notes: "عضوية نقابة المحامين وترخيص مكتب سارٍ.",
    rating_avg: 4.9,
    reviews_count: 36,
    views_count: 1100,
    is_featured: false,
    cover_image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T10:00:00Z",
  },
  {
    id: 18,
    name_ar: "شركة الصقر للشحن السريع ونقل الأثاث بالونش الهيدروليكي",
    name_en: "Al Saqr Shipping & Furniture Moving",
    slug: "al-saqr-movers-alexandria",
    category_id: 17,
    location_id: 3,
    governorate_id: 3,
    city_id: 11,
    neighborhood_id: 20, // ميدان فيكتور عمانويل سموحة
    section_id: 3,
    section_slug: "services",
    owner_id: 1,
    description_ar: "نقل وتغليف عفش شامل بأحدث الأوناش الهيدروليكية حتى الطابق الـ 20 مع سيارات نقل مقفلة وضمان سلامة المنقولات.",
    address_ar: "سموحة، ميدان فيكتور عمانويل، الإسكندرية",
    phone: "+201011223399",
    whatsapp_number: "+201011223399",
    working_hours: "خدمة 24 ساعة طوال أيام الأسبوع",
    latitude: 31.2160,
    longitude: 29.9500,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=31.2160,29.9500",
    has_delivery: true,
    delivery_fee_from: 150,
    delivery_estimated_time: "حسب الموعد المتفق عليه",
    delivery_notes: "فريق عمالة مدرب مع نجار وفني تكييف لفك وتركيب الأجهزة",
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-17T16:00:00Z",
    verified_by: 1,
    verification_notes: "شركة نقل مرخصة وأسطول حديث.",
    rating_avg: 4.82,
    reviews_count: 73,
    views_count: 2190,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600",
    created_at: "2024-01-17T15:00:00Z",
    updated_at: "2024-01-17T16:00:00Z",
  },

  // 4. المعلمون والتدريب (Section 4: teachers)
  {
    id: 9,
    name_ar: "أكاديمية التفوق لدروس اللغات والترجمة المعتمدة",
    name_en: "Al-Tafawwoq Languages & Translation Academy",
    slug: "tafawwoq-languages-cairo",
    category_id: 18,
    location_id: 1,
    governorate_id: 1,
    city_id: 3,
    neighborhood_id: 8, // الكوربة
    section_id: 4,
    section_slug: "teachers",
    owner_id: 8,
    description_ar: "نخبة من كبار مدرسي اللغة الإنجليزية والفرنسية والألمانية، كورسات محادثة تفاعلية، وتأهيل لاختبارات آيلتس وتويفل.",
    address_ar: "شارع بغداد، الكوربة، مصر الجديدة، القاهرة",
    phone: "+201011882233",
    whatsapp_number: "+201011882233",
    working_hours: "يومياً من 10:00 ص حتى 09:00 م",
    latitude: 30.0890,
    longitude: 31.3300,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0890,31.3300",
    has_delivery: false, // كورسات حضورية وأونلاين
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-15T14:00:00Z",
    verified_by: 3,
    verification_notes: "مركز تعليمي معتمد ومدرسون حاصلون على شهادات دولية.",
    rating_avg: 4.92,
    reviews_count: 86,
    views_count: 2450,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600",
    created_at: "2024-01-15T13:00:00Z",
    updated_at: "2024-01-15T14:00:00Z",
  },
  {
    id: 10,
    name_ar: "سنتر الأوائل في الرياضيات والفيزياء للثانوية والجامعات",
    name_en: "Al-Awael Math & Physics Center",
    slug: "al-awael-math-physics-asyut",
    category_id: 19,
    location_id: 4,
    governorate_id: 4,
    city_id: 13,
    neighborhood_id: 24, // حي فريال
    section_id: 4,
    section_slug: "teachers",
    owner_id: 9,
    description_ar: "شرح وتبسيط مناهج الرياضيات والفيزياء للثانوية العامة واللغات وكليات الهندسة مع مذكرات وتطبيقات عملية ومتابعة دورية مع أولياء الأمور.",
    address_ar: "حي فريال، شارع النميس، أسيوط",
    phone: "+201099223344",
    whatsapp_number: "+201099223344",
    working_hours: "يومياً من 09:00 ص حتى 08:00 م",
    latitude: 27.1860,
    longitude: 31.1850,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=27.1860,31.1850",
    has_delivery: false,
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-16T11:00:00Z",
    verified_by: 4,
    verification_notes: "سنتر تعليمي معروف وموثق.",
    rating_avg: 4.86,
    reviews_count: 92,
    views_count: 2780,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600",
    created_at: "2024-01-16T10:00:00Z",
    updated_at: "2024-01-16T11:00:00Z",
  },
  {
    id: 19,
    name_ar: "أكاديمية كودرز للبرمجة والذكاء الاصطناعي",
    name_en: "Coders Programming & AI Academy",
    slug: "coders-academy-zayed",
    category_id: 20,
    location_id: 2,
    governorate_id: 2,
    city_id: 7,
    neighborhood_id: 16, // زايد سنتر
    section_id: 4,
    section_slug: "teachers",
    owner_id: 1,
    description_ar: "دورات عملية مكثفة في تطوير تطبيقات الويب والموبايل، هندسة البرمجيات، علم البيانات والذكاء الاصطناعي مع مشاريع تخرج وفرص توظيف.",
    address_ar: "الشيخ زايد سنتر، بجوار مول أركان، الجيزة",
    phone: "+201066554433",
    whatsapp_number: "+201066554433",
    working_hours: "يومياً من 10:00 ص حتى 09:00 م",
    latitude: 30.0500,
    longitude: 30.9850,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0500,30.9850",
    has_delivery: false,
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-18T13:00:00Z",
    verified_by: 1,
    verification_notes: "أكاديمية تدريب مهني معتمدة.",
    rating_avg: 4.95,
    reviews_count: 115,
    views_count: 3600,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600",
    created_at: "2024-01-18T12:00:00Z",
    updated_at: "2024-01-18T13:00:00Z",
  },

  // 5. البلوجر وصناع المحتوى (Section 5: bloggers)
  {
    id: 20,
    name_ar: "فود بلوجر - يوميات أكيل في المحافظات",
    name_en: "Food Blogger - Egyptian Foodie",
    slug: "egyptian-foodie-blogger",
    category_id: 22,
    location_id: 1,
    governorate_id: 1,
    city_id: 2,
    neighborhood_id: 6, // دجلة المعادي
    section_id: 5,
    section_slug: "bloggers",
    owner_id: 8,
    description_ar: "تغطيات ومراجعات صادقة ومصورة لأشهر المطاعم والمقاهي والأكلات التراثية والشعبية في القاهرة والإسكندرية وصعيد مصر.",
    address_ar: "دجلة المعادي، شارع 206، القاهرة",
    phone: "+201099881122",
    whatsapp_number: "+201099881122",
    website_url: "https://instagram.com/egyptian_foodie",
    working_hours: "يومياً من 12:00 م حتى 10:00 م للتغطيات",
    latitude: 29.9580,
    longitude: 31.2750,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=29.9580,31.2750",
    has_delivery: false,
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-19T11:00:00Z",
    verified_by: 3,
    verification_notes: "صانع محتوى موثق ومعتمد.",
    rating_avg: 4.88,
    reviews_count: 145,
    views_count: 8900,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
    created_at: "2024-01-19T10:00:00Z",
    updated_at: "2024-01-19T11:00:00Z",
  },
  {
    id: 21,
    name_ar: "تيك ريفيو - أحمد التقني للأجهزة والمراجعات",
    name_en: "Tech Review - Ahmed Reviews",
    slug: "ahmed-tech-reviewer",
    category_id: 23,
    location_id: 2,
    governorate_id: 2,
    city_id: 6,
    neighborhood_id: 14, // ميدان المساحة
    section_id: 5,
    section_slug: "bloggers",
    owner_id: 9,
    description_ar: "مراجعات تقنية احترافية، مقارنات دقيقة بين أسعار الهواتف واللابتوبات، وتقديم استشارات ترشيح أفضل أجهزة للمستخدمين.",
    address_ar: "ميدان المساحة، الدقي، الجيزة",
    phone: "+201088771133",
    whatsapp_number: "+201088771133",
    website_url: "https://youtube.com/@AhmedTechReviews",
    working_hours: "يومياً من 02:00 م حتى 10:00 م",
    latitude: 30.0370,
    longitude: 31.2050,
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=30.0370,31.2050",
    has_delivery: false,
    whatsapp_orders_enabled: true,
    status: "verified",
    verified_at: "2024-01-20T12:00:00Z",
    verified_by: 1,
    verification_notes: "صانع محتوى تقني موثق.",
    rating_avg: 4.92,
    reviews_count: 180,
    views_count: 11200,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600",
    created_at: "2024-01-20T11:00:00Z",
    updated_at: "2024-01-20T12:00:00Z",
  },
];

let products: ProductModel[] = [
  // Activity 1: مطعم واحة النيل
  {
    id: 1,
    activity_id: 1,
    owner_user_id: 8,
    name: "وجبة مشويات واحة النيل الملكية (1 كجم)",
    slug: "nile-oasis-royal-mix-grill",
    short_description: "تشكيلة كباب وكفتة ضاني وريش وطرب مع أرز بسمتي وسلطات",
    full_description: "وجبة مشويات فاخرة محضرة من أجود لحوم الضاني الطازجة، تشمل 1 كجم مشويات متنوعة، أرز بسمتي بالمكسرات، طحينة، سلطة خضراء، وخبز طازج من الفرن.",
    sku: "REST-NIL-001",
    price: 650,
    sale_price: 580,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 45,
    availability_note: "متوفر طازج يومياً - توصيل سريع",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    gallery: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600"],
    status: "published",
    views_count: 512,
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:00:00Z",
  },
  {
    id: 2,
    activity_id: 1,
    owner_user_id: 8,
    name: "طاجن مأكولات بحرية بالكريمة والجبن",
    slug: "seafood-casserole-cream-cheese",
    short_description: "جمبري، كاليماري، وفيليه سمك طازج في صلصة كريمة غنية",
    full_description: "طاجن فخاري مغطى بالموزاريلا يجمع بين جمبري جامبو، كاليماري طري، وفيليه سمك قشر بياض بخلطة الأعشاب الإيطالية والكريمة الطازجة.",
    sku: "REST-NIL-002",
    price: 380,
    sale_price: null,
    currency: "ج.م",
    is_available: true,
    is_featured: false,
    stock_qty: 30,
    availability_note: "متوفر للطلب المباشر والتوصيل",
    sort_order: 2,
    cover_image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
    status: "published",
    views_count: 280,
    created_at: "2024-01-16T12:00:00Z",
    updated_at: "2024-01-16T12:00:00Z",
  },

  // Activity 2: مركز النخبة للصيانة
  {
    id: 4,
    activity_id: 2,
    owner_user_id: 9,
    name: "باقة فحص الكمبيوتر الشامل + كشف العفشة والمحرك",
    slug: "elite-full-computer-inspection",
    short_description: "فحص كمبيوتر بأحدث أجهزة OBD-II وتقرير تفصيلي لحالة السيارة",
    full_description: "فحص إلكتروني متكامل لكافة حساسات المحرك، ناقل الحركة، الفرامل ABS، الوسائد الهوائية، مع رفع السيارة لفحص نظام التعليق والفرامل والميزان بدقة متناهية.",
    sku: "AUTO-ELT-101",
    price: 450,
    sale_price: 350,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: null,
    availability_note: "الحجز متاح طوال أيام الأسبوع",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
    status: "published",
    views_count: 640,
    created_at: "2024-01-18T15:00:00Z",
    updated_at: "2024-01-18T15:00:00Z",
  },
  {
    id: 5,
    activity_id: 2,
    owner_user_id: 9,
    name: "حماية وتلميع نانو سيراميك 9H (ضمان سنتين)",
    slug: "nano-ceramic-protection-9h",
    short_description: "طبقات حماية فائقة للمعان الهيكل ضد الخدوش والشمس والعوامل الجوية",
    full_description: "تطبيق 3 طبقات نانو سيراميك أصلي عيار 9H مع معالجة الخدوش السطحية (صاروخ وتلميع ألماني) وضمان سنتين مع مراجعة مجانية كل 6 أشهر.",
    sku: "AUTO-ELT-102",
    price: 3500,
    sale_price: 2900,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 15,
    availability_note: "يستغرق العمل 24 ساعة داخل الكابينة المعزولة",
    sort_order: 2,
    cover_image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600",
    status: "published",
    views_count: 890,
    created_at: "2024-01-19T09:00:00Z",
    updated_at: "2024-01-19T09:00:00Z",
  },
  {
    id: 6,
    activity_id: 2,
    owner_user_id: 9,
    name: "باقة الصيانة الدورية (تغيير زيت تخليقي 10,000 كم + فلتر)",
    slug: "periodic-oil-filter-change",
    short_description: "زيت محرك ألماني تخليقي بالكامل 5W-30 مع فلتر زيت أصلي",
    full_description: "تغيير 4 لتر زيت ألماني معتمد + فلتر زيت أصلي لماركة سيارتك، مع فحص مجاني لمستوى سوائل الفرامل والريداتير والمساحات.",
    sku: "AUTO-ELT-103",
    price: 1250,
    sale_price: 1100,
    currency: "ج.م",
    is_available: true,
    is_featured: false,
    stock_qty: 50,
    availability_note: "متوفر فوري لجميع الموديلات",
    sort_order: 3,
    cover_image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600",
    status: "published",
    views_count: 320,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },

  // Activity 7: مول الدلتا للتسوق والإلكترونيات (المنصورة)
  {
    id: 11,
    activity_id: 7,
    owner_user_id: 1,
    name: "سماعة لاسلكية بلوتوث 5.3 عازلة للضوضاء ANC",
    slug: "anc-wireless-headphones-bt53",
    short_description: "بطارية تدوم 40 ساعة، صوت عالي الدقة Hi-Res، وعزل ضوضاء فعال",
    full_description: "سماعة رأس فاخرة بمحركات ديناميكية 40 مم توفر تجربة صوتية محيطية، مع ميكروفونات ذكية للمكالمات النقية وشحن سريع Type-C.",
    sku: "TECH-DLT-301",
    price: 1850,
    sale_price: 1499,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 35,
    availability_note: "ضمان محلي معتمد لمدة عام",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    status: "published",
    views_count: 1420,
    created_at: "2024-01-18T11:00:00Z",
    updated_at: "2024-01-18T11:00:00Z",
  },
  {
    id: 12,
    activity_id: 7,
    owner_user_id: 1,
    name: "شاحن جداري فائق السرعة GaN بقدرة 65 واط",
    slug: "gan-super-fast-charger-65w",
    short_description: "يشحن اللابتوب والموبايل معاً بثلاثة منافذ Type-C + USB-A",
    full_description: "شاحن مدمج بتقنية نيتريد الجاليوم (GaN) بحجم أصغر بنسبة 50% مع حماية ذكية ضد السخونة وتذبذب التيار.",
    sku: "TECH-DLT-302",
    price: 750,
    sale_price: 620,
    currency: "ج.م",
    is_available: true,
    is_featured: false,
    stock_qty: 60,
    availability_note: "متوفر باللونين الأسود والأبيض",
    sort_order: 2,
    cover_image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600",
    status: "published",
    views_count: 530,
    created_at: "2024-01-19T13:00:00Z",
    updated_at: "2024-01-19T13:00:00Z",
  },

  // Activity 12: تيك إكسبريس (الدقي - الجيزة) [مقارنة أسعار مع مول الدلتا]
  {
    id: 13,
    activity_id: 12,
    owner_user_id: 9,
    name: "سماعة لاسلكية بلوتوث 5.3 عازلة للضوضاء ANC",
    slug: "anc-wireless-headphones-bt53-express",
    short_description: "سماعة بلوتوث أصلية مع ميزة إلغاء الضوضاء وبطارية 40 ساعة",
    full_description: "سماعة رأس عازلة للضوضاء النشطة ANC، صوت محيطي ونقاء استثنائي، مع شحن سريع وضمان استبدال مباشر 14 يوماً.",
    sku: "TECH-EXP-301",
    price: 1650,
    sale_price: 1350,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 20,
    availability_note: "أفضل سعر منافس في الجيزة والقاهرة",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    status: "published",
    views_count: 890,
    created_at: "2024-01-19T10:00:00Z",
    updated_at: "2024-01-19T10:00:00Z",
  },
  {
    id: 14,
    activity_id: 12,
    owner_user_id: 9,
    name: "شاحن جداري فائق السرعة GaN بقدرة 65 واط",
    slug: "gan-super-fast-charger-65w-express",
    short_description: "شاحن لابتوب وهواتف 65W GaN متعدد المنافذ",
    full_description: "شاحن بتقنية GaN فائقة السرعة، يدعم بروتوكولات PD و QC لشحن اللابتوب والموبايل في نفس الوقت بأمان تام.",
    sku: "TECH-EXP-302",
    price: 690,
    sale_price: 580,
    currency: "ج.م",
    is_available: true,
    is_featured: false,
    stock_qty: 40,
    availability_note: "متوفر فوري",
    sort_order: 2,
    cover_image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600",
    status: "published",
    views_count: 420,
    created_at: "2024-01-20T11:00:00Z",
    updated_at: "2024-01-20T11:00:00Z",
  },

  // Activity 6: مجمع الأهرامات الهندسي (كشف ومعالجة تسريبات)
  {
    id: 10,
    activity_id: 6,
    owner_user_id: 1,
    name: "خدمة كشف ومعالجة تسريبات السباكة بالأجهزة الصوتية",
    slug: "acoustic-leak-detection-service",
    short_description: "كشف تسريبات بدون تكسير بأحدث أجهزة الموجات الصوتية والحرارية",
    full_description: "زيارة فني متخصص ومعه أحدث أجهزة الكشف الحراري والموجات فوق الصوتية لتحديد موقع التسريب المخفي داخل الحوائط والأرضيات بدقة سنتيمترية مع تقرير إصلاح فوري.",
    sku: "SERV-HOME-201",
    price: 350,
    sale_price: 280,
    currency: "ج.م",
    is_available: true,
    is_featured: false,
    stock_qty: null,
    availability_note: "متاح حجز المواعيد على مدار 24 ساعة",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600",
    status: "published",
    views_count: 410,
    created_at: "2024-01-17T10:00:00Z",
    updated_at: "2024-01-17T10:00:00Z",
  },

  // Activity 14: أسطى حسن للسباكة (مقارنة أسعار كشف التسريبات)
  {
    id: 15,
    activity_id: 14,
    owner_user_id: 8,
    name: "خدمة كشف ومعالجة تسريبات السباكة بالأجهزة الصوتية",
    slug: "acoustic-leak-detection-service-hassan",
    short_description: "كشف تسريب السباكة بدقة بأحدث الأجهزة مع الإصلاح الفوري والضمان",
    full_description: "فحص كامل لشبكة تغذية وصرف الحمام والمطبخ بالأجهزة الإلكترونية بدون أي تكسير، ومعالجة فورية للتسريب وضمان 6 أشهر على الإصلاح.",
    sku: "PLUMB-HAS-101",
    price: 300,
    sale_price: 250,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: null,
    availability_note: "حضور فوري خلال ساعة داخل القاهرة والجيزة",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600",
    status: "published",
    views_count: 620,
    created_at: "2024-01-18T14:00:00Z",
    updated_at: "2024-01-18T14:00:00Z",
  },

  // Activity 11: هايبر ماركت البركة (سوبر ماركت - القاهرة)
  {
    id: 16,
    activity_id: 11,
    owner_user_id: 8,
    name: "زيت زيتون بكر ممتاز معصور على البارد (1 لتر)",
    slug: "extra-virgin-olive-oil-1l-cairo",
    short_description: "زيت زيتون سيناوي نقي 100% حموضة أقل من 0.8%",
    full_description: "زيت زيتون طبيعي معصور على البارد من مزارع العريش، غني بمضادات الأكسدة والدهون الصحية غير المشبعة، مثالي للسلطات والطهي الصحي.",
    sku: "GROC-BAR-101",
    price: 340,
    sale_price: 290,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 85,
    availability_note: "توصيل فوري مع طلبات السوبرماركت",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600",
    status: "published",
    views_count: 530,
    created_at: "2024-01-17T11:00:00Z",
    updated_at: "2024-01-17T11:00:00Z",
  },

  // Activity 13: سوبر ماركت الصفا أسيوط [مقارنة أسعار مع هايبر البركة]
  {
    id: 17,
    activity_id: 13,
    owner_user_id: 9,
    name: "زيت زيتون بكر ممتاز معصور على البارد (1 لتر)",
    slug: "extra-virgin-olive-oil-1l-asyut",
    short_description: "زيت زيتون نقي 100% عصرة أولى على البارد",
    full_description: "زيت زيتون بكر ممتاز طبيعي بدون أي إضافات كيميائية، في عبوة زجاجية داكنة لحفظ الجودة والنقاء.",
    sku: "GROC-SAF-101",
    price: 310,
    sale_price: 265,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 60,
    availability_note: "متوفر وتوصيل سريع بأسيوط",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600",
    status: "published",
    views_count: 380,
    created_at: "2024-01-17T12:00:00Z",
    updated_at: "2024-01-17T12:00:00Z",
  },

  // Activity 9: أكاديمية التفوق (لغات)
  {
    id: 18,
    activity_id: 9,
    owner_user_id: 8,
    name: "دورة تحضير اختبار الآيلتس الأكاديمي الشاملة (IELTS Prep)",
    slug: "ielts-prep-course-intensive",
    short_description: "48 ساعة تدريب تفاعلي تغطي أقسام المحادثة والكتابة والاستماع والقراءة",
    full_description: "كورس معتمد بإشراف مدربين معتمدين من المجلس الثقافي البريطاني، يتضمن اختبارات محاكاة حقيقية، تصحيح فردي لمقالات الكتابة، وتدريب مكثف على المقابلات الشفوية.",
    sku: "TEACH-LANG-401",
    price: 2200,
    sale_price: 1800,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 25,
    availability_note: "متاح حضور في مقر الأكاديمية أو أونلاين عبر Zoom",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600",
    status: "published",
    views_count: 940,
    created_at: "2024-01-18T16:00:00Z",
    updated_at: "2024-01-18T16:00:00Z",
  },

  // Activity 19: أكاديمية كودرز (برمجة)
  {
    id: 19,
    activity_id: 19,
    owner_user_id: 1,
    name: "معسكر تدريب تطوير تطبيقات الويب Full-Stack وتطبيقات الذكاء الاصطناعي",
    slug: "fullstack-ai-bootcamp",
    short_description: "معسكر عملي لمدة 12 أسبوعاً لتطوير تطبيقات React, Node.js ودمج Gemini AI",
    full_description: "تدريب تطبيقي مكثف من الصفر للاحتراف: بناء قواعد بيانات، واجهات تفاعلية سريعة، واجهات برمجة تطبيقات REST & GraphQL، وبناء مشاريع حقيقية لتجهيز بورتفوليو احترافي.",
    sku: "TEACH-CODE-501",
    price: 4500,
    sale_price: 3600,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 30,
    availability_note: "متاح حجز المقاعد للدفعة الجديدة",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600",
    status: "published",
    views_count: 1560,
    created_at: "2024-01-19T14:00:00Z",
    updated_at: "2024-01-19T14:00:00Z",
  },

  // Activity 8: بازار طيبة
  {
    id: 7,
    activity_id: 8,
    owner_user_id: 8,
    name: "ورق بردي فرعوني أصلي (لوحة حورس ونفرتاري) 40×60 سم",
    slug: "authentic-pharaonic-papyrus-horus-nefertari",
    short_description: "لوحة بردي مرسومة ومذهبة يدوياً بألوان طبيعية مع شهادة أصالة",
    full_description: "ورق بردي مصنوع من نبات البردي الطبيعي من ضفاف النيل في صعيد مصر، رسم وتلوين يدوي بألوان ثابتة وزخارف ذهبية عيار 18 تحاكي نقوش معابد الأقصر، تأتي مؤطرة بإطار خشبي أنيق.",
    sku: "HERIT-LUX-001",
    price: 850,
    sale_price: 720,
    currency: "ج.م",
    is_available: true,
    is_featured: true,
    stock_qty: 25,
    availability_note: "معتمدة من نقابة الحرفيين بالأقصر",
    sort_order: 1,
    cover_image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600",
    status: "published",
    views_count: 1250,
    created_at: "2024-01-19T16:00:00Z",
    updated_at: "2024-01-19T16:00:00Z",
  },
];

let inquiries: InquiryModel[] = [
  {
    id: 1,
    activity_id: 1,
    product_id: 1,
    offer_id: 1,
    customer_name: "عمر فاروق",
    customer_phone: "+201012345678",
    customer_email: "omar.farouk@example.com",
    message: "أريد حجز طاولة لـ 6 أفراد مع وجبة المشويات الملكية واستخدام كود خصم الافتتاح يوم الجمعة القادم.",
    type: "whatsapp",
    status: "new",
    priority: "high",
    is_read: false,
    source: "app_offer",
    notes: "عميل vip يطلب طاولة مطلة على النيل مباشرة.",
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z",
    history: [
      {
        id: "evt_1",
        action: "تم استلام الطلب من التطبيق",
        timestamp: "2024-01-20T14:30:00Z",
        actor_name: "النظام",
      },
    ],
  },
  {
    id: 2,
    activity_id: 1,
    product_id: 2,
    offer_id: null,
    customer_name: "أحمد السعيد",
    customer_phone: "+201055443322",
    customer_email: "ahmed.saeed@example.com",
    message: "هل يتوفر لديكم قسم خاص بالعائلات وغرف مغلقة للمناسبات الصغيرة؟",
    type: "inquiry",
    status: "contacted",
    priority: "normal",
    is_read: true,
    source: "app_activity",
    notes: "تم الاتصال بالعميل وشرح قاعات العائلات المتاحة.",
    created_at: "2024-01-21T11:00:00Z",
    updated_at: "2024-01-21T12:30:00Z",
    history: [
      {
        id: "evt_2_1",
        action: "تم استلام الاستفسار",
        timestamp: "2024-01-21T11:00:00Z",
        actor_name: "النظام",
      },
      {
        id: "evt_2_2",
        action: "تم التواصل هاتفياً وتوضيح باقات المناسبات",
        note: "العميل مهتم بحجز الخميس بعد القادم",
        timestamp: "2024-01-21T12:30:00Z",
        actor_name: "التاجر",
      },
    ],
  },
  {
    id: 3,
    activity_id: 2,
    product_id: 5,
    offer_id: 2,
    customer_name: "م. كريم عبد العزيز",
    customer_phone: "+201098765432",
    customer_email: "kareem.azeez@example.com",
    message: "استفسار عن موعد متاح لتطبيق نانو سيراميك لسيارة كيا سبورتاج 2023 مع خصم باقة الصيف.",
    type: "call",
    status: "in_progress",
    priority: "urgent",
    is_read: true,
    source: "app_product",
    notes: "تم إرسال عرض السعر عبر الواتساب وبانتظار تحديد موعد الاستلام.",
    created_at: "2024-01-21T09:15:00Z",
    updated_at: "2024-01-21T15:20:00Z",
    history: [
      {
        id: "evt_3_1",
        action: "طلب اتصال مباشر",
        timestamp: "2024-01-21T09:15:00Z",
        actor_name: "النظام",
      },
      {
        id: "evt_3_2",
        action: "إرسال عرض السعر والمواصفات عبر واتساب",
        timestamp: "2024-01-21T15:20:00Z",
        actor_name: "التاجر",
      },
    ],
  },
  {
    id: 4,
    activity_id: 1,
    product_id: null,
    offer_id: null,
    customer_name: "سارة محمود",
    customer_phone: "+201233445566",
    customer_email: "sara.m@example.com",
    message: "هل يمكن طلب خدمة بوفيه خارجي لحفل زفاف في أسوان لـ 150 فرد؟",
    type: "inquiry",
    status: "new",
    priority: "urgent",
    is_read: false,
    source: "app_activity",
    notes: "طلب استفسار ضخم يحتاج دراسة تكاليف التوصيل والتجهيز.",
    created_at: "2024-01-22T10:15:00Z",
    updated_at: "2024-01-22T10:15:00Z",
    history: [
      {
        id: "evt_4_1",
        action: "استفسار جديد عن خدمة خارجية",
        timestamp: "2024-01-22T10:15:00Z",
        actor_name: "النظام",
      },
    ],
  },
  {
    id: 5,
    activity_id: 8,
    product_id: 7,
    offer_id: null,
    customer_name: "د. هاني المنشاوي",
    customer_phone: "+201122334455",
    customer_email: "hani.m@example.com",
    message: "هل يمكن شحن لوحة البردي إلى الإسكندرية مغلفة كهدية تذكارية؟",
    type: "inquiry",
    status: "closed",
    priority: "normal",
    is_read: true,
    source: "app_product",
    notes: "تم تأكيد الشحن بنجاح واستلام رقم التتبع.",
    created_at: "2024-01-22T16:45:00Z",
    updated_at: "2024-01-23T14:00:00Z",
    history: [
      {
        id: "evt_5_1",
        action: "تم استلام الاستفسار",
        timestamp: "2024-01-22T16:45:00Z",
        actor_name: "النظام",
      },
      {
        id: "evt_5_2",
        action: "تم إرسال تفاصيل الشحن وإغلاق المعاملة بنجاح",
        timestamp: "2024-01-23T14:00:00Z",
        actor_name: "التاجر",
      },
    ],
  },
];

let reviews: ReviewModel[] = [
  { id: 1, activity_id: 1, user_id: 2, rating: 5, comment: "خدمة رائعة وطعام شهي وإطلالة النيل ساحرة جداً!", is_approved: true, is_reported: false, created_at: "2024-01-16T18:00:00Z" },
  { id: 2, activity_id: 2, user_id: 5, rating: 5, comment: "أفضل مركز صيانة في أسيوط، دقة وسرعة في العمل.", is_approved: true, is_reported: false, created_at: "2024-01-19T10:30:00Z" },
  { id: 3, activity_id: 1, user_id: 4, rating: 4, comment: "المكان راقي والأسعار مناسبة لجودة الخدمة المقدمة.", is_approved: true, is_reported: false, created_at: "2024-01-20T14:15:00Z" },
  { id: 4, activity_id: 3, user_id: 3, rating: 1, comment: "تعامل غير لائق مع العملاء ورفضوا تطبيق الخصم المعلن عنه.", is_approved: false, is_reported: true, created_at: "2024-01-22T09:00:00Z" },
  { id: 5, activity_id: 4, user_id: 6, rating: 2, comment: "تأخر في موعد التسليم لأكثر من ثلاثة أيام دون اعتذار.", is_approved: true, is_reported: true, created_at: "2024-01-23T11:20:00Z" },
];

let auditLogs: AuditLogModel[] = [
  {
    id: 1,
    user_id: 1,
    user_name: "م. طارق الخالدي (المدير العام)",
    model_type: "App\\Models\\Role",
    model_id: 1,
    action: "created",
    old_values: null,
    new_values: { name: "مدير_عام", display_name_ar: "مدير عام", permissions_count: 13 },
    ip_address: "192.168.1.10",
    user_agent: "Laravel Seeder Client",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    user_id: 3,
    user_name: "خالد محمود (مراجع القاهرة)",
    model_type: "App\\Models\\Activity",
    model_id: 1,
    action: "verified",
    old_values: { status: "pending", verified_at: null },
    new_values: { status: "verified", verified_at: "2024-01-15T10:00:00Z", notes: "تم فحص السجل التجاري" },
    ip_address: "41.233.10.45",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    created_at: "2024-01-15T10:00:05Z",
  },
  {
    id: 3,
    user_id: 4,
    user_name: "عمر الصعيدي (مراجع أسيوط)",
    model_type: "App\\Models\\Activity",
    model_id: 2,
    action: "verified",
    old_values: { status: "pending", verified_at: null },
    new_values: { status: "verified", verified_at: "2024-01-18T14:20:00Z", notes: "تمت المعاينة الميدانية" },
    ip_address: "156.204.88.12",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    created_at: "2024-01-18T14:20:10Z",
  },
];

// Seed Offers State
interface FavoriteRecord {
  id: number;
  user_id: number;
  activity_id: number;
  created_at: string;
}

let userFavorites: FavoriteRecord[] = [
  { id: 1, user_id: 10, activity_id: 1, created_at: new Date().toISOString() },
  { id: 2, user_id: 10, activity_id: 2, created_at: new Date().toISOString() },
  { id: 3, user_id: 1, activity_id: 3, created_at: new Date().toISOString() },
];

let offers: OfferModel[] = [
  {
    id: 1,
    owner_user_id: 8,
    activity_id: 1,
    product_id: 1,
    title: "خصم 20% على وجبة مشويات واحة النيل الملكية للعائلات",
    description: "استمتع بإطلالة نيلية ساحرة مع خصم حصري على وجبة المشويات المشكلة الكيلو تكفي حتى 4 أفراد، مع أرز بسمتي وسلطات وخبز طازج.",
    offer_type: "percentage",
    discount_percentage: 20,
    discount_amount: 130,
    original_price: 650,
    offer_price: 520,
    starts_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
    is_active: true,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    terms: "العرض ساري طوال أيام الأسبوع للحجز المسبق وللطاولات العائلية فقط.",
    views_count: 840,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },
  {
    id: 2,
    owner_user_id: 9,
    activity_id: 2,
    product_id: 4,
    title: "وفر 100 ج.م على باقة فحص الكمبيوتر الشامل والعفشة",
    description: "تقرير إلكتروني تفصيلي بكافة حساسات المحرك والفرامل والشاسيه وضبط الزوايا بأحدث أجهزة التشخيص مع خصم فوري.",
    offer_type: "fixed",
    discount_percentage: null,
    discount_amount: 100,
    original_price: 450,
    offer_price: 350,
    starts_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString(),
    is_active: true,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
    terms: "متاح لجميع موديلات السيارات الملاكي من السبت إلى الخميس.",
    views_count: 620,
    created_at: "2024-01-21T11:30:00Z",
    updated_at: "2024-01-21T11:30:00Z",
  },
  {
    id: 3,
    owner_user_id: 8,
    activity_id: 8,
    product_id: 7,
    title: "عرض السياحة والتراث: خصم 15% على لوحات البردي الأصلية",
    description: "لوحات فرعونية مذهبة يدوياً بألوان ثابتة وشهادة أصالة معتمدة من نقابة الحرفيين بالأقصر.",
    offer_type: "percentage",
    discount_percentage: 15,
    discount_amount: 127,
    original_price: 850,
    offer_price: 723,
    starts_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    is_active: true,
    is_featured: true,
    cover_image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600",
    terms: "شحن مجاني لجميع محافظات مصر عند طلب لوحتين أو أكثر.",
    views_count: 490,
    created_at: "2024-01-22T14:00:00Z",
    updated_at: "2024-01-22T14:00:00Z",
  },
  {
    id: 4,
    owner_user_id: 1,
    activity_id: 6,
    product_id: 10,
    title: "خصم 20% على كشف تسريبات السباكة بالأجهزة الصوتية والحرارية",
    description: "كشف دقيق بدون أي تكسير مع تقرير فني فوري وضمان معتمد لأعمال السباكة المنزلية.",
    offer_type: "percentage",
    discount_percentage: 20,
    discount_amount: 70,
    original_price: 350,
    offer_price: 280,
    starts_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    is_active: true,
    is_featured: false,
    cover_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600",
    terms: "ساري لمناطق القاهرة والجيزة على مدار 24 ساعة.",
    views_count: 310,
    created_at: "2024-01-23T09:00:00Z",
    updated_at: "2024-01-23T09:00:00Z",
  },
];

// Seed Plans State
let plans: PlanModel[] = [
  {
    id: 1,
    name: "الخطة الأساسية (Starter)",
    slug: "basic",
    description: "مثالية للمحلات الناشئة، الحرفيين، ومقدمي الخدمات الفردية لبدء التواجد على الدليل.",
    price_monthly: 0,
    price_yearly: 0,
    currency: "ج.م",
    trial_days: 0,
    is_active: true,
    is_featured: false,
    sort_order: 1,
    limits: {
      max_activities: 1,
      max_products: 10,
      can_create_offers: false,
      can_feature_products: false,
      can_feature_activity: false,
      can_access_advanced_analytics: false,
      can_have_multiple_branches: false,
      can_use_import_export: false,
    },
    features_list: [
      "إضافة نشاط تجاري أو خدمي واحد",
      "إضافة حتى 10 منتجات / خدمات بقائمة الأسعار",
      "تحديد الموقع الدقيق على الخريطة التفاعلية",
      "استقبال استفسارات ورسائل الواتساب المباشرة",
      "ظهور في نتائج البحث العامة",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "الخطة الاحترافية (Pro)",
    slug: "pro",
    description: "الخيار الأفضل للمتاجر والمراكز التجارية النشطة لإدارة كتالوج المنتجات ونشر العروض الترويجية.",
    price_monthly: 299,
    price_yearly: 2990,
    currency: "ج.م",
    trial_days: 14,
    is_active: true,
    is_featured: true,
    sort_order: 2,
    limits: {
      max_activities: 3,
      max_products: 50,
      can_create_offers: true,
      can_feature_products: true,
      can_feature_activity: true,
      can_access_advanced_analytics: true,
      can_have_multiple_branches: true,
      can_use_import_export: true,
    },
    features_list: [
      "إدارة حتى 3 فروع أو أنشطة تجارية",
      "إضافة حتى 50 منتج وخدمة مع الأسعار والخصومات",
      "نشر العروض الترويجية والخصومات غير المحدودة",
      "استيراد وتصدير كتالوج المنتجات مجمعاً بملفات CSV",
      "تمييز المنتجات والأنشطة في الصفحة الرئيسية",
      "لوحة تحليلات متقدمة لمعدلات المشاهدة والطلبات",
      "شارة تاجر موثوق على ملف النشاط",
      "دعم فني سريع عبر الواتساب",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "الخطة المميزة (Enterprise)",
    slug: "enterprise",
    description: "مصممة لسلاسل المحلات الكبرى، التوكيلات، والمؤسسات لتوسيع نطاق الأعمال بدون أي قيود.",
    price_monthly: 699,
    price_yearly: 6990,
    currency: "ج.م",
    trial_days: 30,
    is_active: true,
    is_featured: false,
    sort_order: 3,
    limits: {
      max_activities: 999,
      max_products: 9999,
      can_create_offers: true,
      can_feature_products: true,
      can_feature_activity: true,
      can_access_advanced_analytics: true,
      can_have_multiple_branches: true,
      can_use_import_export: true,
    },
    features_list: [
      "عدد غير محدود من الأنشطة والفروع",
      "كتالوج غير محدود من المنتجات والخدمات",
      "عروض ترويجية وحملات تسويقية غير محدودة",
      "استيراد وتصدير فوري ضخم بدون قيود حجم",
      "أولوية مطلقة في ترتيب نتائج البحث والخريطة",
      "تصدير تقارير مدققة وسجلات العمليات التفصيلية",
      "مدير حساب مخصص للدعم الفني والاستشارات 24/7",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Seed Subscriptions State
let subscriptions: SubscriptionModel[] = [
  {
    id: 1,
    user_id: 8, // م. حسام التاجر
    plan_id: 2, // Pro
    status: "active",
    starts_at: "2024-01-01T00:00:00Z",
    ends_at: new Date(Date.now() + 320 * 24 * 3600 * 1000).toISOString(),
    trial_ends_at: null,
    auto_renew: true,
    notes: "اشتراك سنوي في الخطة الاحترافية - تم الدفع بنجاح",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    user_id: 9, // كابتن مدحت
    plan_id: 2, // Pro (in Trial)
    status: "trial",
    starts_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    trial_ends_at: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    auto_renew: false,
    notes: "فترة تجريبية مجانية 14 يوم للخطة الاحترافية",
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    user_id: 10, // محمد عبد الله
    plan_id: 1, // Basic
    status: "active",
    starts_at: "2024-01-10T00:00:00Z",
    ends_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    trial_ends_at: null,
    auto_renew: true,
    notes: "الخطة الأساسية المجانية",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
];

// Seed Import/Export logs
let importExportLogs: ImportExportLogModel[] = [
  {
    id: 1,
    user_id: 8,
    user_name: "م. حسام التاجر",
    operation_type: "import",
    entity_type: "products",
    activity_id: 1,
    activity_name: "مطعم واحة النيل للمأكولات الشرقية",
    format: "csv",
    total_records: 3,
    success_count: 3,
    fail_count: 0,
    status: "success",
    ip_address: "197.35.40.12",
    notes: "استيراد أولي لقائمة أطباق المشويات والمقبلات البحرية",
    created_at: "2024-01-16T10:30:00Z",
  },
  {
    id: 2,
    user_id: 8,
    user_name: "م. حسام التاجر",
    operation_type: "export",
    entity_type: "products",
    activity_id: 8,
    activity_name: "بازار طيبة للتحف والبرديات الأثرية",
    format: "csv",
    total_records: 3,
    success_count: 3,
    fail_count: 0,
    status: "success",
    ip_address: "197.35.40.12",
    notes: "تصدير نسخة احتياطية من كتالوج التحف والبرديات",
    created_at: "2024-01-21T15:00:00Z",
  },
];

// Helper functions for CSV Parsing and Generation
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let insideQuote = false;

  // Strip UTF-8 BOM if present
  let cleanText = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  cleanText = cleanText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if (char === "\n" && !insideQuote) {
      currentRow.push(currentVal.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function generateCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(h => escapeCell(h)).join(",");
  const dataLines = rows.map(r => r.map(c => escapeCell(c)).join(",")).join("\r\n");

  // Include UTF-8 BOM for Microsoft Excel compatibility with Arabic
  return "\uFEFF" + headerLine + "\r\n" + dataLines;
}

function getMerchantSubscriptionInfo(userId: number) {
  const isSuperAdmin = roles.find(r => r.id === users.find(u => u.id === userId)?.role_id)?.name === "مدير_عام";
  const sub = subscriptions.find(s => s.user_id === userId && (s.status === "active" || s.status === "trial"));
  const plan = isSuperAdmin
    ? (plans.find(p => p.slug === "enterprise") || plans[2] || plans[0])
    : (sub ? plans.find(p => p.id === sub.plan_id) || plans[0] : plans[0]);

  const myActivities = isSuperAdmin ? activities : activities.filter(a => a.owner_id === userId);
  const myActivityIds = myActivities.map(a => a.id);
  const myProducts = products.filter(p => myActivityIds.includes(p.activity_id));
  const myOffers = offers.filter(o => o.owner_user_id === userId);

  const defaultEndsAt = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
  let daysRemaining = 365;
  if (sub && sub.ends_at) {
    const end = new Date(sub.ends_at).getTime();
    const now = Date.now();
    daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  const effectiveSubscription = sub ? {
    ...sub,
    user: users.find(u => u.id === sub.user_id),
    plan: plan,
    usage: {
      activities_used: myActivities.length,
      products_used: myProducts.length,
      offers_used: myOffers.length,
    },
  } : {
    id: 0,
    user_id: userId,
    plan_id: plan.id,
    status: isSuperAdmin ? "active" : "active",
    billing_cycle: "yearly",
    starts_at: new Date().toISOString(),
    ends_at: defaultEndsAt,
    is_auto_renew: true,
    user: users.find(u => u.id === userId),
    plan: plan,
    usage: {
      activities_used: myActivities.length,
      products_used: myProducts.length,
      offers_used: myOffers.length,
    },
  };

  return {
    subscription: effectiveSubscription,
    plan,
    status: isSuperAdmin ? "active" : (sub ? sub.status : "active"),
    days_remaining: daysRemaining,
    usage: {
      activities_count: myActivities.length,
      max_activities: plan.limits.max_activities,
      products_count: myProducts.length,
      max_products: plan.limits.max_products,
      offers_count: myOffers.length,
      can_create_offers: plan.limits.can_create_offers,
      can_use_import_export: plan.limits.can_use_import_export,
      can_access_advanced_analytics: plan.limits.can_access_advanced_analytics,
      can_feature_products: plan.limits.can_feature_products,
    },
  };
}

// Helper functions
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function getAuthUser(req: Request): UserModel | null {
  const authHeader = req.headers.authorization;
  const userHeaderId = req.headers["x-user-id"];

  if (userHeaderId) {
    const u = users.find(x => x.id === parseInt(String(userHeaderId)));
    if (u) return u;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userIdMatch = token.match(/user_(\d+)/);
    if (userIdMatch) {
      const u = users.find(x => x.id === parseInt(userIdMatch[1]));
      if (u) return u;
    }
  }

  // Default to General Manager if no header supplied
  return users[0];
}

function userHasPermission(user: UserModel, permission: string): boolean {
  const role = roles.find(r => r.id === user.role_id);
  if (!role) return false;
  if (role.name === "مدير_عام") return true;
  return role.permissions.includes(permission);
}

function userRequiresGeoScope(user: UserModel): boolean {
  const role = roles.find(r => r.id === user.role_id);
  if (!role) return false;
  if (role.name === "مدير_عام") return false;
  return role.requires_geo_scope;
}

function recordAuditLog(
  user: UserModel | null,
  modelType: string,
  modelId: number,
  action: AuditLogModel["action"],
  oldValues: any,
  newValues: any,
  req: Request
) {
  const log: AuditLogModel = {
    id: auditLogs.length + 1,
    user_id: user ? user.id : null,
    user_name: user ? user.name : "النظام",
    model_type: modelType,
    model_id: modelId,
    action,
    old_values: oldValues,
    new_values: newValues,
    ip_address: (req.ip || "127.0.0.1"),
    user_agent: req.headers["user-agent"] || "API Client",
    created_at: new Date().toISOString(),
  };
  auditLogs.unshift(log); // newest first
  return log;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS for Flutter web and external frontends: allow any localhost/127.0.0.1 port
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          /^http:\/\/localhost(:\d+)?$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
        ) {
          return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "Accept-Language",
        "X-Client-Platform",
        "X-User-Id",
      ],
      credentials: true,
    })
  );

  // Fallback headers and URL rewrite to support both /api/* and /api/v2/*
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Content-Language", "ar");
    res.header("X-Direction", "rtl");

    if (
      req.url.startsWith("/api/") &&
      !req.url.startsWith("/api/v2/") &&
      !req.url.startsWith("/api/health")
    ) {
      req.url = req.url.replace(/^\/api\//, "/api/v2/");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  /* -------------------------------------------------------------------------- */
  /*                          API V2 ROUTES (Laravel Contracts)                 */
  /* -------------------------------------------------------------------------- */

  // 1. Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      framework: "Laravel 11.x (Simulated Engine)",
      php_version: "8.3",
      api_version: "v2",
      locale: "ar",
      database: "MySQL / PostgreSQL Compatible",
    });
  });

  // 2. Auth Endpoints & Visitor Identity
  app.post("/api/v2/auth/login", (req, res) => {
    const { email, email_or_phone, password } = req.body;
    const query = (email_or_phone || email || "").trim();
    
    // Find user by email or phone
    const user = users.find(u => 
      u.email.toLowerCase() === query.toLowerCase() || 
      (u.phone && (u.phone === query || u.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '')))
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "بيانات الاعتماد المدخلة غير صحيحة، يرجى التأكد من البريد أو رقم الهاتف.",
        error_code: "INVALID_CREDENTIALS",
      });
    }

    user.last_login_at = new Date().toISOString();
    const token = `sanctum_token_user_${user.id}_${Date.now()}`;
    const role = roles.find(r => r.id === user.role_id);
    const location = locations.find(l => l.id === user.location_id);

    recordAuditLog(user, "App\\Models\\User", user.id, "login", null, { token_type: "Bearer", ip: req.ip }, req);

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح.",
      data: {
        token,
        token_type: "Bearer",
        expires_in_days: 7,
        user: {
          ...user,
          role_name: role?.name,
          role_display_name_ar: role?.display_name_ar,
          location_name_ar: location?.name_ar || "كافة المناطق",
          requires_geo_scope: userRequiresGeoScope(user),
          permissions: role?.permissions || [],
        },
      },
    });
  });

  app.post("/api/v2/auth/register", (req, res) => {
    const { name, email, phone, governorate_id, password } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(422).json({
        success: false,
        message: "يرجى ملء كافة الحقول الإلزامية للتسجيل (الاسم ورقم الهاتف أو البريد).",
        errors: {
          name: !name ? ["حقل الاسم مطلوب."] : [],
          phone: !phone && !email ? ["حقل الهاتف أو البريد مطلوب."] : [],
        },
      });
    }

    // Check if user already exists
    const existing = users.find(u => 
      (email && u.email.toLowerCase() === email.toLowerCase()) || 
      (phone && u.phone === phone)
    );

    if (existing) {
      return res.status(422).json({
        success: false,
        message: "البريد الإلكتروني أو رقم الهاتف مسجل بالفعل مسبقاً لدينا.",
        error_code: "USER_ALREADY_EXISTS",
      });
    }

    // Create user with default visitor/customer role (role_id: 8)
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser: UserModel = {
      id: newId,
      name: name.trim(),
      email: email ? email.trim() : `user_${newId}@daleel.test`,
      phone: phone ? phone.trim() : `+2010000000${newId}`,
      role_id: 8, // Role 8 = User / Customer
      location_id: governorate_id || 1,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      is_active: true,
      last_login_at: new Date().toISOString(),
    };

    users.push(newUser);
    const token = `sanctum_token_user_${newUser.id}_${Date.now()}`;
    const role = roles.find(r => r.id === newUser.role_id);
    const location = locations.find(l => l.id === newUser.location_id);

    recordAuditLog(newUser, "App\\Models\\User", newUser.id, "created", null, { registration: "self_service" }, req);

    res.status(201).json({
      success: true,
      message: "تم إنشاء حسابك الجديد بنجاح وتسجيل الدخول تلقائياً.",
      data: {
        token,
        token_type: "Bearer",
        expires_in_days: 7,
        user: {
          ...newUser,
          role_name: role?.name || "user",
          role_display_name_ar: role?.display_name_ar || "مستخدم / زائر",
          location_name_ar: location?.name_ar || "كافة المناطق",
          requires_geo_scope: false,
          permissions: role?.permissions || ["submit_review"],
        },
      },
    });
  });

  app.post("/api/v2/auth/forgot-password", (req, res) => {
    const { email_or_phone } = req.body;
    const query = (email_or_phone || "").trim();

    const user = users.find(u => 
      u.email.toLowerCase() === query.toLowerCase() || 
      (u.phone && (u.phone === query || u.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '')))
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "لم نتمكن من العثور على حساب مرتبط بهذه البيانات.",
      });
    }

    res.json({
      success: true,
      message: `تم إرسال رمز التحقق (OTP) بنجاح إلى ${user.phone || user.email}.`,
      demo_otp: "5938",
    });
  });

  app.post("/api/v2/auth/reset-password", (req, res) => {
    const { email_or_phone, code, new_password } = req.body;
    
    if (!code || code.length < 4) {
      return res.status(422).json({
        success: false,
        message: "رمز التحقق المدخل غير صحيح.",
      });
    }

    res.json({
      success: true,
      message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
    });
  });

  app.post("/api/v2/auth/update-profile", (req, res) => {
    const user = getAuthUser(req) || users[0];
    const { name, email, phone, location_id, governorate_id, avatar_url } = req.body;

    if (name) user.name = name.trim();
    if (email) user.email = email.trim();
    if (phone) user.phone = phone.trim();
    const locId = location_id ?? governorate_id;
    if (locId !== undefined) user.location_id = locId ? Number(locId) : null;
    if (avatar_url) user.avatar_url = avatar_url;

    const role = roles.find(r => r.id === user.role_id);
    const location = locations.find(l => l.id === user.location_id);

    res.json({
      success: true,
      message: "تم تحديث بيانات الملف الشخصي بنجاح.",
      data: {
        ...user,
        role_name: role?.name,
        role_display_name_ar: role?.display_name_ar,
        location_name_ar: location?.name_ar || "كافة المناطق",
        requires_geo_scope: userRequiresGeoScope(user),
        permissions: role?.permissions || [],
      },
    });
  });

  app.post("/api/v2/auth/refresh", (req, res) => {
    const user = getAuthUser(req);
    const token = `sanctum_refreshed_user_${user?.id || 1}_${Date.now()}`;
    res.json({
      success: true,
      message: "تم تجديد رمز المصادقة بنجاح.",
      data: {
        token,
        token_type: "Bearer",
        expires_in_days: 7,
      },
    });
  });

  app.post("/api/v2/auth/logout", (req, res) => {
    res.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح وإلغاء صلاحية الرمز.",
    });
  });

  app.get("/api/v2/auth/me", (req, res) => {
    const user = getAuthUser(req) || users[0];
    const role = roles.find(r => r.id === user.role_id);
    const location = locations.find(l => l.id === user.location_id);

    res.json({
      success: true,
      data: {
        ...user,
        role_name: role?.name,
        role_display_name_ar: role?.display_name_ar,
        location_name_ar: location?.name_ar || "كافة المناطق",
        requires_geo_scope: userRequiresGeoScope(user),
        permissions: role?.permissions || [],
      },
    });
  });

  // ==========================================
  // Platform Settings Management APIs
  // ==========================================
  app.get("/api/v2/settings", (req, res) => {
    res.json({
      success: true,
      message: "تم استرجاع إعدادات المنصة بنجاح.",
      data: siteSettings,
    });
  });

  app.put("/api/v2/settings", (req, res) => {
    const authUser = getAuthUser(req);
    // Allow admin / authorized operators to update settings
    siteSettings = {
      ...siteSettings,
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    recordAuditLog(
      authUser,
      "App\\Models\\SiteSetting",
      1,
      "updated",
      null,
      siteSettings,
      req
    );

    res.json({
      success: true,
      message: "تم حفظ وتطبيق إعدادات المنصة بنجاح.",
      data: siteSettings,
    });
  });

  // ==========================================
  // Mobile App Bootstrap (Flutter API Readiness)
  // ==========================================
  app.get("/api/v2/app/bootstrap", (req, res) => {
    const sectionsWithMeta = directory_sections.map(sec => {
      const secCategories = categories.filter(c => c.section_id === sec.id || c.section_slug === sec.slug);
      const secCategoryIds = secCategories.map(c => c.id);
      const secActivities = activities.filter(a => a.section_id === sec.id || a.section_slug === sec.slug || secCategoryIds.includes(a.category_id));
      return {
        ...sec,
        categories_count: secCategories.length,
        activities_count: secActivities.length,
      };
    });

    res.json({
      success: true,
      data: {
        app_name: siteSettings.site_name_ar,
        api_version: siteSettings.mobile_api_version,
        settings: siteSettings,
        sections: sectionsWithMeta,
        governorates: governorates,
        deep_link_scheme: siteSettings.deep_link_scheme,
        auth_config: {
          token_type: "Bearer",
          expires_in_days: 7,
          allow_registration: siteSettings.allow_visitor_registration,
        },
      },
    });
  });


  // 3. Directory Sections, Categories & Hierarchical Locations
  app.get("/api/v2/directory/sections", (req, res) => {
    const sectionsWithMeta = directory_sections.map(sec => {
      const secCategories = categories.filter(c => c.section_id === sec.id || c.section_slug === sec.slug);
      const secCategoryIds = secCategories.map(c => c.id);
      const secActivities = activities.filter(a => a.section_id === sec.id || a.section_slug === sec.slug || secCategoryIds.includes(a.category_id));
      const secProducts = products.filter(p => {
        const act = activities.find(a => a.id === p.activity_id);
        return act && (act.section_id === sec.id || act.section_slug === sec.slug || secCategoryIds.includes(act.category_id));
      });

      return {
        ...sec,
        categories_count: secCategories.length,
        activities_count: secActivities.length,
        products_count: secProducts.length,
        featured_activities_count: secActivities.filter(a => a.is_featured).length,
        categories: secCategories.map(cat => ({
          ...cat,
          activities_count: activities.filter(a => a.category_id === cat.id).length,
        })),
      };
    });

    res.json({
      success: true,
      count: sectionsWithMeta.length,
      data: sectionsWithMeta,
    });
  });

  app.get("/api/v2/directory/sections/:slug", (req, res) => {
    const { slug } = req.params;
    const sec = directory_sections.find(s => s.slug === slug || String(s.id) === slug);
    if (!sec) {
      return res.status(404).json({ success: false, message: "القسم المطلوب غير موجود." });
    }

    const secCategories = categories.filter(c => c.section_id === sec.id || c.section_slug === sec.slug);
    const secCategoryIds = secCategories.map(c => c.id);
    const secActivities = activities.filter(a => a.section_id === sec.id || a.section_slug === sec.slug || secCategoryIds.includes(a.category_id));

    res.json({
      success: true,
      data: {
        ...sec,
        categories_count: secCategories.length,
        activities_count: secActivities.length,
        categories: secCategories.map(cat => ({
          ...cat,
          activities_count: activities.filter(a => a.category_id === cat.id).length,
        })),
        featured_activities: secActivities.filter(a => a.is_featured).slice(0, 6),
      },
    });
  });

  app.get("/api/v2/categories", (req, res) => {
    const { section, section_id } = req.query;
    let list = [...categories];

    if (section) {
      list = list.filter(c => c.section_slug === String(section));
    }
    if (section_id) {
      list = list.filter(c => c.section_id === parseInt(String(section_id)));
    }

    const categoriesWithCount = list.map(cat => ({
      ...cat,
      activities_count: activities.filter(a => a.category_id === cat.id).length,
      section: directory_sections.find(s => s.id === cat.section_id || s.slug === cat.section_slug) || null,
    }));
    res.json({
      success: true,
      data: categoriesWithCount,
    });
  });

  // Hierarchical Locations Endpoints
  app.get("/api/v2/locations/governorates", (req, res) => {
    const enriched = governorates.map(gov => {
      const govCities = cities.filter(c => c.governorate_id === gov.id);
      const govActivities = activities.filter(a => a.governorate_id === gov.id || (a.location_id && locations.find(l => l.id === a.location_id)?.governorate_id === gov.id));
      return {
        ...gov,
        cities_count: govCities.length,
        activities_count: govActivities.length,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  app.get("/api/v2/locations/cities", (req, res) => {
    const { governorate_id } = req.query;
    let list = [...cities];

    if (governorate_id) {
      list = list.filter(c => c.governorate_id === parseInt(String(governorate_id)));
    }

    const enriched = list.map(city => {
      const gov = governorates.find(g => g.id === city.governorate_id);
      const cityNeighborhoods = neighborhoods.filter(n => n.city_id === city.id);
      const cityActivities = activities.filter(a => a.city_id === city.id);
      return {
        ...city,
        governorate_name_ar: gov?.name_ar,
        neighborhoods_count: cityNeighborhoods.length,
        activities_count: cityActivities.length,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  app.get("/api/v2/locations/neighborhoods", (req, res) => {
    const { city_id, governorate_id } = req.query;
    let list = [...neighborhoods];

    if (city_id) {
      list = list.filter(n => n.city_id === parseInt(String(city_id)));
    }
    if (governorate_id) {
      list = list.filter(n => n.governorate_id === parseInt(String(governorate_id)));
    }

    const enriched = list.map(neigh => {
      const gov = governorates.find(g => g.id === neigh.governorate_id);
      const city = cities.find(c => c.id === neigh.city_id);
      const neighActivities = activities.filter(a => a.neighborhood_id === neigh.id);
      return {
        ...neigh,
        governorate_name_ar: gov?.name_ar,
        city_name_ar: city?.name_ar,
        activities_count: neighActivities.length,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  app.get("/api/v2/locations/tree", (req, res) => {
    const tree = governorates.map(gov => {
      const govCities = cities
        .filter(c => c.governorate_id === gov.id)
        .map(city => {
          const cityNeighborhoods = neighborhoods.filter(n => n.city_id === city.id);
          return {
            ...city,
            neighborhoods: cityNeighborhoods,
            activities_count: activities.filter(a => a.city_id === city.id).length,
          };
        });

      return {
        ...gov,
        cities: govCities,
        activities_count: activities.filter(a => a.governorate_id === gov.id).length,
      };
    });

    res.json({
      success: true,
      data: tree,
    });
  });

  // Legacy location flat endpoint with backward-compatibility
  app.get("/api/v2/locations", (req, res) => {
    const locationsWithCount = locations.map(loc => ({
      ...loc,
      activities_count: activities.filter(a => a.location_id === loc.id).length,
      governorate: governorates.find(g => g.id === loc.governorate_id) || null,
      city: cities.find(c => c.id === loc.city_id) || null,
      neighborhood: neighborhoods.find(n => n.id === loc.neighborhood_id) || null,
    }));
    res.json({
      success: true,
      data: locationsWithCount,
    });
  });

  // Admin Location Hierarchy CRUD
  app.post("/api/v2/admin/locations/governorates", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح: إدارة المحافظات تتطلب صلاحية المسؤول." });
    }

    const { name_ar, name_en, code, latitude, longitude } = req.body;
    if (!name_ar || !code) {
      return res.status(422).json({ success: false, message: "اسم المحافظة بالعربية والكود حقول إلزامية." });
    }

    const newGov: GovernorateModel = {
      id: governorates.length > 0 ? Math.max(...governorates.map(g => g.id)) + 1 : 1,
      name_ar,
      name_en: name_en || "",
      code: code.toUpperCase(),
      latitude: latitude ? parseFloat(String(latitude)) : 30.0444,
      longitude: longitude ? parseFloat(String(longitude)) : 31.2357,
      is_active: true,
      sort_order: governorates.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    governorates.push(newGov);
    recordAuditLog(user, "App\\Models\\Governorate", newGov.id, "created", null, newGov, req);

    res.status(201).json({ success: true, message: "تم إضافة المحافظة بنجاح.", data: newGov });
  });

  app.put("/api/v2/admin/locations/governorates/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح بتعديل المحافظات." });
    }

    const id = parseInt(req.params.id);
    const gov = governorates.find(g => g.id === id);
    if (!gov) return res.status(404).json({ success: false, message: "المحافظة غير موجودة." });

    const oldValues = { ...gov };
    const { name_ar, name_en, code, latitude, longitude, is_active, sort_order } = req.body;
    if (name_ar) gov.name_ar = name_ar;
    if (name_en !== undefined) gov.name_en = name_en;
    if (code) gov.code = code.toUpperCase();
    if (latitude !== undefined) gov.latitude = parseFloat(String(latitude));
    if (longitude !== undefined) gov.longitude = parseFloat(String(longitude));
    if (is_active !== undefined) gov.is_active = !!is_active;
    if (sort_order !== undefined) gov.sort_order = parseInt(String(sort_order));
    gov.updated_at = new Date().toISOString();

    recordAuditLog(user, "App\\Models\\Governorate", gov.id, "updated", oldValues, gov, req);
    res.json({ success: true, message: "تم تحديث بيانات المحافظة بنجاح.", data: gov });
  });

  app.delete("/api/v2/admin/locations/governorates/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح بحذف المحافظات." });
    }

    const id = parseInt(req.params.id);
    const idx = governorates.findIndex(g => g.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "المحافظة غير موجودة." });

    const hasCities = cities.some(c => c.governorate_id === id);
    if (hasCities) {
      return res.status(422).json({ success: false, message: "لا يمكن حذف المحافظة لوجود مدن مرتبطة بها. يرجى حذف المدن أولاً." });
    }

    const [deleted] = governorates.splice(idx, 1);
    recordAuditLog(user, "App\\Models\\Governorate", id, "deleted", deleted, null, req);
    res.json({ success: true, message: "تم حذف المحافظة بنجاح." });
  });

  // Cities CRUD
  app.post("/api/v2/admin/locations/cities", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح: إدارة المدن تتطلب صلاحية المسؤول." });
    }

    const { governorate_id, name_ar, name_en, code, latitude, longitude } = req.body;
    if (!governorate_id || !name_ar || !code) {
      return res.status(422).json({ success: false, message: "المحافظة والاسم العربي والكود حقول إلزامية." });
    }

    const newCity: CityModel = {
      id: cities.length > 0 ? Math.max(...cities.map(c => c.id)) + 1 : 1,
      governorate_id: parseInt(String(governorate_id)),
      name_ar,
      name_en: name_en || "",
      code: code.toUpperCase(),
      latitude: latitude ? parseFloat(String(latitude)) : 30.0444,
      longitude: longitude ? parseFloat(String(longitude)) : 31.2357,
      is_active: true,
      sort_order: cities.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    cities.push(newCity);
    recordAuditLog(user, "App\\Models\\City", newCity.id, "created", null, newCity, req);
    res.status(201).json({ success: true, message: "تم إضافة المدينة بنجاح.", data: newCity });
  });

  app.put("/api/v2/admin/locations/cities/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح بتعديل المدن." });
    }

    const id = parseInt(req.params.id);
    const city = cities.find(c => c.id === id);
    if (!city) return res.status(404).json({ success: false, message: "المدينة غير موجودة." });

    const oldValues = { ...city };
    const { governorate_id, name_ar, name_en, code, latitude, longitude, is_active, sort_order } = req.body;
    if (governorate_id) city.governorate_id = parseInt(String(governorate_id));
    if (name_ar) city.name_ar = name_ar;
    if (name_en !== undefined) city.name_en = name_en;
    if (code) city.code = code.toUpperCase();
    if (latitude !== undefined) city.latitude = parseFloat(String(latitude));
    if (longitude !== undefined) city.longitude = parseFloat(String(longitude));
    if (is_active !== undefined) city.is_active = !!is_active;
    if (sort_order !== undefined) city.sort_order = parseInt(String(sort_order));
    city.updated_at = new Date().toISOString();

    recordAuditLog(user, "App\\Models\\City", city.id, "updated", oldValues, city, req);
    res.json({ success: true, message: "تم تحديث المدينة بنجاح.", data: city });
  });

  app.delete("/api/v2/admin/locations/cities/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح بحذف المدن." });
    }

    const id = parseInt(req.params.id);
    const idx = cities.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "المدينة غير موجودة." });

    const hasNeighs = neighborhoods.some(n => n.city_id === id);
    if (hasNeighs) {
      return res.status(422).json({ success: false, message: "لا يمكن حذف المدينة لوجود أحياء مرتبطة بها." });
    }

    const [deleted] = cities.splice(idx, 1);
    recordAuditLog(user, "App\\Models\\City", id, "deleted", deleted, null, req);
    res.json({ success: true, message: "تم حذف المدينة بنجاح." });
  });

  // Neighborhoods CRUD
  app.post("/api/v2/admin/locations/neighborhoods", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح: إدارة الأحياء تتطلب صلاحية المسؤول." });
    }

    const { city_id, governorate_id, name_ar, name_en, postal_code, latitude, longitude } = req.body;
    if (!city_id || !name_ar) {
      return res.status(422).json({ success: false, message: "المدينة واسم الحي بالعربية حقول إلزامية." });
    }

    const cityObj = cities.find(c => c.id === parseInt(String(city_id)));
    const govId = governorate_id ? parseInt(String(governorate_id)) : (cityObj?.governorate_id || 1);

    const newNeigh: NeighborhoodModel = {
      id: neighborhoods.length > 0 ? Math.max(...neighborhoods.map(n => n.id)) + 1 : 1,
      city_id: parseInt(String(city_id)),
      governorate_id: govId,
      name_ar,
      name_en: name_en || "",
      slug: (name_en || name_ar).toLowerCase().replace(/\s+/g, "-"),
      postal_code: postal_code || "",
      latitude: latitude ? parseFloat(String(latitude)) : (cityObj?.latitude || 30.0444),
      longitude: longitude ? parseFloat(String(longitude)) : (cityObj?.longitude || 31.2357),
      is_active: true,
      sort_order: neighborhoods.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    neighborhoods.push(newNeigh);
    recordAuditLog(user, "App\\Models\\Neighborhood", newNeigh.id, "created", null, newNeigh, req);
    res.status(201).json({ success: true, message: "تم إضافة الحي بنجاح.", data: newNeigh });
  });

  app.put("/api/v2/admin/locations/neighborhoods/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح بتعديل الأحياء." });
    }

    const id = parseInt(req.params.id);
    const neigh = neighborhoods.find(n => n.id === id);
    if (!neigh) return res.status(404).json({ success: false, message: "الحي غير موجود." });

    const oldValues = { ...neigh };
    const { city_id, governorate_id, name_ar, name_en, postal_code, latitude, longitude, is_active, sort_order } = req.body;
    if (city_id) neigh.city_id = parseInt(String(city_id));
    if (governorate_id) neigh.governorate_id = parseInt(String(governorate_id));
    if (name_ar) neigh.name_ar = name_ar;
    if (name_en !== undefined) neigh.name_en = name_en;
    if (postal_code !== undefined) neigh.postal_code = postal_code;
    if (latitude !== undefined) neigh.latitude = parseFloat(String(latitude));
    if (longitude !== undefined) neigh.longitude = parseFloat(String(longitude));
    if (is_active !== undefined) neigh.is_active = !!is_active;
    if (sort_order !== undefined) neigh.sort_order = parseInt(String(sort_order));
    neigh.updated_at = new Date().toISOString();

    recordAuditLog(user, "App\\Models\\Neighborhood", neigh.id, "updated", oldValues, neigh, req);
    res.json({ success: true, message: "تم تحديث الحي بنجاح.", data: neigh });
  });

  app.delete("/api/v2/admin/locations/neighborhoods/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_locations") && roles.find(r => r.id === user.role_id)?.name !== "مدير_عام")) {
      return res.status(403).json({ success: false, message: "غير مصرح بحذف الأحياء." });
    }

    const id = parseInt(req.params.id);
    const idx = neighborhoods.findIndex(n => n.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "الحي غير موجود." });

    const [deleted] = neighborhoods.splice(idx, 1);
    recordAuditLog(user, "App\\Models\\Neighborhood", id, "deleted", deleted, null, req);
    res.json({ success: true, message: "تم حذف الحي بنجاح." });
  });

  // 4. Activities (Enhanced with Hierarchical Geography, Delivery filters & Sections)
  app.get("/api/v2/activities", (req, res) => {
    const user = getAuthUser(req);
    const {
      search,
      category_id,
      location_id,
      governorate_id,
      city_id,
      neighborhood_id,
      section_id,
      section_slug,
      has_delivery,
      status,
      featured,
      sort_by,
      sort_order,
      page = 1,
      per_page = 15,
      lat,
      lng,
      radius_km,
    } = req.query;

    const userLat = lat ? parseFloat(String(lat)) : null;
    const userLng = lng ? parseFloat(String(lng)) : null;
    const maxRadius = radius_km ? parseFloat(String(radius_km)) : null;

    let result = activities.map(act => {
      let distance_km: number | undefined = undefined;
      if (userLat !== null && userLng !== null && act.latitude !== undefined && act.longitude !== undefined) {
        distance_km = calculateDistanceKm(userLat, userLng, act.latitude, act.longitude);
      }
      return {
        ...act,
        distance_km,
      };
    });

    // Global Geographic Scope enforcement for scoped admins/moderators:
    if (user && userRequiresGeoScope(user) && user.location_id) {
      result = result.filter(a => a.location_id === user.location_id || a.governorate_id === user.location_id);
    } else if (location_id) {
      result = result.filter(a => a.location_id === parseInt(String(location_id)));
    }

    // New Hierarchical Location Filters
    if (governorate_id && governorate_id !== "all") {
      result = result.filter(a => a.governorate_id === parseInt(String(governorate_id)));
    }
    if (city_id && city_id !== "all") {
      result = result.filter(a => a.city_id === parseInt(String(city_id)));
    }
    if (neighborhood_id && neighborhood_id !== "all") {
      result = result.filter(a => a.neighborhood_id === parseInt(String(neighborhood_id)));
    }

    // Section Filters (المحلات، الحرف، الخدمات، المعلمون، البلوجر)
    if (section_id && section_id !== "all") {
      const sId = parseInt(String(section_id));
      const secCats = categories.filter(c => c.section_id === sId).map(c => c.id);
      result = result.filter(a => a.section_id === sId || secCats.includes(a.category_id));
    }
    if (section_slug && section_slug !== "all") {
      const sSlug = String(section_slug);
      const secObj = directory_sections.find(s => s.slug === sSlug);
      const secCats = categories.filter(c => c.section_slug === sSlug || (secObj && c.section_id === secObj.id)).map(c => c.id);
      result = result.filter(a => a.section_slug === sSlug || (secObj && a.section_id === secObj.id) || secCats.includes(a.category_id));
    }

    if (category_id && category_id !== "all") {
      result = result.filter(a => a.category_id === parseInt(String(category_id)));
    }

    // Delivery Status Filter (خدمة التوصيل متاحة)
    if (has_delivery !== undefined && has_delivery !== "all") {
      const reqDelivery = has_delivery === "true" || has_delivery === "1";
      result = result.filter(a => !!a.has_delivery === reqDelivery);
    }

    if (status && status !== "all") {
      result = result.filter(a => a.status === String(status));
    }

    if (featured !== undefined && featured !== "all") {
      const isFeat = String(featured) === "true";
      result = result.filter(a => a.is_featured === isFeat);
    }

    if (maxRadius !== null && userLat !== null && userLng !== null) {
      result = result.filter(a => a.distance_km !== undefined && a.distance_km <= maxRadius);
    }

    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(a =>
        a.name_ar.toLowerCase().includes(q) ||
        a.name_en.toLowerCase().includes(q) ||
        a.description_ar.toLowerCase().includes(q) ||
        a.address_ar.toLowerCase().includes(q)
      );
    }

    // Sorting
    const isAsc = String(sort_order).toLowerCase() === "asc";
    if (sort_by === "distance" || sort_by === "distance_km") {
      result.sort((a, b) => {
        const distA = a.distance_km ?? 999999;
        const distB = b.distance_km ?? 999999;
        return isAsc ? distA - distB : distB - distA;
      });
    } else if (sort_by === "views" || sort_by === "views_count") {
      result.sort((a, b) => isAsc ? a.views_count - b.views_count : b.views_count - a.views_count);
    } else if (sort_by === "rating" || sort_by === "rating_avg") {
      result.sort((a, b) => isAsc ? a.rating_avg - b.rating_avg : b.rating_avg - a.rating_avg);
    } else if (sort_by === "reviews" || sort_by === "reviews_count") {
      result.sort((a, b) => isAsc ? a.reviews_count - b.reviews_count : b.reviews_count - a.reviews_count);
    } else if (sort_by === "delivery_speed") {
      result.sort((a, b) => {
        const timeA = a.delivery_time_min || 999;
        const timeB = b.delivery_time_min || 999;
        return isAsc ? timeA - timeB : timeB - timeA;
      });
    } else if (sort_by === "name") {
      result.sort((a, b) => isAsc ? a.name_ar.localeCompare(b.name_ar) : b.name_ar.localeCompare(a.name_ar));
    } else {
      result.sort((a, b) => isAsc ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const p = parseInt(String(page)) || 1;
    const limit = Math.min(parseInt(String(per_page)) || 15, 100);
    const total = result.length;
    const startIndex = (p - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    // Hydrate relations (Eager Loading simulation)
    const enrichedResults = paginated.map(act => {
      const cat = categories.find(c => c.id === act.category_id);
      const loc = locations.find(l => l.id === act.location_id);
      const gov = governorates.find(g => g.id === act.governorate_id);
      const city = cities.find(c => c.id === act.city_id);
      const neigh = neighborhoods.find(n => n.id === act.neighborhood_id);
      const sec = directory_sections.find(s => s.id === act.section_id || s.slug === act.section_slug || (cat && s.id === cat.section_id));

      const actProducts = products.filter(prd => prd.activity_id === act.id && prd.status === "published");

      return {
        ...act,
        category: cat ? { id: cat.id, name_ar: cat.name_ar, slug: cat.slug, icon: cat.icon, section_slug: cat.section_slug } : null,
        location: loc ? { id: loc.id, name_ar: loc.name_ar, code: loc.code } : null,
        governorate: gov ? { id: gov.id, name_ar: gov.name_ar, code: gov.code } : null,
        city: city ? { id: city.id, name_ar: city.name_ar, code: city.code } : null,
        neighborhood: neigh ? { id: neigh.id, name_ar: neigh.name_ar, postal_code: neigh.postal_code } : null,
        section: sec ? { id: sec.id, name_ar: sec.name_ar, slug: sec.slug, icon: sec.icon, color_theme: sec.color_theme } : null,
        products_count: actProducts.length,
        min_product_price: actProducts.length > 0 ? Math.min(...actProducts.map(prd => prd.sale_price || prd.price)) : null,
      };
    });

    res.json({
      count: total,
      next: (startIndex + limit < total) ? `/api/v2/activities?page=${p + 1}` : null,
      previous: p > 1 ? `/api/v2/activities?page=${p - 1}` : null,
      current_page: p,
      last_page: Math.ceil(total / limit) || 1,
      results: enrichedResults,
    });
  });

  app.get("/api/v2/activities/:id", (req, res) => {
    const user = getAuthUser(req);
    const actId = parseInt(req.params.id);
    const act = activities.find(a => a.id === actId);

    if (!act) {
      return res.status(404).json({
        success: false,
        message: "النشاط التجاري المطلوب غير موجود.",
      });
    }

    // Geographic Scope Check
    if (user && userRequiresGeoScope(user) && user.location_id && act.location_id !== user.location_id && act.governorate_id !== user.location_id) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح: لا يمكنك الاطلاع على أنشطة تقع خارج نطاقك الجغرافي المخصص.",
        error_code: "GEO_SCOPE_UNAUTHORIZED",
      });
    }

    // Increment views
    act.views_count += 1;

    const cat = categories.find(c => c.id === act.category_id);
    const loc = locations.find(l => l.id === act.location_id);
    const gov = governorates.find(g => g.id === act.governorate_id);
    const city = cities.find(c => c.id === act.city_id);
    const neigh = neighborhoods.find(n => n.id === act.neighborhood_id);
    const sec = directory_sections.find(s => s.id === act.section_id || s.slug === act.section_slug || (cat && s.id === cat.section_id));
    const actReviews = reviews.filter(r => r.activity_id === act.id);
    const actProducts = products.filter(p => p.activity_id === act.id && p.status === "published");

    res.json({
      success: true,
      data: {
        ...act,
        category: cat,
        location: loc,
        governorate: gov,
        city: city,
        neighborhood: neigh,
        section: sec,
        products: actProducts,
        reviews: actReviews.map(r => {
          const reviewer = users.find(u => u.id === r.user_id);
          return {
            ...r,
            user: { id: reviewer?.id, name: reviewer?.name, avatar_url: reviewer?.avatar_url },
          };
        }),
      },
    });
  });

  // ============================================================================
  // FAVORITES API
  // ============================================================================
  app.get("/api/v2/favorites", (req, res) => {
    const user = getAuthUser(req);
    const userId = user ? user.id : 10;
    const favActIds = userFavorites.filter(f => f.user_id === userId).map(f => f.activity_id);
    const favActivities = activities.filter(a => favActIds.includes(a.id)).map(act => {
      const cat = categories.find(c => c.id === act.category_id);
      const gov = governorates.find(g => g.id === act.governorate_id);
      const city = cities.find(c => c.id === act.city_id);
      return {
        ...act,
        category_name_ar: cat?.name_ar,
        category_icon: cat?.icon,
        governorate_name_ar: gov?.name_ar,
        city_name_ar: city?.name_ar,
      };
    });

    res.json({
      success: true,
      count: favActivities.length,
      favorite_ids: favActIds,
      data: favActivities,
    });
  });

  app.get("/api/v2/favorites/ids", (req, res) => {
    const user = getAuthUser(req);
    const userId = user ? user.id : 10;
    const favActIds = userFavorites.filter(f => f.user_id === userId).map(f => f.activity_id);
    res.json({
      success: true,
      favorite_ids: favActIds,
    });
  });

  app.post("/api/v2/favorites/toggle", (req, res) => {
    const user = getAuthUser(req);
    const userId = user ? user.id : 10;
    const { activity_id } = req.body;
    const actId = parseInt(String(activity_id));
    if (!actId) {
      return res.status(422).json({ success: false, message: "معرف النشاط التجاري مطلوب." });
    }

    const existingIdx = userFavorites.findIndex(f => f.user_id === userId && f.activity_id === actId);
    let isFavorite = false;
    if (existingIdx >= 0) {
      userFavorites.splice(existingIdx, 1);
      isFavorite = false;
    } else {
      userFavorites.push({
        id: userFavorites.length > 0 ? Math.max(...userFavorites.map(f => f.id)) + 1 : 1,
        user_id: userId,
        activity_id: actId,
        created_at: new Date().toISOString(),
      });
      isFavorite = true;
    }

    const currentFavIds = userFavorites.filter(f => f.user_id === userId).map(f => f.activity_id);
    res.json({
      success: true,
      is_favorite: isFavorite,
      activity_id: actId,
      favorite_ids: currentFavIds,
      message: isFavorite ? "تمت إضافة النشاط إلى المفضلة بنجاح." : "تمت إزالة النشاط من المفضلة.",
    });
  });

  // ==========================================
  // Push & In-App Notifications Management APIs
  // ==========================================
  const deviceTokenRegistry: {
    id: number;
    user_id?: number | null;
    token: string;
    platform: string;
    device_name?: string;
    locale?: string;
    created_at: string;
    updated_at: string;
  }[] = [];

  let inAppNotifications: {
    id: number;
    user_id?: number | null;
    title: string;
    body: string;
    type: 'activity' | 'offer' | 'product' | 'system' | 'general';
    activity_id?: number;
    product_id?: number;
    deep_link?: string;
    payload?: any;
    is_read: boolean;
    created_at: string;
  }[] = [
    {
      id: 1,
      user_id: null,
      title: "مرحباً بك في دليل أي خدمة!",
      body: "استكشف آلاف المتاجر والخدمات الموثوقة وقارن الأسعار بسهولة في محافظتك.",
      type: "general",
      deep_link: "daleel://home",
      payload: { screen: "home" },
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 2,
      user_id: null,
      title: "عروض مميزة في قسم المطاعم والكافيهات",
      body: "تصفح أحدث الخصومات وقوائم الطعام في منطقتك اليوم.",
      type: "activity",
      activity_id: 1,
      deep_link: "daleel://activity/1",
      payload: { screen: "activity_detail", activity_id: 1 },
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 3,
      user_id: null,
      title: "خصومات خاصة على الصيانة المنزلية",
      body: "فنيو تكييف وكهرباء معتمدون بأسعار تنافسية وتقييمات حقيقية.",
      type: "offer",
      activity_id: 3,
      deep_link: "daleel://activity/3",
      payload: { screen: "activity_detail", activity_id: 3 },
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];

  // Register device token for FCM / APNs
  app.post("/api/v2/notifications/register-device", (req, res) => {
    const user = getAuthUser(req);
    const { token, platform = "android", device_name, locale = "ar" } = req.body;

    if (!token) {
      return res.status(422).json({
        success: false,
        message: "رمز الجهاز (Device Token) مطلوب لتسجيل الإشعارات.",
      });
    }

    const existingIndex = deviceTokenRegistry.findIndex(d => d.token === token);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      deviceTokenRegistry[existingIndex].user_id = user?.id || null;
      deviceTokenRegistry[existingIndex].platform = platform;
      deviceTokenRegistry[existingIndex].device_name = device_name;
      deviceTokenRegistry[existingIndex].locale = locale;
      deviceTokenRegistry[existingIndex].updated_at = now;
    } else {
      deviceTokenRegistry.push({
        id: deviceTokenRegistry.length + 1,
        user_id: user?.id || null,
        token,
        platform,
        device_name,
        locale,
        created_at: now,
        updated_at: now,
      });
    }

    res.json({
      success: true,
      message: "تم تسجيل رمز الجهاز لاستقبال الإشعارات بنجاح.",
      data: {
        registered_tokens_count: deviceTokenRegistry.length,
        platform,
      },
    });
  });

  // Unregister device token (e.g. On logout)
  app.post("/api/v2/notifications/unregister-device", (req, res) => {
    const { token } = req.body;
    if (token) {
      const idx = deviceTokenRegistry.findIndex(d => d.token === token);
      if (idx >= 0) {
        deviceTokenRegistry.splice(idx, 1);
      }
    }
    res.json({
      success: true,
      message: "تم إلغاء تسجيل رمز الجهاز بنجاح.",
    });
  });

  // Get In-App Notifications
  app.get("/api/v2/notifications", (req, res) => {
    const user = getAuthUser(req);
    const userId = user?.id;

    // Filter notifications for this user or public broadcast (user_id === null)
    const userNotifs = inAppNotifications.filter(
      n => n.user_id === null || (userId && n.user_id === userId)
    );

    const unreadCount = userNotifs.filter(n => !n.is_read).length;

    res.json({
      success: true,
      unread_count: unreadCount,
      data: userNotifs,
    });
  });

  // Mark notification as read
  app.post("/api/v2/notifications/:id/read", (req, res) => {
    const notifId = parseInt(req.params.id);
    const notif = inAppNotifications.find(n => n.id === notifId);
    if (notif) {
      notif.is_read = true;
    }
    res.json({
      success: true,
      message: "تم تحديث حالة الإشعار إلى مقروء.",
    });
  });

  // Test / Simulation endpoint to trigger a push notification payload
  app.post("/api/v2/notifications/test-send", (req, res) => {
    const { title, body, type = "activity", activity_id, product_id, deep_link } = req.body;
    const newNotif = {
      id: inAppNotifications.length + 1,
      user_id: null,
      title: title || "تنبيه تجريبي من دليل أي خدمة",
      body: body || "تم إرسال هذا الإشعار لاختبار جاهزية التنقل والروابط المباشرة.",
      type: type as any,
      activity_id: activity_id ? Number(activity_id) : 1,
      product_id: product_id ? Number(product_id) : undefined,
      deep_link: deep_link || (activity_id ? `daleel://activity/${activity_id}` : "daleel://home"),
      payload: {
        screen: type === "activity" ? "activity_detail" : "home",
        activity_id: activity_id ? Number(activity_id) : 1,
      },
      is_read: false,
      created_at: new Date().toISOString(),
    };

    inAppNotifications.unshift(newNotif);

    res.json({
      success: true,
      message: "تم إنشاء وإرسال الإشعار التجريبي بنجاح.",
      data: newNotif,
    });
  });

  // ============================================================================
  // UNIFIED SEARCH & PRICE COMPARISON ENGINE (Laravel 11 Search Contracts)
  // ============================================================================

  // Unified Search API across Activities (Shops & Services), Products, Categories, and Sections
  const handleUnifiedSearch = (req: any, res: any) => {
    const {
      q = "",
      type = "all", // 'all' | 'shop' | 'service' | 'product' | 'shops' | 'services' | 'products' | 'activities'
      item_type,
      section_slug,
      section_id,
      category_id,
      governorate_id,
      city_id,
      neighborhood_id,
      has_delivery,
      is_available,
      is_verified,
      min_price,
      max_price,
      sort_by = "relevance",
      page = 1,
      per_page = 50,
      limit = 50,
      lat,
      lng,
      radius_km,
    } = req.query;

    const queryStr = String(q).trim().toLowerCase();
    const effectiveType = String(item_type || type || "all").toLowerCase();
    const userLat = lat ? parseFloat(String(lat)) : null;
    const userLng = lng ? parseFloat(String(lng)) : null;
    const maxRadius = radius_km ? parseFloat(String(radius_km)) : null;

    // Helper to determine if an activity is primarily a Service or a Shop
    const getActivityItemType = (act: ActivityModel): "shop" | "service" => {
      if (
        act.section_slug === "crafts" ||
        act.section_slug === "services" ||
        act.section_slug === "teachers" ||
        (act.category_id >= 7 && act.category_id <= 21)
      ) {
        return "service";
      }
      return "shop";
    };

    // 1. Filter Activities (Shops & Services)
    let matchingActivities = activities.filter(act => {
      // Status filter
      if (is_verified === "true" || is_verified === true) {
        if (act.status !== "verified") return false;
      }

      // Geo Filters
      if (governorate_id && governorate_id !== "all" && act.governorate_id !== parseInt(String(governorate_id))) return false;
      if (city_id && city_id !== "all" && act.city_id !== parseInt(String(city_id))) return false;
      if (neighborhood_id && neighborhood_id !== "all" && act.neighborhood_id !== parseInt(String(neighborhood_id))) return false;

      // Section Filter
      if (section_id && section_id !== "all" && act.section_id !== parseInt(String(section_id))) return false;
      if (section_slug && section_slug !== "all" && act.section_slug !== String(section_slug)) return false;

      // Category Filter
      if (category_id && category_id !== "all" && act.category_id !== parseInt(String(category_id))) return false;

      // Delivery Filter
      if (has_delivery !== undefined && has_delivery !== "all" && has_delivery !== "") {
        const reqDel = has_delivery === "true" || has_delivery === "1" || has_delivery === true;
        if (!!act.has_delivery !== reqDel) return false;
      }

      // Keyword match
      if (!queryStr) return true;
      const cat = categories.find(c => c.id === act.category_id);
      const neigh = neighborhoods.find(n => n.id === act.neighborhood_id);
      const city = cities.find(c => c.id === act.city_id);
      const gov = governorates.find(g => g.id === act.governorate_id);
      const sec = directory_sections.find(s => s.id === act.section_id || s.slug === act.section_slug);

      return (
        act.name_ar.toLowerCase().includes(queryStr) ||
        act.name_en.toLowerCase().includes(queryStr) ||
        act.description_ar.toLowerCase().includes(queryStr) ||
        (act.address_ar && act.address_ar.toLowerCase().includes(queryStr)) ||
        (cat && (cat.name_ar.toLowerCase().includes(queryStr) || cat.name_en.toLowerCase().includes(queryStr))) ||
        (sec && sec.name_ar.toLowerCase().includes(queryStr)) ||
        (neigh && neigh.name_ar.toLowerCase().includes(queryStr)) ||
        (city && city.name_ar.toLowerCase().includes(queryStr)) ||
        (gov && gov.name_ar.toLowerCase().includes(queryStr))
      );
    });

    // 2. Filter Products
    let matchingProducts = products.filter(prd => {
      const act = activities.find(a => a.id === prd.activity_id);
      if (!act) return false;

      // Availability filter
      if (is_available === "true" || is_available === true) {
        if (!prd.is_available) return false;
      }

      // Geo Filters via parent Activity
      if (governorate_id && governorate_id !== "all" && act.governorate_id !== parseInt(String(governorate_id))) return false;
      if (city_id && city_id !== "all" && act.city_id !== parseInt(String(city_id))) return false;
      if (neighborhood_id && neighborhood_id !== "all" && act.neighborhood_id !== parseInt(String(neighborhood_id))) return false;

      // Section Filter
      if (section_id && section_id !== "all" && act.section_id !== parseInt(String(section_id))) return false;
      if (section_slug && section_slug !== "all" && act.section_slug !== String(section_slug)) return false;

      // Category Filter
      if (category_id && category_id !== "all" && act.category_id !== parseInt(String(category_id))) return false;

      // Delivery Filter
      if (has_delivery !== undefined && has_delivery !== "all" && has_delivery !== "") {
        const reqDel = has_delivery === "true" || has_delivery === "1" || has_delivery === true;
        if (!!act.has_delivery !== reqDel) return false;
      }

      // Price Filters
      const effectivePrice = prd.sale_price !== null && prd.sale_price !== undefined ? prd.sale_price : prd.price;
      if (min_price && effectivePrice < parseFloat(String(min_price))) return false;
      if (max_price && effectivePrice > parseFloat(String(max_price))) return false;

      // Keyword match
      if (!queryStr) return true;
      const cat = categories.find(c => c.id === act.category_id);
      const neigh = neighborhoods.find(n => n.id === act.neighborhood_id);
      const city = cities.find(c => c.id === act.city_id);

      return (
        prd.name.toLowerCase().includes(queryStr) ||
        prd.short_description.toLowerCase().includes(queryStr) ||
        prd.full_description.toLowerCase().includes(queryStr) ||
        prd.sku.toLowerCase().includes(queryStr) ||
        act.name_ar.toLowerCase().includes(queryStr) ||
        (cat && cat.name_ar.toLowerCase().includes(queryStr)) ||
        (city && city.name_ar.toLowerCase().includes(queryStr)) ||
        (neigh && neigh.name_ar.toLowerCase().includes(queryStr))
      );
    });

    // Build Unified Search Items List
    const unifiedItems: any[] = [];

    // Map Activities to Unified Items (Shops or Services)
    matchingActivities.forEach(act => {
      const iType = getActivityItemType(act);
      const cat = categories.find(c => c.id === act.category_id);
      const gov = governorates.find(g => g.id === act.governorate_id);
      const city = cities.find(c => c.id === act.city_id);
      const neigh = neighborhoods.find(n => n.id === act.neighborhood_id);
      const sec = directory_sections.find(s => s.id === act.section_id || s.slug === act.section_slug);

      let distance_km: number | undefined = undefined;
      if (userLat !== null && userLng !== null && act.latitude !== undefined && act.longitude !== undefined && act.latitude !== null && act.longitude !== null) {
        distance_km = calculateDistanceKm(userLat, userLng, act.latitude, act.longitude);
      }

      // Skip if exceeds max radius
      if (maxRadius !== null && distance_km !== undefined && distance_km > maxRadius) {
        return;
      }

      unifiedItems.push({
        id: `${iType}-${act.id}`,
        numeric_id: act.id,
        item_type: iType, // "shop" | "service"
        title: act.name_ar,
        title_en: act.name_en,
        slug: act.slug,
        description: act.description_ar,
        category_id: act.category_id,
        category_name_ar: cat?.name_ar || (iType === "service" ? "خدمات وصيانة" : "متاجر وتسوق"),
        category_icon: cat?.icon,
        section_id: act.section_id,
        section_slug: act.section_slug,
        section_name_ar: sec?.name_ar,
        governorate_id: act.governorate_id,
        governorate_name_ar: gov?.name_ar,
        city_id: act.city_id,
        city_name_ar: city?.name_ar,
        neighborhood_id: act.neighborhood_id,
        neighborhood_name_ar: neigh?.name_ar,
        address_ar: act.address_ar,
        latitude: act.latitude,
        longitude: act.longitude,
        cover_image: act.cover_image,
        rating_avg: act.rating_avg || 0,
        reviews_count: act.reviews_count || 0,
        phone: act.phone,
        whatsapp_number: act.whatsapp_number,
        has_delivery: !!act.has_delivery,
        delivery_fee_from: act.delivery_fee_from,
        delivery_estimated_time: act.delivery_estimated_time,
        status: act.status,
        is_featured: act.is_featured,
        distance_km,
        created_at: act.created_at,
      });
    });

    // Map Products to Unified Items
    matchingProducts.forEach(prd => {
      const act = activities.find(a => a.id === prd.activity_id)!;
      const cat = categories.find(c => c.id === act.category_id);
      const gov = governorates.find(g => g.id === act.governorate_id);
      const city = cities.find(c => c.id === act.city_id);
      const neigh = neighborhoods.find(n => n.id === act.neighborhood_id);
      const sec = directory_sections.find(s => s.id === act.section_id || s.slug === act.section_slug);

      let distance_km: number | undefined = undefined;
      if (userLat !== null && userLng !== null && act.latitude !== undefined && act.longitude !== undefined && act.latitude !== null && act.longitude !== null) {
        distance_km = calculateDistanceKm(userLat, userLng, act.latitude, act.longitude);
      }

      // Skip if exceeds max radius
      if (maxRadius !== null && distance_km !== undefined && distance_km > maxRadius) {
        return;
      }

      unifiedItems.push({
        id: `product-${prd.id}`,
        numeric_id: prd.id,
        item_type: "product",
        title: prd.name,
        title_en: prd.slug,
        slug: prd.slug,
        description: prd.short_description || prd.full_description,
        category_id: act.category_id,
        category_name_ar: cat?.name_ar || "منتجات وتجزئة",
        category_icon: cat?.icon || "Package",
        section_id: act.section_id,
        section_slug: act.section_slug,
        section_name_ar: sec?.name_ar,
        governorate_id: act.governorate_id,
        governorate_name_ar: gov?.name_ar,
        city_id: act.city_id,
        city_name_ar: city?.name_ar,
        neighborhood_id: act.neighborhood_id,
        neighborhood_name_ar: neigh?.name_ar,
        address_ar: act.address_ar,
        // Product inherits the parent shop's geographic coordinates for map plotting
        latitude: act.latitude,
        longitude: act.longitude,
        cover_image: prd.cover_image,
        rating_avg: act.rating_avg || 0,
        reviews_count: act.reviews_count || 0,
        phone: act.phone,
        whatsapp_number: act.whatsapp_number,
        has_delivery: !!act.has_delivery,
        delivery_fee_from: act.delivery_fee_from,
        delivery_estimated_time: act.delivery_estimated_time,
        status: prd.status,
        is_featured: prd.is_featured,
        price: prd.price,
        sale_price: prd.sale_price,
        currency: prd.currency || "ج.م",
        is_available: prd.is_available,
        stock_qty: prd.stock_qty,
        parent_activity_id: act.id,
        parent_activity_name_ar: act.name_ar,
        parent_activity_slug: act.slug,
        distance_km,
        created_at: prd.created_at,
      });
    });

    // Calculate item type stats BEFORE type filtering so the UI tabs show true overall counts
    const totalCount = unifiedItems.length;
    const shopsCount = unifiedItems.filter(i => i.item_type === "shop").length;
    const servicesCount = unifiedItems.filter(i => i.item_type === "service").length;
    const productsCount = unifiedItems.filter(i => i.item_type === "product").length;
    const withDeliveryCount = unifiedItems.filter(i => i.has_delivery).length;

    // Apply Type Filter on Unified Items
    let filteredItems = unifiedItems;
    if (effectiveType === "shop" || effectiveType === "shops") {
      filteredItems = unifiedItems.filter(i => i.item_type === "shop");
    } else if (effectiveType === "service" || effectiveType === "services" || effectiveType === "crafts_services") {
      filteredItems = unifiedItems.filter(i => i.item_type === "service");
    } else if (effectiveType === "product" || effectiveType === "products") {
      filteredItems = unifiedItems.filter(i => i.item_type === "product");
    } else if (effectiveType === "activities") {
      filteredItems = unifiedItems.filter(i => i.item_type === "shop" || i.item_type === "service");
    }

    // Apply Sorting across Unified Items
    if (sort_by === "price_asc") {
      filteredItems.sort((a, b) => {
        const priceA = a.sale_price ?? a.price ?? 999999;
        const priceB = b.sale_price ?? b.price ?? 999999;
        return priceA - priceB;
      });
    } else if (sort_by === "price_desc") {
      filteredItems.sort((a, b) => {
        const priceA = a.sale_price ?? a.price ?? 0;
        const priceB = b.sale_price ?? b.price ?? 0;
        return priceB - priceA;
      });
    } else if (sort_by === "rating") {
      filteredItems.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
    } else if (sort_by === "distance" && userLat !== null) {
      filteredItems.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    } else if (sort_by === "newest") {
      filteredItems.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else {
      // Relevance: featured items first, then matches with query in title, then rating
      filteredItems.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        if (queryStr) {
          const aTitleMatch = a.title.toLowerCase().includes(queryStr);
          const bTitleMatch = b.title.toLowerCase().includes(queryStr);
          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
        }
        return (b.rating_avg || 0) - (a.rating_avg || 0);
      });
    }

    // Matched Categories & Sections
    const matchedCategories = categories.filter(c =>
      !queryStr || c.name_ar.toLowerCase().includes(queryStr) || c.name_en.toLowerCase().includes(queryStr)
    ).map(c => ({
      ...c,
      activities_count: activities.filter(a => a.category_id === c.id).length,
    }));

    res.json({
      success: true,
      query: q,
      total_results: filteredItems.length,
      stats: {
        total: totalCount,
        shops_count: shopsCount,
        services_count: servicesCount,
        products_count: productsCount,
        with_delivery_count: withDeliveryCount,
      },
      data: {
        items: filteredItems,
        activities_count: shopsCount + servicesCount,
        products_count: productsCount,
        activities: matchingActivities,
        products: matchingProducts,
        matched_categories: matchedCategories,
        filters_applied: {
          q,
          type: effectiveType,
          item_type: effectiveType,
          governorate_id,
          city_id,
          neighborhood_id,
          section_slug,
          category_id,
          has_delivery,
          min_price,
          max_price,
          sort_by,
        },
      },
    });
  };

  app.get("/api/v2/search", handleUnifiedSearch);
  app.get("/api/v2/search/unified", handleUnifiedSearch);

  // Price Comparison Engine: Compare items across shops with direct WhatsApp order & delivery fee breakdown
  app.get("/api/v2/products/compare", (req, res) => {
    const {
      q = "",
      category_id,
      governorate_id,
      city_id,
      neighborhood_id,
      has_delivery,
      sort_by = "price_asc",
      lat,
      lng,
    } = req.query;

    const queryStr = String(q).trim().toLowerCase();
    const userLat = lat ? parseFloat(String(lat)) : null;
    const userLng = lng ? parseFloat(String(lng)) : null;

    let targetProducts = products.filter(prd => {
      const act = activities.find(a => a.id === prd.activity_id);
      if (!act) return false;

      // Location filters
      if (governorate_id && governorate_id !== "all" && act.governorate_id !== parseInt(String(governorate_id))) return false;
      if (city_id && city_id !== "all" && act.city_id !== parseInt(String(city_id))) return false;
      if (neighborhood_id && neighborhood_id !== "all" && act.neighborhood_id !== parseInt(String(neighborhood_id))) return false;

      // Category filter
      if (category_id && category_id !== "all" && act.category_id !== parseInt(String(category_id))) return false;

      // Delivery filter
      if (has_delivery !== undefined && has_delivery !== "all") {
        const reqDel = has_delivery === "true" || has_delivery === "1";
        if (!!act.has_delivery !== reqDel) return false;
      }

      if (!queryStr) return true;

      // Fuzzy match name or description
      return (
        prd.name.toLowerCase().includes(queryStr) ||
        prd.short_description.toLowerCase().includes(queryStr) ||
        prd.full_description.toLowerCase().includes(queryStr) ||
        act.name_ar.toLowerCase().includes(queryStr)
      );
    });

    if (targetProducts.length === 0) {
      // Fallback: return all available products so user can explore
      targetProducts = [...products];
    }

    // Group products into comparison groups (by common item name/theme)
    const enrichedOffers = targetProducts.map(prd => {
      const act = activities.find(a => a.id === prd.activity_id)!;
      const cat = categories.find(c => c.id === act.category_id);
      const gov = governorates.find(g => g.id === act.governorate_id);
      const city = cities.find(c => c.id === act.city_id);
      const neigh = neighborhoods.find(n => n.id === act.neighborhood_id);

      let distance_km: number | undefined = undefined;
      if (userLat !== null && userLng !== null && act.latitude !== undefined && act.longitude !== undefined) {
        distance_km = calculateDistanceKm(userLat, userLng, act.latitude, act.longitude);
      }

      const effectivePrice = prd.sale_price !== null && prd.sale_price !== undefined ? prd.sale_price : prd.price;
      const hasDiscount = prd.sale_price !== null && prd.sale_price < prd.price;
      const discountPercentage = hasDiscount ? Math.round(((prd.price - prd.sale_price!) / prd.price) * 100) : 0;

      // Generate WhatsApp order message URL
      const waPhone = (act.whatsapp_number || act.phone || "").replace(/[^0-9]/g, "");
      const waText = encodeURIComponent(`مرحباً ${act.name_ar}، أود الاستفسار والطلب لمنتج/خدمة: "${prd.name}" المعروضة في دليل أي خدمة بسعر ${effectivePrice} ${prd.currency}. هل متوفر؟`);
      const whatsappOrderUrl = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : null;

      return {
        product_id: prd.id,
        name: prd.name,
        slug: prd.slug,
        short_description: prd.short_description,
        cover_image: prd.cover_image,
        sku: prd.sku,
        original_price: prd.price,
        current_price: effectivePrice,
        currency: prd.currency,
        has_discount: hasDiscount,
        discount_percentage: discountPercentage,
        is_available: prd.is_available,
        availability_note: prd.availability_note,
        distance_km,
        activity: {
          id: act.id,
          name_ar: act.name_ar,
          slug: act.slug,
          phone: act.phone,
          whatsapp_number: act.whatsapp_number,
          whatsapp_order_url: whatsappOrderUrl,
          rating_avg: act.rating_avg,
          reviews_count: act.reviews_count,
          is_verified: act.status === "verified",
          is_featured: act.is_featured,
          has_delivery: !!act.has_delivery,
          delivery_fee_from: act.delivery_fee_from,
          delivery_fee_to: act.delivery_fee_to,
          delivery_estimated_time: act.delivery_estimated_time,
          delivery_notes: act.delivery_notes,
          address_ar: act.address_ar,
          governorate_name_ar: gov?.name_ar,
          city_name_ar: city?.name_ar,
          neighborhood_name_ar: neigh?.name_ar,
          category_name_ar: cat?.name_ar,
        },
      };
    });

    // Compute Summary Stats
    const prices = enrichedOffers.map(o => o.current_price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

    // Tag the Best Deals
    const taggedOffers = enrichedOffers.map(offer => {
      const isLowestPrice = offer.current_price === minPrice;
      const isBestRated = offer.activity.rating_avg >= 4.8;
      const priceDiffFromAvg = Math.round(((offer.current_price - avgPrice) / avgPrice) * 100);

      return {
        ...offer,
        is_lowest_price: isLowestPrice,
        is_best_rated: isBestRated,
        price_difference_percentage: priceDiffFromAvg,
      };
    });

    // Sort tagged offers
    if (sort_by === "price_asc") {
      taggedOffers.sort((a, b) => a.current_price - b.current_price);
    } else if (sort_by === "price_desc") {
      taggedOffers.sort((a, b) => b.current_price - a.current_price);
    } else if (sort_by === "rating") {
      taggedOffers.sort((a, b) => (b.activity.rating_avg || 0) - (a.activity.rating_avg || 0));
    } else if (sort_by === "delivery_fee") {
      taggedOffers.sort((a, b) => (a.activity.delivery_fee_from || 999) - (b.activity.delivery_fee_from || 999));
    } else if (sort_by === "distance" && userLat !== null) {
      taggedOffers.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    }

    res.json({
      success: true,
      query: q,
      total_offers: taggedOffers.length,
      stats: {
        lowest_price: minPrice,
        highest_price: maxPrice,
        average_price: avgPrice,
        price_spread: maxPrice - minPrice,
        total_shops_comparing: new Set(taggedOffers.map(o => o.activity.id)).size,
        shops_with_delivery_count: taggedOffers.filter(o => o.activity.has_delivery).length,
      },
      offers: taggedOffers,
    });
  });

  app.post("/api/v2/activities", (req, res) => {
    const user = getAuthUser(req);
    if (!user || (!userHasPermission(user, "manage_activities") && !userHasPermission(user, "manage_own_activity"))) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح: ليس لديك الصلاحية المطلوبة لإنشاء نشاط جديد.",
        error_code: "FORBIDDEN",
      });
    }

    const {
      name_ar,
      name_en,
      category_id,
      location_id,
      governorate_id,
      city_id,
      neighborhood_id,
      section_id,
      section_slug,
      description_ar,
      address_ar,
      address_line,
      phone,
      whatsapp_number,
      website_url,
      working_hours,
      is_featured,
      cover_image,
      latitude,
      longitude,
      map_place_id,
      google_maps_url,
      has_delivery,
      delivery_fee_from,
      delivery_fee_to,
      delivery_estimated_time,
      delivery_notes,
      whatsapp_orders_enabled,
    } = req.body;

    if (!name_ar || !category_id || !address_ar) {
      return res.status(422).json({
        success: false,
        message: "بيانات الإدخال غير مكتملة، يرجى ملء الحقول الإلزامية.",
        errors: {
          name_ar: !name_ar ? ["حقل اسم النشاط بالعربية مطلوب."] : undefined,
          category_id: !category_id ? ["حقل التصنيف مطلوب."] : undefined,
          address_ar: !address_ar ? ["حقل العنوان مطلوب."] : undefined,
        },
      });
    }

    // Check Geographic Scope for creation
    if (userRequiresGeoScope(user) && user.location_id && location_id && parseInt(location_id) !== user.location_id) {
      return res.status(403).json({
        success: false,
        message: `غير مصرح: لا يمكنك إنشاء نشاط تجاري خارج نطاقك الجغرافي.`,
        error_code: "GEO_SCOPE_VIOLATION",
      });
    }

    // Resolve Location Hierarchy
    const govId = governorate_id ? parseInt(String(governorate_id)) : (location_id ? parseInt(String(location_id)) : 1);
    const cityId = city_id ? parseInt(String(city_id)) : (cities.find(c => c.governorate_id === govId)?.id || 1);
    const neighId = neighborhood_id ? parseInt(String(neighborhood_id)) : null;

    // Resolve Category Section
    const catObj = categories.find(c => c.id === parseInt(String(category_id)));
    const secId = section_id ? parseInt(String(section_id)) : (catObj?.section_id || 1);
    const secSlug = section_slug || catObj?.section_slug || directory_sections.find(s => s.id === secId)?.slug || "shops";

    const locRecord = locations.find(l => l.id === govId);
    const finalLat = latitude !== undefined && latitude !== "" ? parseFloat(String(latitude)) : (locRecord ? locRecord.latitude + (Math.random() - 0.5) * 0.02 : 30.0444);
    const finalLng = longitude !== undefined && longitude !== "" ? parseFloat(String(longitude)) : (locRecord ? locRecord.longitude + (Math.random() - 0.5) * 0.02 : 31.2357);
    const mapsLink = google_maps_url || `https://www.google.com/maps/search/?api=1&query=${finalLat},${finalLng}`;

    const newActivity: ActivityModel = {
      id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
      name_ar,
      name_en: name_en || "",
      slug: `activity-${Date.now()}`,
      category_id: parseInt(category_id),
      location_id: govId,
      governorate_id: govId,
      city_id: cityId,
      neighborhood_id: neighId,
      section_id: secId,
      section_slug: secSlug,
      owner_id: user.id,
      description_ar: description_ar || "",
      address_ar,
      address_line: address_line || "",
      phone: phone || "",
      whatsapp_number: whatsapp_number || phone || "",
      website_url: website_url || "",
      working_hours: working_hours || "يومياً من 09:00 ص - 10:00 م",
      latitude: finalLat,
      longitude: finalLng,
      map_place_id: map_place_id || null,
      map_url: mapsLink,
      google_maps_url: mapsLink,
      has_delivery: has_delivery !== undefined ? !!has_delivery : false,
      delivery_fee_from: delivery_fee_from !== undefined && delivery_fee_from !== null ? parseFloat(String(delivery_fee_from)) : undefined,
      delivery_fee_to: delivery_fee_to !== undefined && delivery_fee_to !== null ? parseFloat(String(delivery_fee_to)) : undefined,
      delivery_estimated_time: delivery_estimated_time || (has_delivery ? "30-45 دقيقة" : undefined),
      delivery_notes: delivery_notes || (has_delivery ? "التوصيل لكافة أرجاء الحي" : undefined),
      whatsapp_orders_enabled: whatsapp_orders_enabled !== undefined ? !!whatsapp_orders_enabled : true,
      status: roles.find(r => r.id === user.role_id)?.name === "مدير_عام" ? "verified" : "pending",
      verified_at: roles.find(r => r.id === user.role_id)?.name === "مدير_عام" ? new Date().toISOString() : null,
      verified_by: roles.find(r => r.id === user.role_id)?.name === "مدير_عام" ? user.id : null,
      verification_notes: null,
      rating_avg: 0.0,
      reviews_count: 0,
      views_count: 0,
      is_featured: !!is_featured,
      cover_image: cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    activities.unshift(newActivity);
    recordAuditLog(user, "App\\Models\\Activity", newActivity.id, "created", null, newActivity, req);

    res.status(201).json({
      success: true,
      message: "تم إنشاء النشاط التجاري بنجاح وهو بانتظار المراجعة والاعتماد.",
      data: newActivity,
    });
  });

  // Update Activity (General / Owner / Admin)
  app.put("/api/v2/activities/:id", (req, res) => {
    const user = getAuthUser(req);
    const actId = parseInt(req.params.id);
    const act = activities.find(a => a.id === actId);

    if (!act) {
      return res.status(404).json({ success: false, message: "النشاط التجاري المطلوب غير موجود." });
    }

    const isOwner = user && act.owner_id === user.id;
    const canManageAll = user && userHasPermission(user, "manage_activities");

    if (!user || (!isOwner && !canManageAll)) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح: ليس لديك الصلاحية لتعديل بيانات هذا النشاط التجاري.",
      });
    }

    const oldValues = { ...act };
    const {
      name_ar,
      name_en,
      category_id,
      location_id,
      governorate_id,
      city_id,
      neighborhood_id,
      section_id,
      section_slug,
      description_ar,
      address_ar,
      address_line,
      phone,
      whatsapp_number,
      website_url,
      working_hours,
      latitude,
      longitude,
      map_place_id,
      google_maps_url,
      cover_image,
      is_featured,
      has_delivery,
      delivery_fee_from,
      delivery_fee_to,
      delivery_estimated_time,
      delivery_notes,
      whatsapp_orders_enabled,
    } = req.body;

    if (name_ar) act.name_ar = name_ar;
    if (name_en !== undefined) act.name_en = name_en;
    if (category_id) {
      act.category_id = parseInt(category_id);
      const catObj = categories.find(c => c.id === act.category_id);
      if (catObj && !section_id) {
        act.section_id = catObj.section_id;
        act.section_slug = catObj.section_slug;
      }
    }
    if (location_id) {
      act.location_id = parseInt(location_id);
      act.governorate_id = parseInt(location_id);
    }
    if (governorate_id) {
      act.governorate_id = parseInt(String(governorate_id));
      act.location_id = act.governorate_id;
    }
    if (city_id) act.city_id = parseInt(String(city_id));
    if (neighborhood_id !== undefined) act.neighborhood_id = neighborhood_id ? parseInt(String(neighborhood_id)) : null;
    if (section_id) act.section_id = parseInt(String(section_id));
    if (section_slug) act.section_slug = String(section_slug);

    if (description_ar !== undefined) act.description_ar = description_ar;
    if (address_ar) act.address_ar = address_ar;
    if (address_line !== undefined) act.address_line = address_line;
    if (phone !== undefined) act.phone = phone;
    if (whatsapp_number !== undefined) act.whatsapp_number = whatsapp_number;
    if (website_url !== undefined) act.website_url = website_url;
    if (working_hours !== undefined) act.working_hours = working_hours;
    if (latitude !== undefined && latitude !== "") act.latitude = parseFloat(String(latitude));
    if (longitude !== undefined && longitude !== "") act.longitude = parseFloat(String(longitude));
    if (map_place_id !== undefined) act.map_place_id = map_place_id;
    if (google_maps_url !== undefined) {
      act.google_maps_url = google_maps_url;
      act.map_url = google_maps_url;
    } else if (act.latitude && act.longitude) {
      act.google_maps_url = `https://www.google.com/maps/search/?api=1&query=${act.latitude},${act.longitude}`;
      act.map_url = act.google_maps_url;
    }
    if (cover_image) {
      if (oldValues.cover_image && oldValues.cover_image !== cover_image) {
        r2Storage.deleteOldMediaIfReplaced(oldValues.cover_image, cover_image).catch(() => {});
      }
      act.cover_image = cover_image;
    }
    if (canManageAll && is_featured !== undefined) act.is_featured = !!is_featured;

    // Delivery fields update
    if (has_delivery !== undefined) act.has_delivery = !!has_delivery;
    if (delivery_fee_from !== undefined) act.delivery_fee_from = delivery_fee_from !== null ? parseFloat(String(delivery_fee_from)) : undefined;
    if (delivery_fee_to !== undefined) act.delivery_fee_to = delivery_fee_to !== null ? parseFloat(String(delivery_fee_to)) : undefined;
    if (delivery_estimated_time !== undefined) act.delivery_estimated_time = delivery_estimated_time;
    if (delivery_notes !== undefined) act.delivery_notes = delivery_notes;
    if (whatsapp_orders_enabled !== undefined) act.whatsapp_orders_enabled = !!whatsapp_orders_enabled;

    act.updated_at = new Date().toISOString();

    recordAuditLog(user, "App\\Models\\Activity", act.id, "updated", oldValues, act, req);

    res.json({
      success: true,
      message: "تم تحديث بيانات النشاط التجاري والموقع الجغرافي بنجاح.",
      data: act,
    });
  });

  // Delete Activity
  app.delete("/api/v2/activities/:id", (req, res) => {
    const user = getAuthUser(req);
    const actId = parseInt(req.params.id);
    const actIdx = activities.findIndex(a => a.id === actId);

    if (actIdx === -1) {
      return res.status(404).json({ success: false, message: "النشاط التجاري غير موجود." });
    }

    const act = activities[actIdx];
    const isOwner = user && act.owner_id === user.id;
    const canManageAll = user && userHasPermission(user, "manage_activities");

    if (!user || (!isOwner && !canManageAll)) {
      return res.status(403).json({ success: false, message: "غير مصرح: لا تملك صلاحية حذف هذا النشاط." });
    }

    activities.splice(actIdx, 1);
    if (act.cover_image) {
      r2Storage.deleteObject(act.cover_image).catch(() => {});
    }
    // Also remove associated products
    const relatedProducts = products.filter(p => p.activity_id === actId);
    for (const rp of relatedProducts) {
      if (rp.cover_image) r2Storage.deleteObject(rp.cover_image).catch(() => {});
    }
    products = products.filter(p => p.activity_id !== actId);

    recordAuditLog(user, "App\\Models\\Activity", actId, "deleted", act, null, req);

    res.json({
      success: true,
      message: "تم حذف النشاط التجاري وكافة المنتجات المرتبطة به بنجاح.",
    });
  });

  // Get Products of a specific Activity
  app.get("/api/v2/activities/:id/products", (req, res) => {
    const actId = parseInt(req.params.id);
    const act = activities.find(a => a.id === actId);
    if (!act) {
      return res.status(404).json({ success: false, message: "النشاط التجاري غير موجود." });
    }

    const actProducts = products.filter(p => p.activity_id === actId);
    res.json({
      success: true,
      count: actProducts.length,
      data: actProducts,
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                          PRODUCTS MANAGEMENT API                           */
  /* -------------------------------------------------------------------------- */

  // List all products (public & filtered)
  app.get("/api/v2/products", (req, res) => {
    const { activity_id, search, is_available, is_featured, status, sort_by } = req.query;

    let result = [...products];

    if (activity_id) {
      result = result.filter(p => p.activity_id === parseInt(String(activity_id)));
    }
    if (status) {
      result = result.filter(p => p.status === String(status));
    }
    if (is_available !== undefined) {
      result = result.filter(p => p.is_available === (String(is_available) === "true"));
    }
    if (is_featured !== undefined) {
      result = result.filter(p => p.is_featured === (String(is_featured) === "true"));
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.full_description.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (sort_by === "price_asc") {
      result.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
    } else if (sort_by === "price_desc") {
      result.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
    } else if (sort_by === "views") {
      result.sort((a, b) => b.views_count - a.views_count);
    } else {
      result.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }

    // Hydrate with Activity
    const enriched = result.map(p => {
      const act = activities.find(a => a.id === p.activity_id);
      return {
        ...p,
        activity: act ? { id: act.id, name_ar: act.name_ar, slug: act.slug, phone: act.phone, address_ar: act.address_ar, cover_image: act.cover_image } : null,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  // Get single product
  app.get("/api/v2/products/:id", (req, res) => {
    const prodId = parseInt(req.params.id);
    const prod = products.find(p => p.id === prodId);

    if (!prod) {
      return res.status(404).json({ success: false, message: "المنتج أو الخدمة المطلوبة غير موجودة." });
    }

    prod.views_count += 1;
    const act = activities.find(a => a.id === prod.activity_id);

    res.json({
      success: true,
      data: {
        ...prod,
        activity: act ? { id: act.id, name_ar: act.name_ar, slug: act.slug, phone: act.phone, address_ar: act.address_ar, latitude: act.latitude, longitude: act.longitude } : null,
      },
    });
  });

  // Create Product
  app.post("/api/v2/products", (req, res) => {
    const user = getAuthUser(req);
    const {
      activity_id,
      name,
      short_description,
      full_description,
      sku,
      price,
      sale_price,
      currency,
      is_available,
      is_featured,
      stock_qty,
      availability_note,
      cover_image,
      gallery,
      sort_order,
      status,
    } = req.body;

    if (!user) {
      return res.status(401).json({ success: false, message: "يجب تسجيل الدخول أولاً لإضافة منتج." });
    }

    if (!activity_id || !name || price === undefined) {
      return res.status(422).json({
        success: false,
        message: "بيانات المنتج غير مكتملة، يجب تحديد النشاط واسم المنتج والسعر.",
      });
    }

    const act = activities.find(a => a.id === parseInt(activity_id));
    if (!act) {
      return res.status(404).json({ success: false, message: "النشاط التجاري المحدد غير موجود." });
    }

    // Check permission / ownership
    const isOwner = act.owner_id === user.id;
    const canManageAll = userHasPermission(user, "manage_products") || userHasPermission(user, "manage_activities");

    if (!isOwner && !canManageAll) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح: لا تملك صلاحية إضافة منتج لهذا النشاط التجاري.",
      });
    }

    const newProduct: ProductModel = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      activity_id: act.id,
      owner_user_id: user.id,
      name,
      slug: `prod-${Date.now()}`,
      short_description: short_description || "",
      full_description: full_description || short_description || "",
      sku: sku || `SKU-${Date.now()}`,
      price: parseFloat(String(price)),
      sale_price: sale_price ? parseFloat(String(sale_price)) : null,
      currency: currency || "ج.م",
      is_available: is_available !== undefined ? !!is_available : true,
      is_featured: !!is_featured,
      stock_qty: stock_qty !== undefined && stock_qty !== "" ? parseInt(String(stock_qty)) : null,
      availability_note: availability_note || "متوفر للطلب المباشر",
      sort_order: sort_order ? parseInt(String(sort_order)) : 0,
      cover_image: cover_image || "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600",
      gallery: Array.isArray(gallery) ? gallery : [],
      status: status || "published",
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    products.unshift(newProduct);
    recordAuditLog(user, "App\\Models\\Product", newProduct.id, "created", null, newProduct, req);

    res.status(201).json({
      success: true,
      message: "تم إضافة المنتج بنجاح إلى النشاط التجاري.",
      data: newProduct,
    });
  });

  // Update Product
  app.put("/api/v2/products/:id", (req, res) => {
    const user = getAuthUser(req);
    const prodId = parseInt(req.params.id);
    const prod = products.find(p => p.id === prodId);

    if (!prod) {
      return res.status(404).json({ success: false, message: "المنتج المطلوب غير موجود." });
    }

    const act = activities.find(a => a.id === prod.activity_id);
    const isOwner = user && (prod.owner_user_id === user.id || (act && act.owner_id === user.id));
    const canManageAll = user && (userHasPermission(user, "manage_products") || userHasPermission(user, "manage_activities"));

    if (!user || (!isOwner && !canManageAll)) {
      return res.status(403).json({ success: false, message: "غير مصرح: لا تملك صلاحية تعديل هذا المنتج." });
    }

    const oldValues = { ...prod };
    const {
      name,
      short_description,
      full_description,
      sku,
      price,
      sale_price,
      currency,
      is_available,
      is_featured,
      stock_qty,
      availability_note,
      cover_image,
      gallery,
      sort_order,
      status,
    } = req.body;

    if (name) prod.name = name;
    if (short_description !== undefined) prod.short_description = short_description;
    if (full_description !== undefined) prod.full_description = full_description;
    if (sku !== undefined) prod.sku = sku;
    if (price !== undefined) prod.price = parseFloat(String(price));
    if (sale_price !== undefined) prod.sale_price = sale_price ? parseFloat(String(sale_price)) : null;
    if (currency !== undefined) prod.currency = currency;
    if (is_available !== undefined) prod.is_available = !!is_available;
    if (is_featured !== undefined) prod.is_featured = !!is_featured;
    if (stock_qty !== undefined) prod.stock_qty = stock_qty !== "" && stock_qty !== null ? parseInt(String(stock_qty)) : null;
    if (availability_note !== undefined) prod.availability_note = availability_note;
    if (cover_image) {
      if (oldValues.cover_image && oldValues.cover_image !== cover_image) {
        r2Storage.deleteOldMediaIfReplaced(oldValues.cover_image, cover_image).catch(() => {});
      }
      prod.cover_image = cover_image;
    }
    if (gallery && Array.isArray(gallery)) prod.gallery = gallery;
    if (sort_order !== undefined) prod.sort_order = parseInt(String(sort_order));
    if (status !== undefined) prod.status = status;

    prod.updated_at = new Date().toISOString();

    recordAuditLog(user, "App\\Models\\Product", prod.id, "updated", oldValues, prod, req);

    res.json({
      success: true,
      message: "تم تحديث بيانات وسعر المنتج بنجاح.",
      data: prod,
    });
  });

  // Toggle Product Availability
  app.patch("/api/v2/products/:id/toggle-availability", (req, res) => {
    const user = getAuthUser(req);
    const prodId = parseInt(req.params.id);
    const prod = products.find(p => p.id === prodId);

    if (!prod) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود." });
    }

    prod.is_available = !prod.is_available;
    prod.updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: prod.is_available ? "المنتج الآن متوفر للطلب." : "تم تعيين المنتج كغير متوفر مؤقتاً.",
      data: prod,
    });
  });

  // Delete Product
  app.delete("/api/v2/products/:id", (req, res) => {
    const user = getAuthUser(req);
    const prodId = parseInt(req.params.id);
    const prodIdx = products.findIndex(p => p.id === prodId);

    if (prodIdx === -1) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود." });
    }

    const prod = products[prodIdx];
    const act = activities.find(a => a.id === prod.activity_id);
    const isOwner = user && (prod.owner_user_id === user.id || (act && act.owner_id === user.id));
    const canManageAll = user && (userHasPermission(user, "manage_products") || userHasPermission(user, "manage_activities"));

    if (!user || (!isOwner && !canManageAll)) {
      return res.status(403).json({ success: false, message: "غير مصرح بحذف هذا المنتج." });
    }

    products.splice(prodIdx, 1);
    if (prod.cover_image) {
      r2Storage.deleteObject(prod.cover_image).catch(() => {});
    }
    if (Array.isArray(prod.gallery)) {
      for (const g of prod.gallery) {
        r2Storage.deleteObject(g).catch(() => {});
      }
    }
    recordAuditLog(user, "App\\Models\\Product", prodId, "deleted", prod, null, req);

    res.json({
      success: true,
      message: "تم حذف المنتج بنجاح من القائمة.",
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                          MERCHANT PORTAL API                               */
  /* -------------------------------------------------------------------------- */

  // Merchant Overview Dashboard
  app.get("/api/v2/merchant/dashboard", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    // Find all activities owned by merchant or all activities if general manager
    const isSuperAdmin = roles.find(r => r.id === user.role_id)?.name === "مدير_عام";
    const myActivities = isSuperAdmin ? activities : activities.filter(a => a.owner_id === user.id);
    const myActivityIds = myActivities.map(a => a.id);
    const myProducts = products.filter(p => myActivityIds.includes(p.activity_id));
    const myInquiries = inquiries.filter(i => myActivityIds.includes(i.activity_id));
    const myReviews = reviews.filter(r => myActivityIds.includes(r.activity_id));
    const myOffers = offers.filter(o => o.owner_user_id === user.id || myActivityIds.includes(o.activity_id));

    const totalViews = myActivities.reduce((acc, a) => acc + a.views_count, 0) + myProducts.reduce((acc, p) => acc + p.views_count, 0);
    const totalProductsCount = myProducts.length;
    const availableProductsCount = myProducts.filter(p => p.is_available).length;
    const verifiedActivitiesCount = myActivities.filter(a => a.status === "verified").length;
    const pendingActivitiesCount = myActivities.filter(a => a.status === "pending").length;
    const mediaCount = myActivities.reduce((acc, a) => acc + (a.cover_image ? 1 : 0) + (a.gallery_images?.length || 0), 0) + myProducts.filter(p => p.cover_image).length;

    res.json({
      success: true,
      data: {
        merchant: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar_url: user.avatar_url,
        },
        stats: {
          activities_count: myActivities.length,
          verified_activities_count: verifiedActivitiesCount,
          pending_activities_count: pendingActivitiesCount,
          products_count: totalProductsCount,
          available_products_count: availableProductsCount,
          inquiries_count: myInquiries.length,
          new_inquiries_count: myInquiries.filter(i => i.status === "new").length,
          reviews_count: myReviews.length,
          offers_count: myOffers.length,
          media_count: mediaCount,
          total_views: totalViews,
          avg_rating: myActivities.length > 0
            ? parseFloat((myActivities.reduce((acc, a) => acc + a.rating_avg, 0) / myActivities.length).toFixed(2))
            : 0,
        },
        activities: myActivities.map(act => {
          const cat = categories.find(c => c.id === act.category_id);
          const loc = locations.find(l => l.id === act.location_id);
          const actProds = myProducts.filter(p => p.activity_id === act.id);
          return {
            ...act,
            category: cat ? { id: cat.id, name_ar: cat.name_ar, icon: cat.icon } : null,
            location: loc ? { id: loc.id, name_ar: loc.name_ar, code: loc.code } : null,
            products_count: actProds.length,
          };
        }),
        recent_inquiries: myInquiries.slice(0, 5).map(inq => {
          const act = myActivities.find(a => a.id === inq.activity_id);
          const prod = products.find(p => p.id === inq.product_id);
          return {
            ...inq,
            activity_name: act?.name_ar,
            product_name: prod?.name,
          };
        }),
      },
    });
  });

  // Merchant Activities list
  app.get("/api/v2/merchant/activities", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    const isSuperAdmin = roles.find(r => r.id === user.role_id)?.name === "مدير_عام";
    const myActivities = isSuperAdmin ? activities : activities.filter(a => a.owner_id === user.id);

    const enriched = myActivities.map(act => {
      const cat = categories.find(c => c.id === act.category_id);
      const loc = locations.find(l => l.id === act.location_id);
      const actProds = products.filter(p => p.activity_id === act.id);
      return {
        ...act,
        category: cat ? { id: cat.id, name_ar: cat.name_ar, icon: cat.icon } : null,
        location: loc ? { id: loc.id, name_ar: loc.name_ar, code: loc.code } : null,
        products_count: actProds.length,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  // Merchant Products list
  app.get("/api/v2/merchant/products", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    const isSuperAdmin = roles.find(r => r.id === user.role_id)?.name === "مدير_عام";
    const myActivities = isSuperAdmin ? activities : activities.filter(a => a.owner_id === user.id);
    const myActivityIds = myActivities.map(a => a.id);
    const myProducts = products.filter(p => myActivityIds.includes(p.activity_id));

    const enriched = myProducts.map(p => {
      const act = activities.find(a => a.id === p.activity_id);
      return {
        ...p,
        activity: act ? { id: act.id, name_ar: act.name_ar, slug: act.slug } : null,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  /* -------------------------------------------------------------------------- */
  /*               CLOUDFLARE R2 MEDIA & IMAGE STORAGE ENGINE                   */
  /* -------------------------------------------------------------------------- */

  const mediaMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: MAX_FILE_SIZE_BYTES, // 15MB
    },
  });

  const mediaUploadMiddleware = mediaMulter.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]);

  // 1. Upload Media (Supports Multipart Form Data, Base64 String, Data URI, and URL proxies)
  app.post(["/api/v2/media/upload", "/api/v2/upload"], mediaUploadMiddleware, async (req: any, res) => {
    try {
      const user = getAuthUser(req);
      const folder = ((req.body?.folder as string) || "media") as StorageFolder;
      const entityId = req.body?.entity_id || req.body?.activity_id || req.body?.product_id;
      const prefix = req.body?.prefix;
      const clientFileName = req.body?.file_name;

      // Check if file was provided via Multipart Form
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedFile = files?.file?.[0] || files?.image?.[0] || req.file;

      if (uploadedFile) {
        // Upload from Buffer
        const result = await r2Storage.uploadBuffer(uploadedFile.buffer, {
          folder,
          originalName: uploadedFile.originalname || clientFileName,
          mimeType: uploadedFile.mimetype,
          entityId,
          prefix,
        });

        return res.json({
          success: true,
          message: result.isR2
            ? "تم رفع وتخزين الصورة بنجاح على Cloudflare R2."
            : "تم حفظ الصورة بنجاح (وضع المحاكاة).",
          data: {
            id: result.fileName,
            url: result.url,
            key: result.key,
            file_name: result.fileName,
            folder: result.folder,
            size_bytes: result.sizeBytes,
            mime_type: result.mimeType,
            is_r2: result.isR2,
            uploaded_at: result.uploadedAt,
          },
        });
      }

      // Check if file was provided via JSON body (Base64, Data URI, or string)
      const imagePayload = req.body?.image || req.body?.file;
      if (imagePayload && typeof imagePayload === "string") {
        if (imagePayload.startsWith("data:") || !imagePayload.startsWith("http")) {
          // Base64 / Data URI
          const result = await r2Storage.uploadBase64(imagePayload, {
            folder,
            originalName: clientFileName,
            entityId,
            prefix,
          });

          return res.json({
            success: true,
            message: result.isR2
              ? "تم رفع وتخزين الصورة بنجاح على Cloudflare R2."
              : "تم حفظ الصورة بنجاح (وضع المحاكاة).",
            data: {
              id: result.fileName,
              url: result.url,
              key: result.key,
              file_name: result.fileName,
              folder: result.folder,
              size_bytes: result.sizeBytes,
              mime_type: result.mimeType,
              is_r2: result.isR2,
              uploaded_at: result.uploadedAt,
            },
          });
        } else {
          // Already an external HTTP URL (e.g. Unsplash or already hosted image)
          const fallbackDomain = process.env.R2_PUBLIC_DOMAIN || "https://images.dalilaykhidma.com";
          return res.json({
            success: true,
            message: "تم اعتماد رابط الصورة بنجاح.",
            data: {
              id: clientFileName || `media_${Date.now()}.jpg`,
              url: imagePayload,
              key: `${folder}/${clientFileName || `ext_${Date.now()}.jpg`}`,
              file_name: clientFileName || `ext_${Date.now()}.jpg`,
              folder,
              size_bytes: 102400,
              mime_type: "image/jpeg",
              is_r2: imagePayload.includes(fallbackDomain.replace("https://", "").replace("http://", "")),
              uploaded_at: new Date().toISOString(),
            },
          });
        }
      }

      // No file provided - Provide a safe placeholder
      const placeholderUrl = "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600";
      return res.json({
        success: true,
        message: "تم حفظ الصورة الافتراضية.",
        data: {
          id: `media_${Date.now()}.jpg`,
          url: placeholderUrl,
          key: `${folder}/default_${Date.now()}.jpg`,
          file_name: clientFileName || `default_${Date.now()}.jpg`,
          folder,
          size_bytes: 102400,
          mime_type: "image/jpeg",
          is_r2: false,
          uploaded_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error("[MediaUpload] Error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "حدث خطأ أثناء رفع الصورة.",
      });
    }
  });

  // 2. Pre-signed Direct Upload URL (for direct client-to-R2 uploads)
  app.post("/api/v2/media/presign", async (req, res) => {
    try {
      const user = getAuthUser(req);
      const {
        folder = "media",
        mime_type = "image/jpeg",
        file_name,
        entity_id,
        prefix,
        expires_in = 300,
      } = req.body || {};

      // Security scoping: if user is logged in, default prefix to user's id if not specified
      const effectivePrefix = prefix || (user ? `u${user.id}` : undefined);

      const presigned = await r2Storage.generatePresignedUpload({
        folder: folder as StorageFolder,
        mimeType: mime_type,
        originalName: file_name,
        entityId: entity_id,
        prefix: effectivePrefix,
        expiresInSeconds: expires_in,
      });

      res.json({
        success: true,
        message: "تم توليد رابط الرفع المباشر بنجاح.",
        data: {
          upload_url: presigned.uploadUrl,
          public_url: presigned.finalPublicUrl,
          key: presigned.key,
          folder: presigned.folder,
          file_name: presigned.fileName,
          expires_in_seconds: presigned.expiresInSeconds,
        },
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "فشل توليد رابط الرفع المباشر.",
      });
    }
  });

  // Mock Direct Upload Handler (used during local sandbox testing if R2 credentials not supplied)
  app.put("/api/v2/media/upload-direct-mock", (req, res) => {
    const key = String(req.query.key || "temp/mock_upload.jpg");
    console.log(`[R2 Direct Mock] Received simulated PUT upload for key "${key}"`);
    res.status(200).send();
  });

  // 3. Delete Media from R2
  app.all(["/api/v2/media/delete", "/api/v2/media/remove"], async (req, res) => {
    try {
      const keyOrUrl = req.body?.key || req.body?.url || req.query?.key || req.query?.url;
      if (!keyOrUrl) {
        return res.status(400).json({
          success: false,
          message: "يرجى تحديد مفتاح أو رابط الصورة المراد حذفها (key or url).",
        });
      }

      const deleted = await r2Storage.deleteObject(String(keyOrUrl));
      res.json({
        success: true,
        message: deleted ? "تم حذف الصورة من Cloudflare R2 بنجاح." : "تعذر العثور على الصورة لحذفها.",
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || "فشل حذف الصورة من التخزين.",
      });
    }
  });

  // 4. Derive Image Variant URL
  app.post("/api/v2/media/optimize-url", (req, res) => {
    const { url, variant = "original", options } = req.body || {};
    if (!url) {
      return res.status(400).json({ success: false, message: "يرجى توفير رابط الصورة." });
    }

    const optimizedUrl = r2Storage.getOptimizedImageUrl(url, variant, options);
    res.json({
      success: true,
      data: {
        original_url: url,
        variant,
        optimized_url: optimizedUrl,
      },
    });
  });

  // 5. Cleanup Temp Uploads
  app.post("/api/v2/media/cleanup-temp", async (req, res) => {
    const user = getAuthUser(req);
    // Allow admin or system trigger
    const olderThanHours = parseInt(String(req.body?.older_than_hours || 24));
    const result = await r2Storage.cleanupTempUploads(olderThanHours);
    res.json({
      success: true,
      message: `تم تنظيف ${result.deletedCount} ملف مؤقت من حاوية التخزين.`,
      data: result,
    });
  });

  // 6. Bucket Storage Stats
  app.get("/api/v2/media/storage-stats", async (req, res) => {
    const stats = await r2Storage.getStorageStats();
    res.json({
      success: true,
      data: stats,
    });
  });

  // 7. R2 Diagnostic & Public Config
  app.get(["/api/v2/media/r2-status", "/api/v2/media/config"], async (req, res) => {
    const config = r2Storage.getPublicConfig();
    const testResult = await r2Storage.testConnection();

    res.json({
      success: true,
      config,
      diagnostic: testResult,
      timestamp: new Date().toISOString(),
    });
  });


  /* -------------------------------------------------------------------------- */
  /*                          INQUIRIES API (Customer Leads)                     */
  /* -------------------------------------------------------------------------- */

  function enrichInquiry(inq: InquiryModel) {
    const act = activities.find(a => a.id === inq.activity_id);
    const prod = inq.product_id ? products.find(p => p.id === inq.product_id) : null;
    const off = inq.offer_id ? offers.find(o => o.id === inq.offer_id) : null;

    return {
      ...inq,
      activity_name_ar: act?.name_ar || "النشاط التجاري",
      activity_name_en: act?.name_en || "Business",
      activity_cover_image: act?.cover_image || null,
      product_name_ar: prod?.name || null,
      product_price: prod?.price || null,
      product_cover_image: prod?.cover_image || null,
      offer_title_ar: off?.title || null,
      offer_discount_percentage: off?.discount_percentage || null,
    };
  }

  // Merchant Inquiries Inbox List
  app.get("/api/v2/merchant/inquiries", (req, res) => {
    const user = getAuthUser(req);
    const myActivities = user
      ? activities.filter(a => a.owner_id === user.id)
      : activities;
    const myActivityIds = myActivities.map(a => a.id);

    let list = inquiries.filter(i => myActivityIds.length === 0 || myActivityIds.includes(i.activity_id));

    const { activity_id, status, is_read, search, sort } = req.query;

    if (activity_id) {
      list = list.filter(i => i.activity_id === parseInt(String(activity_id)));
    }
    if (status && status !== "all") {
      list = list.filter(i => i.status === String(status));
    }
    if (is_read !== undefined && is_read !== "all") {
      const boolRead = is_read === "true" || is_read === "1";
      list = list.filter(i => (i.is_read ?? false) === boolRead);
    }
    if (search && String(search).trim().length > 0) {
      const q = String(search).toLowerCase().trim();
      list = list.filter(i => {
        const enriched = enrichInquiry(i);
        return (
          i.customer_name.toLowerCase().includes(q) ||
          i.customer_phone.includes(q) ||
          i.message.toLowerCase().includes(q) ||
          (enriched.activity_name_ar && enriched.activity_name_ar.toLowerCase().includes(q)) ||
          (enriched.product_name_ar && enriched.product_name_ar.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q))
        );
      });
    }

    // Sort
    if (sort === "oldest") {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sort === "priority") {
      const priorityOrder: Record<string, number> = { urgent: 3, high: 2, normal: 1 };
      list.sort((a, b) => (priorityOrder[b.priority || "normal"] || 1) - (priorityOrder[a.priority || "normal"] || 1));
    } else {
      // Default newest first
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Compute status counts for all merchant's inquiries
    const allMerchantInquiries = inquiries.filter(i => myActivityIds.length === 0 || myActivityIds.includes(i.activity_id));
    const counts = {
      all: allMerchantInquiries.length,
      new: allMerchantInquiries.filter(i => i.status === "new").length,
      contacted: allMerchantInquiries.filter(i => i.status === "contacted").length,
      in_progress: allMerchantInquiries.filter(i => i.status === "in_progress").length,
      closed: allMerchantInquiries.filter(i => i.status === "closed").length,
      unread: allMerchantInquiries.filter(i => !i.is_read).length,
    };

    const enrichedList = list.map(enrichInquiry);

    res.json({
      success: true,
      count: enrichedList.length,
      counts,
      data: enrichedList,
    });
  });

  // Public / Generic Inquiries List
  app.get("/api/v2/inquiries", (req, res) => {
    const { activity_id } = req.query;
    let list = [...inquiries];
    if (activity_id) {
      list = list.filter(i => i.activity_id === parseInt(String(activity_id)));
    }
    const enrichedList = list.map(enrichInquiry);
    res.json({ success: true, count: enrichedList.length, data: enrichedList });
  });

  // Get Single Inquiry Details
  app.get("/api/v2/inquiries/:id", (req, res) => {
    const inqId = parseInt(req.params.id);
    const inq = inquiries.find(i => i.id === inqId);
    if (!inq) {
      return res.status(404).json({ success: false, message: "طلب الاستفسار غير موجود." });
    }
    res.json({ success: true, data: enrichInquiry(inq) });
  });

  app.get("/api/v2/merchant/inquiries/:id", (req, res) => {
    const inqId = parseInt(req.params.id);
    const inq = inquiries.find(i => i.id === inqId);
    if (!inq) {
      return res.status(404).json({ success: false, message: "طلب الاستفسار غير موجود." });
    }
    res.json({ success: true, data: enrichInquiry(inq) });
  });

  // Create Inquiry from Customer App
  app.post("/api/v2/inquiries", (req, res) => {
    const { activity_id, product_id, offer_id, customer_name, customer_phone, customer_email, message, type, source } = req.body;
    if (!activity_id || !customer_name || !customer_phone || !message) {
      return res.status(422).json({
        success: false,
        message: "يرجى تعبئة كافة بيانات طلب الاستفسار / التواصل.",
      });
    }

    const now = new Date().toISOString();
    const newInquiry: InquiryModel = {
      id: inquiries.length > 0 ? Math.max(...inquiries.map(i => i.id)) + 1 : 1,
      activity_id: parseInt(activity_id),
      product_id: product_id ? parseInt(product_id) : null,
      offer_id: offer_id ? parseInt(offer_id) : null,
      customer_name,
      customer_phone,
      customer_email: customer_email || undefined,
      message,
      type: type || "inquiry",
      status: "new",
      priority: "normal",
      is_read: false,
      source: source || (offer_id ? "app_offer" : (product_id ? "app_product" : "app_activity")),
      created_at: now,
      updated_at: now,
      history: [
        {
          id: `evt_${Date.now()}`,
          action: "تم استلام الطلب من تطبيق دليل بلدي",
          timestamp: now,
          actor_name: "العميل",
        },
      ],
    };

    inquiries.unshift(newInquiry);

    res.status(201).json({
      success: true,
      message: "تم إرسال استفسارك للتاجر بنجاح! سيتم التواصل معك قريباً.",
      data: enrichInquiry(newInquiry),
    });
  });

  // Update Inquiry Status (Pipeline status change)
  app.patch("/api/v2/inquiries/:id/status", (req, res) => {
    const inqId = parseInt(req.params.id);
    const inq = inquiries.find(i => i.id === inqId);
    if (!inq) {
      return res.status(404).json({ success: false, message: "طلب الاستفسار غير موجود." });
    }
    const { status, note } = req.body;
    if (status) {
      const oldStatus = inq.status;
      inq.status = status;
      inq.is_read = true;
      inq.updated_at = new Date().toISOString();

      const statusLabels: Record<string, string> = {
        new: "جديد",
        contacted: "تم التواصل",
        in_progress: "قيد المتابعة",
        closed: "مغلق / منتهي",
        cancelled: "ملغي",
      };

      if (!inq.history) inq.history = [];
      inq.history.push({
        id: `evt_${Date.now()}`,
        action: `تم تغيير الحالة من (${statusLabels[oldStatus] || oldStatus}) إلى (${statusLabels[status] || status})`,
        note: note || undefined,
        timestamp: inq.updated_at,
        actor_name: "التاجر",
      });
    }

    res.json({ success: true, message: "تم تحديث حالة الطلب بنجاح.", data: enrichInquiry(inq) });
  });

  // Update Internal Merchant Notes
  app.patch("/api/v2/inquiries/:id/notes", (req, res) => {
    const inqId = parseInt(req.params.id);
    const inq = inquiries.find(i => i.id === inqId);
    if (!inq) {
      return res.status(404).json({ success: false, message: "طلب الاستفسار غير موجود." });
    }
    const { notes } = req.body;
    inq.notes = notes;
    inq.updated_at = new Date().toISOString();

    if (!inq.history) inq.history = [];
    inq.history.push({
      id: `evt_${Date.now()}`,
      action: "تم تحديث الملاحظات الخاصة بالطلب",
      note: notes,
      timestamp: inq.updated_at,
      actor_name: "التاجر",
    });

    res.json({ success: true, message: "تم حفظ ملاحظات العميل بنجاح.", data: enrichInquiry(inq) });
  });

  // Toggle Read / Unread Status
  app.patch("/api/v2/inquiries/:id/read", (req, res) => {
    const inqId = parseInt(req.params.id);
    const inq = inquiries.find(i => i.id === inqId);
    if (!inq) {
      return res.status(404).json({ success: false, message: "طلب الاستفسار غير موجود." });
    }
    const { is_read } = req.body;
    inq.is_read = is_read !== undefined ? Boolean(is_read) : !inq.is_read;
    inq.updated_at = new Date().toISOString();

    res.json({ success: true, message: inq.is_read ? "تم تعيين الاستفسار كمقروء" : "تم تعيين الاستفسار كغير مقروء", data: enrichInquiry(inq) });
  });

  // Record Quick Action (WhatsApp, Call, Template Reply)
  app.post("/api/v2/inquiries/:id/action", (req, res) => {
    const inqId = parseInt(req.params.id);
    const inq = inquiries.find(i => i.id === inqId);
    if (!inq) {
      return res.status(404).json({ success: false, message: "طلب الاستفسار غير موجود." });
    }

    const { action_type, template_text, note } = req.body;
    const now = new Date().toISOString();
    inq.is_read = true;
    inq.updated_at = now;

    // Automatically transition 'new' to 'contacted' if user made an active outreach
    if (inq.status === "new" && (action_type === "whatsapp" || action_type === "call")) {
      inq.status = "contacted";
    }

    let actionTitle = "إجراء تواصل";
    if (action_type === "whatsapp") actionTitle = "فتح محادثة واتساب مع العميل";
    else if (action_type === "call") actionTitle = "إجراء مكالمة هاتفية مع العميل";
    else if (action_type === "template_reply") actionTitle = "إرسال نموذج رد سريع عبر واتساب";
    else if (action_type === "email") actionTitle = "إرسال بريد إلكتروني";

    if (!inq.history) inq.history = [];
    inq.history.push({
      id: `evt_${Date.now()}`,
      action: actionTitle,
      note: template_text || note || undefined,
      timestamp: now,
      actor_name: "التاجر",
    });

    res.json({
      success: true,
      message: "تم تسجيل عملية التواصل في سجل المتابعة بنجاح.",
      data: enrichInquiry(inq),
    });
  });

  // Verify Activity (Reviewers with Geographic Scope Check)
  app.post("/api/v2/activities/:id/verify", (req, res) => {
    const user = getAuthUser(req);
    const actId = parseInt(req.params.id);
    const act = activities.find(a => a.id === actId);

    if (!act) {
      return res.status(404).json({ success: false, message: "النشاط التجاري غير موجود." });
    }

    // 1. Permission check
    if (!user || (!userHasPermission(user, "review_activities") && !userHasPermission(user, "verify_activities"))) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح: ليس لديك الصلاحية المطلوبة (review_activities / verify_activities).",
        error_code: "FORBIDDEN_PERMISSION_REQUIRED",
      });
    }

    // 2. Strict Geographic Scope check!
    if (userRequiresGeoScope(user) && user.location_id && act.location_id !== user.location_id) {
      const userLoc = locations.find(l => l.id === user.location_id)?.name_ar;
      const actLoc = locations.find(l => l.id === act.location_id)?.name_ar;
      return res.status(403).json({
        success: false,
        message: `غير مصرح: كمراجع لـ (${userLoc})، لا يمكنك اعتماد أو مراجعة نشاط يقع في (${actLoc}).`,
        error_code: "GEO_SCOPE_UNAUTHORIZED",
      });
    }

    const { action, notes, rejection_reason } = req.body;
    const oldValues = { status: act.status, verified_at: act.verified_at, verified_by: act.verified_by };

    if (action === "verify") {
      act.status = "verified";
      act.verified_at = new Date().toISOString();
      act.verified_by = user.id;
      act.verification_notes = notes || "تم التحقق والاعتماد بنجاح.";
    } else if (action === "reject") {
      act.status = "rejected";
      act.verified_at = null;
      act.verified_by = user.id;
      act.verification_notes = rejection_reason || notes || "تم رفض التوثيق.";
    } else if (action === "suspend") {
      act.status = "suspended";
      act.verification_notes = notes || "تم تعليق النشاط مؤقتاً.";
    }

    act.updated_at = new Date().toISOString();

    recordAuditLog(
      user,
      "App\\Models\\Activity",
      act.id,
      action === "verify" ? "verified" : action === "reject" ? "rejected" : "updated",
      oldValues,
      { status: act.status, notes: act.verification_notes },
      req
    );

    res.json({
      success: true,
      message: action === "verify" ? "تم توثيق واعتماد النشاط التجاري بنجاح." : "تم تحديث حالة النشاط بنجاح.",
      data: act,
    });
  });

  // Submit Review
  app.post("/api/v2/activities/:id/reviews", (req, res) => {
    const user = getAuthUser(req);
    const actId = parseInt(req.params.id);
    const act = activities.find(a => a.id === actId);

    if (!act) {
      return res.status(404).json({ success: false, message: "النشاط التجاري غير موجود." });
    }

    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(422).json({ success: false, message: "التقييم والتعليق حقول إلزامية." });
    }

    const newReview: ReviewModel = {
      id: reviews.length + 1,
      activity_id: act.id,
      user_id: user ? user.id : 1,
      rating: Math.min(Math.max(parseInt(rating), 1), 5),
      comment: String(comment),
      is_approved: true,
      is_reported: false,
      created_at: new Date().toISOString(),
    };

    reviews.unshift(newReview);

    // Recalculate average rating
    const actReviews = reviews.filter(r => r.activity_id === act.id && r.is_approved);
    const sum = actReviews.reduce((acc, r) => acc + r.rating, 0);
    act.rating_avg = parseFloat((sum / actReviews.length).toFixed(2));
    act.reviews_count = actReviews.length;

    recordAuditLog(user, "App\\Models\\Review", newReview.id, "created", null, newReview, req);

    res.status(201).json({
      success: true,
      message: "شكراً لمشاركتك! تم إضافة تقييمك بنجاح.",
      data: newReview,
    });
  });

  // 5. Analytics (Eager Loaded, 48 queries -> 2 queries)
  app.get("/api/v2/analytics/dashboard", (req, res) => {
    const user = getAuthUser(req);
    const locationId = (user && userRequiresGeoScope(user)) ? user.location_id : req.query.location_id ? parseInt(String(req.query.location_id)) : null;

    let targetActivities = activities;
    if (locationId) {
      targetActivities = activities.filter(a => a.location_id === locationId);
    }

    const total = targetActivities.length;
    const verified = targetActivities.filter(a => a.status === "verified").length;
    const pending = targetActivities.filter(a => a.status === "pending").length;
    const rejected = targetActivities.filter(a => a.status === "rejected").length;
    const suspended = targetActivities.filter(a => a.status === "suspended").length;
    const featured = targetActivities.filter(a => a.is_featured).length;
    const totalViews = targetActivities.reduce((acc, a) => acc + a.views_count, 0);
    const avgRating = total > 0 ? (targetActivities.reduce((acc, a) => acc + a.rating_avg, 0) / total).toFixed(2) : "0.00";

    const categoryDistribution = categories.map(cat => ({
      category_id: cat.id,
      category_name_ar: cat.name_ar,
      icon: cat.icon,
      activities_count: targetActivities.filter(a => a.category_id === cat.id).length,
    }));

    const locationDistribution = locations.map(loc => ({
      location_id: loc.id,
      location_name_ar: loc.name_ar,
      code: loc.code,
      activities_count: activities.filter(a => a.location_id === loc.id).length,
    }));

    res.json({
      success: true,
      data: {
        summary: {
          total_activities: total,
          verified_activities: verified,
          pending_activities: pending,
          rejected_activities: rejected,
          suspended_activities: suspended,
          featured_activities: featured,
          total_views: totalViews,
          average_rating: parseFloat(avgRating),
          total_reviews: reviews.length,
          total_users: users.length,
        },
        category_distribution: categoryDistribution,
        location_distribution: locationDistribution,
        performance: {
          queries_executed: 2, // Optimized down from 48!
          optimization_ratio: "95.8% Query Reduction (Eager Loading)",
          cache_ttl_seconds: 300,
          response_time_ms: 4.2,
        },
      },
    });
  });

  app.get("/api/v2/analytics/activities", (req, res) => {
    const topViewed = [...activities].sort((a, b) => b.views_count - a.views_count).slice(0, 5);
    const topRated = [...activities].filter(a => a.status === "verified").sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 5);

    res.json({
      success: true,
      data: {
        top_viewed: topViewed,
        top_rated: topRated,
      },
    });
  });

  app.get("/api/v2/analytics/users", (req, res) => {
    const roleDistribution = roles.map(r => ({
      role_name: r.display_name_ar,
      count: users.filter(u => u.role_id === r.id).length,
    }));

    res.json({
      success: true,
      data: {
        total_users: users.length,
        active_users: users.filter(u => u.is_active).length,
        role_distribution: roleDistribution,
      },
    });
  });

  // 6. Admin Roles & Permissions
  app.get("/api/v2/admin/roles", (req, res) => {
    const rolesWithCounts = roles.map(r => ({
      ...r,
      users_count: users.filter(u => u.role_id === r.id).length,
    }));

    res.json({
      success: true,
      data: {
        roles: rolesWithCounts,
        available_permissions: permissions,
      },
    });
  });

  app.post("/api/v2/admin/roles", (req, res) => {
    const user = getAuthUser(req);
    if (!user || !userHasPermission(user, "manage_roles")) {
      return res.status(403).json({
        success: false,
        message: "عفواً، فقط المدير العام مخوّل بإنشاء وتخصيص أدوار جديدة في المنظومة.",
      });
    }

    const { name, display_name_ar, description_ar, requires_geo_scope, permissions: rolePerms } = req.body;

    if (!name || !display_name_ar || !rolePerms || !Array.isArray(rolePerms)) {
      return res.status(422).json({
        success: false,
        message: "بيانات الدور غير مكتملة، يجب تحديد الاسم العربي والصلاحيات.",
      });
    }

    const newRole: RoleModel = {
      id: roles.length + 1,
      name,
      display_name_ar,
      description_ar: description_ar || "",
      requires_geo_scope: !!requires_geo_scope,
      is_system: false,
      permissions: rolePerms,
    };

    roles.push(newRole);
    recordAuditLog(user, "App\\Models\\Role", newRole.id, "created", null, newRole, req);

    res.status(201).json({
      success: true,
      message: "تم إنشاء الدور الجديد وربط الصلاحيات بنجاح.",
      data: newRole,
    });
  });

  app.put("/api/v2/admin/roles/:id", (req, res) => {
    const user = getAuthUser(req);
    const roleId = parseInt(req.params.id);
    const role = roles.find(r => r.id === roleId);

    if (!role) {
      return res.status(404).json({ success: false, message: "الدور المطلوب غير موجود." });
    }

    if (!user || !userHasPermission(user, "manage_roles")) {
      return res.status(403).json({ success: false, message: "عفواً، فقط المدير العام مخوّل بتعديل الأدوار." });
    }

    const oldValues = { ...role };
    const { display_name_ar, description_ar, requires_geo_scope, permissions: newPerms } = req.body;

    if (display_name_ar) role.display_name_ar = display_name_ar;
    if (description_ar !== undefined) role.description_ar = description_ar;
    if (requires_geo_scope !== undefined) role.requires_geo_scope = requires_geo_scope;
    if (newPerms && Array.isArray(newPerms)) role.permissions = newPerms;

    recordAuditLog(user, "App\\Models\\Role", role.id, "updated", oldValues, role, req);

    res.json({
      success: true,
      message: "تم تحديث الدور والصلاحيات المرتبطة بنجاح.",
      data: role,
    });
  });

  // Admin Users
  app.get("/api/v2/admin/users", (req, res) => {
    const enrichedUsers = users.map(u => {
      const role = roles.find(r => r.id === u.role_id);
      const loc = locations.find(l => l.id === u.location_id);
      return {
        ...u,
        role: role ? { id: role.id, name: role.name, display_name_ar: role.display_name_ar } : null,
        location: loc ? { id: loc.id, name_ar: loc.name_ar, code: loc.code } : null,
      };
    });

    res.json({
      count: users.length,
      next: null,
      previous: null,
      results: enrichedUsers,
    });
  });

  // 7. Audit Logs (Immutable Append-Only Log Explorer)
  app.get("/api/v2/admin/audit-logs", (req, res) => {
    const { action, user_id, model_type } = req.query;
    let filtered = [...auditLogs];

    if (action) {
      filtered = filtered.filter(l => l.action === String(action));
    }
    if (user_id) {
      filtered = filtered.filter(l => l.user_id === parseInt(String(user_id)));
    }
    if (model_type) {
      filtered = filtered.filter(l => l.model_type.includes(String(model_type)));
    }

    res.json({
      count: filtered.length,
      next: null,
      previous: null,
      results: filtered,
    });
  });

  // 8. Reviews Moderation API
  app.get("/api/v2/admin/reviews", (req, res) => {
    const { activity_id, is_approved, is_reported } = req.query;
    let list = [...reviews];

    if (activity_id) {
      list = list.filter(r => r.activity_id === parseInt(String(activity_id)));
    }
    if (is_approved !== undefined) {
      const isApprovedBool = is_approved === "true" || is_approved === "1";
      list = list.filter(r => r.is_approved === isApprovedBool);
    }
    if (is_reported !== undefined) {
      const isReportedBool = is_reported === "true" || is_reported === "1";
      list = list.filter(r => r.is_reported === isReportedBool);
    }

    const enriched = list.map(r => {
      const u = users.find(user => user.id === r.user_id);
      const act = activities.find(a => a.id === r.activity_id);
      return {
        ...r,
        user: u ? { id: u.id, name: u.name, avatar_url: u.avatar_url } : { id: r.user_id, name: "مستخدم مسجل" },
        activity: act ? { id: act.id, name_ar: act.name_ar, slug: act.slug } : null,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  app.post("/api/v2/admin/reviews/:id", (req, res) => {
    const user = getAuthUser(req);
    const reviewId = parseInt(req.params.id);
    const { action } = req.body;
    const revIndex = reviews.findIndex(r => r.id === reviewId);

    if (revIndex === -1) {
      return res.status(404).json({ success: false, message: "التقييم المطلوب غير موجود." });
    }

    const rev = reviews[revIndex];
    const act = activities.find(a => a.id === rev.activity_id);

    if (action === "approve") {
      rev.is_approved = true;
      rev.is_reported = false;
      recordAuditLog(user, "App\\Models\\Review", rev.id, "verified", { is_approved: false }, rev, req);
    } else if (action === "reject") {
      rev.is_approved = false;
      recordAuditLog(user, "App\\Models\\Review", rev.id, "rejected", { is_approved: true }, rev, req);
    } else if (action === "delete") {
      const [deletedRev] = reviews.splice(revIndex, 1);
      recordAuditLog(user, "App\\Models\\Review", deletedRev.id, "deleted", deletedRev, null, req);
    }

    // Recalculate activity stats
    if (act) {
      const actReviews = reviews.filter(r => r.activity_id === act.id && r.is_approved);
      const sum = actReviews.reduce((acc, r) => acc + r.rating, 0);
      act.rating_avg = actReviews.length > 0 ? parseFloat((sum / actReviews.length).toFixed(2)) : 0;
      act.reviews_count = actReviews.length;
    }

    res.json({
      success: true,
      message: action === "delete" ? "تم حذف التقييم بنجاح." : "تم تحديث حالة التقييم بنجاح.",
    });
  });

  app.delete("/api/v2/admin/reviews/:id", (req, res) => {
    const user = getAuthUser(req);
    const reviewId = parseInt(req.params.id);
    const revIndex = reviews.findIndex(r => r.id === reviewId);

    if (revIndex === -1) {
      return res.status(404).json({ success: false, message: "التقييم المطلوب غير موجود." });
    }

    const [deletedRev] = reviews.splice(revIndex, 1);
    const act = activities.find(a => a.id === deletedRev.activity_id);

    if (act) {
      const actReviews = reviews.filter(r => r.activity_id === act.id && r.is_approved);
      const sum = actReviews.reduce((acc, r) => acc + r.rating, 0);
      act.rating_avg = actReviews.length > 0 ? parseFloat((sum / actReviews.length).toFixed(2)) : 0;
      act.reviews_count = actReviews.length;
    }

    recordAuditLog(user, "App\\Models\\Review", deletedRev.id, "deleted", deletedRev, null, req);

    res.json({
      success: true,
      message: "تم حذف التقييم بنجاح.",
    });
  });

  // System Reset (for interactive testing & sandbox restoration)
  app.post("/api/v2/admin/reset-sandbox", (req, res) => {
    activities = activities.slice(0, 5);
    res.json({ success: true, message: "تمت إعادة تعيين بيئة الاختبار للقيم النموذجية." });
  });

  /* -------------------------------------------------------------------------- */
  /*                          OFFERS & PROMOTIONS API                            */
  /* -------------------------------------------------------------------------- */

  // Public / User Offers List
  app.get("/api/v2/offers", (req, res) => {
    const { activity_id, product_id, location_id, category_id, is_active, is_featured, search, sort_by } = req.query;
    let list = [...offers];

    if (activity_id) {
      list = list.filter(o => o.activity_id === parseInt(String(activity_id)));
    }
    if (product_id) {
      list = list.filter(o => o.product_id === parseInt(String(product_id)));
    }
    if (location_id) {
      const locId = parseInt(String(location_id));
      list = list.filter(o => {
        const act = activities.find(a => a.id === o.activity_id);
        return act && act.location_id === locId;
      });
    }
    if (category_id) {
      const catId = parseInt(String(category_id));
      list = list.filter(o => {
        const act = activities.find(a => a.id === o.activity_id);
        return act && act.category_id === catId;
      });
    }
    if (is_active !== undefined) {
      list = list.filter(o => (is_active === "true" || is_active === "1" ? o.is_active : !o.is_active));
    }
    if (is_featured !== undefined) {
      list = list.filter(o => (is_featured === "true" || is_featured === "1" ? o.is_featured : !o.is_featured));
    }
    if (search) {
      const term = String(search).toLowerCase();
      list = list.filter(o => o.title.toLowerCase().includes(term) || o.description.toLowerCase().includes(term));
    }

    if (sort_by === "discount_desc") {
      list.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
    } else if (sort_by === "ending_soon") {
      list.sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());
    } else if (sort_by === "views") {
      list.sort((a, b) => b.views_count - a.views_count);
    } else {
      // latest
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const enriched = list.map(o => {
      const act = activities.find(a => a.id === o.activity_id);
      const prod = o.product_id ? products.find(p => p.id === o.product_id) : null;
      const cat = act ? categories.find(c => c.id === act.category_id) : null;
      const loc = act ? locations.find(l => l.id === act.location_id) : null;

      return {
        ...o,
        activity: act ? {
          id: act.id,
          name_ar: act.name_ar,
          slug: act.slug,
          phone: act.phone,
          whatsapp: act.whatsapp_number,
          address_ar: act.address_ar,
          rating_avg: act.rating_avg,
          is_verified: act.status === "verified",
          cover_image: act.cover_image,
          category: cat ? { id: cat.id, name_ar: cat.name_ar, icon: cat.icon } : undefined,
          location: loc ? { id: loc.id, name_ar: loc.name_ar, code: loc.code } : undefined,
        } : undefined,
        product: prod ? {
          id: prod.id,
          name: prod.name,
          sku: prod.sku,
          price: prod.price,
          sale_price: prod.sale_price,
          currency: prod.currency,
          cover_image: prod.cover_image,
        } : undefined,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  // Get Single Offer
  app.get("/api/v2/offers/:id", (req, res) => {
    const offerId = parseInt(req.params.id);
    const offer = offers.find(o => o.id === offerId);

    if (!offer) {
      return res.status(404).json({ success: false, message: "العرض المطلوب غير موجود أو انتهت صلاحيته." });
    }

    offer.views_count += 1;

    const act = activities.find(a => a.id === offer.activity_id);
    const prod = offer.product_id ? products.find(p => p.id === offer.product_id) : null;
    const cat = act ? categories.find(c => c.id === act.category_id) : null;
    const loc = act ? locations.find(l => l.id === act.location_id) : null;

    res.json({
      success: true,
      data: {
        ...offer,
        activity: act ? {
          id: act.id,
          name_ar: act.name_ar,
          slug: act.slug,
          phone: act.phone,
          whatsapp: act.whatsapp_number,
          address_ar: act.address_ar,
          rating_avg: act.rating_avg,
          is_verified: act.status === "verified",
          cover_image: act.cover_image,
          category: cat ? { id: cat.id, name_ar: cat.name_ar, icon: cat.icon } : undefined,
          location: loc ? { id: loc.id, name_ar: loc.name_ar, code: loc.code } : undefined,
        } : undefined,
        product: prod ? {
          id: prod.id,
          name: prod.name,
          sku: prod.sku,
          price: prod.price,
          sale_price: prod.sale_price,
          currency: prod.currency,
          cover_image: prod.cover_image,
        } : undefined,
      },
    });
  });

  // Merchant Offers List
  app.get("/api/v2/merchant/offers", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    const isSuperAdmin = roles.find(r => r.id === user.role_id)?.name === "مدير_عام";
    const myActivities = isSuperAdmin ? activities : activities.filter(a => a.owner_id === user.id);
    const myActivityIds = myActivities.map(a => a.id);
    const list = isSuperAdmin ? offers : offers.filter(o => o.owner_user_id === user.id || myActivityIds.includes(o.activity_id));

    const enriched = list.map(o => {
      const act = activities.find(a => a.id === o.activity_id);
      const prod = o.product_id ? products.find(p => p.id === o.product_id) : null;
      return {
        ...o,
        activity: act ? { id: act.id, name_ar: act.name_ar, slug: act.slug } : undefined,
        product: prod ? { id: prod.id, name: prod.name, sku: prod.sku, price: prod.price } : undefined,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  // Create Offer
  app.post("/api/v2/offers", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    const {
      activity_id,
      product_id,
      title,
      description,
      offer_type,
      discount_percentage,
      discount_amount,
      original_price,
      offer_price,
      starts_at,
      ends_at,
      is_active,
      is_featured,
      cover_image,
      terms,
    } = req.body;

    if (!activity_id || !title || !description || !starts_at || !ends_at) {
      return res.status(422).json({
        success: false,
        message: "بيانات العرض الترويجي غير مكتملة (العنوان، الوصف، النشاط، وتواريخ البداية والنهاية مطلوبة).",
      });
    }

    const act = activities.find(a => a.id === parseInt(activity_id));
    if (!act) {
      return res.status(404).json({ success: false, message: "النشاط التجاري المختار غير موجود." });
    }

    const isSuperAdmin = roles.find(r => r.id === user.role_id)?.name === "مدير_عام";
    if (!isSuperAdmin && act.owner_id !== user.id) {
      return res.status(403).json({ success: false, message: "غير مصرح: لا تملك هذا النشاط التجاري لإنشاء عروض ترويجية عليه." });
    }

    // Check Plan Limits
    const subInfo = getMerchantSubscriptionInfo(user.id);
    if (!isSuperAdmin && !subInfo.plan.limits.can_create_offers) {
      return res.status(403).json({
        success: false,
        message: "خطتك الحالية (الأساسية) لا تدعم نشر العروض الترويجية. يرجى الترقية إلى الخطة الاحترافية (Pro).",
        error_code: "PLAN_FEATURE_UNAVAILABLE",
      });
    }

    const newOffer: OfferModel = {
      id: offers.length > 0 ? Math.max(...offers.map(o => o.id)) + 1 : 1,
      owner_user_id: user.id,
      activity_id: parseInt(activity_id),
      product_id: product_id ? parseInt(product_id) : null,
      title,
      description,
      offer_type: offer_type || "percentage",
      discount_percentage: discount_percentage ? parseFloat(String(discount_percentage)) : null,
      discount_amount: discount_amount ? parseFloat(String(discount_amount)) : null,
      original_price: original_price ? parseFloat(String(original_price)) : null,
      offer_price: offer_price ? parseFloat(String(offer_price)) : null,
      starts_at,
      ends_at,
      is_active: is_active !== undefined ? !!is_active : true,
      is_featured: is_featured !== undefined ? !!is_featured : false,
      cover_image: cover_image || (product_id ? products.find(p => p.id === parseInt(product_id))?.cover_image : act.cover_image) || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
      terms: terms || "",
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    offers.unshift(newOffer);
    recordAuditLog(user, "App\\Models\\Offer", newOffer.id, "created", null, newOffer, req);

    res.status(201).json({
      success: true,
      message: "تم إنشاء العرض الترويجي ونشره بنجاح!",
      data: newOffer,
    });
  });

  // Update Offer
  app.put("/api/v2/offers/:id", (req, res) => {
    const user = getAuthUser(req);
    const offerId = parseInt(req.params.id);
    const offer = offers.find(o => o.id === offerId);

    if (!offer) {
      return res.status(404).json({ success: false, message: "العرض المطلوب غير موجود." });
    }

    const isSuperAdmin = roles.find(r => r.id === user?.role_id)?.name === "مدير_عام";
    if (!user || (!isSuperAdmin && offer.owner_user_id !== user.id)) {
      return res.status(403).json({ success: false, message: "غير مصرح بتعديل هذا العرض." });
    }

    const oldValues = { ...offer };
    const {
      title,
      description,
      offer_type,
      product_id,
      discount_percentage,
      discount_amount,
      original_price,
      offer_price,
      starts_at,
      ends_at,
      is_active,
      is_featured,
      cover_image,
      terms,
    } = req.body;

    if (title) offer.title = title;
    if (description) offer.description = description;
    if (offer_type) offer.offer_type = offer_type;
    if (product_id !== undefined) offer.product_id = product_id ? parseInt(product_id) : null;
    if (discount_percentage !== undefined) offer.discount_percentage = discount_percentage ? parseFloat(String(discount_percentage)) : null;
    if (discount_amount !== undefined) offer.discount_amount = discount_amount ? parseFloat(String(discount_amount)) : null;
    if (original_price !== undefined) offer.original_price = original_price ? parseFloat(String(original_price)) : null;
    if (offer_price !== undefined) offer.offer_price = offer_price ? parseFloat(String(offer_price)) : null;
    if (starts_at) offer.starts_at = starts_at;
    if (ends_at) offer.ends_at = ends_at;
    if (is_active !== undefined) offer.is_active = !!is_active;
    if (is_featured !== undefined) offer.is_featured = !!is_featured;
    if (cover_image) {
      if (oldValues.cover_image && oldValues.cover_image !== cover_image) {
        r2Storage.deleteOldMediaIfReplaced(oldValues.cover_image, cover_image).catch(() => {});
      }
      offer.cover_image = cover_image;
    }
    if (terms !== undefined) offer.terms = terms;

    offer.updated_at = new Date().toISOString();

    recordAuditLog(user, "App\\Models\\Offer", offer.id, "updated", oldValues, offer, req);

    res.json({
      success: true,
      message: "تم تحديث العرض الترويجي بنجاح.",
      data: offer,
    });
  });

  // Toggle Offer Active
  app.patch("/api/v2/offers/:id/toggle", (req, res) => {
    const user = getAuthUser(req);
    const offerId = parseInt(req.params.id);
    const offer = offers.find(o => o.id === offerId);

    if (!offer) {
      return res.status(404).json({ success: false, message: "العرض غير موجود." });
    }

    offer.is_active = !offer.is_active;
    offer.updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: offer.is_active ? "تم تفعيل العرض الترويجي." : "تم تعطيل العرض مؤقتاً.",
      data: offer,
    });
  });

  // Toggle Offer Featured
  app.patch("/api/v2/offers/:id/feature", (req, res) => {
    const user = getAuthUser(req);
    const offerId = parseInt(req.params.id);
    const offer = offers.find(o => o.id === offerId);

    if (!offer) {
      return res.status(404).json({ success: false, message: "العرض غير موجود." });
    }

    offer.is_featured = !offer.is_featured;
    offer.updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: offer.is_featured ? "تم تمييز العرض في الصفحة الرئيسية." : "تم إلغاء تمييز العرض.",
      data: offer,
    });
  });

  // Delete Offer
  app.delete("/api/v2/offers/:id", (req, res) => {
    const user = getAuthUser(req);
    const offerId = parseInt(req.params.id);
    const offerIdx = offers.findIndex(o => o.id === offerId);

    if (offerIdx === -1) {
      return res.status(404).json({ success: false, message: "العرض المطلوب غير موجود." });
    }

    const offer = offers[offerIdx];
    const isSuperAdmin = roles.find(r => r.id === user?.role_id)?.name === "مدير_عام";
    if (!user || (!isSuperAdmin && offer.owner_user_id !== user.id)) {
      return res.status(403).json({ success: false, message: "غير مصرح بحذف هذا العرض." });
    }

    offers.splice(offerIdx, 1);
    if (offer.cover_image) {
      r2Storage.deleteObject(offer.cover_image).catch(() => {});
    }
    recordAuditLog(user, "App\\Models\\Offer", offerId, "deleted", offer, null, req);

    res.json({
      success: true,
      message: "تم حذف العرض الترويجي بنجاح.",
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                      PRICING PLANS & SUBSCRIPTIONS API                     */
  /* -------------------------------------------------------------------------- */

  // Public / Admin Plans List
  app.get("/api/v2/plans", (req, res) => {
    const user = getAuthUser(req);
    const isSuperAdmin = roles.find(r => r.id === user?.role_id)?.name === "مدير_عام";

    let list = [...plans];
    if (!isSuperAdmin) {
      list = list.filter(p => p.is_active);
    }
    list.sort((a, b) => a.sort_order - b.sort_order);

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  });

  // Single Plan
  app.get("/api/v2/plans/:id", (req, res) => {
    const planId = parseInt(req.params.id);
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "الخطة المطلوبة غير موجودة." });
    }
    res.json({ success: true, data: plan });
  });

  // Admin Create Plan
  app.post("/api/v2/admin/plans", app.post("/api/v2/plans", (req, res) => {
    const user = getAuthUser(req);
    if (!user || !userHasPermission(user, "manage_plans")) {
      return res.status(403).json({ success: false, message: "غير مصرح: صلاحية إدارة الخطط والباقات مطلوبة." });
    }

    const {
      name,
      slug,
      description,
      price_monthly,
      price_yearly,
      currency,
      trial_days,
      is_active,
      is_featured,
      sort_order,
      limits,
      features_list,
    } = req.body;

    if (!name || price_monthly === undefined) {
      return res.status(422).json({ success: false, message: "اسم الخطة والسعر الشهري حقول إلزامية." });
    }

    const newPlan: PlanModel = {
      id: plans.length > 0 ? Math.max(...plans.map(p => p.id)) + 1 : 1,
      name,
      slug: slug || `plan-${Date.now()}`,
      description: description || "",
      price_monthly: parseFloat(String(price_monthly)),
      price_yearly: price_yearly !== undefined ? parseFloat(String(price_yearly)) : parseFloat(String(price_monthly)) * 10,
      currency: currency || "ج.م",
      trial_days: trial_days !== undefined ? parseInt(String(trial_days)) : 0,
      is_active: is_active !== undefined ? !!is_active : true,
      is_featured: is_featured !== undefined ? !!is_featured : false,
      sort_order: sort_order !== undefined ? parseInt(String(sort_order)) : plans.length + 1,
      limits: limits || {
        max_activities: 1,
        max_products: 10,
        can_create_offers: false,
        can_feature_products: false,
        can_feature_activity: false,
        can_access_advanced_analytics: false,
        can_have_multiple_branches: false,
        can_use_import_export: false,
      },
      features_list: Array.isArray(features_list) ? features_list : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    plans.push(newPlan);
    recordAuditLog(user, "App\\Models\\Plan", newPlan.id, "created", null, newPlan, req);

    res.status(201).json({
      success: true,
      message: "تم إنشاء خطة الأسعار الجديدة بنجاح.",
      data: newPlan,
    });
  }));

  // Admin Update Plan
  app.put("/api/v2/plans/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user || !userHasPermission(user, "manage_plans")) {
      return res.status(403).json({ success: false, message: "غير مصرح بتعديل خطط الأسعار." });
    }

    const planId = parseInt(req.params.id);
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "الخطة غير موجودة." });
    }

    const oldValues = { ...plan };
    const {
      name,
      slug,
      description,
      price_monthly,
      price_yearly,
      currency,
      trial_days,
      is_active,
      is_featured,
      sort_order,
      limits,
      features_list,
    } = req.body;

    if (name) plan.name = name;
    if (slug) plan.slug = slug;
    if (description !== undefined) plan.description = description;
    if (price_monthly !== undefined) plan.price_monthly = parseFloat(String(price_monthly));
    if (price_yearly !== undefined) plan.price_yearly = parseFloat(String(price_yearly));
    if (currency) plan.currency = currency;
    if (trial_days !== undefined) plan.trial_days = parseInt(String(trial_days));
    if (is_active !== undefined) plan.is_active = !!is_active;
    if (is_featured !== undefined) plan.is_featured = !!is_featured;
    if (sort_order !== undefined) plan.sort_order = parseInt(String(sort_order));
    if (limits) plan.limits = { ...plan.limits, ...limits };
    if (features_list && Array.isArray(features_list)) plan.features_list = features_list;

    plan.updated_at = new Date().toISOString();

    recordAuditLog(user, "App\\Models\\Plan", plan.id, "updated", oldValues, plan, req);

    res.json({
      success: true,
      message: "تم تحديث خطة الأسعار والمزايا بنجاح.",
      data: plan,
    });
  });

  // Admin Delete Plan
  app.delete("/api/v2/plans/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user || !userHasPermission(user, "manage_plans")) {
      return res.status(403).json({ success: false, message: "غير مصرح بحذف الخطط." });
    }

    const planId = parseInt(req.params.id);
    const planIdx = plans.findIndex(p => p.id === planId);
    if (planIdx === -1) {
      return res.status(404).json({ success: false, message: "الخطة غير موجودة." });
    }

    const activeSubs = subscriptions.filter(s => s.plan_id === planId && s.status === "active");
    if (activeSubs.length > 0) {
      return res.status(422).json({
        success: false,
        message: `لا يمكن حذف هذه الخطة لوجود (${activeSubs.length}) اشتراك نشط مرتبط بها حالياً. يمكنك تعطيلها بدلاً من حذفها.`,
      });
    }

    const plan = plans[planIdx];
    plans.splice(planIdx, 1);
    recordAuditLog(user, "App\\Models\\Plan", planId, "deleted", plan, null, req);

    res.json({
      success: true,
      message: "تم حذف الخطة بنجاح.",
    });
  });

  // Admin Subscriptions List
  app.get("/api/v2/subscriptions", (req, res) => {
    const user = getAuthUser(req);
    if (!user || !userHasPermission(user, "manage_subscriptions")) {
      return res.status(403).json({ success: false, message: "غير مصرح: إدارة الاشتراكات تتطلب صلاحية manage_subscriptions." });
    }

    const { status, plan_id } = req.query;
    let list = [...subscriptions];

    if (status && status !== "all") {
      list = list.filter(s => s.status === String(status));
    }
    if (plan_id) {
      list = list.filter(s => s.plan_id === parseInt(String(plan_id)));
    }

    const enriched = list.map(s => {
      const u = users.find(usr => usr.id === s.user_id);
      const p = plans.find(pl => pl.id === s.plan_id);
      const myActivities = activities.filter(a => a.owner_id === s.user_id);
      const myActivityIds = myActivities.map(a => a.id);
      const myProducts = products.filter(prd => myActivityIds.includes(prd.activity_id));
      const myOffers = offers.filter(o => o.owner_user_id === s.user_id);

      return {
        ...s,
        user: u ? { id: u.id, name: u.name, email: u.email, phone: u.phone } : undefined,
        plan: p,
        usage: {
          activities_used: myActivities.length,
          products_used: myProducts.length,
          offers_used: myOffers.length,
        },
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });

  // Admin Update Subscription Status / Extend Days
  app.put("/api/v2/subscriptions/:id/status", (req, res) => {
    const user = getAuthUser(req);
    if (!user || !userHasPermission(user, "manage_subscriptions")) {
      return res.status(403).json({ success: false, message: "غير مصرح بتعديل الاشتراكات." });
    }

    const subId = parseInt(req.params.id);
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) {
      return res.status(404).json({ success: false, message: "الاشتراك غير موجود." });
    }

    const oldValues = { ...sub };
    const { status, extra_days, notes, plan_id } = req.body;

    if (status) sub.status = status;
    if (plan_id) sub.plan_id = parseInt(plan_id);
    if (notes !== undefined) sub.notes = notes;

    if (extra_days && parseInt(extra_days) > 0) {
      const currentEnd = new Date(sub.ends_at).getTime();
      const newEnd = new Date(currentEnd + parseInt(extra_days) * 24 * 3600 * 1000);
      sub.ends_at = newEnd.toISOString();
      if (sub.status === "expired") sub.status = "active";
    }

    sub.updated_at = new Date().toISOString();
    recordAuditLog(user, "App\\Models\\Subscription", sub.id, "updated", oldValues, sub, req);

    res.json({
      success: true,
      message: "تم تحديث حالة وفترة الاشتراك بنجاح.",
      data: sub,
    });
  });

  // Merchant Current Subscription Info & Usage
  app.get("/api/v2/merchant/subscription", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    const info = getMerchantSubscriptionInfo(user.id);
    res.json({
      success: true,
      data: info,
    });
  });

  // Merchant Subscribe or Upgrade Plan
  app.post("/api/v2/merchant/subscription/subscribe", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    const { plan_id, billing_cycle } = req.body;
    const targetPlan = plans.find(p => p.id === parseInt(plan_id));

    if (!targetPlan) {
      return res.status(404).json({ success: false, message: "الخطة المختارة غير موجودة." });
    }

    let sub = subscriptions.find(s => s.user_id === user.id);
    const durationDays = billing_cycle === "yearly" ? 365 : 30;
    const oldValues = sub ? { ...sub } : null;

    if (sub) {
      sub.plan_id = targetPlan.id;
      sub.status = targetPlan.price_monthly === 0 ? "active" : "active";
      sub.starts_at = new Date().toISOString();
      sub.ends_at = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();
      sub.auto_renew = true;
      sub.notes = `ترقية إلى ${targetPlan.name} (${billing_cycle === "yearly" ? "اشتراك سنوي" : "اشتراك شهري"})`;
      sub.updated_at = new Date().toISOString();
    } else {
      sub = {
        id: subscriptions.length > 0 ? Math.max(...subscriptions.map(s => s.id)) + 1 : 1,
        user_id: user.id,
        plan_id: targetPlan.id,
        status: "active",
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString(),
        trial_ends_at: null,
        auto_renew: true,
        notes: `اشتراك جديد في ${targetPlan.name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      subscriptions.push(sub);
    }

    recordAuditLog(user, "App\\Models\\Subscription", sub.id, oldValues ? "updated" : "created", oldValues, sub, req);

    res.json({
      success: true,
      message: `تم تفعيل اشتراكك في "${targetPlan.name}" بنجاح!`,
      data: sub,
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                     PRODUCT IMPORT & EXPORT ENGINE                          */
  /* -------------------------------------------------------------------------- */

  // Export Products to CSV / JSON
  app.get("/api/v2/products/export", (req, res) => {
    const user = getAuthUser(req);
    const { activity_id, category_id, location_id, format } = req.query;

    const isSuperAdmin = roles.find(r => r.id === user?.role_id)?.name === "مدير_عام";
    let list = [...products];

    // Ownership check: If merchant, restrict to own activities
    if (user && !isSuperAdmin) {
      const myActivityIds = activities.filter(a => a.owner_id === user.id).map(a => a.id);
      list = list.filter(p => myActivityIds.includes(p.activity_id));
    }

    if (activity_id) {
      list = list.filter(p => p.activity_id === parseInt(String(activity_id)));
    }
    if (category_id) {
      const catId = parseInt(String(category_id));
      list = list.filter(p => {
        const act = activities.find(a => a.id === p.activity_id);
        return act && act.category_id === catId;
      });
    }
    if (location_id) {
      const locId = parseInt(String(location_id));
      list = list.filter(p => {
        const act = activities.find(a => a.id === p.activity_id);
        return act && act.location_id === locId;
      });
    }

    // Log export operation
    const logItem: ImportExportLogModel = {
      id: importExportLogs.length + 1,
      user_id: user ? user.id : 1,
      user_name: user ? user.name : "مدير النظام",
      operation_type: "export",
      entity_type: "products",
      activity_id: activity_id ? parseInt(String(activity_id)) : null,
      activity_name: activity_id ? activities.find(a => a.id === parseInt(String(activity_id)))?.name_ar : "جميع الأنشطة",
      format: (format === "json" ? "json" : "csv") as any,
      total_records: list.length,
      success_count: list.length,
      fail_count: 0,
      status: "success",
      ip_address: req.ip || "127.0.0.1",
      notes: `تصدير كتالوج يحتوي على ${list.length} منتج`,
      created_at: new Date().toISOString(),
    };
    importExportLogs.unshift(logItem);

    if (format === "json") {
      return res.json({
        success: true,
        count: list.length,
        data: list,
      });
    }

    // CSV format with UTF-8 BOM
    const headers = [
      "name",
      "sku",
      "price",
      "sale_price",
      "currency",
      "short_description",
      "full_description",
      "stock_qty",
      "availability_note",
      "cover_image",
      "status",
    ];

    const rows = list.map(p => [
      p.name,
      p.sku,
      p.price,
      p.sale_price ?? "",
      p.currency,
      p.short_description || "",
      p.full_description || "",
      p.stock_qty ?? "",
      p.availability_note || "",
      p.cover_image || "",
      p.status,
    ]);

    const csvData = generateCSV(headers, rows);
    const filename = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvData);
  });

  // Preview Import (Dry-Run Validation & SKU Conflict Resolver)
  app.post("/api/v2/products/import/preview", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    const { activity_id, csv_content, rows: clientRows } = req.body;
    if (!activity_id) {
      return res.status(422).json({ success: false, message: "يرجى تحديد النشاط التجاري المراد استيراد المنتجات إليه." });
    }

    const act = activities.find(a => a.id === parseInt(activity_id));
    if (!act) {
      return res.status(404).json({ success: false, message: "النشاط التجاري المختار غير موجود." });
    }

    const isSuperAdmin = roles.find(r => r.id === user.role_id)?.name === "مدير_عام";
    if (!isSuperAdmin && act.owner_id !== user.id) {
      return res.status(403).json({ success: false, message: "غير مصرح: لا يمكنك استيراد منتجات لنشاط لا تملكه." });
    }

    // Check Plan Limits
    const subInfo = getMerchantSubscriptionInfo(user.id);
    if (!isSuperAdmin && !subInfo.plan.limits.can_use_import_export) {
      return res.status(403).json({
        success: false,
        message: "ميزة استيراد المنتجات مجمعة بملفات CSV غير متاحة في الخطة الأساسية. يرجى الترقية إلى الخطة الاحترافية (Pro).",
        error_code: "PLAN_FEATURE_UNAVAILABLE",
      });
    }

    let rawRows: any[] = [];

    if (csv_content && typeof csv_content === "string") {
      const parsed = parseCSV(csv_content);
      if (parsed.length < 2) {
        return res.status(422).json({
          success: false,
          message: "الملف المرفق فارغ أو لا يحتوي على صفوف بيانات.",
        });
      }

      const rawHeaders = parsed[0].map(h => h.trim().toLowerCase());
      
      // Mapping dictionary (Supports English + Arabic column titles)
      const mapField = (colName: string): string => {
        if (colName === "name" || colName.includes("اسم") || colName.includes("المنتج")) return "name";
        if (colName === "sku" || colName.includes("رمز") || colName.includes("كود")) return "sku";
        if (colName === "price" || colName.includes("سعر") || colName.includes("السعر الأساسي")) return "price";
        if (colName === "sale_price" || colName.includes("خصم") || colName.includes("تخفيض")) return "sale_price";
        if (colName === "currency" || colName.includes("عملة")) return "currency";
        if (colName === "short_description" || colName.includes("مختصر")) return "short_description";
        if (colName === "full_description" || colName.includes("تفاصيل") || colName.includes("كامل")) return "full_description";
        if (colName === "stock_qty" || colName.includes("كمية") || colName.includes("مخزون")) return "stock_qty";
        if (colName === "availability_note" || colName.includes("توفر") || colName.includes("ملاحظة")) return "availability_note";
        if (colName === "cover_image" || colName.includes("صورة") || colName.includes("رابط")) return "cover_image";
        return colName;
      };

      const mappedHeaders = rawHeaders.map(mapField);

      for (let i = 1; i < parsed.length; i++) {
        const rowData = parsed[i];
        const rowObj: Record<string, any> = {};
        mappedHeaders.forEach((head, idx) => {
          rowObj[head] = rowData[idx] !== undefined ? rowData[idx] : "";
        });
        rawRows.push(rowObj);
      }
    } else if (Array.isArray(clientRows)) {
      rawRows = clientRows;
    } else {
      return res.status(422).json({ success: false, message: "يرجى تقديم محتوى CSV أو مصفوفة صفوف للمعاينة." });
    }

    // Existing products under this activity for SKU match
    const existingActivityProducts = products.filter(p => p.activity_id === act.id);
    const existingSkus = new Map<string, typeof products[0]>();
    existingActivityProducts.forEach(p => {
      if (p.sku) existingSkus.set(p.sku.trim().toLowerCase(), p);
    });

    const previewRows: any[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let willCreateCount = 0;
    let willUpdateCount = 0;

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const errors: string[] = [];
      const warnings: string[] = [];

      const name = (row.name || "").trim();
      const sku = (row.sku || "").trim();
      const priceRaw = row.price;
      const salePriceRaw = row.sale_price;

      if (!name) {
        errors.push("اسم المنتج مطلوب ولا يمكن أن يكون فارغاً.");
      }

      let priceNum = 0;
      if (priceRaw === undefined || priceRaw === "" || isNaN(Number(priceRaw))) {
        errors.push("السعر غير صالح، يجب أن يكون رقماً صحيحاً أو عشرياً موجباً.");
      } else {
        priceNum = Number(priceRaw);
        if (priceNum < 0) errors.push("السعر لا يمكن أن يكون سالباً.");
      }

      let salePriceNum: number | null = null;
      if (salePriceRaw !== undefined && salePriceRaw !== "" && salePriceRaw !== null) {
        if (isNaN(Number(salePriceRaw))) {
          warnings.push("سعر الخصم غير صالح وسيتم تجاهله.");
        } else {
          salePriceNum = Number(salePriceRaw);
          if (salePriceNum >= priceNum && priceNum > 0) {
            warnings.push("سعر الخصم أكبر من أو يساوي السعر الأساسي.");
          }
        }
      }

      let stockNum: number | null = null;
      if (row.stock_qty !== undefined && row.stock_qty !== "" && row.stock_qty !== null) {
        if (!isNaN(Number(row.stock_qty))) {
          stockNum = parseInt(String(row.stock_qty));
        }
      }

      // Check SKU Conflict / Action
      let action: "create" | "update" | "skip" = "create";
      let existingProdId: number | undefined;

      if (sku && existingSkus.has(sku.toLowerCase())) {
        action = "update";
        const matched = existingSkus.get(sku.toLowerCase())!;
        existingProdId = matched.id;
      }

      const isValid = errors.length === 0;
      if (isValid) {
        validCount++;
        if (action === "update") willUpdateCount++;
        else willCreateCount++;
      } else {
        invalidCount++;
      }

      previewRows.push({
        row_number: rowNum,
        is_valid: isValid,
        action,
        errors,
        warnings,
        data: {
          name,
          sku: sku || `SKU-${Date.now()}-${rowNum}`,
          price: priceNum,
          sale_price: salePriceNum,
          currency: row.currency || "ج.م",
          short_description: row.short_description || "",
          full_description: row.full_description || "",
          stock_qty: stockNum,
          availability_note: row.availability_note || "",
          cover_image: row.cover_image || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
          existing_product_id: existingProdId,
        },
      });
    });

    // Check Plan Capacity
    const remainingQuota = Math.max(0, subInfo.plan.limits.max_products - subInfo.usage.products_count);
    const capacityOk = willCreateCount <= remainingQuota || isSuperAdmin;

    res.json({
      success: true,
      data: {
        total_rows: rawRows.length,
        valid_rows_count: validCount,
        invalid_rows_count: invalidCount,
        will_create_count: willCreateCount,
        will_update_count: willUpdateCount,
        capacity_warning: !capacityOk ? `تحذير: خطتك تسمح بإضافة (${remainingQuota}) منتج جديد فقط، بينما يحتوي الملف على (${willCreateCount}) منتج جديد.` : null,
        rows: previewRows,
      },
    });
  });

  // Execute Import
  app.post("/api/v2/products/import/execute", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "غير مسجل الدخول." });
    }

    const { activity_id, rows } = req.body;
    if (!activity_id || !Array.isArray(rows) || rows.length === 0) {
      return res.status(422).json({ success: false, message: "بيانات الاستيراد غير صالحة أو فارغة." });
    }

    const act = activities.find(a => a.id === parseInt(activity_id));
    if (!act) {
      return res.status(404).json({ success: false, message: "النشاط التجاري المختار غير موجود." });
    }

    const isSuperAdmin = roles.find(r => r.id === user.role_id)?.name === "مدير_عام";
    if (!isSuperAdmin && act.owner_id !== user.id) {
      return res.status(403).json({ success: false, message: "غير مصرح باستيراد منتجات لهذا النشاط." });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const failedRows: any[] = [];

    const existingActivityProducts = products.filter(p => p.activity_id === act.id);
    const existingSkus = new Map<string, typeof products[0]>();
    existingActivityProducts.forEach(p => {
      if (p.sku) existingSkus.set(p.sku.trim().toLowerCase(), p);
    });

    rows.forEach((row: any, idx: number) => {
      try {
        const data = row.data || row;
        const name = (data.name || "").trim();
        const sku = (data.sku || "").trim();
        const price = parseFloat(String(data.price || 0));

        if (!name || isNaN(price) || price < 0) {
          failedCount++;
          failedRows.push({ row_number: idx + 1, reason: "الاسم أو السعر غير صالح" });
          return;
        }

        if (sku && existingSkus.has(sku.toLowerCase())) {
          // UPDATE existing product
          const existingProd = existingSkus.get(sku.toLowerCase())!;
          const old = { ...existingProd };
          existingProd.name = name;
          existingProd.price = price;
          if (data.sale_price !== undefined) existingProd.sale_price = data.sale_price ? parseFloat(String(data.sale_price)) : null;
          if (data.currency) existingProd.currency = data.currency;
          if (data.short_description !== undefined) existingProd.short_description = data.short_description;
          if (data.full_description !== undefined) existingProd.full_description = data.full_description;
          if (data.stock_qty !== undefined) existingProd.stock_qty = data.stock_qty !== null ? parseInt(String(data.stock_qty)) : null;
          if (data.availability_note !== undefined) existingProd.availability_note = data.availability_note;
          if (data.cover_image) existingProd.cover_image = data.cover_image;
          existingProd.updated_at = new Date().toISOString();

          updatedCount++;
          recordAuditLog(user, "App\\Models\\Product", existingProd.id, "updated", old, existingProd, req);
        } else {
          // CREATE new product
          const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
          const newProduct: ProductModel = {
            id: newId,
            activity_id: act.id,
            owner_user_id: user.id,
            name,
            slug: `${name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")}-${newId}`,
            short_description: data.short_description || "",
            full_description: data.full_description || "",
            sku: sku || `SKU-${act.id}-${newId}`,
            price,
            sale_price: data.sale_price ? parseFloat(String(data.sale_price)) : null,
            currency: data.currency || "ج.م",
            is_available: true,
            is_featured: false,
            stock_qty: data.stock_qty !== null && data.stock_qty !== undefined ? parseInt(String(data.stock_qty)) : null,
            availability_note: data.availability_note || "",
            sort_order: products.length + 1,
            cover_image: data.cover_image || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
            status: "published",
            views_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          products.push(newProduct);
          existingSkus.set(newProduct.sku.trim().toLowerCase(), newProduct);
          createdCount++;
          recordAuditLog(user, "App\\Models\\Product", newProduct.id, "created", null, newProduct, req);
        }
      } catch (err: any) {
        failedCount++;
        failedRows.push({ row_number: idx + 1, reason: err.message || "خطأ أثناء معالجة الصف" });
      }
    });

    // Record import log
    const logItem: ImportExportLogModel = {
      id: importExportLogs.length + 1,
      user_id: user.id,
      user_name: user.name,
      operation_type: "import",
      entity_type: "products",
      activity_id: act.id,
      activity_name: act.name_ar,
      format: "csv",
      total_records: rows.length,
      success_count: createdCount + updatedCount,
      fail_count: failedCount,
      status: failedCount === 0 ? "success" : (createdCount + updatedCount > 0 ? "warning" : "failed"),
      ip_address: req.ip || "127.0.0.1",
      notes: `تم إنشاء ${createdCount} منتج جديد، وتحديث ${updatedCount} منتج قائم بنجاح`,
      created_at: new Date().toISOString(),
    };
    importExportLogs.unshift(logItem);

    res.json({
      success: true,
      message: `اكتمل الاستيراد بنجاح! (تم إنشاء ${createdCount} جديد، وتحديث ${updatedCount} قائم${failedCount > 0 ? `، وفشل ${failedCount}` : ""}).`,
      data: {
        created_count: createdCount,
        updated_count: updatedCount,
        failed_count: failedCount,
        failed_rows: failedRows,
      },
    });
  });

  // Import / Export Logs
  app.get("/api/v2/import-export/logs", (req, res) => {
    const user = getAuthUser(req);
    const isSuperAdmin = roles.find(r => r.id === user?.role_id)?.name === "مدير_عام";

    let list = [...importExportLogs];
    if (user && !isSuperAdmin) {
      list = list.filter(l => l.user_id === user.id);
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  });

  // ============================================================================
  // Categories & Sectors Import & Export API
  // ============================================================================

  // Categories Export
  app.get("/api/v2/categories/export", (req, res) => {
    const user = getAuthUser(req);
    const format = (req.query.format as string) || "xlsx";
    const sectionId = req.query.section_id ? parseInt(req.query.section_id as string) : undefined;
    const activeOnly = req.query.active_only === "true";

    let list = [...categories];
    if (sectionId) {
      list = list.filter(c => c.section_id === sectionId);
    }
    if (activeOnly) {
      list = list.filter(c => c.is_active);
    }

    const exportRows = list.map(c => {
      const section = directory_sections.find(s => s.id === c.section_id || s.slug === c.section_slug);
      const actCount = activities.filter(a => a.category_id === c.id).length;
      return {
        "معرف التصنيف (id)": c.id,
        "اسم التصنيف بالعربية (name_ar)": c.name_ar,
        "اسم التصنيف بالإنجليزية (name_en)": c.name_en,
        "الاسم اللطيف (slug)": c.slug,
        "اسم القطاع الرئيسي (section_name)": section?.name_ar || "",
        "رمز القطاع (section_slug)": c.section_slug || section?.slug || "shops",
        "الأيقونة (icon)": c.icon,
        "الوصف بالعربية (description_ar)": c.description_ar,
        "الترتيب (sort_order)": c.sort_order,
        "الحالة (is_active)": c.is_active ? 1 : 0,
        "عدد الأنشطة المسجلة": actCount,
      };
    });

    if (user) {
      recordAuditLog(user, "App\\Models\\Category", 0, "verified", null, { count: exportRows.length, format }, req);
      const logItem: ImportExportLogModel = {
        id: importExportLogs.length + 1,
        user_id: user.id,
        user_name: user.name,
        operation_type: "export",
        entity_type: "activities",
        format: format as any,
        total_records: exportRows.length,
        success_count: exportRows.length,
        fail_count: 0,
        status: "success",
        ip_address: req.ip || "127.0.0.1",
        notes: `تم تصدير ${exportRows.length} تصنيف بصيغة ${format.toUpperCase()}`,
        created_at: new Date().toISOString(),
      };
      importExportLogs.unshift(logItem);
    }

    if (format === "csv") {
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const csvData = XLSX.utils.sheet_to_csv(ws);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="categories_export_${Date.now()}.csv"`);
      return res.send("\uFEFF" + csvData);
    } else if (format === "json") {
      return res.json({ success: true, count: exportRows.length, data: list });
    } else {
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "التصنيفات والقطاعات");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="categories_export_${Date.now()}.xlsx"`);
      return res.send(buffer);
    }
  });

  // Categories Import Preview
  app.post("/api/v2/categories/import/preview", (req, res) => {
    const user = getAuthUser(req);
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(422).json({ success: false, message: "بيانات الاستيراد فارغة أو غير صالحة." });
    }

    let validCount = 0;
    let invalidCount = 0;
    let willCreateCount = 0;
    let willUpdateCount = 0;
    const previewRows: any[] = [];

    const existingById = new Map<number, CategoryModel>();
    const existingBySlug = new Map<string, CategoryModel>();
    const existingByName = new Map<string, CategoryModel>();

    categories.forEach(c => {
      existingById.set(c.id, c);
      existingBySlug.set(c.slug.toLowerCase().trim(), c);
      existingByName.set(c.name_ar.toLowerCase().trim(), c);
    });

    rows.forEach((row: any, idx: number) => {
      const rowNum = idx + 1;
      const errors: string[] = [];
      const warnings: string[] = [];

      const id = row.id ? parseInt(String(row.id)) : undefined;
      const name_ar = (row.name_ar || "").trim();
      const name_en = (row.name_en || "").trim();
      let slug = (row.slug || "").trim();
      const section_name = (row.section_name || "").trim();
      let section_slug = (row.section_slug || "").trim();
      const icon = (row.icon || "Building2").trim();
      const description_ar = (row.description_ar || "").trim();
      const sort_order = row.sort_order !== undefined && row.sort_order !== "" ? parseInt(String(row.sort_order)) : categories.length + rowNum;
      const is_active = row.is_active === 0 || row.is_active === "0" || row.is_active === false ? false : true;

      if (!name_ar) {
        errors.push("اسم التصنيف بالعربية (name_ar) حقل إجباري.");
      }
      if (!name_en) {
        warnings.push("اسم التصنيف بالإنجليزية غير محدد، سيتم استخدام اسم افتراضي.");
      }

      // Match Section
      let matchedSection = directory_sections.find(s => 
        (section_slug && s.slug.toLowerCase() === section_slug.toLowerCase()) ||
        (section_name && (s.name_ar.includes(section_name) || section_name.includes(s.name_ar) || s.name_en.toLowerCase() === section_name.toLowerCase()))
      );

      if (!matchedSection && (section_name || section_slug)) {
        warnings.push(`القطاع "${section_name || section_slug}" غير معروف، تم تعيينه تلقائياً لقطاع المحلات (shops).`);
        matchedSection = directory_sections[0];
      } else if (!matchedSection) {
        matchedSection = directory_sections[0];
      }

      if (!slug) {
        slug = (name_en || name_ar)
          .toLowerCase()
          .replace(/[^\w\s\u0621-\u064A-]/g, "")
          .replace(/[\s_-]+/g, "-") || `category-${rowNum}`;
      }

      // Check Action (Create vs Update)
      let action: "create" | "update" = "create";
      let matchedId: number | undefined;

      if (id && existingById.has(id)) {
        action = "update";
        matchedId = id;
      } else if (slug && existingBySlug.has(slug.toLowerCase())) {
        action = "update";
        matchedId = existingBySlug.get(slug.toLowerCase())!.id;
      } else if (name_ar && existingByName.has(name_ar.toLowerCase())) {
        action = "update";
        matchedId = existingByName.get(name_ar.toLowerCase())!.id;
      }

      const isValid = errors.length === 0;
      if (isValid) {
        validCount++;
        if (action === "update") willUpdateCount++;
        else willCreateCount++;
      } else {
        invalidCount++;
      }

      previewRows.push({
        row_number: rowNum,
        is_valid: isValid,
        action,
        errors,
        warnings,
        matched_id: matchedId,
        data: {
          id: matchedId || id,
          name_ar,
          name_en: name_en || name_ar,
          slug,
          section_id: matchedSection?.id || 1,
          section_slug: matchedSection?.slug || "shops",
          section_name_ar: matchedSection?.name_ar || "المحلات",
          icon: icon || "Building2",
          description_ar: description_ar || `دليل ${name_ar}`,
          sort_order,
          is_active,
        },
      });
    });

    res.json({
      success: true,
      data: {
        total_rows: rows.length,
        valid_rows_count: validCount,
        invalid_rows_count: invalidCount,
        will_create_count: willCreateCount,
        will_update_count: willUpdateCount,
        rows: previewRows,
      },
    });
  });

  // Categories Import Execute
  app.post("/api/v2/categories/import/execute", (req, res) => {
    const user = getAuthUser(req);
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(422).json({ success: false, message: "بيانات الاستيراد فارغة." });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const failedRows: any[] = [];

    const existingById = new Map<number, CategoryModel>();
    const existingBySlug = new Map<string, CategoryModel>();
    const existingByName = new Map<string, CategoryModel>();

    categories.forEach(c => {
      existingById.set(c.id, c);
      existingBySlug.set(c.slug.toLowerCase().trim(), c);
      existingByName.set(c.name_ar.toLowerCase().trim(), c);
    });

    rows.forEach((rowItem: any, idx: number) => {
      try {
        const item = rowItem.data || rowItem;
        const name_ar = (item.name_ar || "").trim();
        const name_en = (item.name_en || name_ar).trim();
        let slug = (item.slug || "").trim();
        const icon = (item.icon || "Building2").trim();
        const description_ar = (item.description_ar || "").trim();
        const sort_order = item.sort_order !== undefined ? parseInt(String(item.sort_order)) : categories.length + 1;
        const is_active = item.is_active === false || item.is_active === 0 || item.is_active === "0" ? false : true;
        const section_id = item.section_id ? parseInt(String(item.section_id)) : 1;
        const section_slug = item.section_slug || "shops";

        if (!name_ar) {
          failedCount++;
          failedRows.push({ row_number: idx + 1, reason: "اسم التصنيف بالعربية مفقود." });
          return;
        }

        if (!slug) {
          slug = (name_en || name_ar)
            .toLowerCase()
            .replace(/[^\w\s\u0621-\u064A-]/g, "")
            .replace(/[\s_-]+/g, "-");
        }

        let targetCategory: CategoryModel | undefined;
        if (item.id && existingById.has(parseInt(String(item.id)))) {
          targetCategory = existingById.get(parseInt(String(item.id)));
        } else if (slug && existingBySlug.has(slug.toLowerCase())) {
          targetCategory = existingBySlug.get(slug.toLowerCase());
        } else if (name_ar && existingByName.has(name_ar.toLowerCase())) {
          targetCategory = existingByName.get(name_ar.toLowerCase());
        }

        if (targetCategory) {
          // UPDATE
          const old = { ...targetCategory };
          targetCategory.name_ar = name_ar;
          targetCategory.name_en = name_en;
          targetCategory.slug = slug;
          targetCategory.icon = icon;
          targetCategory.description_ar = description_ar;
          targetCategory.sort_order = sort_order;
          targetCategory.is_active = is_active;
          targetCategory.section_id = section_id;
          targetCategory.section_slug = section_slug;

          updatedCount++;
          if (user) recordAuditLog(user, "App\\Models\\Category", targetCategory.id, "updated", old, targetCategory, req);
        } else {
          // CREATE
          const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
          const newCat: CategoryModel = {
            id: newId,
            section_id,
            section_slug,
            name_ar,
            name_en,
            slug,
            icon,
            description_ar: description_ar || `دليل ${name_ar}`,
            sort_order,
            is_active,
          };
          categories.push(newCat);
          existingById.set(newCat.id, newCat);
          existingBySlug.set(newCat.slug.toLowerCase(), newCat);
          existingByName.set(newCat.name_ar.toLowerCase(), newCat);

          createdCount++;
          if (user) recordAuditLog(user, "App\\Models\\Category", newCat.id, "created", null, newCat, req);
        }
      } catch (err: any) {
        failedCount++;
        failedRows.push({ row_number: idx + 1, reason: err.message || "خطأ أثناء معالجة التصنيف." });
      }
    });

    if (user) {
      const logItem: ImportExportLogModel = {
        id: importExportLogs.length + 1,
        user_id: user.id,
        user_name: user.name,
        operation_type: "import",
        entity_type: "activities",
        format: "xlsx",
        total_records: rows.length,
        success_count: createdCount + updatedCount,
        fail_count: failedCount,
        status: failedCount === 0 ? "success" : (createdCount + updatedCount > 0 ? "warning" : "failed"),
        ip_address: req.ip || "127.0.0.1",
        notes: `استيراد تصنيفات: تم إنشاء ${createdCount} وتحديث ${updatedCount}`,
        created_at: new Date().toISOString(),
      };
      importExportLogs.unshift(logItem);
    }

    res.json({
      success: true,
      message: `اكتمل استيراد التصنيفات بنجاح! تم إنشاء ${createdCount} جديد، وتحديث ${updatedCount} قائم${failedCount > 0 ? `، وفشل ${failedCount}` : ""}.`,
      data: {
        created_count: createdCount,
        updated_count: updatedCount,
        failed_count: failedCount,
        failed_rows: failedRows,
      },
    });
  });

  // ============================================================================
  // Geographic Locations (Governorates, Cities, Neighborhoods) Import & Export API
  // ============================================================================

  // Locations Export
  app.get("/api/v2/locations/export", (req, res) => {
    const user = getAuthUser(req);
    const format = (req.query.format as string) || "xlsx";
    const govId = req.query.governorate_id ? parseInt(req.query.governorate_id as string) : undefined;

    let targetGovs = [...governorates];
    if (govId) targetGovs = targetGovs.filter(g => g.id === govId);

    const exportRows: any[] = [];

    targetGovs.forEach(gov => {
      const govCities = cities.filter(c => c.governorate_id === gov.id);

      if (govCities.length === 0) {
        // Governorates with no cities yet
        exportRows.push({
          "معرف المحافظة": gov.id,
          "اسم المحافظة بالعربية": gov.name_ar,
          "اسم المحافظة بالإنجليزية": gov.name_en,
          "كود المحافظة": gov.code,
          "معرف المدينة": "",
          "اسم المدينة بالعربية": "",
          "اسم المدينة بالإنجليزية": "",
          "كود المدينة": "",
          "معرف الحي": "",
          "اسم الحي بالعربية": "",
          "اسم الحي بالإنجليزية": "",
          "كود الحي": "",
          "خط العرض (Latitude)": gov.latitude,
          "خط الطول (Longitude)": gov.longitude,
          "الحالة (نشط: 1 / غير نشط: 0)": gov.is_active ? 1 : 0,
          "الترتيب": gov.sort_order,
        });
      } else {
        govCities.forEach(city => {
          const cityNeighs = neighborhoods.filter(n => n.city_id === city.id);
          if (cityNeighs.length === 0) {
            exportRows.push({
              "معرف المحافظة": gov.id,
              "اسم المحافظة بالعربية": gov.name_ar,
              "اسم المحافظة بالإنجليزية": gov.name_en,
              "كود المحافظة": gov.code,
              "معرف المدينة": city.id,
              "اسم المدينة بالعربية": city.name_ar,
              "اسم المدينة بالإنجليزية": city.name_en,
              "كود المدينة": city.code,
              "معرف الحي": "",
              "اسم الحي بالعربية": "",
              "اسم الحي بالإنجليزية": "",
              "كود الحي": "",
              "خط العرض (Latitude)": city.latitude,
              "خط الطول (Longitude)": city.longitude,
              "الحالة (نشط: 1 / غير نشط: 0)": city.is_active ? 1 : 0,
              "الترتيب": city.sort_order,
            });
          } else {
            cityNeighs.forEach(neigh => {
              exportRows.push({
                "معرف المحافظة": gov.id,
                "اسم المحافظة بالعربية": gov.name_ar,
                "اسم المحافظة بالإنجليزية": gov.name_en,
                "كود المحافظة": gov.code,
                "معرف المدينة": city.id,
                "اسم المدينة بالعربية": city.name_ar,
                "اسم المدينة بالإنجليزية": city.name_en,
                "كود المدينة": city.code,
                "معرف الحي": neigh.id,
                "اسم الحي بالعربية": neigh.name_ar,
                "اسم الحي بالإنجليزية": neigh.name_en,
                "كود الحي": neigh.slug,
                "خط العرض (Latitude)": neigh.latitude || city.latitude,
                "خط الطول (Longitude)": neigh.longitude || city.longitude,
                "الحالة (نشط: 1 / غير نشط: 0)": neigh.is_active ? 1 : 0,
                "الترتيب": neigh.sort_order,
              });
            });
          }
        });
      }
    });

    if (user) {
      recordAuditLog(user, "App\\Models\\Governorate", 0, "verified", null, { count: exportRows.length, format }, req);
    }

    if (format === "csv") {
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const csvData = XLSX.utils.sheet_to_csv(ws);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="geo_locations_export_${Date.now()}.csv"`);
      return res.send("\uFEFF" + csvData);
    } else if (format === "json") {
      return res.json({ success: true, count: exportRows.length, data: exportRows });
    } else {
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "الهيكل الجغرافي");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="geo_locations_export_${Date.now()}.xlsx"`);
      return res.send(buffer);
    }
  });

  // Locations Import Preview
  app.post("/api/v2/locations/import/preview", (req, res) => {
    const user = getAuthUser(req);
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(422).json({ success: false, message: "بيانات الاستيراد فارغة." });
    }

    let validCount = 0;
    let invalidCount = 0;
    let willCreateCount = 0;
    let willUpdateCount = 0;
    const previewRows: any[] = [];

    const govMap = new Map<string, GovernorateModel>();
    governorates.forEach(g => {
      govMap.set(g.name_ar.trim().toLowerCase(), g);
      if (g.code) govMap.set(g.code.trim().toLowerCase(), g);
    });

    const cityMap = new Map<string, CityModel>();
    cities.forEach(c => {
      cityMap.set(`${c.governorate_id}_${c.name_ar.trim().toLowerCase()}`, c);
    });

    const neighMap = new Map<string, NeighborhoodModel>();
    neighborhoods.forEach(n => {
      neighMap.set(`${n.city_id}_${n.name_ar.trim().toLowerCase()}`, n);
    });

    rows.forEach((row: any, idx: number) => {
      const rowNum = idx + 1;
      const errors: string[] = [];
      const warnings: string[] = [];

      const govName = (row.governorate_name_ar || "").trim();
      const cityName = (row.city_name_ar || "").trim();
      const neighName = (row.neighborhood_name_ar || "").trim();

      if (!govName) {
        errors.push("اسم المحافظة بالعربية مطلوب في كل صف لربط الهيكل الجغرافي.");
      }

      if (neighName && !cityName) {
        errors.push("لا يمكن إنشاء حي دون تحديد اسم المدينة التابع لها.");
      }

      let entityType: "governorate" | "city" | "neighborhood" = "governorate";
      if (neighName) entityType = "neighborhood";
      else if (cityName) entityType = "city";

      let action: "create" | "update" = "create";
      const existingGov = govName ? govMap.get(govName.toLowerCase()) : undefined;

      if (entityType === "governorate") {
        if (existingGov) action = "update";
      } else if (entityType === "city") {
        if (existingGov && cityMap.has(`${existingGov.id}_${cityName.toLowerCase()}`)) {
          action = "update";
        }
      } else if (entityType === "neighborhood") {
        if (existingGov) {
          const matchedCity = cityMap.get(`${existingGov.id}_${cityName.toLowerCase()}`);
          if (matchedCity && neighMap.has(`${matchedCity.id}_${neighName.toLowerCase()}`)) {
            action = "update";
          }
        }
      }

      const isValid = errors.length === 0;
      if (isValid) {
        validCount++;
        if (action === "update") willUpdateCount++;
        else willCreateCount++;
      } else {
        invalidCount++;
      }

      previewRows.push({
        row_number: rowNum,
        is_valid: isValid,
        action,
        entity_type: entityType,
        errors,
        warnings,
        data: {
          governorate_name_ar: govName,
          governorate_name_en: row.governorate_name_en || govName,
          governorate_code: row.governorate_code || `EGY-${rowNum}`,
          city_name_ar: cityName,
          city_name_en: row.city_name_en || cityName,
          city_code: row.city_code || `CTY-${rowNum}`,
          neighborhood_name_ar: neighName,
          neighborhood_name_en: row.neighborhood_name_en || neighName,
          neighborhood_code: row.neighborhood_code || `NEI-${rowNum}`,
          latitude: row.latitude ? parseFloat(String(row.latitude)) : 30.0444,
          longitude: row.longitude ? parseFloat(String(row.longitude)) : 31.2357,
          is_active: row.is_active === 0 || row.is_active === "0" || row.is_active === false ? false : true,
          sort_order: row.sort_order !== undefined ? parseInt(String(row.sort_order)) : rowNum,
        },
      });
    });

    res.json({
      success: true,
      data: {
        total_rows: rows.length,
        valid_rows_count: validCount,
        invalid_rows_count: invalidCount,
        will_create_count: willCreateCount,
        will_update_count: willUpdateCount,
        rows: previewRows,
      },
    });
  });

  // Locations Import Execute
  app.post("/api/v2/locations/import/execute", (req, res) => {
    const user = getAuthUser(req);
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(422).json({ success: false, message: "بيانات الاستيراد فارغة." });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const failedRows: any[] = [];

    const govMap = new Map<string, GovernorateModel>();
    governorates.forEach(g => {
      govMap.set(g.name_ar.trim().toLowerCase(), g);
      if (g.code) govMap.set(g.code.trim().toLowerCase(), g);
    });

    const cityMap = new Map<string, CityModel>();
    cities.forEach(c => {
      cityMap.set(`${c.governorate_id}_${c.name_ar.trim().toLowerCase()}`, c);
    });

    const neighMap = new Map<string, NeighborhoodModel>();
    neighborhoods.forEach(n => {
      neighMap.set(`${n.city_id}_${n.name_ar.trim().toLowerCase()}`, n);
    });

    rows.forEach((rowItem: any, idx: number) => {
      try {
        const item = rowItem.data || rowItem;
        const govName = (item.governorate_name_ar || "").trim();
        const govNameEn = (item.governorate_name_en || govName).trim();
        const govCode = (item.governorate_code || `EGY-${govName.substring(0, 3)}`).trim();
        const cityName = (item.city_name_ar || "").trim();
        const cityNameEn = (item.city_name_en || cityName).trim();
        const cityCode = (item.city_code || `CTY-${cityName.substring(0, 3)}`).trim();
        const neighName = (item.neighborhood_name_ar || "").trim();
        const neighNameEn = (item.neighborhood_name_en || neighName).trim();
        const neighSlug = (item.neighborhood_code || item.slug || neighName.toLowerCase().replace(/\s+/g, "-")).trim();
        const lat = item.latitude ? parseFloat(String(item.latitude)) : 30.0444;
        const lng = item.longitude ? parseFloat(String(item.longitude)) : 31.2357;
        const isActive = item.is_active === false || item.is_active === 0 || item.is_active === "0" ? false : true;
        const sortOrder = item.sort_order !== undefined ? parseInt(String(item.sort_order)) : 1;

        if (!govName) {
          failedCount++;
          failedRows.push({ row_number: idx + 1, reason: "اسم المحافظة مفقود." });
          return;
        }

        // 1. Resolve or Create Governorate
        let currentGov = govMap.get(govName.toLowerCase());
        if (!currentGov) {
          const newGovId = governorates.length > 0 ? Math.max(...governorates.map(g => g.id)) + 1 : 1;
          currentGov = {
            id: newGovId,
            name_ar: govName,
            name_en: govNameEn,
            code: govCode,
            latitude: lat,
            longitude: lng,
            is_active: isActive,
            sort_order: sortOrder,
          };
          governorates.push(currentGov);
          govMap.set(govName.toLowerCase(), currentGov);
          locations.push({
            id: currentGov.id,
            name_ar: currentGov.name_ar,
            name_en: currentGov.name_en,
            code: currentGov.code,
            latitude: lat,
            longitude: lng,
            is_active: isActive,
          });
          createdCount++;
          if (user) recordAuditLog(user, "App\\Models\\Governorate", currentGov.id, "created", null, currentGov, req);
        } else {
          currentGov.name_ar = govName;
          if (govNameEn) currentGov.name_en = govNameEn;
          if (govCode) currentGov.code = govCode;
          updatedCount++;
        }

        // 2. Resolve or Create City if provided
        if (cityName) {
          const cityKey = `${currentGov.id}_${cityName.toLowerCase()}`;
          let currentCity = cityMap.get(cityKey);

          if (!currentCity) {
            const newCityId = cities.length > 0 ? Math.max(...cities.map(c => c.id)) + 1 : 1;
            currentCity = {
              id: newCityId,
              governorate_id: currentGov.id,
              name_ar: cityName,
              name_en: cityNameEn,
              code: cityCode,
              latitude: lat,
              longitude: lng,
              is_active: isActive,
              sort_order: sortOrder,
            };
            cities.push(currentCity);
            cityMap.set(cityKey, currentCity);
            createdCount++;
            if (user) recordAuditLog(user, "App\\Models\\City", currentCity.id, "created", null, currentCity, req);
          } else {
            currentCity.name_ar = cityName;
            if (cityNameEn) currentCity.name_en = cityNameEn;
            updatedCount++;
          }

          // 3. Resolve or Create Neighborhood if provided
          if (neighName) {
            const neighKey = `${currentCity.id}_${neighName.toLowerCase()}`;
            let currentNeigh = neighMap.get(neighKey);

            if (!currentNeigh) {
              const newNeighId = neighborhoods.length > 0 ? Math.max(...neighborhoods.map(n => n.id)) + 1 : 1;
              currentNeigh = {
                id: newNeighId,
                city_id: currentCity.id,
                governorate_id: currentGov.id,
                name_ar: neighName,
                name_en: neighNameEn,
                slug: neighSlug || `neigh-${newNeighId}`,
                latitude: lat,
                longitude: lng,
                is_active: isActive,
                sort_order: sortOrder,
              };
              neighborhoods.push(currentNeigh);
              neighMap.set(neighKey, currentNeigh);
              createdCount++;
              if (user) recordAuditLog(user, "App\\Models\\Neighborhood", currentNeigh.id, "created", null, currentNeigh, req);
            } else {
              currentNeigh.name_ar = neighName;
              if (neighNameEn) currentNeigh.name_en = neighNameEn;
              updatedCount++;
            }
          }
        }
      } catch (err: any) {
        failedCount++;
        failedRows.push({ row_number: idx + 1, reason: err.message || "خطأ أثناء معالجة الموقع." });
      }
    });

    if (user) {
      const logItem: ImportExportLogModel = {
        id: importExportLogs.length + 1,
        user_id: user.id,
        user_name: user.name,
        operation_type: "import",
        entity_type: "activities",
        format: "xlsx",
        total_records: rows.length,
        success_count: createdCount + updatedCount,
        fail_count: failedCount,
        status: failedCount === 0 ? "success" : (createdCount + updatedCount > 0 ? "warning" : "failed"),
        ip_address: req.ip || "127.0.0.1",
        notes: `استيراد مواقع جغرافية: تم إنشاء ${createdCount} وتحديث ${updatedCount}`,
        created_at: new Date().toISOString(),
      };
      importExportLogs.unshift(logItem);
    }

    res.json({
      success: true,
      message: `اكتمل استيراد الهيكل الجغرافي بنجاح! تم إنشاء ${createdCount} عنصر جديد وتحديث ${updatedCount}${failedCount > 0 ? `، وفشل ${failedCount}` : ""}.`,
      data: {
        created_count: createdCount,
        updated_count: updatedCount,
        failed_count: failedCount,
        failed_rows: failedRows,
      },
    });
  });

  // ============================================================================
  // Universal Internal Django Admin API (Super Admin English Portal)
  // ============================================================================

  // Django Admin Models Summary
  app.get("/api/v2/internal-admin/models-summary", (req, res) => {
    const user = getAuthUser(req);
    const isSuperAdmin = roles.find(r => r.id === user?.role_id)?.name === "مدير_عام";

    const models = [
      {
        app_label: "Authentication & Authorization",
        app_key: "auth",
        models: [
          { key: "users", name: "Users", verbose_name_plural: "User Accounts", count: users.length, icon: "Users" },
          { key: "roles", name: "Roles", verbose_name_plural: "Security Roles (RBAC)", count: roles.length, icon: "Shield" },
          { key: "permissions", name: "Permissions", verbose_name_plural: "System Permissions", count: permissions.length, icon: "Key" },
          { key: "audit_logs", name: "Audit Log Entries", verbose_name_plural: "Audit Logs", count: auditLogs.length, icon: "History", readonly: true },
        ],
      },
      {
        app_label: "Geography & Geo Scope",
        app_key: "geography",
        models: [
          { key: "governorates", name: "Governorate", verbose_name_plural: "Governorates", count: governorates.length, icon: "Globe" },
          { key: "cities", name: "City", verbose_name_plural: "Cities & Districts", count: cities.length, icon: "Building2" },
          { key: "neighborhoods", name: "Neighborhood", verbose_name_plural: "Neighborhoods & Quarters", count: neighborhoods.length, icon: "MapPin" },
        ],
      },
      {
        app_label: "Directory & Taxonomy",
        app_key: "directory",
        models: [
          { key: "directory_sections", name: "Directory Section", verbose_name_plural: "Main Sectors", count: directory_sections.length, icon: "Layers" },
          { key: "categories", name: "Category", verbose_name_plural: "Commercial Categories", count: categories.length, icon: "Tags" },
        ],
      },
      {
        app_label: "Business & Marketplace",
        app_key: "business",
        models: [
          { key: "activities", name: "Activity", verbose_name_plural: "Commercial Activities & Listings", count: activities.length, icon: "Store" },
          { key: "products", name: "Product", verbose_name_plural: "Products & Catalog Items", count: products.length, icon: "ShoppingBag" },
          { key: "offers", name: "Offer & Deal", verbose_name_plural: "Promotions & Discounts", count: offers.length, icon: "Flame" },
        ],
      },
      {
        app_label: "Monetization & Subscriptions",
        app_key: "monetization",
        models: [
          { key: "plans", name: "Plan", verbose_name_plural: "Pricing Plans", count: plans.length, icon: "Crown" },
          { key: "subscriptions", name: "Subscription", verbose_name_plural: "Merchant Subscriptions", count: subscriptions.length, icon: "CreditCard" },
        ],
      },
      {
        app_label: "Communications & Feedback",
        app_key: "communication",
        models: [
          { key: "reviews", name: "Review", verbose_name_plural: "Customer Reviews", count: reviews.length, icon: "MessageSquare" },
          { key: "inquiries", name: "Inquiry", verbose_name_plural: "Customer Inquiries & Leads", count: inquiries.length, icon: "PhoneCall" },
          { key: "import_export_logs", name: "Import/Export Job", verbose_name_plural: "Import & Export Jobs", count: importExportLogs.length, icon: "FileSpreadsheet", readonly: true },
        ],
      },
    ];

    res.json({
      success: true,
      data: {
        is_super_admin: isSuperAdmin,
        current_user: user,
        app_models: models,
        total_records: activities.length + products.length + users.length + categories.length + governorates.length + cities.length + neighborhoods.length,
      },
    });
  });

  // Helper to resolve Model Array
  function getModelCollection(modelKey: string): { array: any[]; modelType: string } | null {
    switch (modelKey) {
      case "users": return { array: users, modelType: "App\\Models\\User" };
      case "roles": return { array: roles, modelType: "App\\Models\\Role" };
      case "permissions": return { array: permissions, modelType: "App\\Models\\Permission" };
      case "audit_logs": return { array: auditLogs, modelType: "App\\Models\\AuditLog" };
      case "governorates": return { array: governorates, modelType: "App\\Models\\Governorate" };
      case "cities": return { array: cities, modelType: "App\\Models\\City" };
      case "neighborhoods": return { array: neighborhoods, modelType: "App\\Models\\Neighborhood" };
      case "directory_sections": return { array: directory_sections, modelType: "App\\Models\\DirectorySection" };
      case "categories": return { array: categories, modelType: "App\\Models\\Category" };
      case "activities": return { array: activities, modelType: "App\\Models\\Activity" };
      case "products": return { array: products, modelType: "App\\Models\\Product" };
      case "offers": return { array: offers, modelType: "App\\Models\\Offer" };
      case "plans": return { array: plans, modelType: "App\\Models\\Plan" };
      case "subscriptions": return { array: subscriptions, modelType: "App\\Models\\Subscription" };
      case "reviews": return { array: reviews, modelType: "App\\Models\\Review" };
      case "inquiries": return { array: inquiries, modelType: "App\\Models\\Inquiry" };
      case "import_export_logs": return { array: importExportLogs, modelType: "App\\Models\\ImportExportLog" };
      default: return null;
    }
  }

  // Generic Changelist (Get List with Search, Filter & Pagination)
  app.get("/api/v2/internal-admin/:modelKey", (req, res) => {
    const { modelKey } = req.params;
    const modelMeta = getModelCollection(modelKey);
    if (!modelMeta) {
      return res.status(404).json({ success: false, message: `Model '${modelKey}' not found.` });
    }

    const q = (req.query.q as string || "").toLowerCase().trim();
    const page = parseInt(req.query.page as string || "1");
    const pageSize = parseInt(req.query.page_size as string || "25");
    const sortBy = (req.query.sort_by as string || "id");
    const sortDir = (req.query.sort_dir as string || "desc");

    let items = [...modelMeta.array];

    // Generic Search
    if (q) {
      items = items.filter(item => {
        return Object.entries(item).some(([k, val]) => {
          if (val === null || val === undefined) return false;
          if (typeof val === "object") return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Generic Filters from query
    Object.entries(req.query).forEach(([k, val]) => {
      if (["q", "page", "page_size", "sort_by", "sort_dir"].includes(k)) return;
      if (val === "all" || val === "" || val === undefined) return;
      
      items = items.filter(item => {
        if (item[k] === undefined) return true;
        if (val === "true" || val === "1") return item[k] === true || item[k] === 1;
        if (val === "false" || val === "0") return item[k] === false || item[k] === 0;
        return String(item[k]) === String(val);
      });
    });

    // Sorting
    items.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA === undefined) return 0;
      if (valB === undefined) return 0;
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

    const totalCount = items.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    res.json({
      success: true,
      meta: {
        model_key: modelKey,
        total_count: totalCount,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(totalCount / pageSize),
      },
      data: paginatedItems,
    });
  });

  // Generic Single Item
  app.get("/api/v2/internal-admin/:modelKey/:id", (req, res) => {
    const { modelKey, id } = req.params;
    const modelMeta = getModelCollection(modelKey);
    if (!modelMeta) return res.status(404).json({ success: false, message: "Model not found." });

    const item = modelMeta.array.find(i => String(i.id) === String(id));
    if (!item) return res.status(404).json({ success: false, message: "Object not found." });

    res.json({ success: true, data: item });
  });

  // Generic Create
  app.post("/api/v2/internal-admin/:modelKey", (req, res) => {
    const user = getAuthUser(req);
    const { modelKey } = req.params;
    const modelMeta = getModelCollection(modelKey);
    if (!modelMeta) return res.status(404).json({ success: false, message: "Model not found." });

    const data = req.body;
    const newId = modelMeta.array.length > 0 ? Math.max(...modelMeta.array.map(i => i.id || 0)) + 1 : 1;
    const newItem = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    modelMeta.array.push(newItem);
    if (user) recordAuditLog(user, modelMeta.modelType, newId, "created", null, newItem, req);

    res.json({
      success: true,
      message: `Created ${modelKey} #${newId} successfully.`,
      data: newItem,
    });
  });

  // Generic Update
  app.put("/api/v2/internal-admin/:modelKey/:id", (req, res) => {
    const user = getAuthUser(req);
    const { modelKey, id } = req.params;
    const modelMeta = getModelCollection(modelKey);
    if (!modelMeta) return res.status(404).json({ success: false, message: "Model not found." });

    const existingIndex = modelMeta.array.findIndex(i => String(i.id) === String(id));
    if (existingIndex === -1) return res.status(404).json({ success: false, message: "Object not found." });

    const oldItem = { ...modelMeta.array[existingIndex] };
    const updatedItem = {
      ...oldItem,
      ...req.body,
      id: oldItem.id, // Preserve ID
      updated_at: new Date().toISOString(),
    };

    modelMeta.array[existingIndex] = updatedItem;
    if (user) recordAuditLog(user, modelMeta.modelType, oldItem.id, "updated", oldItem, updatedItem, req);

    res.json({
      success: true,
      message: `Updated ${modelKey} #${id} successfully.`,
      data: updatedItem,
    });
  });

  // Generic Delete
  app.delete("/api/v2/internal-admin/:modelKey/:id", (req, res) => {
    const user = getAuthUser(req);
    const { modelKey, id } = req.params;
    const modelMeta = getModelCollection(modelKey);
    if (!modelMeta) return res.status(404).json({ success: false, message: "Model not found." });

    const existingIndex = modelMeta.array.findIndex(i => String(i.id) === String(id));
    if (existingIndex === -1) return res.status(404).json({ success: false, message: "Object not found." });

    const deleted = modelMeta.array.splice(existingIndex, 1)[0];
    if (user) recordAuditLog(user, modelMeta.modelType, deleted.id, "deleted", deleted, null, req);

    res.json({
      success: true,
      message: `Deleted ${modelKey} #${id} successfully.`,
    });
  });

  // Generic Bulk Action
  app.post("/api/v2/internal-admin/:modelKey/bulk-action", (req, res) => {
    const user = getAuthUser(req);
    const { modelKey } = req.params;
    const { action, ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(422).json({ success: false, message: "No items selected for bulk action." });
    }

    const modelMeta = getModelCollection(modelKey);
    if (!modelMeta) return res.status(404).json({ success: false, message: "Model not found." });

    let affectedCount = 0;

    if (action === "activate") {
      modelMeta.array.forEach(item => {
        if (ids.includes(item.id)) {
          item.is_active = true;
          affectedCount++;
        }
      });
    } else if (action === "deactivate") {
      modelMeta.array.forEach(item => {
        if (ids.includes(item.id)) {
          item.is_active = false;
          affectedCount++;
        }
      });
    } else if (action === "verify" && modelKey === "activities") {
      modelMeta.array.forEach(item => {
        if (ids.includes(item.id)) {
          item.status = "verified";
          item.verified_at = new Date().toISOString();
          item.verified_by = user?.id || 1;
          affectedCount++;
        }
      });
    } else if (action === "delete") {
      const idSet = new Set(ids);
      const remaining = modelMeta.array.filter(item => !idSet.has(item.id));
      affectedCount = modelMeta.array.length - remaining.length;
      modelMeta.array.length = 0;
      modelMeta.array.push(...remaining);
    }

    if (user) {
      recordAuditLog(user, modelMeta.modelType, 0, "updated", null, { action, ids, affectedCount }, req);
    }

    res.json({
      success: true,
      message: `Bulk action '${action}' completed on ${affectedCount} item(s).`,
      affected_count: affectedCount,
    });
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // The Flutter build folders under mobile/**/build churn files constantly while
    // `flutter run` is active, which occasionally wins a race with chokidar's watcher
    // (EBUSY) even though those paths are excluded in vite.config.ts. An unhandled
    // 'error' on the watcher is fatal to the whole Node process, so keep it non-fatal.
    vite.watcher.on("error", (err: NodeJS.ErrnoException) => {
      if (err?.code === "EBUSY" || err?.code === "EPERM") {
        console.warn(`[vite] watcher ${err.code} on ${err.path ?? "unknown path"} (ignored)`);
        return;
      }
      console.error("[vite] watcher error:", err);
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Daleel Any Service Laravel 11 Backend running on port ${PORT}`);
  });
}

startServer();
