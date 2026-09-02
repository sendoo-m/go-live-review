import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/search_models.dart';
import '../models/activity_model.dart';
import '../models/app_bootstrap.dart';

class SearchRepository {
  final ApiClient _apiClient;

  SearchRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Perform unified search across activities, services, and products
  Future<UnifiedSearchResponseModel> searchUnified(SearchFilterParams params) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.searchUnified,
        queryParameters: params.toQueryParams(),
      );

      if (response.data is Map<String, dynamic>) {
        return UnifiedSearchResponseModel.fromJson(response.data as Map<String, dynamic>);
      }
      return UnifiedSearchResponseModel(
        query: params.query,
        totalResults: 0,
        stats: SearchStatsModel(),
        items: [],
      );
    } catch (e) {
      // Return empty results on error rather than crashing
      return UnifiedSearchResponseModel(
        query: params.query,
        totalResults: 0,
        stats: SearchStatsModel(),
        items: [],
      );
    }
  }

  /// Get activities for map display with valid coordinates
  Future<List<SearchResultItemModel>> getMapItems({
    int? governorateId,
    int? categoryId,
    String? sectionSlug,
    String? query,
    double? lat,
    double? lng,
    double? radiusKm,
  }) async {
    final params = SearchFilterParams(
      query: query ?? '',
      governorateId: governorateId,
      categoryId: categoryId,
      sectionSlug: sectionSlug,
      userLat: lat,
      userLng: lng,
    );

    final res = await searchUnified(params);
    // Filter items that actually have valid latitude and longitude
    return res.items.where((item) => item.latitude != null && item.longitude != null).toList();
  }

  /// Get all categories for search filter chips
  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.categories);
      final list = (response.data['data'] as List<dynamic>?) ?? [];
      return list.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  /// Get governorates for search filter chips
  Future<List<GovernorateModel>> getGovernorates() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.governorates);
      final list = (response.data['data'] as List<dynamic>?) ?? [];
      return list.map((e) => GovernorateModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }
}
