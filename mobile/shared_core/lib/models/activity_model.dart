class ActivityModel {
  final int id;
  final String nameAr;
  final String? nameEn;
  final String? slug;
  final String? descriptionAr;
  final int categoryId;
  final String? categoryNameAr;
  final String? categoryIcon;
  final int governorateId;
  final String? governorateNameAr;
  final int? cityId;
  final String? cityNameAr;
  final String? addressAr;
  final String? phone;
  final String? whatsapp;
  final String? email;
  final String? website;
  final double? latitude;
  final double? longitude;
  final double? distanceKm;
  final String status;
  final bool isFeatured;
  final bool isVerified;
  final bool hasDelivery;
  final double ratingAvg;
  final int ratingCount;
  final int viewsCount;
  final String? logoUrl;
  final String? coverUrl;
  final List<String> galleryUrls;
  final int productsCount;

  ActivityModel({
    required this.id,
    required this.nameAr,
    this.nameEn,
    this.slug,
    this.descriptionAr,
    required this.categoryId,
    this.categoryNameAr,
    this.categoryIcon,
    required this.governorateId,
    this.governorateNameAr,
    this.cityId,
    this.cityNameAr,
    this.addressAr,
    this.phone,
    this.whatsapp,
    this.email,
    this.website,
    this.latitude,
    this.longitude,
    this.distanceKm,
    this.status = 'verified',
    this.isFeatured = false,
    this.isVerified = true,
    this.hasDelivery = false,
    this.ratingAvg = 5.0,
    this.ratingCount = 0,
    this.viewsCount = 0,
    this.logoUrl,
    this.coverUrl,
    this.galleryUrls = const [],
    this.productsCount = 0,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['id'] ?? 0,
      nameAr: json['name_ar'] ?? json['name'] ?? '',
      nameEn: json['name_en'],
      slug: json['slug'],
      descriptionAr: json['description_ar'] ?? json['description'],
      categoryId: json['category_id'] ?? 0,
      categoryNameAr: json['category'] is Map ? json['category']['name_ar'] : json['category_name_ar'],
      categoryIcon: json['category'] is Map ? json['category']['icon'] : json['category_icon'],
      governorateId: json['governorate_id'] ?? json['location_id'] ?? 1,
      governorateNameAr: json['location'] is Map ? json['location']['name_ar'] : json['governorate_name_ar'],
      cityId: json['city_id'],
      cityNameAr: json['city_name_ar'],
      addressAr: json['address_ar'] ?? json['address'],
      phone: json['phone'],
      whatsapp: json['whatsapp'],
      email: json['email'],
      website: json['website'],
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
      status: json['status'] ?? 'verified',
      isFeatured: json['is_featured'] ?? json['featured'] ?? false,
      isVerified: json['is_verified'] ?? json['verified'] ?? (json['status'] == 'verified'),
      hasDelivery: json['has_delivery'] ?? json['delivery_available'] ?? false,
      ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 5.0,
      ratingCount: json['rating_count'] ?? json['reviews_count'] ?? 0,
      viewsCount: json['views_count'] ?? 0,
      logoUrl: json['logo_url'] ?? json['logo'],
      coverUrl: json['cover_url'] ?? json['cover_image'],
      galleryUrls: (json['gallery_urls'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      productsCount: json['products_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name_ar': nameAr,
      'name_en': nameEn,
      'slug': slug,
      'description_ar': descriptionAr,
      'category_id': categoryId,
      'category_name_ar': categoryNameAr,
      'category_icon': categoryIcon,
      'governorate_id': governorateId,
      'governorate_name_ar': governorateNameAr,
      'city_id': cityId,
      'city_name_ar': cityNameAr,
      'address_ar': addressAr,
      'phone': phone,
      'whatsapp': whatsapp,
      'email': email,
      'website': website,
      'latitude': latitude,
      'longitude': longitude,
      'distance_km': distanceKm,
      'status': status,
      'is_featured': isFeatured,
      'is_verified': isVerified,
      'has_delivery': hasDelivery,
      'rating_avg': ratingAvg,
      'rating_count': ratingCount,
      'views_count': viewsCount,
      'logo_url': logoUrl,
      'cover_url': coverUrl,
      'gallery_urls': galleryUrls,
      'products_count': productsCount,
    };
  }
}

class CategoryModel {
  final int id;
  final String nameAr;
  final String nameEn;
  final String slug;
  final String icon;
  final int sectionId;
  final int activitiesCount;
  final bool isFeatured;

  CategoryModel({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    this.slug = '',
    required this.icon,
    required this.sectionId,
    this.activitiesCount = 0,
    this.isFeatured = false,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] ?? 0,
      nameAr: json['name_ar'] ?? '',
      nameEn: json['name_en'] ?? '',
      slug: json['slug'] as String? ?? '',
      icon: json['icon'] ?? 'Tag',
      sectionId: json['section_id'] ?? 1,
      activitiesCount: json['activities_count'] ?? 0,
      isFeatured: json['is_featured'] ?? json['featured'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name_ar': nameAr,
      'name_en': nameEn,
      'slug': slug,
      'icon': icon,
      'section_id': sectionId,
      'activities_count': activitiesCount,
      'is_featured': isFeatured,
    };
  }
}
