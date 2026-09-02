class ReviewUserModel {
  final int? id;
  final String name;
  final String? avatarUrl;

  ReviewUserModel({
    this.id,
    required this.name,
    this.avatarUrl,
  });

  factory ReviewUserModel.fromJson(Map<String, dynamic> json) {
    return ReviewUserModel(
      id: json['id'],
      name: json['name'] ?? 'مستخدم',
      avatarUrl: json['avatar_url'] ?? json['avatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'avatar_url': avatarUrl,
    };
  }
}

class ReviewModel {
  final int id;
  final int activityId;
  final int userId;
  final int rating;
  final String comment;
  final bool isApproved;
  final bool isReported;
  final String? createdAt;
  final ReviewUserModel? user;

  ReviewModel({
    required this.id,
    required this.activityId,
    required this.userId,
    required this.rating,
    required this.comment,
    this.isApproved = true,
    this.isReported = false,
    this.createdAt,
    this.user,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] ?? 0,
      activityId: json['activity_id'] ?? 0,
      userId: json['user_id'] ?? 0,
      rating: (json['rating'] as num?)?.toInt() ?? 5,
      comment: json['comment'] ?? '',
      isApproved: json['is_approved'] == true || json['is_approved'] == 1,
      isReported: json['is_reported'] == true || json['is_reported'] == 1,
      createdAt: json['created_at'],
      user: json['user'] is Map<String, dynamic>
          ? ReviewUserModel.fromJson(json['user'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'activity_id': activityId,
      'user_id': userId,
      'rating': rating,
      'comment': comment,
      'is_approved': isApproved,
      'is_reported': isReported,
      'created_at': createdAt,
    };
  }
}
