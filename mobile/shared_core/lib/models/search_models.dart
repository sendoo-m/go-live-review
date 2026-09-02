class SearchResultItemModel {
  final String id;
  final int numericId;
  final String itemType; // 'shop' | 'service' | 'product'
  final String title;
  final String? titleEn;
  final String? slug;
  final String? description;
  final int? categoryId;
  final String? categoryNameAr;
  final String? categoryIcon;
  final String? sectionSlug;
  final String? sectionNameAr;
  final int? governorateId;
  final String? governorateNameAr;
  final int? cityId;
  final String? cityNameAr;
  final String? neighborhoodNameAr;
  final String? addressAr;
  final double? latitude;
  final double? longitude;
  final String? coverImage;
  final double ratingAvg;
  final int reviewsCount;
  final String? phone;
  final String? whatsappNumber;
  final bool hasDelivery;
  final bool isFeatured;
  final bool isVerified;
  final double? price;
  final double? salePrice;
  final String currency;
  final bool isAvailable;
  final int? parentActivityId;
  final String? parentActivityNameAr;
  final double? distanceKm;

  SearchResultItemModel({
    required this.id,
    required this.numericId,
    required this.itemType,
    required this.title,
    this.titleEn,
    this.slug,
    this.description,
    this.categoryId,
    this.categoryNameAr,
    this.categoryIcon,
    this.sectionSlug,
    this.sectionNameAr,
    this.governorateId,
    this.governorateNameAr,
    this.cityId,
    this.cityNameAr,
    this.neighborhoodNameAr,
    this.addressAr,
    this.latitude,
    this.longitude,
    this.coverImage,
    this.ratingAvg = 5.0,
    this.reviewsCount = 0,
    this.phone,
    this.whatsappNumber,
    this.hasDelivery = false,
    this.isFeatured = false,
    this.isVerified = true,
    this.price,
    this.salePrice,
    this.currency = 'ج.م',
    this.isAvailable = true,
    this.parentActivityId,
    this.parentActivityNameAr,
    this.distanceKm,
  });

  bool get isProduct => itemType == 'product';
  bool get isService => itemType == 'service';
  bool get isShop => itemType == 'shop';

  double? get effectivePrice => salePrice ?? price;
  bool get hasDiscount => salePrice != null && price != null && salePrice! < price!;
  int get discountPercent => hasDiscount ? (((price! - salePrice!) / price!) * 100).round() : 0;

  int get targetActivityId => isProduct ? (parentActivityId ?? numericId) : numericId;

  String get locationText {
    final parts = [governorateNameAr, cityNameAr, neighborhoodNameAr]
        .where((p) => p != null && p.isNotEmpty)
        .toList();
    if (parts.isNotEmpty) {
      return parts.join('، ');
    }
    return addressAr ?? '';
  }

  factory SearchResultItemModel.fromJson(Map<String, dynamic> json) {
    return SearchResultItemModel(
      id: json['id']?.toString() ?? '',
      numericId: json['numeric_id'] is int ? json['numeric_id'] : (int.tryParse(json['numeric_id']?.toString() ?? '') ?? 0),
      itemType: json['item_type']?.toString() ?? 'shop',
      title: json['title']?.toString() ?? '',
      titleEn: json['title_en']?.toString(),
      slug: json['slug']?.toString(),
      description: json['description']?.toString(),
      categoryId: json['category_id'] is int ? json['category_id'] : int.tryParse(json['category_id']?.toString() ?? ''),
      categoryNameAr: json['category_name_ar']?.toString(),
      categoryIcon: json['category_icon']?.toString(),
      sectionSlug: json['section_slug']?.toString(),
      sectionNameAr: json['section_name_ar']?.toString(),
      governorateId: json['governorate_id'] is int ? json['governorate_id'] : int.tryParse(json['governorate_id']?.toString() ?? ''),
      governorateNameAr: json['governorate_name_ar']?.toString(),
      cityId: json['city_id'] is int ? json['city_id'] : int.tryParse(json['city_id']?.toString() ?? ''),
      cityNameAr: json['city_name_ar']?.toString(),
      neighborhoodNameAr: json['neighborhood_name_ar']?.toString(),
      addressAr: json['address_ar']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      coverImage: json['cover_image']?.toString(),
      ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 5.0,
      reviewsCount: json['reviews_count'] is int ? json['reviews_count'] : (int.tryParse(json['reviews_count']?.toString() ?? '') ?? 0),
      phone: json['phone']?.toString(),
      whatsappNumber: json['whatsapp_number']?.toString(),
      hasDelivery: json['has_delivery'] == true || json['has_delivery'] == 1,
      isFeatured: json['is_featured'] == true || json['is_featured'] == 1,
      isVerified: json['status'] == 'verified' || json['is_verified'] == true,
      price: (json['price'] as num?)?.toDouble(),
      salePrice: (json['sale_price'] as num?)?.toDouble(),
      currency: json['currency']?.toString() ?? 'ج.م',
      isAvailable: json['is_available'] == null ? true : (json['is_available'] == true || json['is_available'] == 1),
      parentActivityId: json['parent_activity_id'] is int ? json['parent_activity_id'] : int.tryParse(json['parent_activity_id']?.toString() ?? ''),
      parentActivityNameAr: json['parent_activity_name_ar']?.toString(),
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'numeric_id': numericId,
      'item_type': itemType,
      'title': title,
      'title_en': titleEn,
      'slug': slug,
      'description': description,
      'category_id': categoryId,
      'category_name_ar': categoryNameAr,
      'category_icon': categoryIcon,
      'section_slug': sectionSlug,
      'section_name_ar': sectionNameAr,
      'governorate_id': governorateId,
      'governorate_name_ar': governorateNameAr,
      'city_id': cityId,
      'cityNameAr': cityNameAr,
      'neighborhood_name_ar': neighborhoodNameAr,
      'address_ar': addressAr,
      'latitude': latitude,
      'longitude': longitude,
      'cover_image': coverImage,
      'rating_avg': ratingAvg,
      'reviews_count': reviewsCount,
      'phone': phone,
      'whatsapp_number': whatsappNumber,
      'has_delivery': hasDelivery,
      'is_featured': isFeatured,
      'price': price,
      'sale_price': salePrice,
      'currency': currency,
      'is_available': isAvailable,
      'parent_activity_id': parentActivityId,
      'parent_activity_name_ar': parentActivityNameAr,
      'distance_km': distanceKm,
    };
  }
}

class SearchStatsModel {
  final int total;
  final int shopsCount;
  final int servicesCount;
  final int productsCount;
  final int withDeliveryCount;

  SearchStatsModel({
    this.total = 0,
    this.shopsCount = 0,
    this.servicesCount = 0,
    this.productsCount = 0,
    this.withDeliveryCount = 0,
  });

  factory SearchStatsModel.fromJson(Map<String, dynamic> json) {
    return SearchStatsModel(
      total: json['total'] ?? 0,
      shopsCount: json['shops_count'] ?? 0,
      servicesCount: json['services_count'] ?? 0,
      productsCount: json['products_count'] ?? 0,
      withDeliveryCount: json['with_delivery_count'] ?? 0,
    );
  }
}

class UnifiedSearchResponseModel {
  final String query;
  final int totalResults;
  final SearchStatsModel stats;
  final List<SearchResultItemModel> items;

  UnifiedSearchResponseModel({
    required this.query,
    required this.totalResults,
    required this.stats,
    required this.items,
  });

  factory UnifiedSearchResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? {};
    final itemsList = (data['items'] as List<dynamic>?)
            ?.map((e) => SearchResultItemModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return UnifiedSearchResponseModel(
      query: json['query']?.toString() ?? '',
      totalResults: json['total_results'] ?? itemsList.length,
      stats: json['stats'] is Map ? SearchStatsModel.fromJson(json['stats']) : SearchStatsModel(),
      items: itemsList,
    );
  }
}

class SearchFilterParams {
  final String query;
  final String? type; // 'all', 'shop', 'service', 'product'
  final int? governorateId;
  final int? cityId;
  final int? categoryId;
  final String? sectionSlug;
  final bool? hasDelivery;
  final bool? isVerified;
  final String sortBy; // 'relevance', 'rating', 'newest', 'distance', 'price_asc', 'price_desc'
  final double? userLat;
  final double? userLng;

  SearchFilterParams({
    this.query = '',
    this.type = 'all',
    this.governorateId,
    this.cityId,
    this.categoryId,
    this.sectionSlug,
    this.hasDelivery,
    this.isVerified,
    this.sortBy = 'relevance',
    this.userLat,
    this.userLng,
  });

  SearchFilterParams copyWith({
    String? query,
    String? type,
    int? governorateId,
    int? cityId,
    int? categoryId,
    String? sectionSlug,
    bool? hasDelivery,
    bool? isVerified,
    String? sortBy,
    double? userLat,
    double? userLng,
    bool clearGovernorate = false,
    bool clearCategory = false,
    bool clearSection = false,
    bool clearType = false,
    bool clearDelivery = false,
  }) {
    return SearchFilterParams(
      query: query ?? this.query,
      type: clearType ? 'all' : (type ?? this.type),
      governorateId: clearGovernorate ? null : (governorateId ?? this.governorateId),
      cityId: clearGovernorate ? null : (cityId ?? this.cityId),
      categoryId: clearCategory ? null : (categoryId ?? this.categoryId),
      sectionSlug: clearSection ? null : (sectionSlug ?? this.sectionSlug),
      hasDelivery: clearDelivery ? null : (hasDelivery ?? this.hasDelivery),
      isVerified: isVerified ?? this.isVerified,
      sortBy: sortBy ?? this.sortBy,
      userLat: userLat ?? this.userLat,
      userLng: userLng ?? this.userLng,
    );
  }

  Map<String, dynamic> toQueryParams() {
    final map = <String, dynamic>{};
    if (query.isNotEmpty) map['q'] = query;
    if (type != null && type != 'all') map['type'] = type;
    if (governorateId != null) map['governorate_id'] = governorateId;
    if (cityId != null) map['city_id'] = cityId;
    if (categoryId != null) map['category_id'] = categoryId;
    if (sectionSlug != null && sectionSlug != 'all') map['section_slug'] = sectionSlug;
    if (hasDelivery == true) map['has_delivery'] = 'true';
    if (isVerified == true) map['is_verified'] = 'true';
    if (sortBy.isNotEmpty && sortBy != 'relevance') map['sort_by'] = sortBy;
    if (userLat != null && userLng != null) {
      map['lat'] = userLat;
      map['lng'] = userLng;
    }
    return map;
  }
}
