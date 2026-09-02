import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

class MerchantDashboardState {
  final bool isLoading;
  final String? errorMessage;
  final MerchantDashboardData? data;

  const MerchantDashboardState({
    this.isLoading = true,
    this.errorMessage,
    this.data,
  });

  MerchantDashboardState copyWith({
    bool? isLoading,
    String? errorMessage,
    MerchantDashboardData? data,
  }) {
    return MerchantDashboardState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      data: data ?? this.data,
    );
  }
}

class MerchantDashboardNotifier extends StateNotifier<MerchantDashboardState> {
  final ApiClient _apiClient = ApiClient();

  MerchantDashboardNotifier() : super(const MerchantDashboardState()) {
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final response = await _apiClient.get(ApiEndpoints.merchantDashboard);
      if (response.statusCode == 200 && response.data['success'] == true) {
        final dashboardData = MerchantDashboardData.fromJson(response.data['data']);
        state = state.copyWith(
          isLoading: false,
          data: dashboardData,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          errorMessage: response.data['message'] ?? 'تعذر تحميل بيانات لوحة التحكم.',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.',
      );
    }
  }
}

final merchantDashboardProvider =
    StateNotifierProvider<MerchantDashboardNotifier, MerchantDashboardState>((ref) {
  return MerchantDashboardNotifier();
});
