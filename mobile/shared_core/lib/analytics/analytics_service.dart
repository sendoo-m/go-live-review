import 'package:flutter/foundation.dart';
import '../monitoring/crash_reporting_service.dart';
import 'analytics_events.dart';

/// Abstract adapter for analytics integrations (Firebase Analytics, PostHog, Mixpanel, Custom)
abstract class AnalyticsAdapter {
  Future<void> initialize();
  Future<void> logEvent(String name, {Map<String, dynamic>? parameters});
  Future<void> setUserId(String? userId);
  Future<void> setUserProperty(String name, String value);
  Future<void> logScreenView(String screenName, {String? screenClass});
}

/// Default In-Memory & Console Analytics Adapter for Local/Beta testing
class DefaultAnalyticsAdapter implements AnalyticsAdapter {
  final List<Map<String, dynamic>> loggedEvents = [];

  @override
  Future<void> initialize() async {
    if (kDebugMode) {
      debugPrint('[Analytics] Initialized DefaultAnalyticsAdapter');
    }
  }

  @override
  Future<void> logEvent(String name, {Map<String, dynamic>? parameters}) async {
    loggedEvents.add({
      'name': name,
      'parameters': parameters,
      'timestamp': DateTime.now().toIso8601String(),
    });

    if (kDebugMode) {
      final paramStr = parameters != null && parameters.isNotEmpty ? ' | Params: $parameters' : '';
      debugPrint('📊 [ANALYTICS EVENT] $name$paramStr');
    }
  }

  @override
  Future<void> setUserId(String? userId) async {
    if (kDebugMode) {
      debugPrint('📊 [ANALYTICS USER ID] $userId');
    }
  }

  @override
  Future<void> setUserProperty(String name, String value) async {
    if (kDebugMode) {
      debugPrint('📊 [ANALYTICS USER PROP] $name = $value');
    }
  }

  @override
  Future<void> logScreenView(String screenName, {String? screenClass}) async {
    loggedEvents.add({
      'name': AnalyticsEvents.screenView,
      'parameters': {'screen_name': screenName, if (screenClass != null) 'screen_class': screenClass},
      'timestamp': DateTime.now().toIso8601String(),
    });

    if (kDebugMode) {
      debugPrint('📱 [ANALYTICS SCREEN] $screenName');
    }
  }
}

/// Centralized Analytics Service
class AnalyticsService {
  static final AnalyticsService _instance = AnalyticsService._internal();
  factory AnalyticsService() => _instance;

  AnalyticsService._internal();

  AnalyticsAdapter _adapter = DefaultAnalyticsAdapter();
  bool _isInitialized = false;

  // Forbidden keys to protect user privacy
  static final List<String> _forbiddenKeys = [
    'password',
    'pass',
    'token',
    'auth_token',
    'secret',
    'credit_card',
    'cvv',
    'bearer',
    'authorization',
  ];

  void setAdapter(AnalyticsAdapter adapter) {
    _adapter = adapter;
  }

  Future<void> initialize() async {
    if (_isInitialized) return;
    await _adapter.initialize();
    _isInitialized = true;
  }

  /// Logs an analytics event after sanitizing parameters
  Future<void> logEvent(String eventName, {Map<String, dynamic>? parameters}) async {
    final sanitizedParams = _sanitizeParameters(parameters);

    // Add breadcrumb to crash reporter for contextual telemetry
    CrashReportingService().addBreadcrumb(
      category: 'analytics.event',
      message: eventName,
      data: sanitizedParams,
    );

    await _adapter.logEvent(eventName, parameters: sanitizedParams);
  }

  /// Logs a screen navigation transition
  Future<void> logScreenView(String screenName, {String? screenClass}) async {
    CrashReportingService().addBreadcrumb(
      category: 'navigation',
      message: 'Viewed Screen: $screenName',
    );

    await _adapter.logScreenView(screenName, screenClass: screenClass);
  }

  /// Associates the current analytics session with a user ID
  Future<void> setUserId(String? userId) async {
    await _adapter.setUserId(userId);
  }

  /// Sets a user segment / attribute property (e.g., user_role: merchant)
  Future<void> setUserProperty(String name, String value) async {
    await _adapter.setUserProperty(name, value);
  }

  /// Filters out any sensitive keys or PII from event payloads
  Map<String, dynamic>? _sanitizeParameters(Map<String, dynamic>? params) {
    if (params == null) return null;
    final Map<String, dynamic> clean = {};

    for (final entry in params.entries) {
      final keyLower = entry.key.toLowerCase();
      if (_forbiddenKeys.contains(keyLower)) {
        clean[entry.key] = '[FILTERED]';
      } else if (entry.value is String && (entry.value as String).length > 250) {
        // Truncate overly long strings
        clean[entry.key] = (entry.value as String).substring(0, 250);
      } else {
        clean[entry.key] = entry.value;
      }
    }
    return clean;
  }
}
