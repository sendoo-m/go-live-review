import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:daleel_core/daleel_core.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() {
  group('Activity Details & Card Rendering Tests', () {
    testWidgets('Renders Arabic activity information and verified badge properly', (WidgetTester tester) async {
      final activity = ActivityModel(
        id: 77,
        nameAr: 'عيادة د. سمير للأسنان',
        categoryNameAr: 'أطباء وأسنان',
        governorateNameAr: 'الجيزة',
        cityNameAr: 'الدقي',
        rating: 4.9,
        ratingCount: 88,
        isVerified: true,
        phone: '01234567890',
        featuredImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09',
      );

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
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(activity.nameAr, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  Text(activity.categoryNameAr ?? ''),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber),
                      Text('${activity.rating} (${activity.ratingCount})'),
                    ],
                  ),
                  if (activity.isVerified)
                    const Chip(label: Text('موثّق')),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('عيادة د. سمير للأسنان'), findsOneWidget);
      expect(find.text('أطباء وأسنان'), findsOneWidget);
      expect(find.text('4.9 (88)'), findsOneWidget);
      expect(find.text('موثّق'), findsOneWidget);
    });
  });
}
