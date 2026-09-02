import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../dashboard/providers/merchant_dashboard_provider.dart';

class MerchantProfileState {
  final List<ActivityModel> activities;
  final ActivityModel? selectedActivity;
  final bool isLoading;
  final bool isSaving;
  final String? errorMessage;
  final String? successMessage;

  MerchantProfileState({
    this.activities = const [],
    this.selectedActivity,
    this.isLoading = false,
    this.isSaving = false,
    this.errorMessage,
    this.successMessage,
  });

  MerchantProfileState copyWith({
    List<ActivityModel>? activities,
    ActivityModel? selectedActivity,
    bool? isLoading,
    bool? isSaving,
    String? errorMessage,
    String? successMessage,
    bool clearError = false,
    bool clearSuccess = false,
  }) {
    return MerchantProfileState(
      activities: activities ?? this.activities,
      selectedActivity: selectedActivity ?? this.selectedActivity,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearSuccess ? null : (successMessage ?? this.successMessage),
    );
  }
}

class MerchantProfileNotifier extends StateNotifier<MerchantProfileState> {
  final MerchantProfileRepository _repository;
  final Ref _ref;

  MerchantProfileNotifier(this._repository, this._ref) : super(MerchantProfileState()) {
    loadActivities();
  }

  Future<void> loadActivities() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final list = await _repository.getMerchantActivities();
      state = state.copyWith(
        isLoading: false,
        activities: list,
        selectedActivity: list.isNotEmpty ? (state.selectedActivity ?? list.first) : null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'فشل تحميل أنشطة التاجر: ${e.toString()}',
      );
    }
  }

  void selectActivity(ActivityModel activity) {
    state = state.copyWith(selectedActivity: activity);
  }

  Future<bool> updateActivityDetails({
    required int activityId,
    required Map<String, dynamic> data,
  }) async {
    state = state.copyWith(isSaving: true, clearError: true, clearSuccess: true);
    try {
      final updated = await _repository.updateActivity(
        activityId: activityId,
        data: data,
      );

      final updatedList = state.activities.map((a) => a.id == updated.id ? updated : a).toList();

      state = state.copyWith(
        isSaving: false,
        activities: updatedList,
        selectedActivity: updated,
        successMessage: 'تم حفظ وتحديث بيانات النشاط التجاري بنجاح.',
      );

      // Refresh Dashboard data as well
      _ref.read(merchantDashboardProvider.notifier).fetchDashboardData();

      return true;
    } catch (e) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'فشل حفظ التعديلات: ${e.toString()}',
      );
      return false;
    }
  }

  void clearStatus() {
    state = state.copyWith(clearError: true, clearSuccess: true);
  }
}

final merchantProfileRepositoryProvider = Provider<MerchantProfileRepository>((ref) {
  return MerchantProfileRepository();
});

final merchantProfileNotifierProvider =
    StateNotifierProvider<MerchantProfileNotifier, MerchantProfileState>((ref) {
  final repo = ref.watch(merchantProfileRepositoryProvider);
  return MerchantProfileNotifier(repo, ref);
});
