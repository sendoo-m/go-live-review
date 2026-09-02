// ============================================================================
// Daleel Ay Khidma - Centralized TypeScript API Contracts (Laravel 11 v2)
// ============================================================================

export type ActivityStatus = "pending" | "verified" | "rejected" | "suspended";

// ============================================================================
// Geographic Hierarchy Contracts: Governorate -> City -> Neighborhood
// ============================================================================
export interface GovernorateDTO {
  id: number;
  name_ar: string;
  name_en: string;
  code: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  sort_order: number;
  cities_count?: number;
  activities_count?: number;
}

export interface CityDTO {
  id: number;
  governorate_id: number;
  name_ar: string;
  name_en: string;
  code: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  sort_order: number;
  governorate?: GovernorateDTO | null;
  neighborhoods_count?: number;
  activities_count?: number;
}

export interface NeighborhoodDTO {
  id: number;
  city_id: number;
  governorate_id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  city?: CityDTO | null;
  governorate?: GovernorateDTO | null;
  activities_count?: number;
}

export interface GeoHierarchyDTO extends GovernorateDTO {
  cities: (CityDTO & { neighborhoods: NeighborhoodDTO[] })[];
}

// Backward compatibility alias for legacy components
export interface LocationDTO {
  id: number;
  name_ar: string;
  name_en: string;
  code: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  activities_count?: number;
  governorate_id?: number;
  city_id?: number;
  neighborhood_id?: number;
}

// ============================================================================
// Top-Level Directory Sections (المحلات، الحرف، الخدمات، المعلمون، البلوجر)
// ============================================================================
export type DirectorySectionSlug = "shops" | "crafts" | "services" | "teachers" | "bloggers";

export interface DirectorySectionDTO {
  id: number;
  slug: DirectorySectionSlug | string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  icon: string;
  color: string;
  color_theme?: string;
  sort_order: number;
  is_active: boolean;
  badge_text?: string;
  categories_count?: number;
  activities_count?: number;
  popular_subcategories?: string[];
}

export interface CategoryDTO {
  id: number;
  section_id?: number;
  section_slug?: DirectorySectionSlug | string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string;
  description_ar: string;
  sort_order: number;
  is_active: boolean;
  activities_count?: number;
  section?: DirectorySectionDTO | null;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role_id: number;
  location_id: number | null;
  avatar_url: string;
  is_active: boolean;
  last_login_at: string;
  role?: string;
  role_name?: string;
  role_display_name_ar?: string;
  location_name_ar?: string;
  requires_geo_scope?: boolean;
  permissions?: string[];
}

export interface PermissionDTO {
  id: number;
  name: string;
  display_name_ar: string;
  module: string;
  description_ar: string;
}

export interface RoleDTO {
  id: number;
  name: string;
  display_name_ar: string;
  description_ar: string;
  requires_geo_scope: boolean;
  is_system: boolean;
  permissions: string[];
  users_count?: number;
}

export interface ActivityDTO {
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
  section_slug?: DirectorySectionSlug | string;
  owner_id: number;
  description_ar: string;
  address_ar: string;
  address_line?: string;
  phone: string;
  whatsapp_number?: string;
  website_url?: string;
  working_hours?: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  map_place_id?: string | null;
  map_url?: string | null;
  google_maps_url?: string | null;
  status: ActivityStatus;
  verified_at: string | null;
  verified_by: number | null;
  verification_notes: string | null;
  rating_avg: number;
  reviews_count: number;
  views_count: number;
  is_featured: boolean;
  cover_image: string;
  gallery_images?: string[];
  
  // Delivery feature fields
  has_delivery: boolean;
  delivery_fee_from?: number | null;
  delivery_fee_to?: number | null;
  delivery_estimated_time?: string;
  delivery_time_min?: number | null;
  delivery_notes?: string;
  whatsapp_orders_enabled?: boolean;

  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name_ar: string;
    slug: string;
    icon: string;
    section_id?: number;
    section_slug?: string;
  } | null;
  location?: {
    id: number;
    name_ar: string;
    code: string;
  } | null;
  governorate?: GovernorateDTO | null;
  city?: CityDTO | null;
  neighborhood?: NeighborhoodDTO | null;
  section?: DirectorySectionDTO | null;
  owner?: {
    id: number;
    name: string;
    avatar_url: string;
  } | null;
  reviews?: ReviewDTO[];
  products_count?: number;
  products?: ProductDTO[];
}

export interface ProductDTO {
  id: number;
  activity_id: number;
  owner_user_id: number;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  currency: string;
  is_available: boolean;
  is_featured: boolean;
  stock_qty?: number | null;
  availability_note?: string;
  sort_order?: number;
  cover_image: string;
  gallery?: string[];
  status: "draft" | "published" | "archived";
  views_count: number;
  created_at: string;
  updated_at: string;
  activity?: {
    id: number;
    name_ar: string;
    slug: string;
    phone?: string;
    whatsapp_number?: string;
    address_ar?: string;
    cover_image?: string;
    latitude?: number;
    longitude?: number;
    rating_avg?: number;
    has_delivery?: boolean;
    delivery_fee_from?: number | null;
    delivery_estimated_time?: string;
    status?: ActivityStatus;
    governorate_name_ar?: string;
    city_name_ar?: string;
    neighborhood_name_ar?: string;
    category_name_ar?: string;
  } | null;
}

export interface InquiryDTO {
  id: number;
  activity_id: number;
  product_id?: number | null;
  customer_name: string;
  customer_phone: string;
  message: string;
  type: "inquiry" | "booking" | "whatsapp" | "call";
  status: "new" | "contacted" | "resolved" | "closed";
  created_at: string;
  activity_name?: string;
  product_name?: string;
}

export interface MerchantDashboardDTO {
  merchant: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar_url: string;
  };
  stats: {
    activities_count: number;
    verified_activities_count: number;
    pending_activities_count: number;
    products_count: number;
    available_products_count: number;
    inquiries_count: number;
    new_inquiries_count: number;
    reviews_count: number;
    total_views: number;
    avg_rating: number;
  };
  activities: ActivityDTO[];
  recent_inquiries: InquiryDTO[];
}

export interface ReviewDTO {
  id: number;
  activity_id: number;
  user_id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
  is_reported: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
}

export interface AuditLogDTO {
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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  last_page: number;
  results: T[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  error_code?: string;
  errors?: Record<string, string[]>;
}

export interface AnalyticsSummaryDTO {
  summary: {
    total_activities: number;
    verified_activities: number;
    pending_activities: number;
    rejected_activities: number;
    suspended_activities: number;
    featured_activities: number;
    total_views: number;
    average_rating: number;
    total_reviews: number;
    total_users: number;
  };
  category_distribution: {
    category_id: number;
    category_name_ar: string;
    icon: string;
    activities_count: number;
  }[];
  location_distribution: {
    location_id: number;
    location_name_ar: string;
    code: string;
    activities_count: number;
  }[];
  performance: {
    queries_executed: number;
    optimization_ratio: string;
    cache_ttl_seconds: number;
    response_time_ms: number;
  };
}

// ============================================================================
// Offers & Promotions DTOs
// ============================================================================
export interface OfferDTO {
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
  activity?: {
    id: number;
    name_ar: string;
    slug: string;
    phone: string;
    whatsapp_number?: string;
    address_ar: string;
    cover_image: string;
    category_id: number;
    location_id: number;
  } | null;
  product?: {
    id: number;
    name: string;
    price: number;
    sale_price?: number | null;
    cover_image: string;
    sku?: string;
  } | null;
}

// ============================================================================
// Pricing Plans & Subscriptions DTOs
// ============================================================================
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

export interface PlanDTO {
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

export interface SubscriptionDTO {
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
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar_url?: string;
  };
  plan?: PlanDTO;
  usage?: {
    activities_used: number;
    products_used: number;
    offers_used: number;
  };
}

export interface MerchantSubscriptionInfoDTO {
  subscription: SubscriptionDTO | null;
  plan: PlanDTO;
  status: "trial" | "active" | "expired" | "cancelled" | "none";
  days_remaining: number;
  usage: {
    activities_count: number;
    max_activities: number;
    products_count: number;
    max_products: number;
    offers_count: number;
    can_create_offers: boolean;
    can_use_import_export: boolean;
    can_access_advanced_analytics: boolean;
    can_feature_products: boolean;
  };
}

// ============================================================================
// Product Import & Export DTOs
// ============================================================================
export interface ProductImportPreviewRowDTO {
  row_number: number;
  is_valid: boolean;
  action: "create" | "update";
  errors: string[];
  data: {
    name: string;
    sku: string;
    price: number;
    sale_price?: number | null;
    currency?: string;
    short_description?: string;
    full_description?: string;
    stock_qty?: number | null;
    is_available?: boolean;
    is_featured?: boolean;
    availability_note?: string;
    cover_image?: string;
    activity_id: number;
  };
}

export interface ProductImportPreviewResultDTO {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  to_create_count: number;
  to_update_count: number;
  activity_name?: string;
  remaining_plan_quota: number;
  will_exceed_quota: boolean;
  rows: ProductImportPreviewRowDTO[];
}

export interface ProductImportExecuteResultDTO {
  success: boolean;
  message: string;
  created_count: number;
  updated_count: number;
  failed_count: number;
  failed_rows?: { row_number: number; error: string; name?: string; sku?: string }[];
}

export interface ImportExportLogDTO {
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

// ============================================================================
// Advanced Search & Price Comparison Engine Contracts
// ============================================================================
export type SearchItemType = "shop" | "service" | "product";

export interface UnifiedSearchItemDTO {
  id: string; // Unique composite key e.g. "shop-1", "service-3", "product-5"
  numeric_id: number;
  item_type: SearchItemType; // "shop" | "service" | "product"
  title: string;
  title_en?: string;
  slug: string;
  description: string;
  category_id: number;
  category_name_ar: string;
  category_icon?: string;
  section_id?: number;
  section_slug?: string;
  section_name_ar?: string;
  governorate_id?: number;
  governorate_name_ar?: string;
  city_id?: number;
  city_name_ar?: string;
  neighborhood_id?: number;
  neighborhood_name_ar?: string;
  address_ar?: string;
  latitude?: number | null;
  longitude?: number | null;
  cover_image: string;
  rating_avg?: number;
  reviews_count?: number;
  phone?: string;
  whatsapp_number?: string;
  has_delivery: boolean;
  delivery_fee_from?: number | null;
  delivery_estimated_time?: string | null;
  status?: string;
  is_featured?: boolean;
  // Product-specific attributes
  price?: number | null;
  sale_price?: number | null;
  currency?: string;
  is_available?: boolean;
  stock_qty?: number | null;
  parent_activity_id?: number | null;
  parent_activity_name_ar?: string | null;
  parent_activity_slug?: string | null;
  distance_km?: number | null;
  created_at?: string;
}

export interface UnifiedSearchResultDTO {
  query: string;
  total_results: number;
  total_count?: number;
  shops_count?: number;
  services_count?: number;
  products_count?: number;
  stats: {
    total: number;
    shops_count: number;
    services_count: number;
    products_count: number;
    with_delivery_count: number;
  };
  items: UnifiedSearchItemDTO[];
  activities?: ActivityDTO[];
  products?: ProductDTO[];
  matched_categories: CategoryDTO[];
  filters_applied: SearchFilterParams;
}

export interface SearchFilterParams {
  q?: string;
  section?: string;
  section_slug?: string;
  section_id?: number | string;
  category_id?: number | string;
  location_id?: number | string;
  governorate_id?: number | string;
  city_id?: number | string;
  neighborhood_id?: number | string;
  has_delivery?: boolean | string;
  is_verified?: boolean;
  is_available?: boolean;
  min_price?: number | string;
  max_price?: number | string;
  sort_by?: "relevance" | "price_asc" | "price_desc" | "rating" | "views" | "newest" | "distance" | string;
  type?: "all" | "shop" | "service" | "product" | "activities" | "products" | "crafts_services" | string;
  item_type?: "all" | "shop" | "service" | "product" | string;
  page?: number;
  limit?: number;
  per_page?: number;
  lat?: number;
  lng?: number;
  radius_km?: number;
}

export interface SearchResultStats {
  total_results: number;
  activities_count: number;
  products_count: number;
  shops_count: number;
  crafts_count: number;
  services_count: number;
  teachers_count: number;
  bloggers_count: number;
  with_delivery_count: number;
  verified_count: number;
  min_price: number;
  max_price: number;
}

export interface SearchResultDTO {
  query: string;
  filters: SearchFilterParams;
  stats: SearchResultStats;
  activities: ActivityDTO[];
  products: ProductDTO[];
  matched_categories: CategoryDTO[];
  suggested_queries?: string[];
}

export interface PriceComparisonItemDTO {
  product_id: number;
  product_name: string;
  product_slug: string;
  sku?: string;
  price: number;
  sale_price?: number | null;
  effective_price: number;
  discount_percentage?: number | null;
  currency: string;
  is_available: boolean;
  cover_image: string;
  activity: {
    id: number;
    name_ar: string;
    slug: string;
    phone: string;
    whatsapp_number?: string;
    rating_avg: number;
    reviews_count: number;
    is_verified: boolean;
    has_delivery: boolean;
    delivery_fee_from?: number | null;
    delivery_estimated_time?: string;
    governorate_name_ar?: string;
    city_name_ar?: string;
    neighborhood_name_ar?: string;
    address_ar?: string;
    latitude?: number;
    longitude?: number;
  };
  is_best_price: boolean;
  price_difference_from_lowest: number;
}

export interface PriceComparisonGroupDTO {
  normalized_title: string;
  category_name_ar?: string;
  section_slug?: string;
  sample_image: string;
  min_price: number;
  max_price: number;
  avg_price: number;
  savings_max: number;
  merchants_count: number;
  offers: PriceComparisonItemDTO[];
}

export interface PriceComparisonResultDTO {
  query: string;
  total_groups: number;
  total_offers: number;
  groups: PriceComparisonGroupDTO[];
  available_governorates: { id: number; name_ar: string; count: number }[];
  price_range: { min: number; max: number };
}

// ============================================================================
// Comprehensive Platform Settings Contracts
// ============================================================================
export interface SiteSettingsDTO {
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
  
  // Branding & Visuals
  logo_url: string;
  logo_dark_url: string;
  favicon_url: string;
  og_image_url: string;
  primary_color: string;
  secondary_color: string;

  // Social & Mobile App Stores
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

  // Functional System Toggles
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

  // Flutter Mobile Apps Integration
  mobile_api_version: string;
  min_supported_user_app_version: string;
  min_supported_merchant_app_version: string;
  deep_link_scheme: string;
  user_app_package_id: string;
  merchant_app_package_id: string;
  updated_at?: string;
}

// ============================================================================
// Visitor Auth & Mobile DTOs
// ============================================================================
export interface LoginCredentialsDTO {
  email_or_phone: string;
  password?: string;
  remember_me?: boolean;
}

export interface RegisterCredentialsDTO {
  name: string;
  email: string;
  phone: string;
  governorate_id?: number;
  password?: string;
  password_confirmation?: string;
}

export interface ForgotPasswordDTO {
  email_or_phone: string;
}

export interface ResetPasswordDTO {
  email_or_phone: string;
  code: string;
  new_password?: string;
}

export interface MobileBootstrapDTO {
  app_name: string;
  api_version: string;
  settings: SiteSettingsDTO;
  sections: DirectorySectionDTO[];
  governorates: GovernorateDTO[];
  deep_link_scheme: string;
  auth_config: {
    token_type: string;
    expires_in_days: number;
    allow_registration: boolean;
  };
}

export interface MediaUploadDTO {
  id: string;
  url: string;
  key: string;
  file_name: string;
  folder: string;
  size_bytes: number;
  mime_type: string;
  is_r2: boolean;
  uploaded_at: string;
}



