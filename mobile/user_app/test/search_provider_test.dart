import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import 'package:daleel_user_app/features/search/providers/search_provider.dart';

class MockSearchRepository extends SearchRepository {
  @override
  Future<SearchResultModel> search({
    String? query,
    int? categoryId,
    int? governorateId,
    int? cityId,
    bool? isVerified,
    bool? hasOffers,
    String? sortBy,
    int page = 1,
    int limit = 15,
  }) async {
    final mockItems = [
      ActivityModel(
        id: 1,
        nameAr: 'مستشفى الشروق التخصصي',
        categoryNameAr: 'صحة وطب',
        governorateNameAr: 'القاهرة',
        cityNameAr: 'مدينة نصر',
        rating: 4.9,
        isVerified: true,
      ),
      ActivityModel(
        id: 2,
        nameAr: 'صيدلية النور',
        categoryNameAr: 'صحة وطب',
        governorateNameAr: 'القاهرة',
        rating: 4.6,
        isVerified: true,
      ),
    ];

    return SearchResultModel(
      activities: mockItems,
      totalCount: 2,
      page: 1,
      limit: 15,
      hasMore: false,
    );
  }
}

void main() {
  group('SearchNotifier Provider Tests', () {
    late ProviderContainer container;
    late MockSearchRepository mockRepo;

    setUp(() {
      mockRepo = MockSearchRepository();
      container = ProviderContainer(
        overrides: [
          searchRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    test('Searching updates query and returns formatted results', () async {
      final notifier = container.read(searchNotifierProvider.notifier);

      await notifier.search(query: 'مستشفى');

      final state = container.read(searchNotifierProvider);
      expect(state.isLoading, isFalse);
      expect(state.results.length, 2);
      expect(state.results.first.nameAr, 'مستشفى الشروق التخصصي');
      expect(state.filter.query, 'مستشفى');
    });

    test('resetFilters clears query and filter states', () {
      final notifier = container.read(searchNotifierProvider.notifier);
      notifier.setQuery('test');
      notifier.resetFilters();

      final state = container.read(searchNotifierProvider);
      expect(state.filter.query, isNull);
      expect(state.filter.categoryId, isNull);
      expect(state.filter.isVerifiedOnly, isFalse);
    });
  });
}
