import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

final favoritesRepositoryProvider = Provider<FavoritesRepository>((ref) {
  return FavoritesRepository();
});

class FavoritesState {
  final bool isLoading;
  final Set<int> favoriteIds;
  final List<ActivityModel> favorites;
  final String? errorMessage;

  const FavoritesState({
    this.isLoading = false,
    this.favoriteIds = const {},
    this.favorites = const [],
    this.errorMessage,
  });

  bool isFavorite(int activityId) => favoriteIds.contains(activityId);

  FavoritesState copyWith({
    bool? isLoading,
    Set<int>? favoriteIds,
    List<ActivityModel>? favorites,
    String? errorMessage,
  }) {
    return FavoritesState(
      isLoading: isLoading ?? this.isLoading,
      favoriteIds: favoriteIds ?? this.favoriteIds,
      favorites: favorites ?? this.favorites,
      errorMessage: errorMessage,
    );
  }
}

class FavoritesNotifier extends StateNotifier<FavoritesState> {
  final FavoritesRepository _repository;

  FavoritesNotifier(this._repository) : super(const FavoritesState()) {
    loadFavorites();
  }

  /// Initial load of favorites (instant from cache, then syncs with server)
  Future<void> loadFavorites({bool isRefresh = false}) async {
    if (!isRefresh && state.favorites.isNotEmpty) return;

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final list = await _repository.fetchFavorites();
      final ids = list.map((e) => e.id).toSet();
      state = state.copyWith(
        isLoading: false,
        favorites: list,
        favoriteIds: ids,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'تعذر تحديث المفضلة',
      );
    }
  }

  /// Toggle favorite status for an activity
  Future<bool> toggleFavorite(ActivityModel activity) async {
    // Optimistic state update
    final currentIds = Set<int>.from(state.favoriteIds);
    final currentList = List<ActivityModel>.from(state.favorites);

    final bool willBeFavorite = !currentIds.contains(activity.id);
    if (willBeFavorite) {
      currentIds.add(activity.id);
      currentList.removeWhere((a) => a.id == activity.id);
      currentList.insert(0, activity);
    } else {
      currentIds.remove(activity.id);
      currentList.removeWhere((a) => a.id == activity.id);
    }

    state = state.copyWith(favoriteIds: currentIds, favorites: currentList);

    // Persist and sync
    return await _repository.toggleFavorite(activity);
  }

  /// Remove an activity from favorites
  Future<void> removeFavorite(int activityId) async {
    final currentIds = Set<int>.from(state.favoriteIds);
    final currentList = List<ActivityModel>.from(state.favorites);

    currentIds.remove(activityId);
    currentList.removeWhere((a) => a.id == activityId);

    state = state.copyWith(favoriteIds: currentIds, favorites: currentList);
    await _repository.removeFavorite(activityId);
  }
}

final favoritesProvider = StateNotifierProvider<FavoritesNotifier, FavoritesState>((ref) {
  final repo = ref.watch(favoritesRepositoryProvider);
  return FavoritesNotifier(repo);
});
