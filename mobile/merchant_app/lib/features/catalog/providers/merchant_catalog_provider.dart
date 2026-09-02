import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

class MerchantCatalogState {
  final bool isLoading;
  final bool isRefreshing;
  final bool isMutating;
  final List<ProductModel> products;
  final String searchQuery;
  final String filter; // 'all', 'available', 'unavailable', 'discounted'
  final int? selectedActivityId;
  final String? errorMessage;
  final String? successMessage;

  MerchantCatalogState({
    this.isLoading = false,
    this.isRefreshing = false,
    this.isMutating = false,
    this.products = const [],
    this.searchQuery = '',
    this.filter = 'all',
    this.selectedActivityId,
    this.errorMessage,
    this.successMessage,
  });

  List<ProductModel> get filteredProducts {
    return products.where((item) {
      // Activity match
      if (selectedActivityId != null && item.activityId != selectedActivityId) {
        return false;
      }

      // Filter category
      if (filter == 'available' && !item.isAvailable) return false;
      if (filter == 'unavailable' && item.isAvailable) return false;
      if (filter == 'discounted' && !item.hasDiscount) return false;

      // Search match
      if (searchQuery.trim().isNotEmpty) {
        final q = searchQuery.trim().toLowerCase();
        final matchName = item.name.toLowerCase().contains(q);
        final matchDesc = item.shortDescription.toLowerCase().contains(q) ||
            item.fullDescription.toLowerCase().contains(q);
        final matchSku = item.sku?.toLowerCase().contains(q) ?? false;
        return matchName || matchDesc || matchSku;
      }

      return true;
    }).toList();
  }

  MerchantCatalogState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    bool? isMutating,
    List<ProductModel>? products,
    String? searchQuery,
    String? filter,
    int? selectedActivityId,
    String? errorMessage,
    String? successMessage,
    bool clearError = false,
    bool clearSuccess = false,
  }) {
    return MerchantCatalogState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isMutating: isMutating ?? this.isMutating,
      products: products ?? this.products,
      searchQuery: searchQuery ?? this.searchQuery,
      filter: filter ?? this.filter,
      selectedActivityId: selectedActivityId ?? this.selectedActivityId,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearSuccess ? null : (successMessage ?? this.successMessage),
    );
  }
}

class MerchantCatalogNotifier extends StateNotifier<MerchantCatalogState> {
  final MerchantCatalogRepository _catalogRepository;

  MerchantCatalogNotifier({
    required MerchantCatalogRepository catalogRepository,
  })  : _catalogRepository = catalogRepository,
        super(MerchantCatalogState()) {
    loadProducts();
  }

  Future<void> loadProducts({bool isRefresh = false, int? activityId}) async {
    if (isRefresh) {
      state = state.copyWith(isRefreshing: true, clearError: true);
    } else {
      state = state.copyWith(isLoading: true, clearError: true);
    }

    try {
      final list = await _catalogRepository.getMerchantProducts(
        activityId: activityId ?? state.selectedActivityId,
      );
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        products: list,
        selectedActivityId: activityId ?? state.selectedActivityId,
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void setFilter(String filter) {
    state = state.copyWith(filter: filter);
  }

  void setSelectedActivity(int? activityId) {
    state = state.copyWith(selectedActivityId: activityId);
    loadProducts(activityId: activityId);
  }

  Future<bool> toggleAvailability(int productId) async {
    state = state.copyWith(isMutating: true, clearError: true, clearSuccess: true);
    try {
      final updated = await _catalogRepository.toggleProductAvailability(productId);
      final updatedList = state.products.map((p) => p.id == productId ? updated : p).toList();
      state = state.copyWith(
        isMutating: false,
        products: updatedList,
        successMessage: updated.isAvailable ? 'تم تفعيل توفر المنتج بنجاح' : 'تم تحويل المنتج إلى غير متوفر',
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isMutating: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  Future<bool> createProduct(Map<String, dynamic> data) async {
    state = state.copyWith(isMutating: true, clearError: true, clearSuccess: true);
    try {
      final created = await _catalogRepository.createProduct(data);
      state = state.copyWith(
        isMutating: false,
        products: [created, ...state.products],
        successMessage: 'تمت إضافة المنتج الجديد إلى الكتالوج بنجاح',
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isMutating: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  Future<bool> updateProduct(int id, Map<String, dynamic> data) async {
    state = state.copyWith(isMutating: true, clearError: true, clearSuccess: true);
    try {
      final updated = await _catalogRepository.updateProduct(id, data);
      final updatedList = state.products.map((p) => p.id == id ? updated : p).toList();
      state = state.copyWith(
        isMutating: false,
        products: updatedList,
        successMessage: 'تم تحديث بيانات المنتج بنجاح',
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isMutating: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  Future<bool> deleteProduct(int id) async {
    state = state.copyWith(isMutating: true, clearError: true, clearSuccess: true);
    try {
      await _catalogRepository.deleteProduct(id);
      final updatedList = state.products.where((p) => p.id != id).toList();
      state = state.copyWith(
        isMutating: false,
        products: updatedList,
        successMessage: 'تم حذف المنتج من الكتالوج بنجاح',
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isMutating: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  Future<String?> uploadMedia(dynamic file, {String? fileName}) async {
    try {
      return await _catalogRepository.uploadProductMedia(file, fileName: fileName);
    } catch (e) {
      state = state.copyWith(
        errorMessage: 'تعذر رفع الصورة: ${e.toString().replaceAll('Exception: ', '')}',
      );
      return null;
    }
  }
}

final merchantCatalogRepositoryProvider = Provider<MerchantCatalogRepository>((ref) {
  return MerchantCatalogRepository();
});

final merchantCatalogProvider = StateNotifierProvider<MerchantCatalogNotifier, MerchantCatalogState>((ref) {
  final repo = ref.watch(merchantCatalogRepositoryProvider);
  return MerchantCatalogNotifier(catalogRepository: repo);
});
