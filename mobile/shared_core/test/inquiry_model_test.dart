import 'package:flutter_test/flutter_test.dart';
import 'package:daleel_core/daleel_core.dart';

void main() {
  group('InquiryModel & Pipeline Tests', () {
    test('InquiryStatus enum has correct keys and localized titles', () {
      expect(InquiryStatus.all.length, 6);
      expect(InquiryStatus.newInquiry.label, 'جديد');
      expect(InquiryStatus.inProgress.label, 'قيد المتابعة');
      expect(InquiryStatus.closedWon.label, 'تم بنجاح');
      expect(InquiryStatus.closedLost.label, 'ملغي / غير مناسب');
    });

    test('InquiryStatus fromString parses various formats and fallbacks gracefully', () {
      expect(InquiryStatus.fromString('new'), InquiryStatus.newInquiry);
      expect(InquiryStatus.fromString('contacted'), InquiryStatus.contacted);
      expect(InquiryStatus.fromString('in_progress'), InquiryStatus.inProgress);
      expect(InquiryStatus.fromString('qualified'), InquiryStatus.qualified);
      expect(InquiryStatus.fromString('closed_won'), InquiryStatus.closedWon);
      expect(InquiryStatus.fromString('closed_lost'), InquiryStatus.closedLost);
      expect(InquiryStatus.fromString('unknown_value'), InquiryStatus.newInquiry);
    });

    test('InquiryModel.fromJson parses JSON payload correctly', () {
      final json = {
        'id': 42,
        'activity_id': 105,
        'activity_name': 'مطعم الشام الأصيل',
        'customer_name': 'محمد علي',
        'customer_phone': '01123456789',
        'customer_email': 'mohamed@test.com',
        'type': 'booking',
        'status': 'in_progress',
        'source': 'direct_call',
        'message': 'استفسار عن حجز طاولة 6 أفراد',
        'notes': 'تم الاتصال وتأكيد الميعاد',
        'created_at': '2025-05-10T14:30:00Z',
      };

      final inquiry = InquiryModel.fromJson(json);

      expect(inquiry.id, 42);
      expect(inquiry.activityId, 105);
      expect(inquiry.activityName, 'مطعم الشام الأصيل');
      expect(inquiry.customerName, 'محمد علي');
      expect(inquiry.customerPhone, '01123456789');
      expect(inquiry.type, InquiryType.booking);
      expect(inquiry.status, InquiryStatus.inProgress);
      expect(inquiry.source, InquirySource.directCall);
      expect(inquiry.message, 'استفسار عن حجز طاولة 6 أفراد');
      expect(inquiry.notes, 'تم الاتصال وتأكيد الميعاد');
    });

    test('InquiryModel.copyWith updates fields without mutating originals', () {
      final inquiry = InquiryModel(
        id: 1,
        activityId: 10,
        activityName: 'ورشة السلام',
        customerName: 'طارق سامي',
        customerPhone: '01000000000',
        type: InquiryType.general,
        status: InquiryStatus.newInquiry,
        source: InquirySource.userApp,
        message: 'رسالة أصلية',
        createdAt: '2025-05-01',
      );

      final updated = inquiry.copyWith(
        status: InquiryStatus.closedWon,
        notes: 'تم تقديم الخدمة بنجاح',
      );

      expect(updated.id, inquiry.id);
      expect(updated.status, InquiryStatus.closedWon);
      expect(updated.notes, 'تم تقديم الخدمة بنجاح');
      expect(inquiry.status, InquiryStatus.newInquiry);
    });
  });
}
