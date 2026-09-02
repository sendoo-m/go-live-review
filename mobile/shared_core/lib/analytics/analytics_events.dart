/// Standardized Analytics Event Names across User App and Merchant App
class AnalyticsEvents {
  // App Lifecycle & Session
  static const String appOpen = 'app_open';
  static const String appBackground = 'app_background';
  static const String sessionExpired = 'session_expired';
  static const String screenView = 'screen_view';

  // Auth & Account
  static const String loginSuccess = 'login_success';
  static const String loginFailure = 'login_failure';
  static const String registerSuccess = 'register_success';
  static const String registerFailure = 'register_failure';
  static const String logout = 'logout';

  // Search, Discovery & Navigation
  static const String searchPerformed = 'search_performed';
  static const String searchFilterApplied = 'search_filter_applied';
  static const String searchCleared = 'search_cleared';
  static const String categorySelected = 'category_selected';
  static const String mapOpened = 'map_opened';
  static const String mapMarkerTapped = 'map_marker_tapped';

  // Activity & Engagement (User App)
  static const String activityViewed = 'activity_viewed';
  static const String favoriteToggled = 'favorite_toggled';
  static const String shareClicked = 'share_clicked';
  static const String callInitiated = 'call_initiated';
  static const String whatsappInitiated = 'whatsapp_initiated';
  static const String directionsRequested = 'directions_requested';
  static const String productViewed = 'product_viewed';
  static const String offerViewed = 'offer_viewed';
  static const String reviewSubmitted = 'review_submitted';

  // Merchant Portal Events
  static const String merchantDashboardViewed = 'merchant_dashboard_viewed';
  static const String merchantCatalogItemAdded = 'merchant_catalog_item_added';
  static const String merchantCatalogItemEdited = 'merchant_catalog_item_edited';
  static const String merchantCatalogItemDeleted = 'merchant_catalog_item_deleted';
  static const String merchantOfferCreated = 'merchant_offer_created';
  static const String merchantOfferStatusToggled = 'merchant_offer_status_toggled';
  static const String merchantMediaUploaded = 'merchant_media_uploaded';
  static const String merchantProfileUpdated = 'merchant_profile_updated';
  static const String inquiryStatusChanged = 'inquiry_status_changed';
  static const String inquiryNotesSaved = 'inquiry_notes_saved';
  static const String inquiryQuickReplyUsed = 'inquiry_quick_reply_used';

  // Deep Links & Notifications
  static const String deepLinkOpened = 'deep_link_opened';
  static const String notificationReceived = 'notification_received';
  static const String notificationTapped = 'notification_tapped';
}
