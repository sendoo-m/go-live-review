import 'package:flutter_test/flutter_test.dart';
import 'package:daleel_core/daleel_core.dart';

void main() {
  group('AnalyticsService & PII Protection Tests', () {
    late AnalyticsService analytics;
    late DefaultAnalyticsAdapter testAdapter;

    setUp(() {
      analytics = AnalyticsService();
      testAdapter = DefaultAnalyticsAdapter();
      analytics.setAdapter(testAdapter);
    });

    test('logEvent records event and filters sensitive tokens & passwords', () async {
      await analytics.logEvent('user_profile_updated', parameters: {
        'user_id': 123,
        'action': 'edit',
        'password': 'SuperSecretPassword123!',
        'auth_token': 'Bearer eyJhbGciOi...',
        'secret': 'client_secret_999',
      });

      expect(testAdapter.loggedEvents.isNotEmpty, isTrue);
      final lastEvent = testAdapter.loggedEvents.last;
      expect(lastEvent['name'], 'user_profile_updated');

      final params = lastEvent['parameters'] as Map<String, dynamic>;
      expect(params['user_id'], 123);
      expect(params['action'], 'edit');
      expect(params['password'], '[FILTERED]');
      expect(params['auth_token'], '[FILTERED]');
      expect(params['secret'], '[FILTERED]');
    });

    test('logScreenView logs standard screen_view event', () async {
      await analytics.logScreenView('HomeScreen', screenClass: 'HomeScreen');

      final lastEvent = testAdapter.loggedEvents.last;
      expect(lastEvent['name'], AnalyticsEvents.screenView);
      expect((lastEvent['parameters'] as Map)['screen_name'], 'HomeScreen');
    });
  });
}
