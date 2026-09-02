import 'activity_model.dart';

class MerchantStats {
  final int activitiesCount;
  final int verifiedActivitiesCount;
  final int pendingActivitiesCount;
  final int productsCount;
  final int availableProductsCount;
  final int inquiriesCount;
  final int newInquiriesCount;
  final int reviewsCount;
  final int offersCount;
  final int mediaCount;
  final int totalViews;
  final double avgRating;

  MerchantStats({
    required this.activitiesCount,
    required this.verifiedActivitiesCount,
    required this.pendingActivitiesCount,
    required this.productsCount,
    required this.availableProductsCount,
    required this.inquiriesCount,
    required this.newInquiriesCount,
    required this.reviewsCount,
    this.offersCount = 0,
    this.mediaCount = 0,
    required this.totalViews,
    required this.avgRating,
  });

  factory MerchantStats.fromJson(Map<String, dynamic> json) {
    return MerchantStats(
      activitiesCount: json['activities_count'] ?? 0,
      verifiedActivitiesCount: json['verified_activities_count'] ?? 0,
      pendingActivitiesCount: json['pending_activities_count'] ?? 0,
      productsCount: json['products_count'] ?? 0,
      availableProductsCount: json['available_products_count'] ?? 0,
      inquiriesCount: json['inquiries_count'] ?? 0,
      newInquiriesCount: json['new_inquiries_count'] ?? 0,
      reviewsCount: json['reviews_count'] ?? 0,
      offersCount: json['offers_count'] ?? 0,
      mediaCount: json['media_count'] ?? 0,
      totalViews: json['total_views'] ?? 0,
      avgRating: (json['avg_rating'] as num?)?.toDouble() ?? 5.0,
    );
  }
}

class MerchantInquiry {
  final int id;
  final int activityId;
  final String? activityName;
  final int? productId;
  final String? productName;
  final String senderName;
  final String senderPhone;
  final String message;
  final String status;
  final String createdAt;

  MerchantInquiry({
    required this.id,
    required this.activityId,
    this.activityName,
    this.productId,
    this.productName,
    required this.senderName,
    required this.senderPhone,
    required this.message,
    required this.status,
    required this.createdAt,
  });

  factory MerchantInquiry.fromJson(Map<String, dynamic> json) {
    return MerchantInquiry(
      id: json['id'] ?? 0,
      activityId: json['activity_id'] ?? 0,
      activityName: json['activity_name'],
      productId: json['product_id'],
      productName: json['product_name'],
      senderName: json['sender_name'] ?? json['name'] ?? 'عميل',
      senderPhone: json['sender_phone'] ?? json['phone'] ?? '',
      message: json['message'] ?? '',
      status: json['status'] ?? 'new',
      createdAt: json['created_at'] ?? '',
    );
  }
}

class MerchantDashboardData {
  final Map<String, dynamic> merchant;
  final MerchantStats stats;
  final List<ActivityModel> activities;
  final List<MerchantInquiry> recentInquiries;

  MerchantDashboardData({
    required this.merchant,
    required this.stats,
    required this.activities,
    required this.recentInquiries,
  });

  factory MerchantDashboardData.fromJson(Map<String, dynamic> json) {
    return MerchantDashboardData(
      merchant: json['merchant'] as Map<String, dynamic>? ?? {},
      stats: MerchantStats.fromJson(json['stats'] as Map<String, dynamic>? ?? {}),
      activities: (json['activities'] as List<dynamic>? ?? [])
          .map((e) => ActivityModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      recentInquiries: (json['recent_inquiries'] as List<dynamic>? ?? [])
          .map((e) => MerchantInquiry.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
