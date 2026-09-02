import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import 'package:daleel_user_app/features/favorites/providers/favorites_provider.dart';

class MockFavoritesRepository extends FavoritesRepository {
  final List<ActivityModel> _mockFavs = [];

  @override
  Future<List<ActivityModel>> getFavorites() async {
    return List.from(_mockFavs);
  }

  @override
  Future<bool> toggleFavorite(int activityId) async {
    final existingIndex = _mockFavs.indexWhere((a) => a.id == activityId);
    if (existingIndex >= 0) {
      _mockFavs.removeAt(existingIndex);
      return false;
    } else {
      _mockFavs.add(ActivityModel(
        id: activityId,
        nameAr: 'نشاط تجريبي $activityId',
        governorateNameAr: 'القاهرة',
        rating: 4.8,
        ratingCount: 12,
        isVerified: true,
      ));
      return true;
    }
  }

  @override
  Future<bool> checkIsFavorite(int activityId) async {
    return _mockFavs.any((a) => a.id == activityId);
  }
}

void main() {
  group('FavoritesNotifier Unit Tests', () {
    late ProviderContainer container;
    late MockFavoritesRepository mockRepo;

    setUp(() {
      mockRepo = MockFavoritesRepository();
      container = ProviderContainer(
        overrides: [
          favoritesRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    test('Initial state is empty', () {
      final state = container.read(favoritesNotifierProvider);
      expect(state.favorites.isEmpty, isTrue);
      expect(state.isLoading, isFalse);
    });

    test('toggleFavorite adds and then removes favorite item', () async {
      final notifier = container.read(favoritesNotifierProvider.notifier);

      // Add item 101
      final added = await notifier.toggleFavorite(101);
      expect(added, isTrue);
      expect(container.read(favoritesNotifierProvider).isFavorite(101), isTrue);

      // Toggle again to remove
      final removed = await notifier.toggleFavorite(101);
      expect(removed, isFalse);
      expect(container.read(favoritesNotifierProvider).isFavorite(101), isFalse);
    });
  });
}
