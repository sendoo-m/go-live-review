import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  /// Register FCM / APNs device token on backend
  Future<bool> registerDeviceToken({
    required String token,
    String platform = 'android',
    String? deviceName,
    String locale = 'ar',
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.registerDeviceToken,
        data: {
          'token': token,
          'platform': platform,
          'device_name': deviceName,
          'locale': locale,
        },
      );
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (_) {
      return false;
    }
  }

  /// Unregister device token (e.g., when logging out)
  Future<bool> unregisterDeviceToken({required String token}) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.unregisterDeviceToken,
        data: {'token': token},
      );
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (_) {
      return false;
    }
  }

  /// Fetch in-app notifications
  Future<List<AppNotificationModel>> getNotifications() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.notifications);
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> list = response.data['data'] ?? [];
        return list.map((item) => AppNotificationModel.fromJson(item)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Mark specific notification as read
  Future<bool> markAsRead(int notificationId) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.readNotification(notificationId));
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (_) {
      return false;
    }
  }

  /// Trigger a test notification for developer QA & validation
  Future<AppNotificationModel?> sendTestNotification({
    String? title,
    String? body,
    String type = 'activity',
    int? activityId,
    String? deepLink,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.testSendNotification,
        data: {
          'title': title,
          'body': body,
          'type': type,
          'activity_id': activityId,
          'deep_link': deepLink,
        },
      );
      if (response.statusCode == 200 && response.data['success'] == true) {
        return AppNotificationModel.fromJson(response.data['data']);
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
