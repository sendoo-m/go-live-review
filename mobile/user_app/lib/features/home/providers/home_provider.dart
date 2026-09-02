import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

class HomeState {
  final bool isLoading;
  final String? errorMessage;
  final AppBootstrapData? bootstrap;
  final List<ActivityModel> featuredActivities;
  final List<CategoryModel> categories;
  final int? selectedGovernorateId;
  final int? selectedSectionId;
  final String searchQuery;

  const HomeState({
    this.isLoading = true,
    this.errorMessage,
    this.bootstrap,
    this.featuredActivities = const [],
    this.categories = const [],
    this.selectedGovernorateId,
    this.selectedSectionId,
    this.searchQuery = '',
  });

  HomeState copyWith({
    bool? isLoading,
    String? errorMessage,
    AppBootstrapData? bootstrap,
    List<ActivityModel>? featuredActivities,
    List<CategoryModel>? categories,
    int? selectedGovernorateId,
    int? selectedSectionId,
    String? searchQuery,
  }) {
    return HomeState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      bootstrap: bootstrap ?? this.bootstrap,
      featuredActivities: featuredActivities ?? this.featuredActivities,
      categories: categories ?? this.categories,
      selectedGovernorateId: selectedGovernorateId ?? this.selectedGovernorateId,
      selectedSectionId: selectedSectionId ?? this.selectedSectionId,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class HomeNotifier extends StateNotifier<HomeState> {
  final ApiClient _apiClient = ApiClient();

  HomeNotifier() : super(const HomeState()) {
    loadHomeData();
  }

  Future<void> loadHomeData({bool refresh = false}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      // 1. Fetch Bootstrap
      final bootstrapRes = await _apiClient.get(ApiEndpoints.appBootstrap);
      AppBootstrapData? bootstrap;
      if (bootstrapRes.statusCode == 200 && bootstrapRes.data['success'] == true) {
        bootstrap = AppBootstrapData.fromJson(bootstrapRes.data['data']);
      }

      // 2. Fetch Categories
      final categoriesRes = await _apiClient.get(ApiEndpoints.categories);
      List<CategoryModel> categories = [];
      if (categoriesRes.statusCode == 200 && categoriesRes.data['success'] == true) {
        final list = categoriesRes.data['data'] as List<dynamic>? ?? [];
        categories = list.map((e) => CategoryModel.fromJson(e)).toList();
      }

      // 3. Fetch Featured Activities
      final activitiesRes = await _apiClient.get(
        ApiEndpoints.activities,
        queryParameters: {
          'featured': 'true',
          'per_page': 10,
          if (state.selectedGovernorateId != null) 'governorate_id': state.selectedGovernorateId,
          if (state.selectedSectionId != null) 'section_id': state.selectedSectionId,
          if (state.searchQuery.isNotEmpty) 'search': state.searchQuery,
        },
      );
      List<ActivityModel> activities = [];
      if (activitiesRes.statusCode == 200 && activitiesRes.data['success'] == true) {
        final list = activitiesRes.data['data'] as List<dynamic>? ?? [];
        activities = list.map((e) => ActivityModel.fromJson(e)).toList();
      }

      state = state.copyWith(
        isLoading: false,
        bootstrap: bootstrap,
        categories: categories,
        featuredActivities: activities,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'تعذر تحميل بيانات الصفحة الرئيسية. يرجى التحقق من الاتصال بالإنترنت.',
      );
    }
  }

  void filterByGovernorate(int? governorateId) {
    state = state.copyWith(selectedGovernorateId: governorateId);
    loadActivitiesOnly();
  }

  void filterBySection(int? sectionId) {
    if (state.selectedSectionId == sectionId) {
      state = state.copyWith(selectedSectionId: null);
    } else {
      state = state.copyWith(selectedSectionId: sectionId);
    }
    loadActivitiesOnly();
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
    loadActivitiesOnly();
  }

  Future<void> loadActivitiesOnly() async {
    try {
      final activitiesRes = await _apiClient.get(
        ApiEndpoints.activities,
        queryParameters: {
          'per_page': 15,
          if (state.selectedGovernorateId != null) 'governorate_id': state.selectedGovernorateId,
          if (state.selectedSectionId != null) 'section_id': state.selectedSectionId,
          if (state.searchQuery.isNotEmpty) 'search': state.searchQuery,
        },
      );
      if (activitiesRes.statusCode == 200 && activitiesRes.data['success'] == true) {
        final list = activitiesRes.data['data'] as List<dynamic>? ?? [];
        final activities = list.map((e) => ActivityModel.fromJson(e)).toList();
        state = state.copyWith(featuredActivities: activities);
      }
    } catch (_) {}
  }
}

final homeNotifierProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  return HomeNotifier();
});
