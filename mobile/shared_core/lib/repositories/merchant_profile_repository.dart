import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/activity_model.dart';

class MerchantProfileRepository {
  final ApiClient _apiClient;

  MerchantProfileRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Get merchant's activities
  Future<List<ActivityModel>> getMerchantActivities() async {
    final response = await _apiClient.get(ApiEndpoints.merchantActivities);
    final responseData = response.data as Map<String, dynamic>;
    if (responseData['success'] == true && responseData['data'] is List) {
      return (responseData['data'] as List)
          .map((item) => ActivityModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  /// Get single activity details for editing
  Future<ActivityModel> getActivityDetails(int activityId) async {
    final response = await _apiClient.get(ApiEndpoints.activityDetails(activityId));
    final responseData = response.data as Map<String, dynamic>;
    if (responseData['success'] == true && responseData['data'] != null) {
      return ActivityModel.fromJson(responseData['data'] as Map<String, dynamic>);
    }
    throw Exception(responseData['message'] ?? 'فشل جلب بيانات النشاط التجاري');
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

    final responseData = response.data as Map<String, dynamic>;
    if (responseData['success'] == true && responseData['data'] != null) {
      return ActivityModel.fromJson(responseData['data'] as Map<String, dynamic>);
    }
    throw Exception(responseData['message'] ?? 'فشل تحديث بيانات النشاط التجاري');
  }
}
