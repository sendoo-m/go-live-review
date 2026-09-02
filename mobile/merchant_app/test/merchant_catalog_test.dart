import 'package:flutter_test/flutter_test.dart';
import 'package:daleel_core/daleel_core.dart';

void main() {
  group('ProductModel & Merchant Catalog Unit Tests', () {
    test('ProductModel parses JSON correctly', () {
      final json = {
        'id': 15,
        'activity_id': 101,
        'name_ar': 'قهوة مختصة كولومبي',
        'description_ar': 'حبوب قهوة كولومبية معالجة مجففة',
        'price': '85.50',
        'currency': 'EGP',
        'is_available': 1,
        'image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
      };

      final product = ProductModel.fromJson(json);

      expect(product.id, 15);
      expect(product.activityId, 101);
      expect(product.nameAr, 'قهوة مختصة كولومبي');
      expect(product.price, 85.50);
      expect(product.isAvailable, isTrue);
      expect(product.currency, 'EGP');
    });

    test('ProductModel formattedPrice returns currency string', () {
      final product = ProductModel(
        id: 1,
        activityId: 10,
        nameAr: 'شاي أخضر',
        price: 35.0,
        currency: 'EGP',
        isAvailable: true,
      );

      expect(product.formattedPrice, '35.00 ج.م');
    });
  });
}
