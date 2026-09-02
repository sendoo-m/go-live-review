import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/inquiry_model.dart';

class InquiriesFetchResult {
  final List<InquiryModel> inquiries;
  final InquiryCountsModel counts;

  InquiriesFetchResult({
    required this.inquiries,
    required this.counts,
  });
}

class InquiriesRepository {
  final ApiClient _apiClient;

  InquiriesRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Fetch merchant's incoming inquiries and leads with optional filters
  Future<InquiriesFetchResult> getMerchantInquiries({
    int? activityId,
    String? status,
    String? search,
    String? sort,
    bool? isRead,
  }) async {
    final queryParams = <String, dynamic>{};
    if (activityId != null) queryParams['activity_id'] = activityId;
    if (status != null && status != 'all') queryParams['status'] = status;
    if (search != null && search.trim().isNotEmpty) queryParams['search'] = search.trim();
    if (sort != null) queryParams['sort'] = sort;
    if (isRead != null) queryParams['is_read'] = isRead;

    try {
      final response = await _apiClient.get(
        ApiEndpoints.merchantInquiries,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      final responseData = response.data as Map<String, dynamic>;
      if (responseData['success'] == true) {
        final rawList = responseData['data'] is List ? responseData['data'] as List : [];
        final inquiries = rawList
            .map((item) => InquiryModel.fromJson(item as Map<String, dynamic>))
            .toList();

        final rawCounts = responseData['counts'] is Map<String, dynamic>
            ? responseData['counts'] as Map<String, dynamic>
            : <String, dynamic>{};
        final counts = InquiryCountsModel.fromJson(rawCounts);

        return InquiriesFetchResult(inquiries: inquiries, counts: counts);
      }
      return InquiriesFetchResult(inquiries: [], counts: InquiryCountsModel());
    } catch (e) {
      // Fallback to public inquiries endpoint if merchant endpoint fails or offline
      try {
        final publicRes = await _apiClient.get(
          ApiEndpoints.inquiries,
          queryParameters: activityId != null ? {'activity_id': activityId} : null,
        );
        final publicData = publicRes.data as Map<String, dynamic>;
        if (publicData['success'] == true && publicData['data'] is List) {
          final inquiries = (publicData['data'] as List)
              .map((item) => InquiryModel.fromJson(item as Map<String, dynamic>))
              .toList();
          return InquiriesFetchResult(
            inquiries: inquiries,
            counts: InquiryCountsModel(all: inquiries.length, newCount: inquiries.where((i) => i.isNew).length),
          );
        }
      } catch (_) {}
      return InquiriesFetchResult(inquiries: [], counts: InquiryCountsModel());
    }
  }

  /// Get complete inquiry details by ID
  Future<InquiryModel> getInquiryDetails(int id) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.inquiryDetails(id));
      final responseData = response.data as Map<String, dynamic>;
      if (responseData['success'] == true && responseData['data'] != null) {
        return InquiryModel.fromJson(responseData['data'] as Map<String, dynamic>);
      }
      throw Exception(responseData['message'] ?? 'فشل تحميل بيانات الاستفسار');
    } catch (e) {
      // Fallback
      throw Exception('تعذر استرداد تفاصيل الاستفسار: $e');
    }
  }

  /// Update inquiry pipeline status (e.g. new -> contacted -> in_progress -> closed)
  Future<InquiryModel> updateInquiryStatus(int id, String status, {String? note}) async {
    final response = await _apiClient.patch(
      ApiEndpoints.updateInquiryStatus(id),
      data: {
        'status': status,
        if (note != null && note.isNotEmpty) 'note': note,
      },
    );

    final responseData = response.data as Map<String, dynamic>;
    if (responseData['success'] == true && responseData['data'] != null) {
      return InquiryModel.fromJson(responseData['data'] as Map<String, dynamic>);
    }
    throw Exception(responseData['message'] ?? 'فشل تحديث حالة الاستفسار');
  }

  /// Update internal merchant private notes
  Future<InquiryModel> updateInquiryNotes(int id, String notes) async {
    final response = await _apiClient.patch(
      ApiEndpoints.updateInquiryNotes(id),
      data: {'notes': notes},
    );

    final responseData = response.data as Map<String, dynamic>;
    if (responseData['success'] == true && responseData['data'] != null) {
      return InquiryModel.fromJson(responseData['data'] as Map<String, dynamic>);
    }
    throw Exception(responseData['message'] ?? 'فشل حفظ الملاحظات');
  }

  /// Mark inquiry as read or unread
  Future<InquiryModel> toggleInquiryRead(int id, bool isRead) async {
    final response = await _apiClient.patch(
      ApiEndpoints.toggleInquiryRead(id),
      data: {'is_read': isRead},
    );

    final responseData = response.data as Map<String, dynamic>;
    if (responseData['success'] == true && responseData['data'] != null) {
      return InquiryModel.fromJson(responseData['data'] as Map<String, dynamic>);
    }
    throw Exception(responseData['message'] ?? 'فشل تغيير حالة القراءة');
  }

  /// Record an outreach action (e.g. WhatsApp opened, phone call initiated, quick template sent)
  Future<InquiryModel> recordInquiryAction(
    int id, {
    required String actionType,
    String? templateText,
    String? note,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.recordInquiryAction(id),
      data: {
        'action_type': actionType,
        if (templateText != null) 'template_text': templateText,
        if (note != null) 'note': note,
      },
    );

    final responseData = response.data as Map<String, dynamic>;
    if (responseData['success'] == true && responseData['data'] != null) {
      return InquiryModel.fromJson(responseData['data'] as Map<String, dynamic>);
    }
    throw Exception(responseData['message'] ?? 'فشل تسجيل عملية التواصل');
  }

  /// Create a new inquiry (Customer side submission)
  Future<InquiryModel> createInquiry({
    required int activityId,
    int? productId,
    int? offerId,
    required String customerName,
    required String customerPhone,
    String? customerEmail,
    required String message,
    String type = 'inquiry',
    String? source,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.inquiries,
      data: {
        'activity_id': activityId,
        if (productId != null) 'product_id': productId,
        if (offerId != null) 'offer_id': offerId,
        'customer_name': customerName,
        'customer_phone': customerPhone,
        if (customerEmail != null) 'customer_email': customerEmail,
        'message': message,
        'type': type,
        if (source != null) 'source': source,
      },
    );

    final responseData = response.data as Map<String, dynamic>;
    if (responseData['success'] == true && responseData['data'] != null) {
      return InquiryModel.fromJson(responseData['data'] as Map<String, dynamic>);
    }
    throw Exception(responseData['message'] ?? 'فشل إرسال الاستفسار');
  }
}
