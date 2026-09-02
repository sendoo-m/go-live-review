import 'dart:async';
import 'dart:collection';
import 'package:flutter/foundation.dart';

/// Representation of a captured breadcrumb for error diagnostics
class Breadcrumb {
  final DateTime timestamp;
  final String category;
  final String message;
  final String level;
  final Map<String, dynamic>? data;

  Breadcrumb({
    DateTime? timestamp,
    required this.category,
    required this.message,
    this.level = 'info',
    this.data,
  }) : timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toJson() => {
        'timestamp': timestamp.toIso8601String(),
        'category': category,
        'message': message,
        'level': level,
        if (data != null) 'data': data,
      };

  @override
  String toString() => '[${timestamp.toIso8601String().substring(11, 19)}] [$category] ($level) $message';
}

/// Abstract adapter for crash reporting backends (Firebase Crashlytics, Sentry, Custom API)
abstract class CrashReportAdapter {
  Future<void> initialize();
  Future<void> recordError(
    dynamic exception,
    StackTrace? stack, {
    String? reason,
    bool fatal = false,
    Map<String, dynamic>? customData,
    List<Breadcrumb>? breadcrumbs,
  });
  Future<void> setUserIdentifier(String? userId, {String? role, String? email});
  Future<void> setCustomKey(String key, dynamic value);
}

/// Default In-Memory and Console Crash Reporter for Beta/Development
class DefaultCrashAdapter implements CrashReportAdapter {
  String? _userId;
  final Map<String, dynamic> _customKeys = {};

  @override
  Future<void> initialize() async {
    if (kDebugMode) {
      debugPrint('[CrashReporter] Initialized DefaultCrashAdapter (Safe in-memory & console mode)');
    }
  }

  @override
  Future<void> recordError(
    dynamic exception,
    StackTrace? stack, {
    String? reason,
    bool fatal = false,
    Map<String, dynamic>? customData,
    List<Breadcrumb>? breadcrumbs,
  }) async {
    final banner = fatal ? '🚨 [FATAL CRASH DETECTED]' : '⚠️ [NON-FATAL ERROR CAPTURED]';
    debugPrint('════════════════════════════════════════════════════════');
    debugPrint(banner);
    if (reason != null) debugPrint('Reason: $reason');
    debugPrint('Exception: $exception');
    if (_userId != null) debugPrint('User ID: $_userId');
    if (_customKeys.isNotEmpty) debugPrint('Context Keys: $_customKeys');
    if (customData != null) debugPrint('Extra Data: $customData');
    if (breadcrumbs != null && breadcrumbs.isNotEmpty) {
      debugPrint('--- Recent Breadcrumbs (Last ${breadcrumbs.length}) ---');
      for (final b in breadcrumbs.take(10)) {
        debugPrint('  • $b');
      }
    }
    if (stack != null) {
      debugPrint('--- StackTrace ---');
      debugPrint(stack.toString());
    }
    debugPrint('════════════════════════════════════════════════════════');
  }

  @override
  Future<void> setUserIdentifier(String? userId, {String? role, String? email}) async {
    _userId = userId;
    if (role != null) _customKeys['user_role'] = role;
  }

  @override
  Future<void> setCustomKey(String key, dynamic value) async {
    _customKeys[key] = value;
  }
}

/// Central Crash & Error Monitoring Service
class CrashReportingService {
  static final CrashReportingService _instance = CrashReportingService._internal();
  factory CrashReportingService() => _instance;

  CrashReportingService._internal();

  CrashReportAdapter _adapter = DefaultCrashAdapter();
  final Queue<Breadcrumb> _breadcrumbs = Queue<Breadcrumb>();
  static const int _maxBreadcrumbs = 35;
  bool _isInitialized = false;

  void setAdapter(CrashReportAdapter adapter) {
    _adapter = adapter;
  }

  Future<void> initialize() async {
    if (_isInitialized) return;
    await _adapter.initialize();
    _hookGlobalErrorHandlers();
    _isInitialized = true;
  }

  /// Hooks Flutter and Platform error dispatchers
  void _hookGlobalErrorHandlers() {
    // 1. Flutter Framework errors (Widget layout, rendering, assert errors)
    final originalOnError = FlutterError.onError;
    FlutterError.onError = (FlutterErrorDetails details) {
      recordFlutterError(details);
      // Retain original behavior in debug mode for terminal output
      if (kDebugMode && originalOnError != null) {
        originalOnError(details);
      }
    };

    // 2. Platform Dispatcher uncaught asynchronous errors
    PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
      recordError(
        error,
        stack,
        reason: 'Uncaught Platform Async Error',
        fatal: true,
      );
      return true; // Return true to mark handled and prevent immediate hard OS crash when possible
    };
  }

  /// Record a Flutter Framework error
  void recordFlutterError(FlutterErrorDetails details, {bool fatal = false}) {
    addBreadcrumb(
      category: 'flutter.error',
      message: details.summary.toString(),
      level: 'error',
    );

    _adapter.recordError(
      details.exception,
      details.stack,
      reason: details.context?.toString() ?? 'Flutter Framework Error',
      fatal: fatal,
      customData: {
        'library': details.library,
        'context': details.context?.toString(),
      },
      breadcrumbs: getBreadcrumbs(),
    );
  }

  /// Record non-fatal or caught exceptions from try-catch blocks or repositories
  void recordError(
    dynamic exception,
    StackTrace? stack, {
    String? reason,
    bool fatal = false,
    Map<String, dynamic>? customData,
  }) {
    addBreadcrumb(
      category: 'app.error',
      message: exception.toString(),
      level: fatal ? 'fatal' : 'error',
    );

    _adapter.recordError(
      exception,
      stack,
      reason: reason,
      fatal: fatal,
      customData: customData,
      breadcrumbs: getBreadcrumbs(),
    );
  }

  /// Add a diagnostic breadcrumb (navigation transition, button tap, API call)
  void addBreadcrumb({
    required String category,
    required String message,
    String level = 'info',
    Map<String, dynamic>? data,
  }) {
    if (_breadcrumbs.length >= _maxBreadcrumbs) {
      _breadcrumbs.removeFirst();
    }
    _breadcrumbs.add(
      Breadcrumb(
        category: category,
        message: message,
        level: level,
        data: data,
      ),
    );
  }

  /// Retrieve current history of breadcrumbs
  List<Breadcrumb> getBreadcrumbs() {
    return _breadcrumbs.toList();
  }

  /// Clear breadcrumbs on user logout
  void clearBreadcrumbs() {
    _breadcrumbs.clear();
  }

  /// Set user ID with optional sanitized metadata
  void setUserIdentifier(String? userId, {String? role, String? email}) {
    _adapter.setUserIdentifier(userId, role: role, email: email);
  }

  /// Set a contextual key-value tag for telemetry
  void setCustomKey(String key, dynamic value) {
    _adapter.setCustomKey(key, value);
  }
}
