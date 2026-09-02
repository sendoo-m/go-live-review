import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  StreamSubscription<void>? _sessionSub;

  AuthNotifier(this._repository) : super(AuthState.initial()) {
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

  Future<void> checkSession() async {
    state = AuthState.loading();
    try {
      final authData = await _repository.restoreSession();
      if (authData != null) {
        state = AuthState.authenticated(authData.user, authData.token);
        AnalyticsService().setUserId(authData.user.id.toString());
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
      AnalyticsService().logEvent(AnalyticsEvents.loginSuccess, parameters: {
        'role': authData.user.role,
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
      });
      return false;
    }
  }

  Future<bool> register({
    required String name,
    String? email,
    String? phone,
    int? governorateId,
    required String password,
  }) async {
    state = AuthState.loading();
    try {
      final authData = await _repository.register(
        name: name,
        email: email,
        phone: phone,
        governorateId: governorateId,
        password: password,
      );
      state = AuthState.authenticated(authData.user, authData.token);
      
      AnalyticsService().setUserId(authData.user.id.toString());
      AnalyticsService().logEvent(AnalyticsEvents.registerSuccess, parameters: {
        'governorate_id': governorateId,
      });
      CrashReportingService().setUserIdentifier(
        authData.user.id.toString(),
        role: authData.user.role,
      );
      return true;
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = AuthState.error(errorMsg);
      AnalyticsService().logEvent(AnalyticsEvents.registerFailure, parameters: {
        'error': errorMsg,
      });
      return false;
    }
  }

  Future<bool> updateProfile({
    required String name,
    String? email,
    String? phone,
    int? governorateId,
    String? avatarUrl,
  }) async {
    try {
      final updatedUser = await _repository.updateProfile(
        name: name,
        email: email,
        phone: phone,
        governorateId: governorateId,
        avatarUrl: avatarUrl,
      );
      final currentToken = state.token ?? '';
      state = AuthState.authenticated(updatedUser, currentToken);
      return true;
    } catch (e) {
      state = AuthState.error(e.toString().replaceAll('Exception: ', ''));
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _repository.logout();
      await SecurityUtils.wipeSessionData();
      AnalyticsService().logEvent(AnalyticsEvents.logout);
    } catch (_) {}
    state = AuthState.unauthenticated();
  }
}

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(repository);
});
