/// Centralized API Endpoints for Daleel Ay Khidma REST API v2
class ApiEndpoints {
  // Base URL - In production, this points to your deployed backend domain
  static const String baseUrl = 'https://ais-dev-btvvpybazsg3thwohpcxuu-530193892223.europe-west2.run.app/api/v2';
  
  // App Initialization & Settings
  static const String appBootstrap = '/app/bootstrap';
  static const String settings = '/settings';

  // Authentication & Profile
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String me = '/auth/me';
  static const String updateProfile = '/auth/update-profile';
  static const String logout = '/auth/logout';

  // Directory & Taxonomy
  static const String sections = '/directory/sections';
  static const String categories = '/categories';
  static const String governorates = '/locations/governorates';
  static const String cities = '/locations/cities';
  static const String neighborhoods = '/locations/neighborhoods';

  // Search, Map & Discovery
  static const String activities = '/activities';
  static String activityDetails(int id) => '/activities/$id';
  static String activityProducts(int id) => '/activities/$id/products';
  static String activityReviews(int id) => '/activities/$id/reviews';
  static const String searchUnified = '/search/unified';
  static const String mapItems = '/map/items';
  static const String products = '/products';
  static String productDetails(int id) => '/products/$id';
  static String toggleProductAvailability(int id) => '/products/$id/toggle-availability';
  static const String compareProducts = '/products/compare';
  static const String offers = '/offers';
  static const String reviews = '/reviews';
  static const String mediaUpload = '/media/upload';
  static const String mediaPresign = '/media/presign';
  static const String mediaDelete = '/media/delete';
  static const String mediaCleanupTemp = '/media/cleanup-temp';
  static const String mediaStorageStats = '/media/storage-stats';

  // Favorites
  static const String favorites = '/favorites';
  static const String favoritesIds = '/favorites/ids';
  static const String favoritesToggle = '/favorites/toggle';

  // Notifications (Push & In-App)
  static const String registerDeviceToken = '/notifications/register-device';
  static const String unregisterDeviceToken = '/notifications/unregister-device';
  static const String notifications = '/notifications';
  static String readNotification(int id) => '/notifications/$id/read';
  static const String testSendNotification = '/notifications/test-send';

  // Merchant Portal Operations
  static const String merchantDashboard = '/merchant/dashboard';
  static const String merchantActivities = '/merchant/activities';
  static const String merchantProducts = '/merchant/products';
  static const String merchantProductsImportCsv = '/products/import/execute';
  static const String merchantOffers = '/merchant/offers';
  static const String merchantInquiries = '/merchant/inquiries';
  static const String inquiries = '/inquiries';
  static String inquiryDetails(int id) => '/inquiries/$id';
  static String updateInquiryStatus(int id) => '/inquiries/$id/status';
  static String updateInquiryNotes(int id) => '/inquiries/$id/notes';
  static String toggleInquiryRead(int id) => '/inquiries/$id/read';
  static String recordInquiryAction(int id) => '/inquiries/$id/action';
  static const String merchantPlans = '/plans';
  static const String merchantSubscribe = '/merchant/subscribe';
  static const String merchantSubscriptionStatus = '/merchant/subscription/status';
}
