import 'activity_model.dart';
import 'product_model.dart';
import 'review_model.dart';

class ActivityDetailModel {
  final int id;
  final int ownerId;
  final String nameAr;
  final String? nameEn;
  final String? slug;
  final String? descriptionAr;
  final String? descriptionEn;
  final int categoryId;
  final String? categoryNameAr;
  final String? categoryIcon;
  final int governorateId;
  final String? governorateNameAr;
  final int? cityId;
  final String? cityNameAr;
  final int? neighborhoodId;
  final String? neighborhoodNameAr;
  final int? sectionId;
  final String? sectionNameAr;
  final String? addressAr;
  final String? phone;
  final String? whatsapp;
  final String? email;
  final String? website;
  final String? googleMapsUrl;
  final double? latitude;
  final double? longitude;
  final String status;
  final bool isFeatured;
  final bool isVerified;
  final bool hasDelivery;
  final double? deliveryFeeFrom;
  final double? deliveryFeeTo;
  final String? deliveryEstimatedTime;
  final String? deliveryNotes;
  final bool whatsappOrdersEnabled;
  final double ratingAvg;
  final int reviewsCount;
  final int viewsCount;
  final String? logoUrl;
  final String? coverUrl;
  final List<String> galleryUrls;
  final List<ProductModel> products;
  final List<ReviewModel> reviews;
  final String? workingHours;
  final String? createdAt;
  final String? updatedAt;

  ActivityDetailModel({
    required this.id,
    this.ownerId = 0,
    required this.nameAr,
    this.nameEn,
    this.slug,
    this.descriptionAr,
    this.descriptionEn,
    required this.categoryId,
    this.categoryNameAr,
    this.categoryIcon,
    required this.governorateId,
    this.governorateNameAr,
    this.cityId,
    this.cityNameAr,
    this.neighborhoodId,
    this.neighborhoodNameAr,
    this.sectionId,
    this.sectionNameAr,
    this.addressAr,
    this.phone,
    this.whatsapp,
    this.email,
    this.website,
    this.googleMapsUrl,
    this.latitude,
    this.longitude,
    this.status = 'verified',
    this.isFeatured = false,
    this.isVerified = true,
    this.hasDelivery = false,
    this.deliveryFeeFrom,
    this.deliveryFeeTo,
    this.deliveryEstimatedTime,
    this.deliveryNotes,
    this.whatsappOrdersEnabled = true,
    this.ratingAvg = 5.0,
    this.reviewsCount = 0,
    this.viewsCount = 0,
    this.logoUrl,
    this.coverUrl,
    this.galleryUrls = const [],
    this.products = const [],
    this.reviews = const [],
    this.workingHours = 'يومياً من 9:00 ص حتى 11:00 م',
    this.createdAt,
    this.updatedAt,
  });

  String get fullLocationText {
    final parts = <String>[];
    if (neighborhoodNameAr != null && neighborhoodNameAr!.isNotEmpty) {
      parts.add(neighborhoodNameAr!);
    }
    if (cityNameAr != null && cityNameAr!.isNotEmpty) {
      parts.add(cityNameAr!);
    }
    if (governorateNameAr != null && governorateNameAr!.isNotEmpty) {
      parts.add(governorateNameAr!);
    }
    return parts.isNotEmpty ? parts.join('، ') : (addressAr ?? 'مصر');
  }

  ActivityModel toActivityModel() {
    return ActivityModel(
      id: id,
      nameAr: nameAr,
      nameEn: nameEn,
      slug: slug,
      descriptionAr: descriptionAr,
      categoryId: categoryId,
      categoryNameAr: categoryNameAr,
      categoryIcon: categoryIcon,
      governorateId: governorateId,
      governorateNameAr: governorateNameAr,
      cityNameAr: cityNameAr,
      addressAr: addressAr,
      phone: phone,
      whatsapp: whatsapp,
      latitude: latitude,
      longitude: longitude,
      isFeatured: isFeatured,
      hasDelivery: hasDelivery,
      ratingAvg: ratingAvg,
      ratingCount: reviewsCount,
      logoUrl: logoUrl,
      coverUrl: coverUrl,
      status: status,
    );
  }

  factory ActivityDetailModel.fromJson(Map<String, dynamic> json) {
    // Parse nested category
    String? catName = json['category_name_ar'];
    String? catIcon = json['category_icon'];
    if (json['category'] is Map<String, dynamic>) {
      catName = json['category']['name_ar'] ?? catName;
      catIcon = json['category']['icon'] ?? catIcon;
    }

    // Parse nested location/governorate
    String? govName = json['governorate_name_ar'];
    if (json['governorate'] is Map<String, dynamic>) {
      govName = json['governorate']['name_ar'] ?? govName;
    } else if (json['location'] is Map<String, dynamic>) {
      govName = json['location']['name_ar'] ?? govName;
    }

    // Parse nested city
    String? cName = json['city_name_ar'];
    if (json['city'] is Map<String, dynamic>) {
      cName = json['city']['name_ar'] ?? cName;
    }

    // Parse nested neighborhood
    String? neighName = json['neighborhood_name_ar'];
    if (json['neighborhood'] is Map<String, dynamic>) {
      neighName = json['neighborhood']['name_ar'] ?? neighName;
    }

    // Parse nested section
    String? secName = json['section_name_ar'];
    if (json['section'] is Map<String, dynamic>) {
      secName = json['section']['name_ar'] ?? secName;
    }

    // Parse products list
    final rawProducts = json['products'];
    final productsList = <ProductModel>[];
    if (rawProducts is List) {
      for (final item in rawProducts) {
        if (item is Map<String, dynamic>) {
          productsList.add(ProductModel.fromJson(item));
        }
      }
    }

    // Parse reviews list
    final rawReviews = json['reviews'];
    final reviewsList = <ReviewModel>[];
    if (rawReviews is List) {
      for (final item in rawReviews) {
        if (item is Map<String, dynamic>) {
          reviewsList.add(ReviewModel.fromJson(item));
        }
      }
    }

    // Gallery
    List<String> gallery = [];
    if (json['gallery'] is List) {
      gallery = (json['gallery'] as List).map((e) => e.toString()).toList();
    } else if (json['gallery_urls'] is List) {
      gallery = (json['gallery_urls'] as List).map((e) => e.toString()).toList();
    }

    return ActivityDetailModel(
      id: json['id'] ?? 0,
      ownerId: json['owner_id'] ?? 0,
      nameAr: json['name_ar'] ?? json['name'] ?? '',
      nameEn: json['name_en'],
      slug: json['slug'],
      descriptionAr: json['description_ar'] ?? json['description'],
      descriptionEn: json['description_en'],
      categoryId: json['category_id'] ?? 0,
      categoryNameAr: catName,
      categoryIcon: catIcon,
      governorateId: json['governorate_id'] ?? json['location_id'] ?? 1,
      governorateNameAr: govName,
      cityId: json['city_id'],
      cityNameAr: cName,
      neighborhoodId: json['neighborhood_id'],
      neighborhoodNameAr: neighName,
      sectionId: json['section_id'],
      sectionNameAr: secName,
      addressAr: json['address_ar'] ?? json['address'],
      phone: json['phone'],
      whatsapp: json['whatsapp'],
      email: json['email'],
      website: json['website'],
      googleMapsUrl: json['google_maps_url'],
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      status: json['status'] ?? 'verified',
      isFeatured: json['is_featured'] == true || json['is_featured'] == 1,
      isVerified: json['is_verified'] == true || json['is_verified'] == 1 || json['status'] == 'verified',
      hasDelivery: json['has_delivery'] == true || json['has_delivery'] == 1,
      deliveryFeeFrom: (json['delivery_fee_from'] as num?)?.toDouble(),
      deliveryFeeTo: (json['delivery_fee_to'] as num?)?.toDouble(),
      deliveryEstimatedTime: json['delivery_estimated_time'],
      deliveryNotes: json['delivery_notes'],
      whatsappOrdersEnabled: json['whatsapp_orders_enabled'] != false,
      ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 5.0,
      reviewsCount: json['reviews_count'] ?? json['rating_count'] ?? 0,
      viewsCount: json['views_count'] ?? 0,
      logoUrl: json['logo_url'] ?? json['logo'],
      coverUrl: json['cover_url'] ?? json['cover_image'] ?? json['logo_url'],
      galleryUrls: gallery,
      products: productsList,
      reviews: reviewsList,
      workingHours: json['working_hours'] ?? 'يومياً من 9:00 ص حتى 11:00 م',
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }
}
