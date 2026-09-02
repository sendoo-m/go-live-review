class ProductActivitySummary {
  final int id;
  final String nameAr;
  final String? slug;
  final String? phone;
  final String? addressAr;
  final double? latitude;
  final double? longitude;

  ProductActivitySummary({
    required this.id,
    required this.nameAr,
    this.slug,
    this.phone,
    this.addressAr,
    this.latitude,
    this.longitude,
  });

  factory ProductActivitySummary.fromJson(Map<String, dynamic> json) {
    return ProductActivitySummary(
      id: json['id'] ?? 0,
      nameAr: json['name_ar'] ?? json['name'] ?? '',
      slug: json['slug'],
      phone: json['phone'],
      addressAr: json['address_ar'] ?? json['address'],
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name_ar': nameAr,
      'slug': slug,
      'phone': phone,
      'address_ar': addressAr,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

class ProductModel {
  final int id;
  final int activityId;
  final int? ownerUserId;
  final String name;
  final String? slug;
  final String shortDescription;
  final String fullDescription;
  final String? sku;
  final double price;
  final double? salePrice;
  final String currency;
  final bool isAvailable;
  final bool isFeatured;
  final int? stockQty;
  final String availabilityNote;
  final int sortOrder;
  final String coverImage;
  final List<String> gallery;
  final String status;
  final int viewsCount;
  final String? createdAt;
  final String? updatedAt;
  final ProductActivitySummary? activity;

  ProductModel({
    required this.id,
    required this.activityId,
    this.ownerUserId,
    required this.name,
    this.slug,
    this.shortDescription = '',
    this.fullDescription = '',
    this.sku,
    required this.price,
    this.salePrice,
    this.currency = 'ج.م',
    this.isAvailable = true,
    this.isFeatured = false,
    this.stockQty,
    this.availabilityNote = 'متوفر للطلب المباشر',
    this.sortOrder = 0,
    required this.coverImage,
    this.gallery = const [],
    this.status = 'published',
    this.viewsCount = 0,
    this.createdAt,
    this.updatedAt,
    this.activity,
  });

  bool get hasDiscount => salePrice != null && salePrice! > 0 && salePrice! < price;

  double get effectivePrice => hasDiscount ? salePrice! : price;

  int get discountPercent {
    if (!hasDiscount || price <= 0) return 0;
    return (((price - salePrice!) / price) * 100).round();
  }

  bool get isPublished => status == 'published';

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] ?? 0,
      activityId: json['activity_id'] ?? 0,
      ownerUserId: json['owner_user_id'],
      name: json['name'] ?? '',
      slug: json['slug'],
      shortDescription: json['short_description'] ?? '',
      fullDescription: json['full_description'] ?? json['description'] ?? '',
      sku: json['sku'],
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      salePrice: (json['sale_price'] as num?)?.toDouble(),
      currency: json['currency'] ?? 'ج.م',
      isAvailable: json['is_available'] == true || json['is_available'] == 1,
      isFeatured: json['is_featured'] == true || json['is_featured'] == 1,
      stockQty: json['stock_qty'] != null ? (json['stock_qty'] as num).toInt() : null,
      availabilityNote: json['availability_note'] ?? 'متوفر للطلب المباشر',
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
      coverImage: json['cover_image'] ?? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600',
      gallery: (json['gallery'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      status: json['status'] ?? 'published',
      viewsCount: json['views_count'] ?? 0,
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      activity: json['activity'] is Map<String, dynamic>
          ? ProductActivitySummary.fromJson(json['activity'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'activity_id': activityId,
      'owner_user_id': ownerUserId,
      'name': name,
      'slug': slug,
      'short_description': shortDescription,
      'full_description': fullDescription,
      'sku': sku,
      'price': price,
      'sale_price': salePrice,
      'currency': currency,
      'is_available': isAvailable,
      'is_featured': isFeatured,
      'stock_qty': stockQty,
      'availability_note': availabilityNote,
      'sort_order': sortOrder,
      'cover_image': coverImage,
      'gallery': gallery,
      'status': status,
      'views_count': viewsCount,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  ProductModel copyWith({
    int? id,
    int? activityId,
    int? ownerUserId,
    String? name,
    String? slug,
    String? shortDescription,
    String? fullDescription,
    String? sku,
    double? price,
    double? salePrice,
    String? currency,
    bool? isAvailable,
    bool? isFeatured,
    int? stockQty,
    String? availabilityNote,
    int? sortOrder,
    String? coverImage,
    List<String>? gallery,
    String? status,
    int? viewsCount,
    String? createdAt,
    String? updatedAt,
    ProductActivitySummary? activity,
  }) {
    return ProductModel(
      id: id ?? this.id,
      activityId: activityId ?? this.activityId,
      ownerUserId: ownerUserId ?? this.ownerUserId,
      name: name ?? this.name,
      slug: slug ?? this.slug,
      shortDescription: shortDescription ?? this.shortDescription,
      fullDescription: fullDescription ?? this.fullDescription,
      sku: sku ?? this.sku,
      price: price ?? this.price,
      salePrice: salePrice ?? this.salePrice,
      currency: currency ?? this.currency,
      isAvailable: isAvailable ?? this.isAvailable,
      isFeatured: isFeatured ?? this.isFeatured,
      stockQty: stockQty ?? this.stockQty,
      availabilityNote: availabilityNote ?? this.availabilityNote,
      sortOrder: sortOrder ?? this.sortOrder,
      coverImage: coverImage ?? this.coverImage,
      gallery: gallery ?? this.gallery,
      status: status ?? this.status,
      viewsCount: viewsCount ?? this.viewsCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      activity: activity ?? this.activity,
    );
  }
}
