import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/activity_model.dart';

class FavoritesRepository {
  static const String _favIdsKey = 'daleel_favorite_activity_ids_v1';
  static const String _favActivitiesKey = 'daleel_favorite_activities_cache_v1';

  final ApiClient _apiClient;

  FavoritesRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Retrieve cached favorite IDs from local device storage
  Future<Set<int>> getLocalFavoriteIds() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_favIdsKey) ?? [];
      return list.map((e) => int.tryParse(e)).whereType<int>().toSet();
    } catch (_) {
      return <int>{};
    }
  }

  /// Retrieve full cached favorite activities from local storage
  Future<List<ActivityModel>> getLocalFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_favActivitiesKey);
      if (jsonStr == null || jsonStr.isEmpty) return [];

      final List<dynamic> decoded = jsonDecode(jsonStr);
      return decoded.map((e) => ActivityModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  /// Save local favorites list and IDs
  Future<void> _saveLocal(List<ActivityModel> activities, Set<int> ids) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_favIdsKey, ids.map((e) => e.toString()).toList());
      final jsonStr = jsonEncode(activities.map((e) => e.toJson()).toList());
      await prefs.setString(_favActivitiesKey, jsonStr);
    } catch (_) {}
  }

  /// Fetch favorites from Backend API and synchronize with local cache
  Future<List<ActivityModel>> fetchFavorites() async {
    // 1. Load local cache first
    final localList = await getLocalFavorites();
    final localIds = localList.map((e) => e.id).toSet();

    try {
      final response = await _apiClient.get(ApiEndpoints.favorites);
      if (response.data != null && response.data['data'] is List) {
        final serverList = (response.data['data'] as List<dynamic>)
            .map((e) => ActivityModel.fromJson(e as Map<String, dynamic>))
            .toList();

        // Merge server list with any offline locally saved items
        final Map<int, ActivityModel> mergedMap = {};
        for (final item in serverList) {
          mergedMap[item.id] = item;
        }
        for (final item in localList) {
          mergedMap.putIfAbsent(item.id, () => item);
        }

        final mergedList = mergedMap.values.toList();
        final mergedIds = mergedList.map((e) => e.id).toSet();

        await _saveLocal(mergedList, mergedIds);
        return mergedList;
      }
    } catch (_) {
      // If server request fails (e.g. offline or unauthenticated), return local cache
    }

    return localList;
  }

  /// Toggle an activity favorite status with instant optimistic local persistence
  Future<bool> toggleFavorite(ActivityModel activity) async {
    final localList = await getLocalFavorites();
    final ids = (await getLocalFavoriteIds()).toSet();

    bool isNowFavorite;
    if (ids.contains(activity.id)) {
      // Remove
      ids.remove(activity.id);
      localList.removeWhere((item) => item.id == activity.id);
      isNowFavorite = false;
    } else {
      // Add
      ids.add(activity.id);
      // Remove duplicate if exists then add
      localList.removeWhere((item) => item.id == activity.id);
      localList.insert(0, activity);
      isNowFavorite = true;
    }

    // Save locally immediately
    await _saveLocal(localList, ids);

    // Call backend asynchronously
    try {
      await _apiClient.post(
        ApiEndpoints.favoritesToggle,
        data: {'activity_id': activity.id},
      );
    } catch (_) {
      // Offline fallback: already saved in SharedPreferences
    }

    return isNowFavorite;
  }

  /// Remove single activity from favorites
  Future<void> removeFavorite(int activityId) async {
    final localList = await getLocalFavorites();
    final ids = (await getLocalFavoriteIds()).toSet();

    ids.remove(activityId);
    localList.removeWhere((item) => item.id == activityId);

    await _saveLocal(localList, ids);

    try {
      await _apiClient.post(
        ApiEndpoints.favoritesToggle,
        data: {'activity_id': activityId},
      );
    } catch (_) {}
  }
}
