import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:daleel_core/daleel_core.dart';

final searchRepositoryProvider = Provider<SearchRepository>((ref) {
  return SearchRepository();
});

class SearchState {
  final bool isLoading;
  final bool isInitial;
  final SearchFilterParams params;
  final List<SearchResultItemModel> items;
  final SearchStatsModel stats;
  final int totalResults;
  final List<CategoryModel> categories;
  final List<GovernorateModel> governorates;
  final List<String> recentSearches;
  final String? errorMessage;

  SearchState({
    this.isLoading = false,
    this.isInitial = true,
    SearchFilterParams? params,
    this.items = const [],
    SearchStatsModel? stats,
    this.totalResults = 0,
    this.categories = const [],
    this.governorates = const [],
    this.recentSearches = const [],
    this.errorMessage,
  })  : params = params ?? SearchFilterParams(),
        stats = stats ?? SearchStatsModel();

  int get activeFiltersCount {
    int count = 0;
    if (params.type != null && params.type != 'all') count++;
    if (params.governorateId != null) count++;
    if (params.categoryId != null) count++;
    if (params.sectionSlug != null && params.sectionSlug != 'all') count++;
    if (params.hasDelivery == true) count++;
    if (params.sortBy != 'relevance') count++;
    return count;
  }

  SearchState copyWith({
    bool? isLoading,
    bool? isInitial,
    SearchFilterParams? params,
    List<SearchResultItemModel>? items,
    SearchStatsModel? stats,
    int? totalResults,
    List<CategoryModel>? categories,
    List<GovernorateModel>? governorates,
    List<String>? recentSearches,
    String? errorMessage,
  }) {
    return SearchState(
      isLoading: isLoading ?? this.isLoading,
      isInitial: isInitial ?? this.isInitial,
      params: params ?? this.params,
      items: items ?? this.items,
      stats: stats ?? this.stats,
      totalResults: totalResults ?? this.totalResults,
      categories: categories ?? this.categories,
      governorates: governorates ?? this.governorates,
      recentSearches: recentSearches ?? this.recentSearches,
      errorMessage: errorMessage,
    );
  }
}

class SearchNotifier extends StateNotifier<SearchState> {
  final SearchRepository _repository;
  Timer? _debounceTimer;
  static const String _recentSearchesKey = 'daleel_recent_searches_v1';

  SearchNotifier(this._repository) : super(SearchState()) {
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    await Future.wait([
      _loadTaxonomy(),
      _loadRecentSearches(),
    ]);
  }

  Future<void> _loadTaxonomy() async {
    try {
      final results = await Future.wait([
        _repository.getCategories(),
        _repository.getGovernorates(),
      ]);
      state = state.copyWith(
        categories: results[0] as List<CategoryModel>,
        governorates: results[1] as List<GovernorateModel>,
      );
    } catch (_) {}
  }

  Future<void> _loadRecentSearches() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_recentSearchesKey) ?? [];
      state = state.copyWith(recentSearches: list);
    } catch (_) {}
  }

  Future<void> _saveRecentSearch(String term) async {
    if (term.trim().isEmpty) return;
    try {
      final cleanTerm = term.trim();
      final list = List<String>.from(state.recentSearches);
      list.remove(cleanTerm);
      list.insert(0, cleanTerm);
      if (list.length > 10) list.removeLast();

      state = state.copyWith(recentSearches: list);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_recentSearchesKey, list);
    } catch (_) {}
  }

  Future<void> clearRecentSearches() async {
    try {
      state = state.copyWith(recentSearches: []);
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_recentSearchesKey);
    } catch (_) {}
  }

  Future<void> removeRecentSearch(String term) async {
    try {
      final list = List<String>.from(state.recentSearches)..remove(term);
      state = state.copyWith(recentSearches: list);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_recentSearchesKey, list);
    } catch (_) {}
  }

  /// On text changed with debounce (350ms)
  void onQueryChanged(String query) {
    _debounceTimer?.cancel();
    final updatedParams = state.params.copyWith(query: query);
    state = state.copyWith(params: updatedParams);

    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      executeSearch();
    });
  }

  /// Direct search trigger
  Future<void> executeSearch({String? overrideQuery}) async {
    _debounceTimer?.cancel();
    final queryToUse = overrideQuery ?? state.params.query;
    final searchParams = state.params.copyWith(query: queryToUse);

    state = state.copyWith(
      isLoading: true,
      isInitial: false,
      params: searchParams,
      errorMessage: null,
    );

    if (queryToUse.trim().isNotEmpty) {
      _saveRecentSearch(queryToUse);
    }

    try {
      final response = await _repository.searchUnified(searchParams);
      state = state.copyWith(
        isLoading: false,
        items: response.items,
        stats: response.stats,
        totalResults: response.totalResults,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'حدث خطأ أثناء جلب نتائج البحث.',
      );
    }
  }

  void setType(String? type) {
    final updated = state.params.copyWith(type: type, clearType: type == null || type == 'all');
    state = state.copyWith(params: updated);
    executeSearch();
  }

  void setGovernorate(int? govId) {
    final updated = state.params.copyWith(
      governorateId: govId,
      clearGovernorate: govId == null,
    );
    state = state.copyWith(params: updated);
    executeSearch();
  }

  void setCategory(int? catId) {
    final updated = state.params.copyWith(
      categoryId: catId,
      clearCategory: catId == null,
    );
    state = state.copyWith(params: updated);
    executeSearch();
  }

  void setSection(String? sectionSlug) {
    final updated = state.params.copyWith(
      sectionSlug: sectionSlug,
      clearSection: sectionSlug == null || sectionSlug == 'all',
    );
    state = state.copyWith(params: updated);
    executeSearch();
  }

  void setDeliveryFilter(bool? hasDelivery) {
    final updated = state.params.copyWith(
      hasDelivery: hasDelivery,
      clearDelivery: hasDelivery == null,
    );
    state = state.copyWith(params: updated);
    executeSearch();
  }

  void setSortBy(String sortBy) {
    final updated = state.params.copyWith(sortBy: sortBy);
    state = state.copyWith(params: updated);
    executeSearch();
  }

  void clearAllFilters() {
    final resetParams = SearchFilterParams(query: state.params.query);
    state = state.copyWith(params: resetParams);
    executeSearch();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

final searchNotifierProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  final repo = ref.watch(searchRepositoryProvider);
  return SearchNotifier(repo);
});
