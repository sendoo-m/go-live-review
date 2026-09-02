import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../dashboard/providers/merchant_dashboard_provider.dart';

class MerchantOffersState {
  final List<OfferModel> offers;
  final String filter; // 'all', 'active', 'inactive'
  final bool isLoading;
  final bool isSaving;
  final String? errorMessage;
  final String? successMessage;

  MerchantOffersState({
    this.offers = const [],
    this.filter = 'all',
    this.isLoading = false,
    this.isSaving = false,
    this.errorMessage,
    this.successMessage,
  });

  List<OfferModel> get filteredOffers {
    if (filter == 'active') {
      return offers.where((o) => o.isActive).toList();
    }
    if (filter == 'inactive') {
      return offers.where((o) => !o.isActive).toList();
    }
    return offers;
  }

  MerchantOffersState copyWith({
    List<OfferModel>? offers,
    String? filter,
    bool? isLoading,
    bool? isSaving,
    String? errorMessage,
    String? successMessage,
    bool clearError = false,
    bool clearSuccess = false,
  }) {
    return MerchantOffersState(
      offers: offers ?? this.offers,
      filter: filter ?? this.filter,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearSuccess ? null : (successMessage ?? this.successMessage),
    );
  }
}

class MerchantOffersNotifier extends StateNotifier<MerchantOffersState> {
  final OffersRepository _repository;
  final Ref _ref;

  MerchantOffersNotifier(this._repository, this._ref) : super(MerchantOffersState()) {
    loadOffers();
  }

  Future<void> loadOffers() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final list = await _repository.getMerchantOffers();
      state = state.copyWith(isLoading: false, offers: list);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'فشل تحميل العروض الترويجية: ${e.toString()}',
      );
    }
  }

  void setFilter(String filter) {
    state = state.copyWith(filter: filter);
  }

  Future<bool> createOffer({
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
    state = state.copyWith(isSaving: true, clearError: true, clearSuccess: true);
    try {
      final newOffer = await _repository.createOffer(
        activityId: activityId,
        productId: productId,
        title: title,
        description: description,
        offerType: offerType,
        discountPercentage: discountPercentage,
        discountAmount: discountAmount,
        originalPrice: originalPrice,
        offerPrice: offerPrice,
        startsAt: startsAt,
        endsAt: endsAt,
        isActive: isActive,
        isFeatured: isFeatured,
        coverImage: coverImage,
        terms: terms,
      );

      state = state.copyWith(
        isSaving: false,
        offers: [newOffer, ...state.offers],
        successMessage: 'تم إنشاء ونشر العرض الترويجي بنجاح.',
      );

      _ref.read(merchantDashboardProvider.notifier).fetchDashboardData();
      return true;
    } catch (e) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'فشل إنشاء العرض: ${e.toString()}',
      );
      return false;
    }
  }

  Future<bool> updateOffer({
    required int offerId,
    required Map<String, dynamic> data,
  }) async {
    state = state.copyWith(isSaving: true, clearError: true, clearSuccess: true);
    try {
      final updated = await _repository.updateOffer(offerId: offerId, data: data);
      final list = state.offers.map((o) => o.id == offerId ? updated : o).toList();

      state = state.copyWith(
        isSaving: false,
        offers: list,
        successMessage: 'تم تحديث العرض الترويجي بنجاح.',
      );

      _ref.read(merchantDashboardProvider.notifier).fetchDashboardData();
      return true;
    } catch (e) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'فشل تعديل العرض: ${e.toString()}',
      );
      return false;
    }
  }

  Future<void> toggleOfferStatus(int offerId) async {
    // Optimistic toggle
    final previousOffers = [...state.offers];
    final targetIndex = state.offers.indexWhere((o) => o.id == offerId);
    if (targetIndex == -1) return;

    final target = state.offers[targetIndex];
    final updatedTarget = target.copyWith(isActive: !target.isActive);
    final updatedList = [...state.offers];
    updatedList[targetIndex] = updatedTarget;

    state = state.copyWith(offers: updatedList);

    try {
      final success = await _repository.toggleOffer(offerId);
      if (!success) {
        state = state.copyWith(offers: previousOffers);
      }
    } catch (e) {
      state = state.copyWith(offers: previousOffers);
    }
  }

  Future<bool> deleteOffer(int offerId) async {
    try {
      final success = await _repository.deleteOffer(offerId);
      if (success) {
        state = state.copyWith(
          offers: state.offers.where((o) => o.id != offerId).toList(),
          successMessage: 'تم حذف العرض بنجاح.',
        );
        _ref.read(merchantDashboardProvider.notifier).fetchDashboardData();
        return true;
      }
      return false;
    } catch (e) {
      state = state.copyWith(errorMessage: 'فشل حذف العرض الترويجي');
      return false;
    }
  }
}

final offersRepositoryProvider = Provider<OffersRepository>((ref) {
  return OffersRepository();
});

final merchantOffersNotifierProvider =
    StateNotifierProvider<MerchantOffersNotifier, MerchantOffersState>((ref) {
  final repo = ref.watch(offersRepositoryProvider);
  return MerchantOffersNotifier(repo, ref);
});
