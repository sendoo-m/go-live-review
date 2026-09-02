class AppSettingsModel {
  final String language;
  final int? defaultGovernorateId;
  final String? defaultGovernorateName;
  final bool pushNotificationsEnabled;
  final bool offerNotificationsEnabled;
  final bool systemAlertsEnabled;
  final List<String> searchHistory;
  final bool isDarkMode;

  const AppSettingsModel({
    this.language = 'ar',
    this.defaultGovernorateId,
    this.defaultGovernorateName,
    this.pushNotificationsEnabled = true,
    this.offerNotificationsEnabled = true,
    this.systemAlertsEnabled = true,
    this.searchHistory = const [],
    this.isDarkMode = false,
  });

  AppSettingsModel copyWith({
    String? language,
    int? defaultGovernorateId,
    String? defaultGovernorateName,
    bool? pushNotificationsEnabled,
    bool? offerNotificationsEnabled,
    bool? systemAlertsEnabled,
    List<String>? searchHistory,
    bool? isDarkMode,
  }) {
    return AppSettingsModel(
      language: language ?? this.language,
      defaultGovernorateId: defaultGovernorateId ?? this.defaultGovernorateId,
      defaultGovernorateName: defaultGovernorateName ?? this.defaultGovernorateName,
      pushNotificationsEnabled: pushNotificationsEnabled ?? this.pushNotificationsEnabled,
      offerNotificationsEnabled: offerNotificationsEnabled ?? this.offerNotificationsEnabled,
      systemAlertsEnabled: systemAlertsEnabled ?? this.systemAlertsEnabled,
      searchHistory: searchHistory ?? this.searchHistory,
      isDarkMode: isDarkMode ?? this.isDarkMode,
    );
  }

  factory AppSettingsModel.fromJson(Map<String, dynamic> json) {
    return AppSettingsModel(
      language: json['language'] ?? 'ar',
      defaultGovernorateId: json['default_governorate_id'],
      defaultGovernorateName: json['default_governorate_name'],
      pushNotificationsEnabled: json['push_notifications_enabled'] ?? true,
      offerNotificationsEnabled: json['offer_notifications_enabled'] ?? true,
      systemAlertsEnabled: json['system_alerts_enabled'] ?? true,
      searchHistory: (json['search_history'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      isDarkMode: json['is_dark_mode'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'language': language,
      'default_governorate_id': defaultGovernorateId,
      'default_governorate_name': defaultGovernorateName,
      'push_notifications_enabled': pushNotificationsEnabled,
      'offer_notifications_enabled': offerNotificationsEnabled,
      'system_alerts_enabled': systemAlertsEnabled,
      'search_history': searchHistory,
      'is_dark_mode': isDarkMode,
    };
  }
}
