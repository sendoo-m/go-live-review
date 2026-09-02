import 'package:flutter/foundation.dart';
import 'crash_reporting_service.dart';

enum LogLevel {
  debug,
  info,
  warning,
  error,
}

class AppLogger {
  static LogLevel minimumLevel = kReleaseMode ? LogLevel.warning : LogLevel.debug;
  static bool enableCrashReportingBridge = true;

  // Sensitive keywords to mask in logs
  static final List<RegExp> _sensitivePatterns = [
    RegExp(r'(password|pass|secret|token|authorization|bearer)\s*[:=]\s*([^\s,]+)', caseSensitive: false),
    RegExp(r'Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*', caseSensitive: false),
  ];

  static void debug(String message, {String tag = 'DEBUG', dynamic error, StackTrace? stackTrace}) {
    _log(LogLevel.debug, tag, message, error: error, stackTrace: stackTrace);
  }

  static void info(String message, {String tag = 'INFO', dynamic error, StackTrace? stackTrace}) {
    _log(LogLevel.info, tag, message, error: error, stackTrace: stackTrace);
  }

  static void warning(String message, {String tag = 'WARN', dynamic error, StackTrace? stackTrace}) {
    _log(LogLevel.warning, tag, message, error: error, stackTrace: stackTrace);
  }

  static void error(String message, {String tag = 'ERROR', dynamic error, StackTrace? stackTrace}) {
    _log(LogLevel.error, tag, message, error: error, stackTrace: stackTrace);
  }

  static void _log(
    LogLevel level,
    String tag,
    String message, {
    dynamic error,
    StackTrace? stackTrace,
  }) {
    if (level.index < minimumLevel.index) return;

    final sanitizedMessage = _sanitize(message);
    final timestamp = DateTime.now().toIso8601String().substring(11, 19);
    final logLine = '[$timestamp] [${level.name.toUpperCase()}] [$tag] $sanitizedMessage';

    if (kDebugMode) {
      // Formatted debug output
      switch (level) {
        case LogLevel.debug:
          debugPrint('\x1B[37m$logLine\x1B[0m');
          break;
        case LogLevel.info:
          debugPrint('\x1B[32m$logLine\x1B[0m');
          break;
        case LogLevel.warning:
          debugPrint('\x1B[33m$logLine\x1B[0m');
          break;
        case LogLevel.error:
          debugPrint('\x1B[31m$logLine\x1B[0m');
          break;
      }
      if (error != null) {
        debugPrint('  Error: $error');
      }
      if (stackTrace != null) {
        debugPrint('  StackTrace: $stackTrace');
      }
    } else {
      // Release mode: only print warnings and errors without color codes
      if (level == LogLevel.warning || level == LogLevel.error) {
        debugPrint(logLine);
        if (error != null) debugPrint('  Error: $error');
      }
    }

    // Bridge warnings and errors to Crash Reporting / Breadcrumbs
    if (enableCrashReportingBridge) {
      if (level == LogLevel.info || level == LogLevel.warning) {
        CrashReportingService().addBreadcrumb(
          category: 'logger.$tag',
          message: sanitizedMessage,
          level: level.name,
        );
      } else if (level == LogLevel.error) {
        CrashReportingService().recordError(
          error ?? sanitizedMessage,
          stackTrace,
          reason: 'Logger.error [$tag]: $sanitizedMessage',
          fatal: false,
        );
      }
    }
  }

  static String _sanitize(String input) {
    String result = input;
    for (final pattern in _sensitivePatterns) {
      result = result.replaceAllMapped(pattern, (match) {
        return '${match.group(1)}: [REDACTED]';
      });
    }
    return result;
  }
}
