import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/app_settings_model.dart';

class SettingsRepository {
  static const String _settingsKey = 'daleel_app_settings_v1';
  static const String _searchHistoryKey = 'daleel_search_history_v1';
  static const String _deviceTokenKey = 'daleel_device_token_v1';
  static const String _notifPermissionKey = 'daleel_notif_permission_asked';

  /// Load persisted app settings
  Future<AppSettingsModel> loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_settingsKey);
      if (raw != null && raw.isNotEmpty) {
        final Map<String, dynamic> json = jsonDecode(raw);
        return AppSettingsModel.fromJson(json);
      }
    } catch (_) {}
    return const AppSettingsModel();
  }

  /// Save settings
  Future<void> saveSettings(AppSettingsModel settings) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_settingsKey, jsonEncode(settings.toJson()));
    } catch (_) {}
  }

  /// Get cached device token
  Future<String?> getSavedDeviceToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_deviceTokenKey);
    } catch (_) {
      return null;
    }
  }

  /// Save cached device token
  Future<void> saveDeviceToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_deviceTokenKey, token);
    } catch (_) {}
  }

  /// Search History
  Future<List<String>> getSearchHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getStringList(_searchHistoryKey) ?? [];
    } catch (_) {
      return [];
    }
  }

  Future<void> addSearchQuery(String query) async {
    if (query.trim().isEmpty) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_searchHistoryKey) ?? [];
      list.remove(query.trim());
      list.insert(0, query.trim());
      if (list.length > 20) {
        list.removeRange(20, list.length);
      }
      await prefs.setStringList(_searchHistoryKey, list);
    } catch (_) {}
  }

  Future<void> clearSearchHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_searchHistoryKey);
    } catch (_) {}
  }

  /// Notification permission tracking
  Future<bool> hasAskedNotificationPermission() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(_notifPermissionKey) ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<void> markNotificationPermissionAsked() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_notifPermissionKey, true);
    } catch (_) {}
  }
}
