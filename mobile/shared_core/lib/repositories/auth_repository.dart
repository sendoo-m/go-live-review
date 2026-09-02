import 'dart:convert';
import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/user_model.dart';
import '../storage/secure_token_storage.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final SecureTokenStorage _tokenStorage;

  AuthRepository({
    ApiClient? apiClient,
    SecureTokenStorage? tokenStorage,
  })  : _apiClient = apiClient ?? ApiClient(),
        _tokenStorage = tokenStorage ?? SecureTokenStorage();

  /// Attempt to restore the existing session from secure storage and refresh user data
  Future<AuthData?> restoreSession() async {
    try {
      final token = await _tokenStorage.getToken();
      if (token == null || token.isEmpty) {
        return null;
      }

      // Fetch fresh user profile from /auth/me
      final response = await _apiClient.get(ApiEndpoints.me);
      if (response.statusCode == 200 && response.data['success'] == true) {
        final userData = UserModel.fromJson(response.data['data']);
        await _tokenStorage.saveCachedUser(jsonEncode(userData.toJson()));
        return AuthData(token: token, user: userData);
      }

      // If token is invalid or expired
      await _tokenStorage.deleteToken();
      return null;
    } catch (e) {
      // If offline, check if we have a cached user
      final cachedUserStr = await _tokenStorage.getCachedUser();
      final token = await _tokenStorage.getToken();
      if (token != null && cachedUserStr != null) {
        try {
          final cachedUser = UserModel.fromJson(jsonDecode(cachedUserStr));
          return AuthData(token: token, user: cachedUser);
        } catch (_) {}
      }
      return null;
    }
  }

  /// User and Merchant Login with email or phone + password
  Future<AuthData> login({
    required String emailOrPhone,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.login,
        data: {
          'email_or_phone': emailOrPhone.trim(),
          'password': password.trim(),
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        final authData = AuthData.fromJson(data);

        // Persist token & cached user profile
        await _tokenStorage.saveToken(authData.token);
        await _tokenStorage.saveCachedUser(jsonEncode(authData.user.toJson()));

        return authData;
      } else {
        final message = response.data['message'] ?? 'فشل تسجيل الدخول، يرجى مراجعة البيانات.';
        throw Exception(message);
      }
    } on DioException catch (dioErr) {
      if (dioErr.response?.data is Map && dioErr.response?.data['message'] != null) {
        throw Exception(dioErr.response?.data['message']);
      }
      throw Exception('تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت.');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// New User Registration
  Future<AuthData> register({
    required String name,
    String? email,
    String? phone,
    int? governorateId,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.register,
        data: {
          'name': name.trim(),
          if (email != null && email.isNotEmpty) 'email': email.trim(),
          if (phone != null && phone.isNotEmpty) 'phone': phone.trim(),
          if (governorateId != null) 'governorate_id': governorateId,
          'password': password.trim(),
        },
      );

      if ((response.statusCode == 200 || response.statusCode == 201) && response.data['success'] == true) {
        final data = response.data['data'];
        final authData = AuthData.fromJson(data);

        await _tokenStorage.saveToken(authData.token);
        await _tokenStorage.saveCachedUser(jsonEncode(authData.user.toJson()));

        return authData;
      } else {
        final message = response.data['message'] ?? 'فشل إنشاء الحساب.';
        throw Exception(message);
      }
    } on DioException catch (dioErr) {
      if (dioErr.response?.data is Map && dioErr.response?.data['message'] != null) {
        throw Exception(dioErr.response?.data['message']);
      }
      throw Exception('تعذر الاتصال بالخادم أثناء التسجيل، يرجى المحاولة لاحقاً.');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Update Profile Details
  Future<UserModel> updateProfile({
    required String name,
    String? email,
    String? phone,
    int? governorateId,
    String? avatarUrl,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.updateProfile,
        data: {
          'name': name.trim(),
          if (email != null && email.isNotEmpty) 'email': email.trim(),
          if (phone != null && phone.isNotEmpty) 'phone': phone.trim(),
          if (governorateId != null) 'governorate_id': governorateId,
          if (governorateId != null) 'location_id': governorateId,
          if (avatarUrl != null) 'avatar_url': avatarUrl,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final userData = UserModel.fromJson(response.data['data']);
        await _tokenStorage.saveCachedUser(jsonEncode(userData.toJson()));
        return userData;
      } else {
        final message = response.data['message'] ?? 'فشل تحديث الملف الشخصي.';
        throw Exception(message);
      }
    } on DioException catch (dioErr) {
      if (dioErr.response?.data is Map && dioErr.response?.data['message'] != null) {
        throw Exception(dioErr.response?.data['message']);
      }
      throw Exception('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Secure Logout
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiEndpoints.logout);
    } catch (_) {
      // Even if network fails, we purge local token and cache
    } finally {
      await _tokenStorage.deleteToken();
    }
  }
}
