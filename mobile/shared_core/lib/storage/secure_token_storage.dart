import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureTokenStorage {
  static const String _tokenKey = 'daleel_auth_token';
  static const String _userKey = 'daleel_cached_user';
  static const String _governorateKey = 'daleel_selected_governorate';
  static const String _cityKey = 'daleel_selected_city';

  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<void> saveCachedUser(String userJson) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, userJson);
  }

  Future<String?> getCachedUser() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userKey);
  }

  Future<void> saveSelectedLocation({required int governorateId, int? cityId}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_governorateKey, governorateId);
    if (cityId != null) {
      await prefs.setInt(_cityKey, cityId);
    }
  }

  Future<Map<String, int?>> getSelectedLocation() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'governorate_id': prefs.getInt(_governorateKey),
      'city_id': prefs.getInt(_cityKey),
    };
  }
}
