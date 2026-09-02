import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/activity_detail_model.dart';
import '../models/product_model.dart';
import '../models/review_model.dart';

class ActivityRepository {
  final ApiClient _apiClient;

  ActivityRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Fetch comprehensive activity details by ID
  Future<ActivityDetailModel> getActivityDetails(int activityId) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.activityDetails(activityId));
      if (response.data != null && response.data['success'] == true) {
        return ActivityDetailModel.fromJson(response.data['data']);
      }
      throw Exception(response.data?['message'] ?? 'فشل في استرجاع تفاصيل النشاط');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'خطأ في الاتصال بالخادم';
      throw Exception(msg);
    } catch (e) {
      throw Exception('حدث خطأ غير متوقع: $e');
    }
  }

  /// Fetch products belonging to a specific activity
  Future<List<ProductModel>> getActivityProducts(int activityId) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.activityProducts(activityId));
      if (response.data != null && response.data['success'] == true) {
        final List<dynamic> list = response.data['data'] ?? [];
        return list.map((item) => ProductModel.fromJson(item)).toList();
      }
      return [];
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'تعذر جلب المنتجات';
      throw Exception(msg);
    } catch (e) {
      throw Exception('خطأ غير متوقع أثناء جلب المنتجات: $e');
    }
  }

  /// Add a customer review for an activity
  Future<ReviewModel> submitReview({
    required int activityId,
    required int rating,
    required String comment,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.activityReviews(activityId),
        data: {
          'rating': rating,
          'comment': comment,
        },
      );
      if (response.data != null && response.data['success'] == true) {
        return ReviewModel.fromJson(response.data['data']);
      }
      throw Exception(response.data?['message'] ?? 'فشل في إضافة التقييم');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'تعذر إرسال التقييم';
      throw Exception(msg);
    } catch (e) {
      throw Exception('خطأ أثناء إرسال التقييم: $e');
    }
  }
}
