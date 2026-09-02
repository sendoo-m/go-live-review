import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

final merchantAuthRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

class MerchantAuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  StreamSubscription<void>? _sessionSub;

  MerchantAuthNotifier(this._repository) : super(AuthState.initial()) {
    // Listen to centralized 401 Unauthorized / session expired events
    _sessionSub = ApiClient().onSessionExpired.listen((_) {
      if (state.isAuthenticated) {
        state = AuthState.unauthenticated();
      }
    });
  }

  @override
  void dispose() {
    _sessionSub?.cancel();
    super.dispose();
  }

  Future<void> checkMerchantSession() async {
    state = AuthState.loading();
    try {
      final authData = await _repository.restoreSession();
      if (authData != null) {
        state = AuthState.authenticated(authData.user, authData.token);
        AnalyticsService().setUserId(authData.user.id.toString());
        AnalyticsService().setUserProperty('user_role', authData.user.role ?? 'merchant');
        CrashReportingService().setUserIdentifier(
          authData.user.id.toString(),
          role: authData.user.role,
        );
      } else {
        state = AuthState.unauthenticated();
      }
    } catch (e) {
      state = AuthState.unauthenticated();
    }
  }

  Future<bool> login({
    required String emailOrPhone,
    required String password,
  }) async {
    state = AuthState.loading();
    try {
      final authData = await _repository.login(
        emailOrPhone: emailOrPhone,
        password: password,
      );
      state = AuthState.authenticated(authData.user, authData.token);
      
      AnalyticsService().setUserId(authData.user.id.toString());
      AnalyticsService().setUserProperty('user_role', authData.user.role ?? 'merchant');
      AnalyticsService().logEvent(AnalyticsEvents.loginSuccess, parameters: {
        'role': authData.user.role,
        'portal': 'merchant',
      });
      CrashReportingService().setUserIdentifier(
        authData.user.id.toString(),
        role: authData.user.role,
      );
      return true;
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = AuthState.error(errorMsg);
      AnalyticsService().logEvent(AnalyticsEvents.loginFailure, parameters: {
        'error': errorMsg,
        'portal': 'merchant',
      });
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _repository.logout();
      await SecurityUtils.wipeSessionData();
      AnalyticsService().logEvent(AnalyticsEvents.logout, parameters: {
        'portal': 'merchant',
      });
    } catch (_) {}
    state = AuthState.unauthenticated();
  }
}

final merchantAuthNotifierProvider = StateNotifierProvider<MerchantAuthNotifier, AuthState>((ref) {
  final repository = ref.watch(merchantAuthRepositoryProvider);
  return MerchantAuthNotifier(repository);
});
