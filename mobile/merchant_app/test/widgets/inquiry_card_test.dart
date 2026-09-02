import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:daleel_core/daleel_core.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() {
  group('Merchant CRM Widget Tests', () {
    testWidgets('Renders inquiry status badge with appropriate styling', (WidgetTester tester) async {
      final status = InquiryStatus.inProgress;

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          locale: const Locale('ar', 'EG'),
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: Scaffold(
            body: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: status.color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: status.color.withOpacity(0.4)),
              ),
              child: Text(
                status.label,
                style: TextStyle(
                  color: status.color,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ),
        ),
      );

      expect(find.text('قيد المتابعة'), findsOneWidget);
    });
  });
}
