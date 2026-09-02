class OfferModel {
  final int id;
  final int ownerUserId;
  final int activityId;
  final String? activityName;
  final int? productId;
  final String? productName;
  final String title;
  final String description;
  final String offerType; // percentage, fixed, bundle, text
  final double? discountPercentage;
  final double? discountAmount;
  final double? originalPrice;
  final double? offerPrice;
  final String startsAt;
  final String endsAt;
  final bool isActive;
  final bool isFeatured;
  final String? coverImage;
  final String? terms;
  final int viewsCount;

  OfferModel({
    required this.id,
    required this.ownerUserId,
    required this.activityId,
    this.activityName,
    this.productId,
    this.productName,
    required this.title,
    required this.description,
    this.offerType = 'percentage',
    this.discountPercentage,
    this.discountAmount,
    this.originalPrice,
    this.offerPrice,
    required this.startsAt,
    required this.endsAt,
    this.isActive = true,
    this.isFeatured = false,
    this.coverImage,
    this.terms,
    this.viewsCount = 0,
  });

  factory OfferModel.fromJson(Map<String, dynamic> json) {
    return OfferModel(
      id: json['id'] ?? 0,
      ownerUserId: json['owner_user_id'] ?? 0,
      activityId: json['activity_id'] ?? (json['activity'] is Map ? json['activity']['id'] ?? 0 : 0),
      activityName: json['activity'] is Map ? json['activity']['name_ar'] : json['activity_name'],
      productId: json['product_id'] ?? (json['product'] is Map ? json['product']['id'] : null),
      productName: json['product'] is Map ? json['product']['name'] : json['product_name'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      offerType: json['offer_type'] ?? 'percentage',
      discountPercentage: (json['discount_percentage'] as num?)?.toDouble(),
      discountAmount: (json['discount_amount'] as num?)?.toDouble(),
      originalPrice: (json['original_price'] as num?)?.toDouble(),
      offerPrice: (json['offer_price'] as num?)?.toDouble(),
      startsAt: json['starts_at'] ?? '',
      endsAt: json['ends_at'] ?? '',
      isActive: json['is_active'] ?? true,
      isFeatured: json['is_featured'] ?? false,
      coverImage: json['cover_image'] ?? json['cover_url'],
      terms: json['terms'],
      viewsCount: json['views_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'owner_user_id': ownerUserId,
      'activity_id': activityId,
      'product_id': productId,
      'title': title,
      'description': description,
      'offer_type': offerType,
      'discount_percentage': discountPercentage,
      'discount_amount': discountAmount,
      'original_price': originalPrice,
      'offer_price': offerPrice,
      'starts_at': startsAt,
      'ends_at': endsAt,
      'is_active': isActive,
      'is_featured': isFeatured,
      'cover_image': coverImage,
      'terms': terms,
    };
  }

  OfferModel copyWith({
    int? id,
    int? ownerUserId,
    int? activityId,
    String? activityName,
    int? productId,
    String? productName,
    String? title,
    String? description,
    String? offerType,
    double? discountPercentage,
    double? discountAmount,
    double? originalPrice,
    double? offerPrice,
    String? startsAt,
    String? endsAt,
    bool? isActive,
    bool? isFeatured,
    String? coverImage,
    String? terms,
    int? viewsCount,
  }) {
    return OfferModel(
      id: id ?? this.id,
      ownerUserId: ownerUserId ?? this.ownerUserId,
      activityId: activityId ?? this.activityId,
      activityName: activityName ?? this.activityName,
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      title: title ?? this.title,
      description: description ?? this.description,
      offerType: offerType ?? this.offerType,
      discountPercentage: discountPercentage ?? this.discountPercentage,
      discountAmount: discountAmount ?? this.discountAmount,
      originalPrice: originalPrice ?? this.originalPrice,
      offerPrice: offerPrice ?? this.offerPrice,
      startsAt: startsAt ?? this.startsAt,
      endsAt: endsAt ?? this.endsAt,
      isActive: isActive ?? this.isActive,
      isFeatured: isFeatured ?? this.isFeatured,
      coverImage: coverImage ?? this.coverImage,
      terms: terms ?? this.terms,
      viewsCount: viewsCount ?? this.viewsCount,
    );
  }
}
