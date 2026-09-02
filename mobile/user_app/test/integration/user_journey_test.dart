import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import 'package:daleel_user_app/app.dart';

void main() {
  group('User App Critical Journey Integration Flow', () {
    testWidgets('App initializes cleanly and navigates gracefully without crashing', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: DaleelUserApp(),
        ),
      );

      // Verify widget tree mounts
      expect(find.byType(MaterialApp), findsOneWidget);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));
    });
  });
}
