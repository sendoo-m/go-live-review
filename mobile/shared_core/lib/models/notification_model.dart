class AppNotificationModel {
  final int id;
  final int? userId;
  final String title;
  final String body;
  final String type;
  final int? activityId;
  final int? productId;
  final String? deepLink;
  final Map<String, dynamic>? payload;
  final bool isRead;
  final DateTime createdAt;

  AppNotificationModel({
    required this.id,
    this.userId,
    required this.title,
    required this.body,
    this.type = 'general',
    this.activityId,
    this.productId,
    this.deepLink,
    this.payload,
    this.isRead = false,
    required this.createdAt,
  });

  AppNotificationModel copyWith({
    int? id,
    int? userId,
    String? title,
    String? body,
    String? type,
    int? activityId,
    int? productId,
    String? deepLink,
    Map<String, dynamic>? payload,
    bool? isRead,
    DateTime? createdAt,
  }) {
    return AppNotificationModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      activityId: activityId ?? this.activityId,
      productId: productId ?? this.productId,
      deepLink: deepLink ?? this.deepLink,
      payload: payload ?? this.payload,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  factory AppNotificationModel.fromJson(Map<String, dynamic> json) {
    return AppNotificationModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      userId: json['user_id'] != null ? int.tryParse(json['user_id'].toString()) : null,
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      type: json['type'] ?? 'general',
      activityId: json['activity_id'] != null ? int.tryParse(json['activity_id'].toString()) : null,
      productId: json['product_id'] != null ? int.tryParse(json['product_id'].toString()) : null,
      deepLink: json['deep_link'],
      payload: json['payload'] is Map<String, dynamic> ? json['payload'] : null,
      isRead: json['is_read'] == true || json['is_read'] == 1,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'body': body,
      'type': type,
      'activity_id': activityId,
      'product_id': productId,
      'deep_link': deepLink,
      'payload': payload,
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
