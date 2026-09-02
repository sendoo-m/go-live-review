import 'package:flutter_test/flutter_test.dart';
import 'package:daleel_core/daleel_core.dart';

void main() {
  group('CrashReportingService & Diagnostics Tests', () {
    late CrashReportingService crashService;

    setUp(() {
      crashService = CrashReportingService();
      crashService.clearBreadcrumbs();
    });

    test('Breadcrumbs are stored and FIFO bounded', () {
      for (int i = 1; i <= 40; i++) {
        crashService.addBreadcrumb(
          category: 'navigation',
          message: 'Transition to Screen $i',
        );
      }

      final breadcrumbs = crashService.getBreadcrumbs();
      // Should cap at max (35)
      expect(breadcrumbs.length, 35);
      // First item in queue should be Screen 6 (1 to 5 dropped)
      expect(breadcrumbs.first.message, 'Transition to Screen 6');
      expect(breadcrumbs.last.message, 'Transition to Screen 40');
    });

    test('clearBreadcrumbs wipes all recorded history', () {
      crashService.addBreadcrumb(category: 'test', message: 'test breadcrumb');
      expect(crashService.getBreadcrumbs().isNotEmpty, isTrue);

      crashService.clearBreadcrumbs();
      expect(crashService.getBreadcrumbs().isEmpty, isTrue);
    });
  });
}
