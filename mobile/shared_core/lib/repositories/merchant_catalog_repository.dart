import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/product_model.dart';

class MerchantCatalogRepository {
  final ApiClient _apiClient;

  MerchantCatalogRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Fetch merchant's products (optionally filtered by activity)
  Future<List<ProductModel>> getMerchantProducts({int? activityId}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.merchantProducts,
        queryParameters: {
          if (activityId != null) 'activity_id': activityId,
        },
      );
      if (response.data != null && response.data['success'] == true) {
        final List<dynamic> list = response.data['data'] ?? [];
        return list.map((item) => ProductModel.fromJson(item)).toList();
      }
      return [];
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'فشل في استرجاع كتالوج المنتجات';
      throw Exception(msg);
    } catch (e) {
      throw Exception('حدث خطأ غير متوقع أثناء جلب المنتجات: $e');
    }
  }

  /// Add a new product to the catalog
  Future<ProductModel> createProduct(Map<String, dynamic> productData) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.products,
        data: productData,
      );
      if (response.data != null && response.data['success'] == true) {
        return ProductModel.fromJson(response.data['data']);
      }
      throw Exception(response.data?['message'] ?? 'فشل في إضافة المنتج الجديد');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'تعذر إضافة المنتج';
      throw Exception(msg);
    } catch (e) {
      throw Exception('خطأ غير متوقع أثناء إضافة المنتج: $e');
    }
  }

  /// Update an existing product
  Future<ProductModel> updateProduct(int id, Map<String, dynamic> productData) async {
    try {
      final response = await _apiClient.put(
        ApiEndpoints.productDetails(id),
        data: productData,
      );
      if (response.data != null && response.data['success'] == true) {
        return ProductModel.fromJson(response.data['data']);
      }
      throw Exception(response.data?['message'] ?? 'فشل في تحديث بيانات المنتج');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'تعذر تحديث المنتج';
      throw Exception(msg);
    } catch (e) {
      throw Exception('خطأ غير متوقع أثناء تحديث المنتج: $e');
    }
  }

  /// Toggle product availability (Active / Out of Stock)
  Future<ProductModel> toggleProductAvailability(int id) async {
    try {
      final response = await _apiClient.patch(
        ApiEndpoints.toggleProductAvailability(id),
      );
      if (response.data != null && response.data['success'] == true) {
        return ProductModel.fromJson(response.data['data']);
      }
      throw Exception(response.data?['message'] ?? 'فشل في تعديل حالة التوفر');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'تعذر تعديل توفر المنتج';
      throw Exception(msg);
    } catch (e) {
      throw Exception('خطأ غير متوقع أثناء تغيير حالة المنتج: $e');
    }
  }

  /// Delete a product from catalog
  Future<bool> deleteProduct(int id) async {
    try {
      final response = await _apiClient.delete(
        ApiEndpoints.productDetails(id),
      );
      if (response.data != null && response.data['success'] == true) {
        return true;
      }
      throw Exception(response.data?['message'] ?? 'فشل في حذف المنتج');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'تعذر حذف المنتج';
      throw Exception(msg);
    } catch (e) {
      throw Exception('خطأ أثناء حذف المنتج: $e');
    }
  }

  /// Upload product media (image file, base64 or URL)
  Future<String> uploadProductMedia(dynamic file, {String? fileName}) async {
    try {
      final response = await _apiClient.uploadFile(
        ApiEndpoints.mediaUpload,
        file: file,
        fileName: fileName,
        fileKey: 'image',
        extraFields: {
          'folder': 'products',
          if (fileName != null) 'file_name': fileName,
        },
      );
      if (response.data != null && response.data['success'] == true) {
        return response.data['data']['url'] ?? '';
      }
      throw Exception(response.data?['message'] ?? 'فشل في رفع الصورة');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'تعذر رفع الصورة';
      throw Exception(msg);
    } catch (e) {
      throw Exception('خطأ أثناء رفع الصورة: $e');
    }
  }
}
