import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import 'deep_link_service.dart';

class NotificationPayload {
  final String title;
  final String body;
  final String type; // 'activity', 'offer', 'product', 'system', 'general'
  final int? activityId;
  final int? productId;
  final String? deepLink;
  final Map<String, dynamic> rawData;

  NotificationPayload({
    required this.title,
    required this.body,
    this.type = 'general',
    this.activityId,
    this.productId,
    this.deepLink,
    this.rawData = const {},
  });

  factory NotificationPayload.fromMap(Map<String, dynamic> map) {
    return NotificationPayload(
      title: map['title'] ?? map['notification']?['title'] ?? 'تنبيه جديد',
      body: map['body'] ?? map['notification']?['body'] ?? '',
      type: map['type'] ?? map['data']?['type'] ?? 'general',
      activityId: map['activity_id'] != null
          ? int.tryParse(map['activity_id'].toString())
          : (map['data']?['activity_id'] != null
              ? int.tryParse(map['data']['activity_id'].toString())
              : null),
      productId: map['product_id'] != null
          ? int.tryParse(map['product_id'].toString())
          : null,
      deepLink: map['deep_link'] ?? map['data']?['deep_link'],
      rawData: map,
    );
  }

  /// Resolve to target route path
  String resolveRoutePath() {
    if (deepLink != null && deepLink!.isNotEmpty) {
      final parsed = DeepLinkService().parseUri(Uri.parse(deepLink!));
      if (parsed != null) return parsed.routePath;
    }
    if (type == 'activity' && activityId != null) {
      return '/activity/$activityId';
    }
    if (type == 'offer' && activityId != null) {
      return '/activity/$activityId';
    }
    return '/home';
  }
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final NotificationRepository _repository = NotificationRepository();
  final SettingsRepository _settingsRepository = SettingsRepository();

  // Stream for foreground notifications to notify UI
  final _foregroundNotificationController = StreamController<NotificationPayload>.broadcast();
  Stream<NotificationPayload> get onForegroundNotification => _foregroundNotificationController.stream;

  // Stored pending payload if opened from terminated state
  NotificationPayload? _pendingPayload;
  NotificationPayload? get pendingPayload => _pendingPayload;

  void clearPendingPayload() {
    _pendingPayload = null;
  }

  /// Initialize Notifications system and register token
  Future<void> initialize() async {
    // Check or create a persistent pseudo-FCM token for device identification
    String? token = await _settingsRepository.getSavedDeviceToken();
    if (token == null || token.isEmpty) {
      final random = Random().nextInt(999999);
      token = 'fcm_token_daleel_${DateTime.now().millisecondsSinceEpoch}_$random';
      await _settingsRepository.saveDeviceToken(token);
    }

    // Register token with backend server
    await _repository.registerDeviceToken(
      token: token,
      platform: 'android',
      deviceName: 'Flutter Device',
      locale: 'ar',
    );
  }

  /// Request Notification Permissions
  Future<bool> requestPermissions(BuildContext context) async {
    await _settingsRepository.markNotificationPermissionAsked();
    // On Android 13+ / iOS, this triggers OS permission dialog
    return true;
  }

  /// Simulate receiving a notification (Foreground / Background / Push)
  void handleIncomingMessage(Map<String, dynamic> messageData, {bool isAppInForeground = true}) {
    final payload = NotificationPayload.fromMap(messageData);

    if (isAppInForeground) {
      _foregroundNotificationController.add(payload);
    } else {
      _pendingPayload = payload;
    }
  }

  /// Handle user clicking/tapping on a notification
  void handleNotificationTap(BuildContext context, NotificationPayload payload) {
    final targetRoute = payload.resolveRoutePath();
    context.push(targetRoute);
  }

  /// Show an in-app banner for foreground notifications
  void showForegroundBanner(BuildContext context, NotificationPayload payload) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.notifications_active, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    payload.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    payload.body,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.8),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            TextButton(
              onPressed: () {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
                handleNotificationTap(context, payload);
              },
              style: TextButton.styleFrom(
                foregroundColor: AppColors.secondary,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              ),
              child: const Text('عرض', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }
}
