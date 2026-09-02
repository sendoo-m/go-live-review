import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository();
});

class NotificationsState {
  final bool isLoading;
  final List<AppNotificationModel> notifications;
  final String? error;
  final int unreadCount;

  const NotificationsState({
    this.isLoading = false,
    this.notifications = const [],
    this.error,
    this.unreadCount = 0,
  });

  NotificationsState copyWith({
    bool? isLoading,
    List<AppNotificationModel>? notifications,
    String? error,
    int? unreadCount,
  }) {
    return NotificationsState(
      isLoading: isLoading ?? this.isLoading,
      notifications: notifications ?? this.notifications,
      error: error,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final NotificationRepository _repository;

  NotificationsNotifier(this._repository) : super(const NotificationsState()) {
    loadNotifications();
  }

  Future<void> loadNotifications() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await _repository.getNotifications();
      final unread = list.where((n) => !n.isRead).length;
      state = state.copyWith(
        isLoading: false,
        notifications: list,
        unreadCount: unread,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<void> markAsRead(int notificationId) async {
    // Optimistic update
    final updatedList = state.notifications.map((n) {
      if (n.id == notificationId) {
        return n.copyWith(isRead: true);
      }
      return n;
    }).toList();

    state = state.copyWith(
      notifications: updatedList,
      unreadCount: updatedList.where((n) => !n.isRead).length,
    );

    await _repository.markAsRead(notificationId);
  }

  Future<AppNotificationModel?> triggerTestNotification({
    String? title,
    String? body,
    String type = 'activity',
    int? activityId,
    String? deepLink,
  }) async {
    final notif = await _repository.sendTestNotification(
      title: title,
      body: body,
      type: type,
      activityId: activityId,
      deepLink: deepLink,
    );
    if (notif != null) {
      state = state.copyWith(
        notifications: [notif, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      );
    }
    return notif;
  }
}

final notificationsNotifierProvider = StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  final repo = ref.watch(notificationRepositoryProvider);
  return NotificationsNotifier(repo);
});
