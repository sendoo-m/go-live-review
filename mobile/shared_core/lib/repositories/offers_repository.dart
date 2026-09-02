import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/offer_model.dart';

class OffersRepository {
  final ApiClient _apiClient;

  OffersRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Fetch merchant's offers
  Future<List<OfferModel>> getMerchantOffers() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.merchantOffers);
      if (response['success'] == true && response['data'] is List) {
        return (response['data'] as List)
            .map((item) => OfferModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      // In case of offline/fallback or error, attempt public offers or return fallback
      try {
        final publicRes = await _apiClient.get(ApiEndpoints.offers);
        if (publicRes['success'] == true && publicRes['data'] is List) {
          return (publicRes['data'] as List)
              .map((item) => OfferModel.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {}
      return [];
    }
  }

  /// Create a new promotional offer
  Future<OfferModel> createOffer({
    required int activityId,
    int? productId,
    required String title,
    required String description,
    String offerType = 'percentage',
    double? discountPercentage,
    double? discountAmount,
    double? originalPrice,
    double? offerPrice,
    required String startsAt,
    required String endsAt,
    bool isActive = true,
    bool isFeatured = false,
    String? coverImage,
    String? terms,
  }) async {
    final payload = {
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

    final response = await _apiClient.post(ApiEndpoints.offers, data: payload);
    if (response['success'] == true && response['data'] != null) {
      return OfferModel.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw Exception(response['message'] ?? 'فشل إنشاء العرض الترويجي');
  }

  /// Update an existing offer
  Future<OfferModel> updateOffer({
    required int offerId,
    required Map<String, dynamic> data,
  }) async {
    final response = await _apiClient.put('${ApiEndpoints.offers}/$offerId', data: data);
    if (response['success'] == true && response['data'] != null) {
      return OfferModel.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw Exception(response['message'] ?? 'فشل تعديل العرض الترويجي');
  }

  /// Toggle offer active status
  Future<bool> toggleOffer(int offerId) async {
    try {
      final response = await _apiClient.patch('${ApiEndpoints.offers}/$offerId/toggle');
      if (response['success'] == true) {
        return response['data']?['is_active'] ?? true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Delete an offer
  Future<bool> deleteOffer(int offerId) async {
    final response = await _apiClient.delete('${ApiEndpoints.offers}/$offerId');
    return response['success'] == true;
  }
}
