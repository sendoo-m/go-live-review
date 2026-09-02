import 'package:flutter_test/flutter_test.dart';
import 'package:daleel_core/daleel_core.dart';

void main() {
  group('AuthState Unit Tests', () {
    test('AuthState.initial() has correct default values', () {
      final state = AuthState.initial();
      expect(state.status, AuthStatus.initial);
      expect(state.user, isNull);
      expect(state.token, isNull);
      expect(state.errorMessage, isNull);
      expect(state.isAuthenticated, isFalse);
      expect(state.isLoading, isFalse);
    });

    test('AuthState.loading() sets status correctly', () {
      final state = AuthState.loading();
      expect(state.status, AuthStatus.loading);
      expect(state.isLoading, isTrue);
      expect(state.isAuthenticated, isFalse);
    });

    test('AuthState.authenticated() sets user and token correctly', () {
      final user = UserModel(
        id: 10,
        name: 'أحمد محمود',
        email: 'ahmed@example.com',
        phone: '01012345678',
        role: 'user',
        createdAt: '2025-01-01',
      );
      final state = AuthState.authenticated(user, 'test_jwt_token_123');

      expect(state.status, AuthStatus.authenticated);
      expect(state.isAuthenticated, isTrue);
      expect(state.user, equals(user));
      expect(state.token, 'test_jwt_token_123');
      expect(state.user?.name, 'أحمد محمود');
    });

    test('AuthState.error() preserves error message', () {
      final state = AuthState.error('كلمة المرور غير صحيحة');
      expect(state.status, AuthStatus.error);
      expect(state.errorMessage, 'كلمة المرور غير صحيحة');
      expect(state.isAuthenticated, isFalse);
    });

    test('AuthState.unauthenticated() clears credentials', () {
      final state = AuthState.unauthenticated();
      expect(state.status, AuthStatus.unauthenticated);
      expect(state.isAuthenticated, isFalse);
      expect(state.user, isNull);
      expect(state.token, isNull);
    });
  });
}
