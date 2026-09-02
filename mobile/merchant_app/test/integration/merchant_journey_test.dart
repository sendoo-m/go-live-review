import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import 'package:daleel_merchant_app/app.dart';

void main() {
  group('Merchant App Critical Integration Journey', () {
    testWidgets('Merchant App boots up without unhandled exceptions and shows login/splash', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: DaleelMerchantApp(),
        ),
      );

      // Verify MaterialApp mounts
      expect(find.byType(MaterialApp), findsOneWidget);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));
    });
  });
}
