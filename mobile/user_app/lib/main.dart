import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/monitoring/crash_reporting_service.dart';
import 'package:daleel_core/monitoring/app_logger.dart';
import 'package:daleel_core/analytics/analytics_service.dart';
import 'package:daleel_core/analytics/analytics_events.dart';
import 'app.dart';

void main() async {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    // 1. Initialize Observability & Crash Reporting
    await CrashReportingService().initialize();
    CrashReportingService().setCustomKey('app_type', 'user_app');
    CrashReportingService().setCustomKey('platform', 'flutter');

    // 2. Initialize Analytics
    await AnalyticsService().initialize();
    await AnalyticsService().logEvent(AnalyticsEvents.appOpen, parameters: {
      'app': 'daleel_user_app',
      'launch_time': DateTime.now().toIso8601String(),
    });

    AppLogger.info('Daleel User App initialized successfully', tag: 'BOOT');

    // 3. Launch UI inside ProviderScope
    runApp(
      const ProviderScope(
        child: DaleelUserApp(),
      ),
    );
  }, (error, stackTrace) {
    // Uncaught Root Zone Exception
    AppLogger.error('Root Zone Unhandled Exception: $error', tag: 'CRASH', error: error, stackTrace: stackTrace);
    CrashReportingService().recordError(
      error,
      stackTrace,
      reason: 'Root Zone Unhandled Exception',
      fatal: true,
    );
  });
}
