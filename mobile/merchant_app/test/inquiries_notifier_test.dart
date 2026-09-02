import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import 'package:daleel_merchant_app/features/inquiries/providers/merchant_inquiries_provider.dart';

class MockInquiriesRepository extends InquiriesRepository {
  final List<InquiryModel> _inquiries = [
    InquiryModel(
      id: 1,
      activityId: 10,
      activityName: 'متجر السعادة',
      customerName: 'سارة خالد',
      customerPhone: '01099887766',
      type: InquiryType.order,
      status: InquiryStatus.newInquiry,
      source: InquirySource.userApp,
      message: 'طلب شراء حذاء رياضي',
      createdAt: '2025-05-12T10:00:00Z',
    ),
    InquiryModel(
      id: 2,
      activityId: 10,
      activityName: 'متجر السعادة',
      customerName: 'كريم عادل',
      customerPhone: '01233445566',
      type: InquiryType.quotation,
      status: InquiryStatus.contacted,
      source: InquirySource.whatsapp,
      message: 'طلب عرض سعر كميات',
      createdAt: '2025-05-12T11:30:00Z',
    ),
  ];

  @override
  Future<List<InquiryModel>> getInquiries({
    int? activityId,
    InquiryStatus? status,
    InquiryType? type,
    String? search,
  }) async {
    return _inquiries.where((inq) {
      if (status != null && inq.status != status) return false;
      if (type != null && inq.type != type) return false;
      if (search != null && search.isNotEmpty) {
        return inq.customerName.contains(search) || inq.message.contains(search);
      }
      return true;
    }).toList();
  }

  @override
  Future<InquiryModel> updateStatus({
    required int inquiryId,
    required InquiryStatus status,
    String? notes,
  }) async {
    final index = _inquiries.indexWhere((i) => i.id == inquiryId);
    if (index >= 0) {
      final updated = _inquiries[index].copyWith(
        status: status,
        notes: notes ?? _inquiries[index].notes,
      );
      _inquiries[index] = updated;
      return updated;
    }
    throw Exception('Inquiry not found');
  }
}

void main() {
  group('MerchantInquiriesNotifier Tests', () {
    late ProviderContainer container;
    late MockInquiriesRepository mockRepo;

    setUp(() {
      mockRepo = MockInquiriesRepository();
      container = ProviderContainer(
        overrides: [
          inquiriesRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    test('loadInquiries retrieves CRM leads and groups them by status', () async {
      final notifier = container.read(merchantInquiriesProvider.notifier);
      await notifier.loadInquiries();

      final state = container.read(merchantInquiriesProvider);
      expect(state.isLoading, isFalse);
      expect(state.inquiries.length, 2);
      expect(state.newCount, 1);
      expect(state.inProgressCount, 0);
    });

    test('updateStatus transitions inquiry pipeline status cleanly', () async {
      final notifier = container.read(merchantInquiriesProvider.notifier);
      await notifier.loadInquiries();

      final success = await notifier.updateStatus(
        inquiryId: 1,
        status: InquiryStatus.inProgress,
        notes: 'تم الاتصال بالعميل',
      );

      expect(success, isTrue);
      final state = container.read(merchantInquiriesProvider);
      final updatedInq = state.inquiries.firstWhere((i) => i.id == 1);
      expect(updatedInq.status, InquiryStatus.inProgress);
      expect(updatedInq.notes, 'تم الاتصال بالعميل');
    });

    test('setStatusFilter filters displayed list accordingly', () async {
      final notifier = container.read(merchantInquiriesProvider.notifier);
      await notifier.loadInquiries();

      notifier.setStatusFilter(InquiryStatus.contacted);
      final filteredList = container.read(merchantInquiriesProvider).filteredInquiries;
      expect(filteredList.length, 1);
      expect(filteredList.first.customerName, 'كريم عادل');
    });
  });
}
