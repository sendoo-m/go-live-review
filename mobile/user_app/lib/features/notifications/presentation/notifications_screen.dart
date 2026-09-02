import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import 'package:intl/intl.dart';
import '../../../services/notification_service.dart';
import '../providers/notifications_provider.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(notificationsNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('الإشعارات والتنبيهات', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'تحديث',
            onPressed: () {
              ref.read(notificationsNotifierProvider.notifier).loadNotifications();
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showSendTestDialog(context, ref),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.send),
        label: const Text('إرسال إشعار تجريبي', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: state.isLoading && state.notifications.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : state.notifications.isEmpty
              ? _buildEmptyState(context)
              : RefreshIndicator(
                  onRefresh: () => ref.read(notificationsNotifierProvider.notifier).loadNotifications(),
                  child: ListView.separated(
                    padding: const EdgeInsets.only(top: 12, bottom: 80, left: 16, right: 16),
                    itemCount: state.notifications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final notif = state.notifications[index];
                      return _buildNotificationCard(context, ref, notif);
                    },
                  ),
                ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.notifications_none, size: 64, color: AppColors.primary),
            ),
            const SizedBox(height: 16),
            const Text(
              'لا توجد إشعارات حالياً',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            const Text(
              'ستظهر هنا أحدث العروض والأنشطة الجديدة والتنبيهات الهامة فور وصولها.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(BuildContext context, WidgetRef ref, AppNotificationModel notif) {
    IconData iconData = Icons.notifications;
    Color iconColor = AppColors.primary;
    Color bgColor = AppColors.primaryLight;

    if (notif.type == 'offer') {
      iconData = Icons.local_offer;
      iconColor = AppColors.secondary;
      bgColor = AppColors.secondaryLight;
    } else if (notif.type == 'activity') {
      iconData = Icons.storefront;
      iconColor = AppColors.primary;
      bgColor = AppColors.primaryLight;
    } else if (notif.type == 'system') {
      iconData = Icons.info;
      iconColor = AppColors.info;
      bgColor = Colors.blue.shade50;
    }

    final formattedDate = DateFormat('yyyy-MM-dd • hh:mm a', 'ar').format(notif.createdAt);

    return InkWell(
      onTap: () {
        if (!notif.isRead) {
          ref.read(notificationsNotifierProvider.notifier).markAsRead(notif.id);
        }

        // Navigate using payload
        final payload = NotificationPayload(
          title: notif.title,
          body: notif.body,
          type: notif.type,
          activityId: notif.activityId,
          productId: notif.productId,
          deepLink: notif.deepLink,
        );

        NotificationService().handleNotificationTap(context, payload);
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notif.isRead ? Colors.white : const Color(0xFFF0FDF4), // Light emerald tint for unread
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: notif.isRead ? AppColors.border : AppColors.primary.withOpacity(0.3),
            width: notif.isRead ? 1 : 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: bgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(iconData, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!notif.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notif.body,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        formattedDate,
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      if (notif.deepLink != null && notif.deepLink!.isNotEmpty)
                        Row(
                          children: const [
                            Text(
                              'عرض التفاصيل',
                              style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(width: 2),
                            Icon(Icons.arrow_forward, size: 12, color: AppColors.primary),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSendTestDialog(BuildContext context, WidgetRef ref) {
    final titleCtrl = TextEditingController(text: 'عرض خاص في مطعم بيت الشاورما');
    final bodyCtrl = TextEditingController(text: 'خصم 20% لفترة محدودة على وجبات العائلة! اضغط لعرض المتجر.');
    String selectedType = 'activity';
    int selectedActivityId = 1;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إرسال إشعار تجريبي (QA)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('نوع التنبيه', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                DropdownButton<String>(
                  isExpanded: true,
                  value: selectedType,
                  items: const [
                    DropdownMenuItem(value: 'activity', child: Text('تفاصيل نشاط تجاري (Deep Link)')),
                    DropdownMenuItem(value: 'offer', child: Text('عرض ترويجي وخصومات')),
                    DropdownMenuItem(value: 'general', child: Text('إشعار عام')),
                  ],
                  onChanged: (v) {
                    if (v != null) {
                      setDialogState(() => selectedType = v);
                    }
                  },
                ),
                const SizedBox(height: 12),
                const Text('عنوان الإشعار', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                TextField(
                  controller: titleCtrl,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('نص الإشعار', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                TextField(
                  controller: bodyCtrl,
                  maxLines: 2,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('معرف النشاط (Activity ID)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                DropdownButton<int>(
                  isExpanded: true,
                  value: selectedActivityId,
                  items: const [
                    DropdownMenuItem(value: 1, child: Text('مطعم بيت الشاورما السوري (ID: 1)')),
                    DropdownMenuItem(value: 2, child: Text('صيدلية الشفاء التخصصية (ID: 2)')),
                    DropdownMenuItem(value: 3, child: Text('مركز الأمل للصيانة والأجهزة (ID: 3)')),
                    DropdownMenuItem(value: 4, child: Text('معرض الأناقة للأثاث المنزلي (ID: 4)')),
                  ],
                  onChanged: (v) {
                    if (v != null) {
                      setDialogState(() => selectedActivityId = v);
                    }
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                final deepLink = 'daleel://activity/$selectedActivityId';
                final notif = await ref.read(notificationsNotifierProvider.notifier).triggerTestNotification(
                  title: titleCtrl.text.trim(),
                  body: bodyCtrl.text.trim(),
                  type: selectedType,
                  activityId: selectedActivityId,
                  deepLink: deepLink,
                );

                if (notif != null && context.mounted) {
                  // Trigger foreground banner
                  NotificationService().showForegroundBanner(
                    context,
                    NotificationPayload(
                      title: notif.title,
                      body: notif.body,
                      type: notif.type,
                      activityId: notif.activityId,
                      deepLink: notif.deepLink,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
              child: const Text('إرسال فوراً'),
            ),
          ],
        ),
      ),
    );
  }
}
