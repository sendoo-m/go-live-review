import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../storage/secure_token_storage.dart';
import '../monitoring/crash_reporting_service.dart';
import '../monitoring/app_logger.dart';

class SecurityUtils {
  static const List<String> _allowedUrlSchemes = [
    'https',
    'http',
    'tel',
    'mailto',
    'sms',
    'whatsapp',
    'geo',
  ];

  static const List<String> _forbiddenUrlSchemes = [
    'javascript',
    'file',
    'content',
    'data',
    'blob',
    'about',
  ];

  /// Validates whether a URL is safe to open externally or inside the app
  static bool isSafeUrl(String? urlString) {
    if (urlString == null || urlString.trim().isEmpty) return false;

    final trimmed = urlString.trim();

    try {
      final uri = Uri.parse(trimmed);

      // Check scheme
      if (!uri.hasScheme) {
        // Reject scheme-less URLs that may be relative or malformed
        return false;
      }

      final scheme = uri.scheme.toLowerCase();

      // Explicitly reject forbidden schemes
      if (_forbiddenUrlSchemes.contains(scheme)) {
        AppLogger.warning('Blocked attempt to open unsafe URL scheme: $scheme', tag: 'SECURITY');
        return false;
      }

      // Must belong to allowed list
      if (!_allowedUrlSchemes.contains(scheme)) {
        AppLogger.warning('Blocked unrecognized URL scheme: $scheme', tag: 'SECURITY');
        return false;
      }

      return true;
    } catch (e) {
      AppLogger.warning('Failed to parse URL for safety validation: $urlString', tag: 'SECURITY', error: e);
      return false;
    }
  }

  /// Sanitizes phone numbers for safe dialing (e.g. tel:+201012345678)
  static String? sanitizePhoneNumber(String? rawPhone) {
    if (rawPhone == null || rawPhone.trim().isEmpty) return null;
    // Strip everything except digits and leading plus
    final clean = rawPhone.trim().replaceAll(RegExp(r'[^\d+]'), '');
    if (clean.isEmpty) return null;
    return clean;
  }

  /// Complete and secure session cleanup on user logout
  static Future<void> wipeSessionData() async {
    try {
      AppLogger.info('Initiating comprehensive session wipe and credentials purge', tag: 'SECURITY');

      // 1. Wipe secure token storage
      final secureStorage = SecureTokenStorage();
      await secureStorage.deleteToken();

      // 2. Wipe sensitive keys from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final sensitiveKeys = [
        'auth_token',
        'refresh_token',
        'user_data',
        'current_merchant_id',
        'cached_profile',
        'pin_code',
      ];

      for (final key in sensitiveKeys) {
        if (prefs.containsKey(key)) {
          await prefs.remove(key);
        }
      }

      // 3. Clear in-memory crash reporting telemetry & user identifiers
      CrashReportingService().setUserIdentifier(null);
      CrashReportingService().clearBreadcrumbs();

      AppLogger.info('Session wipe completed successfully', tag: 'SECURITY');
    } catch (e, stack) {
      AppLogger.error('Error during session wipe', tag: 'SECURITY', error: e, stackTrace: stack);
    }
  }

  /// Ensures an API endpoint URL enforces HTTPS in production release
  static String enforceHttps(String url) {
    if (kReleaseMode && url.startsWith('http://') && !url.contains('localhost') && !url.contains('127.0.0.1')) {
      AppLogger.warning('Enforcing HTTPS upgrade for URL: $url', tag: 'SECURITY');
      return url.replaceFirst('http://', 'https://');
    }
    return url;
  }
}
