// ============================================================================
// Daleel Ay Khidma - Typed API Client (matching Laravel 11 v2 Contracts)
// ============================================================================

import {
  ActivityDTO,
  CategoryDTO,
  LocationDTO,
  GovernorateDTO,
  CityDTO,
  NeighborhoodDTO,
  GeoHierarchyDTO,
  DirectorySectionDTO,
  SearchFilterParams,
  SearchResultDTO,
  UnifiedSearchResultDTO,
  UnifiedSearchItemDTO,
  PriceComparisonResultDTO,
  UserDTO,
  RoleDTO,
  PermissionDTO,
  AuditLogDTO,
  ReviewDTO,
  ProductDTO,
  InquiryDTO,
  MerchantDashboardDTO,
  AnalyticsSummaryDTO,
  OfferDTO,
  PlanDTO,
  SubscriptionDTO,
  MerchantSubscriptionInfoDTO,
  ProductImportPreviewResultDTO,
  ProductImportExecuteResultDTO,
  ImportExportLogDTO,
  PaginatedResponse,
  ApiResponse,
  SiteSettingsDTO,
  LoginCredentialsDTO,
  RegisterCredentialsDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  MobileBootstrapDTO,
  MediaUploadDTO,
} from "../types";

class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errorCode?: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

class ApiClient {
  private baseUrl = "/api/v2";
  private token: string | null = null;
  private activeUserId: number | null = 1; // Default to admin for seamless testing

  constructor() {
    // Restore token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("daleel_token");
      const storedId = localStorage.getItem("daleel_user_id");
      if (storedId) this.activeUserId = parseInt(storedId);
    }
  }

  public setToken(token: string | null, userId?: number | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("daleel_token", token);
    } else {
      localStorage.removeItem("daleel_token");
    }

    if (userId !== undefined) {
      this.activeUserId = userId;
      if (userId) {
        localStorage.setItem("daleel_user_id", String(userId));
      } else {
        localStorage.removeItem("daleel_user_id");
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getActiveUserId(): number | null {
    return this.activeUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": "ar",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    if (this.activeUserId) {
      headers["X-User-Id"] = String(this.activeUserId);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          data.message ||
          (response.status === 401
            ? "جلسة العمل منتهية، يرجى إعادة تسجيل الدخول."
            : response.status === 403
            ? "غير مصرح لك بإجراء هذه العملية أو الوصول لهذا النطاق الجغرافي."
            : response.status === 404
            ? "العنصر المطلوب غير موجود."
            : response.status === 422
            ? "يرجى التأكد من صحة البيانات المدخلة."
            : "حدث خطأ غير متوقع في الخادم.");

        throw new ApiError(errorMessage, response.status, data.error_code, data.errors);
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || "فشل الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.", 0);
    }
  }

  // ==========================================
  // Auth API
  // ==========================================
  async login(email: string, password?: string): Promise<ApiResponse<{ token: string; user: UserDTO }>> {
    const res = await this.request<ApiResponse<{ token: string; user: UserDTO }>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: password || "password123" }),
    });
    if (res.data?.token) {
      this.setToken(res.data.token, res.data.user.id);
    }
    return res;
  }

  async register(data: { name: string; email: string; phone?: string; location_id?: number }): Promise<ApiResponse<{ token: string; user: UserDTO }>> {
    const res = await this.request<ApiResponse<{ token: string; user: UserDTO }>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.data?.token) {
      this.setToken(res.data.token, res.data.user.id);
    }
    return res;
  }

  async logout(): Promise<ApiResponse> {
    const res = await this.request<ApiResponse>("/auth/logout", { method: "POST" });
    this.setToken(null, null);
    return res;
  }

  async getMe(): Promise<ApiResponse<UserDTO>> {
    return this.request<ApiResponse<UserDTO>>("/auth/me");
  }

  // ==========================================
  // Directory Sections API (المحلات، الحرف، الخدمات، المعلمون، البلوجر)
  // ==========================================
  async getSections(): Promise<ApiResponse<DirectorySectionDTO[]>> {
    return this.request<ApiResponse<DirectorySectionDTO[]>>("/directory/sections");
  }

  async getSection(slug: string): Promise<ApiResponse<DirectorySectionDTO>> {
    return this.request<ApiResponse<DirectorySectionDTO>>(`/directory/sections/${slug}`);
  }

  // ==========================================
  // Categories & Hierarchical Locations API
  // ==========================================
  async getCategories(section?: string): Promise<ApiResponse<CategoryDTO[]>> {
    const query = section ? `?section=${section}` : "";
    return this.request<ApiResponse<CategoryDTO[]>>(`/categories${query}`);
  }

  async getGovernorates(): Promise<ApiResponse<GovernorateDTO[]>> {
    return this.request<ApiResponse<GovernorateDTO[]>>("/locations/governorates");
  }

  async getCities(governorateId?: number): Promise<ApiResponse<CityDTO[]>> {
    const query = governorateId ? `?governorate_id=${governorateId}` : "";
    return this.request<ApiResponse<CityDTO[]>>(`/locations/cities${query}`);
  }

  async getNeighborhoods(params?: { city_id?: number; governorate_id?: number }): Promise<ApiResponse<NeighborhoodDTO[]>> {
    const query = new URLSearchParams();
    if (params?.city_id) query.set("city_id", String(params.city_id));
    if (params?.governorate_id) query.set("governorate_id", String(params.governorate_id));
    const qStr = query.toString();
    return this.request<ApiResponse<NeighborhoodDTO[]>>(`/locations/neighborhoods${qStr ? `?${qStr}` : ""}`);
  }

  async getGeoHierarchyTree(): Promise<ApiResponse<GeoHierarchyDTO[]>> {
    return this.request<ApiResponse<GeoHierarchyDTO[]>>("/locations/tree");
  }

  async getLocations(): Promise<ApiResponse<LocationDTO[]>> {
    return this.request<ApiResponse<LocationDTO[]>>("/locations");
  }

  async createCategory(data: Partial<CategoryDTO>): Promise<ApiResponse<CategoryDTO>> {
    return this.request<ApiResponse<CategoryDTO>>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: Partial<CategoryDTO>): Promise<ApiResponse<CategoryDTO>> {
    return this.request<ApiResponse<CategoryDTO>>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/admin/categories/${id}`, {
      method: "DELETE",
    });
  }

  // Admin Location Hierarchy CRUD
  async createGovernorate(data: Partial<GovernorateDTO>): Promise<ApiResponse<GovernorateDTO>> {
    return this.request<ApiResponse<GovernorateDTO>>("/admin/locations/governorates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateGovernorate(id: number, data: Partial<GovernorateDTO>): Promise<ApiResponse<GovernorateDTO>> {
    return this.request<ApiResponse<GovernorateDTO>>(`/admin/locations/governorates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteGovernorate(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/admin/locations/governorates/${id}`, {
      method: "DELETE",
    });
  }

  async createCity(data: Partial<CityDTO>): Promise<ApiResponse<CityDTO>> {
    return this.request<ApiResponse<CityDTO>>("/admin/locations/cities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCity(id: number, data: Partial<CityDTO>): Promise<ApiResponse<CityDTO>> {
    return this.request<ApiResponse<CityDTO>>(`/admin/locations/cities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCity(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/admin/locations/cities/${id}`, {
      method: "DELETE",
    });
  }

  async createNeighborhood(data: Partial<NeighborhoodDTO>): Promise<ApiResponse<NeighborhoodDTO>> {
    return this.request<ApiResponse<NeighborhoodDTO>>("/admin/locations/neighborhoods", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateNeighborhood(id: number, data: Partial<NeighborhoodDTO>): Promise<ApiResponse<NeighborhoodDTO>> {
    return this.request<ApiResponse<NeighborhoodDTO>>(`/admin/locations/neighborhoods/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteNeighborhood(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/admin/locations/neighborhoods/${id}`, {
      method: "DELETE",
    });
  }

  async createLocation(data: Partial<LocationDTO>): Promise<ApiResponse<LocationDTO>> {
    return this.request<ApiResponse<LocationDTO>>("/admin/locations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLocation(id: number, data: Partial<LocationDTO>): Promise<ApiResponse<LocationDTO>> {
    return this.request<ApiResponse<LocationDTO>>(`/admin/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // Unified Search & Smart Price Comparison API
  // ==========================================
  async unifiedSearch(params: SearchFilterParams): Promise<ApiResponse<UnifiedSearchResultDTO>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "all") {
        query.set(key, String(val));
      }
    });
    const qStr = query.toString();
    return this.request<ApiResponse<UnifiedSearchResultDTO>>(`/search${qStr ? `?${qStr}` : ""}`);
  }

  async getUnifiedSearch(params: SearchFilterParams): Promise<ApiResponse<UnifiedSearchResultDTO>> {
    return this.unifiedSearch(params);
  }

  async comparePrices(params: {
    q?: string;
    category_id?: number;
    governorate_id?: number;
    city_id?: number;
    neighborhood_id?: number;
    has_delivery?: boolean;
    sort_by?: string;
  }): Promise<ApiResponse<PriceComparisonResultDTO>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "all") {
        query.set(key, String(val));
      }
    });
    const qStr = query.toString();
    return this.request<ApiResponse<PriceComparisonResultDTO>>(`/products/compare${qStr ? `?${qStr}` : ""}`);
  }

  // ==========================================
  // Activities API
  // ==========================================
  async getActivities(params?: {
    search?: string;
    category_id?: number | string;
    location_id?: number | string;
    city_id?: number | string;
    neighborhood_id?: number | string;
    section_id?: number | string;
    has_delivery?: boolean | string;
    status?: string;
    featured?: boolean | string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    page?: number;
    per_page?: number;
    lat?: number;
    lng?: number;
    radius_km?: number;
  }): Promise<PaginatedResponse<ActivityDTO>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.set(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return this.request<PaginatedResponse<ActivityDTO>>(`/activities${qStr ? `?${qStr}` : ""}`);
  }

  async getActivityById(id: number | string): Promise<ApiResponse<ActivityDTO>> {
    return this.request<ApiResponse<ActivityDTO>>(`/activities/${id}`);
  }

  async createActivity(data: {
    name_ar: string;
    name_en?: string;
    category_id: number;
    location_id: number;
    governorate_id?: number;
    city_id?: number;
    neighborhood_id?: number | null;
    section_id?: number;
    section_slug?: string;
    description_ar?: string;
    address_ar: string;
    address_line?: string;
    whatsapp_number?: string;
    website_url?: string;
    working_hours?: string;
    map_place_id?: string;
    google_maps_url?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    is_featured?: boolean;
    cover_image?: string;
    has_delivery?: boolean;
    delivery_fee_from?: number | null;
    delivery_estimated_time?: string;
    delivery_notes?: string;
    whatsapp_orders_enabled?: boolean;
  }): Promise<ApiResponse<ActivityDTO>> {
    return this.request<ApiResponse<ActivityDTO>>("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateActivity(id: number, data: Partial<ActivityDTO>): Promise<ApiResponse<ActivityDTO>> {
    return this.request<ApiResponse<ActivityDTO>>(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteActivity(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/activities/${id}`, {
      method: "DELETE",
    });
  }

  async verifyActivity(
    id: number,
    action: "verify" | "reject" | "suspend",
    notes?: string,
    rejectionReason?: string
  ): Promise<ApiResponse<ActivityDTO>> {
    return this.request<ApiResponse<ActivityDTO>>(`/activities/${id}/verify`, {
      method: "POST",
      body: JSON.stringify({ action, notes, rejection_reason: rejectionReason }),
    });
  }

  async submitReview(activityId: number, rating: number, comment: string): Promise<ApiResponse<ReviewDTO>> {
    return this.request<ApiResponse<ReviewDTO>>(`/activities/${activityId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    });
  }

  async reportActivity(activityId: number, reason: string, details?: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/activities/${activityId}/report`, {
      method: "POST",
      body: JSON.stringify({ reason, details }),
    });
  }

  // ==========================================
  // Products API
  // ==========================================
  async getProducts(params?: {
    activity_id?: number | string;
    search?: string;
    is_available?: boolean | string;
    is_featured?: boolean | string;
    status?: string;
    sort_by?: string;
  }): Promise<ApiResponse<ProductDTO[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "" && v !== "all") {
          query.set(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return this.request<ApiResponse<ProductDTO[]>>(`/products${qStr ? `?${qStr}` : ""}`);
  }

  async getProductById(id: number | string): Promise<ApiResponse<ProductDTO>> {
    return this.request<ApiResponse<ProductDTO>>(`/products/${id}`);
  }

  async getActivityProducts(activityId: number | string): Promise<ApiResponse<ProductDTO[]>> {
    return this.request<ApiResponse<ProductDTO[]>>(`/activities/${activityId}/products`);
  }

  async createProduct(data: Partial<ProductDTO>): Promise<ApiResponse<ProductDTO>> {
    return this.request<ApiResponse<ProductDTO>>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: Partial<ProductDTO>): Promise<ApiResponse<ProductDTO>> {
    return this.request<ApiResponse<ProductDTO>>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async toggleProductAvailability(id: number): Promise<ApiResponse<ProductDTO>> {
    return this.request<ApiResponse<ProductDTO>>(`/products/${id}/toggle-availability`, {
      method: "PATCH",
    });
  }

  async deleteProduct(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // Inquiries API
  // ==========================================
  async getInquiries(activityId?: number): Promise<ApiResponse<InquiryDTO[]>> {
    const q = activityId ? `?activity_id=${activityId}` : "";
    return this.request<ApiResponse<InquiryDTO[]>>(`/inquiries${q}`);
  }

  async submitInquiry(data: {
    activity_id: number;
    product_id?: number | null;
    customer_name: string;
    customer_phone: string;
    message: string;
    type?: "inquiry" | "booking" | "whatsapp" | "call";
  }): Promise<ApiResponse<InquiryDTO>> {
    return this.request<ApiResponse<InquiryDTO>>("/inquiries", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createInquiry(data: {
    activity_id: number;
    product_id?: number | null;
    customer_name: string;
    customer_phone: string;
    message: string;
    type?: "inquiry" | "booking" | "whatsapp" | "call";
  }): Promise<ApiResponse<InquiryDTO>> {
    return this.submitInquiry(data);
  }

  async updateInquiryStatus(id: number, status: string): Promise<ApiResponse<InquiryDTO>> {
    return this.request<ApiResponse<InquiryDTO>>(`/inquiries/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // ==========================================
  // Merchant Portal API
  // ==========================================
  async getMerchantDashboard(): Promise<ApiResponse<MerchantDashboardDTO>> {
    return this.request<ApiResponse<MerchantDashboardDTO>>("/merchant/dashboard");
  }

  async getMerchantActivities(): Promise<ApiResponse<ActivityDTO[]>> {
    return this.request<ApiResponse<ActivityDTO[]>>("/merchant/activities");
  }

  async getMerchantProducts(): Promise<ApiResponse<ProductDTO[]>> {
    return this.request<ApiResponse<ProductDTO[]>>("/merchant/products");
  }

  // ==========================================
  // Reviews Moderation API
  // ==========================================
  async getReviews(params?: { activity_id?: number; is_approved?: boolean; is_reported?: boolean }): Promise<ApiResponse<ReviewDTO[]>> {
    const query = new URLSearchParams();
    if (params?.activity_id) query.set("activity_id", String(params.activity_id));
    if (params?.is_approved !== undefined) query.set("is_approved", String(params.is_approved));
    if (params?.is_reported !== undefined) query.set("is_reported", String(params.is_reported));
    const q = query.toString();
    return this.request<ApiResponse<ReviewDTO[]>>(`/admin/reviews${q ? `?${q}` : ""}`);
  }

  async moderateReview(reviewId: number, action: "approve" | "reject" | "delete"): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/admin/reviews/${reviewId}`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  }

  // ==========================================
  // Admin & RBAC API
  // ==========================================
  async getRoles(): Promise<ApiResponse<{ roles: RoleDTO[]; available_permissions: PermissionDTO[] }>> {
    return this.request<ApiResponse<{ roles: RoleDTO[]; available_permissions: PermissionDTO[] }>>("/admin/roles");
  }

  async createRole(data: {
    name: string;
    display_name_ar: string;
    description_ar?: string;
    requires_geo_scope: boolean;
    permissions: string[];
  }): Promise<ApiResponse<RoleDTO>> {
    return this.request<ApiResponse<RoleDTO>>("/admin/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: number, data: Partial<RoleDTO>): Promise<ApiResponse<RoleDTO>> {
    return this.request<ApiResponse<RoleDTO>>(`/admin/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getUsers(): Promise<PaginatedResponse<UserDTO>> {
    return this.request<PaginatedResponse<UserDTO>>("/admin/users");
  }

  async updateUserRole(userId: number, roleId: number, locationId?: number | null): Promise<ApiResponse<UserDTO>> {
    return this.request<ApiResponse<UserDTO>>(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ role_id: roleId, location_id: locationId }),
    });
  }

  async getAuditLogs(params?: { action?: string; user_id?: number; model_type?: string }): Promise<PaginatedResponse<AuditLogDTO>> {
    const query = new URLSearchParams();
    if (params?.action && params.action !== "all") query.set("action", params.action);
    if (params?.user_id) query.set("user_id", String(params.user_id));
    if (params?.model_type) query.set("model_type", params.model_type);
    const q = query.toString();
    return this.request<PaginatedResponse<AuditLogDTO>>(`/admin/audit-logs${q ? `?${q}` : ""}`);
  }

  async getDashboardAnalytics(locationId?: number | null): Promise<ApiResponse<AnalyticsSummaryDTO>> {
    const q = locationId ? `?location_id=${locationId}` : "";
    return this.request<ApiResponse<AnalyticsSummaryDTO>>(`/analytics/dashboard${q}`);
  }

  // ==========================================
  // Offers & Promotions API
  // ==========================================
  async getOffers(params?: {
    activity_id?: number | string;
    product_id?: number | string;
    location_id?: number | string;
    category_id?: number | string;
    is_active?: boolean;
    is_featured?: boolean;
    search?: string;
    sort_by?: "latest" | "discount_desc" | "ending_soon" | "views";
  }): Promise<ApiResponse<OfferDTO[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.set(key, String(val));
        }
      });
    }
    const q = query.toString();
    return this.request<ApiResponse<OfferDTO[]>>(`/offers${q ? `?${q}` : ""}`);
  }

  async getOfferById(id: number): Promise<ApiResponse<OfferDTO>> {
    return this.request<ApiResponse<OfferDTO>>(`/offers/${id}`);
  }

  async getMerchantOffers(): Promise<ApiResponse<OfferDTO[]>> {
    return this.request<ApiResponse<OfferDTO[]>>("/merchant/offers");
  }

  async createOffer(data: Partial<OfferDTO>): Promise<ApiResponse<OfferDTO>> {
    return this.request<ApiResponse<OfferDTO>>("/offers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOffer(id: number, data: Partial<OfferDTO>): Promise<ApiResponse<OfferDTO>> {
    return this.request<ApiResponse<OfferDTO>>(`/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteOffer(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/offers/${id}`, {
      method: "DELETE",
    });
  }

  async toggleOfferActive(id: number): Promise<ApiResponse<OfferDTO>> {
    return this.request<ApiResponse<OfferDTO>>(`/offers/${id}/toggle`, {
      method: "PATCH",
    });
  }

  async toggleOfferFeatured(id: number): Promise<ApiResponse<OfferDTO>> {
    return this.request<ApiResponse<OfferDTO>>(`/offers/${id}/feature`, {
      method: "PATCH",
    });
  }

  // ==========================================
  // Pricing Plans & Subscriptions API
  // ==========================================
  async getPlans(): Promise<ApiResponse<PlanDTO[]>> {
    return this.request<ApiResponse<PlanDTO[]>>("/plans");
  }

  async getPlanById(id: number): Promise<ApiResponse<PlanDTO>> {
    return this.request<ApiResponse<PlanDTO>>(`/plans/${id}`);
  }

  async createPlan(data: Partial<PlanDTO>): Promise<ApiResponse<PlanDTO>> {
    return this.request<ApiResponse<PlanDTO>>("/plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePlan(id: number, data: Partial<PlanDTO>): Promise<ApiResponse<PlanDTO>> {
    return this.request<ApiResponse<PlanDTO>>(`/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePlan(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/plans/${id}`, {
      method: "DELETE",
    });
  }

  async getSubscriptions(params?: { status?: string; plan_id?: number }): Promise<ApiResponse<SubscriptionDTO[]>> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.plan_id) query.set("plan_id", String(params.plan_id));
    const q = query.toString();
    return this.request<ApiResponse<SubscriptionDTO[]>>(`/subscriptions${q ? `?${q}` : ""}`);
  }

  async updateSubscriptionStatus(
    id: number,
    data: { status: string; extra_days?: number; notes?: string; plan_id?: number }
  ): Promise<ApiResponse<SubscriptionDTO>> {
    return this.request<ApiResponse<SubscriptionDTO>>(`/subscriptions/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getMerchantSubscription(): Promise<ApiResponse<MerchantSubscriptionInfoDTO>> {
    return this.request<ApiResponse<MerchantSubscriptionInfoDTO>>("/merchant/subscription");
  }

  async subscribeMerchantPlan(data: { plan_id: number; billing_cycle: "monthly" | "yearly" }): Promise<ApiResponse<SubscriptionDTO>> {
    return this.request<ApiResponse<SubscriptionDTO>>("/merchant/subscription/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // Product Import & Export API
  // ==========================================
  async exportProducts(params?: {
    activity_id?: number;
    category_id?: number;
    location_id?: number;
    format?: "csv" | "json";
  }): Promise<{ blob: Blob; filename: string }> {
    const query = new URLSearchParams();
    if (params?.activity_id) query.set("activity_id", String(params.activity_id));
    if (params?.category_id) query.set("category_id", String(params.category_id));
    if (params?.location_id) query.set("location_id", String(params.location_id));
    query.set("format", params?.format || "csv");

    const url = `${this.baseUrl}/products/export?${query.toString()}`;
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    if (this.activeUserId) headers["X-User-Id"] = String(this.activeUserId);

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new ApiError("فشل تصدير المنتجات", res.status);
    }

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition");
    let filename = "products_catalog.csv";
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "").trim();
    }
    return { blob, filename };
  }

  async previewProductImport(data: {
    activity_id: number;
    csv_content?: string;
    rows?: any[];
  }): Promise<ApiResponse<ProductImportPreviewResultDTO>> {
    return this.request<ApiResponse<ProductImportPreviewResultDTO>>("/products/import/preview", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async executeProductImport(data: {
    activity_id: number;
    rows: any[];
  }): Promise<ApiResponse<ProductImportExecuteResultDTO>> {
    return this.request<ApiResponse<ProductImportExecuteResultDTO>>("/products/import/execute", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getImportExportLogs(): Promise<ApiResponse<ImportExportLogDTO[]>> {
    return this.request<ApiResponse<ImportExportLogDTO[]>>("/import-export/logs");
  }

  // ==========================================
  // Categories Import & Export API
  // ==========================================
  async exportCategories(params?: {
    section_id?: number;
    active_only?: boolean;
    format?: "xlsx" | "csv" | "json";
  }): Promise<{ blob: Blob; filename: string }> {
    const query = new URLSearchParams();
    if (params?.section_id) query.set("section_id", String(params.section_id));
    if (params?.active_only) query.set("active_only", "true");
    query.set("format", params?.format || "xlsx");

    const url = `${this.baseUrl}/categories/export?${query.toString()}`;
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    if (this.activeUserId) headers["X-User-Id"] = String(this.activeUserId);

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new ApiError("فشل تصدير التصنيفات", res.status);
    }

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition");
    let filename = `categories_export.${params?.format || "xlsx"}`;
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "").trim();
    }
    return { blob, filename };
  }

  async previewCategoriesImport(data: { rows: any[] }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>("/categories/import/preview", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async executeCategoriesImport(data: { rows: any[] }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>("/categories/import/execute", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // Locations Import & Export API
  // ==========================================
  async exportLocations(params?: {
    governorate_id?: number;
    format?: "xlsx" | "csv" | "json";
  }): Promise<{ blob: Blob; filename: string }> {
    const query = new URLSearchParams();
    if (params?.governorate_id) query.set("governorate_id", String(params.governorate_id));
    query.set("format", params?.format || "xlsx");

    const url = `${this.baseUrl}/locations/export?${query.toString()}`;
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    if (this.activeUserId) headers["X-User-Id"] = String(this.activeUserId);

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new ApiError("فشل تصدير الهيكل الجغرافي", res.status);
    }

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition");
    let filename = `geo_locations_export.${params?.format || "xlsx"}`;
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "").trim();
    }
    return { blob, filename };
  }

  async previewLocationsImport(data: { rows: any[] }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>("/locations/import/preview", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async executeLocationsImport(data: { rows: any[] }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>("/locations/import/execute", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // Internal Django Admin API
  // ==========================================
  async getInternalAdminModelsSummary(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>("/internal-admin/models-summary");
  }

  async getInternalAdminModelList(
    modelKey: string,
    params?: {
      q?: string;
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_dir?: "asc" | "desc";
      [key: string]: any;
    }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          query.set(k, String(v));
        }
      });
    }
    return this.request<ApiResponse<any>>(`/internal-admin/${modelKey}?${query.toString()}`);
  }

  async getInternalAdminModelItem(modelKey: string, id: number | string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/internal-admin/${modelKey}/${id}`);
  }

  async createInternalAdminModelItem(modelKey: string, data: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/internal-admin/${modelKey}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateInternalAdminModelItem(modelKey: string, id: number | string, data: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/internal-admin/${modelKey}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteInternalAdminModelItem(modelKey: string, id: number | string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/internal-admin/${modelKey}/${id}`, {
      method: "DELETE",
    });
  }

  async executeInternalAdminBulkAction(modelKey: string, action: string, ids: (number | string)[]): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/internal-admin/${modelKey}/bulk-action`, {
      method: "POST",
      body: JSON.stringify({ action, ids }),
    });
  }

  async resetSandbox(): Promise<ApiResponse> {
    return this.request<ApiResponse>("/admin/reset-sandbox", { method: "POST" });
  }

  // ==========================================
  // Platform Settings & Configuration APIs
  // ==========================================
  async getSettings(): Promise<ApiResponse<SiteSettingsDTO>> {
    return this.request<ApiResponse<SiteSettingsDTO>>("/settings");
  }

  async updateSettings(data: Partial<SiteSettingsDTO>): Promise<ApiResponse<SiteSettingsDTO>> {
    return this.request<ApiResponse<SiteSettingsDTO>>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // Visitor & User Authentication APIs
  // ==========================================
  async loginVisitor(data: LoginCredentialsDTO): Promise<ApiResponse<{ token: string; user: UserDTO }>> {
    return this.request<ApiResponse<{ token: string; user: UserDTO }>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async registerVisitor(data: RegisterCredentialsDTO): Promise<ApiResponse<{ token: string; user: UserDTO }>> {
    return this.request<ApiResponse<{ token: string; user: UserDTO }>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<ApiResponse<{ message: string; demo_otp?: string }>> {
    return this.request<ApiResponse<{ message: string; demo_otp?: string }>>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordDTO): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProfile(data: { name?: string; phone?: string; location_id?: number; avatar_url?: string }): Promise<ApiResponse<UserDTO>> {
    return this.request<ApiResponse<UserDTO>>("/auth/update-profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // Cloudflare R2 Media & Upload APIs
  // ==========================================
  async uploadMedia(
    payload: File | Blob | string,
    options?: {
      folder?: "activities" | "products" | "offers" | "profiles" | "reviews" | "media" | "temp";
      fileName?: string;
      entityId?: string | number;
      prefix?: string;
    }
  ): Promise<ApiResponse<{
    id: string;
    url: string;
    key: string;
    file_name: string;
    folder: string;
    size_bytes: number;
    mime_type: string;
    is_r2: boolean;
    uploaded_at: string;
  }>> {
    const folder = options?.folder || "media";

    if (typeof payload === "string") {
      // Base64 or Data URI
      return this.request("/media/upload", {
        method: "POST",
        body: JSON.stringify({
          image: payload,
          folder,
          file_name: options?.fileName,
          entity_id: options?.entityId,
          prefix: options?.prefix,
        }),
      });
    } else {
      // Multipart FormData
      const formData = new FormData();
      formData.append("file", payload, options?.fileName || "upload.jpg");
      formData.append("folder", folder);
      if (options?.fileName) formData.append("file_name", options.fileName);
      if (options?.entityId) formData.append("entity_id", String(options.entityId));
      if (options?.prefix) formData.append("prefix", options.prefix);

      const url = `${this.baseUrl}/media/upload`;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new ApiError(errJson.message || "فشل رفع الملف", res.status);
      }

      return res.json();
    }
  }

  async presignMediaUpload(options: {
    folder?: string;
    mime_type?: string;
    file_name?: string;
    entity_id?: string | number;
    prefix?: string;
  }): Promise<ApiResponse<{
    upload_url: string;
    public_url: string;
    key: string;
    folder: string;
    file_name: string;
    expires_in_seconds: number;
  }>> {
    return this.request("/media/presign", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  /**
   * Direct Upload to Cloudflare R2 via Pre-signed URL with automatic fallback to Backend Upload
   */
  async uploadMediaDirect(
    file: File | Blob,
    options?: {
      folder?: "activities" | "products" | "offers" | "profiles" | "reviews" | "media" | "temp";
      fileName?: string;
      entityId?: string | number;
      prefix?: string;
    }
  ): Promise<ApiResponse<MediaUploadDTO>> {
    const mimeType = file.type || "image/jpeg";
    const fileName = options?.fileName || (file instanceof File ? file.name : `upload_${Date.now()}.jpg`);
    const folder = options?.folder || "media";

    try {
      // 1. Request presigned URL from Backend
      const presignRes = await this.presignMediaUpload({
        folder,
        mime_type: mimeType,
        file_name: fileName,
        entity_id: options?.entityId,
        prefix: options?.prefix,
      });

      if (presignRes.success && presignRes.data?.upload_url) {
        const { upload_url, public_url, key } = presignRes.data;

        // 2. Direct PUT to Cloudflare R2
        const putRes = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": mimeType,
          },
        });

        if (putRes.ok) {
          return {
            success: true,
            message: "تم الرفع المباشر إلى Cloudflare R2 بنجاح.",
            data: {
              id: key,
              url: public_url,
              key,
              file_name: fileName,
              folder,
              size_bytes: file.size,
              mime_type: mimeType,
              is_r2: true,
              uploaded_at: new Date().toISOString(),
            },
          };
        }
      }
      // If direct PUT failed, fallback to backend-mediated upload
      console.warn("[Media Direct Upload] Direct PUT failed. Falling back to backend-mediated upload.");
      return await this.uploadMedia(file, options);
    } catch (err) {
      console.warn("[Media Direct Upload] Error during direct upload, executing backend fallback:", err);
      return await this.uploadMedia(file, options);
    }
  }

  async deleteMedia(keyOrUrl: string): Promise<ApiResponse<void>> {
    return this.request("/media/delete", {
      method: "POST",
      body: JSON.stringify({ key: keyOrUrl }),
    });
  }

  async cleanupTempMedia(olderThanHours: number = 24): Promise<ApiResponse<{ deletedCount: number; errors: string[] }>> {
    return this.request("/media/cleanup-temp", {
      method: "POST",
      body: JSON.stringify({ older_than_hours: olderThanHours }),
    });
  }

  async getStorageStats(): Promise<ApiResponse<{
    isConfigured: boolean;
    bucketName: string | null;
    totalObjects: number;
    totalSizeBytes: number;
    folders: Record<string, { count: number; sizeBytes: number }>;
  }>> {
    return this.request("/media/storage-stats");
  }

  async getR2MediaStatus(): Promise<{
    success: boolean;
    config: {
      isConfigured: boolean;
      bucketName: string | null;
      publicDomain: string;
      maxSizeBytes: number;
      allowedMimeTypes: string[];
    };
    diagnostic: {
      success: boolean;
      message: string;
      bucket?: string;
      publicDomain?: string;
    };
    timestamp: string;
  }> {
    return this.request("/media/r2-status");
  }

  // ==========================================
  // Mobile / Flutter Bootstrap APIs
  // ==========================================

  async getMobileBootstrap(): Promise<ApiResponse<MobileBootstrapDTO>> {
    return this.request<ApiResponse<MobileBootstrapDTO>>("/app/bootstrap");
  }
}


export const api = new ApiClient();
export { ApiError };
