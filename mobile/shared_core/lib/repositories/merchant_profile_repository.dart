import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/activity_model.dart';

class MerchantProfileRepository {
  final ApiClient _apiClient;

  MerchantProfileRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Get merchant's activities
  Future<List<ActivityModel>> getMerchantActivities() async {
    final response = await _apiClient.get(ApiEndpoints.merchantActivities);
    if (response['success'] == true && response['data'] is List) {
      return (response['data'] as List)
          .map((item) => ActivityModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  /// Get single activity details for editing
  Future<ActivityModel> getActivityDetails(int activityId) async {
    final response = await _apiClient.get(ApiEndpoints.activityDetails(activityId));
    if (response['success'] == true && response['data'] != null) {
      return ActivityModel.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw Exception(response['message'] ?? 'فشل جلب بيانات النشاط التجاري');
  }

  /// Update merchant activity details
  Future<ActivityModel> updateActivity({
    required int activityId,
    required Map<String, dynamic> data,
  }) async {
    final response = await _apiClient.put(
      '${ApiEndpoints.activities}/$activityId',
      data: data,
    );

    if (response['success'] == true && response['data'] != null) {
      return ActivityModel.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw Exception(response['message'] ?? 'فشل تحديث بيانات النشاط التجاري');
  }
}
