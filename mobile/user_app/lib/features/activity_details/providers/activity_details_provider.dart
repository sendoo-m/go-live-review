import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

class ActivityDetailsState {
  final bool isLoading;
  final bool isRefreshing;
  final bool isSubmittingReview;
  final ActivityDetailModel? activity;
  final String? errorMessage;
  final String? reviewSuccessMessage;

  ActivityDetailsState({
    this.isLoading = false,
    this.isRefreshing = false,
    this.isSubmittingReview = false,
    this.activity,
    this.errorMessage,
    this.reviewSuccessMessage,
  });

  ActivityDetailsState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    bool? isSubmittingReview,
    ActivityDetailModel? activity,
    String? errorMessage,
    String? reviewSuccessMessage,
    bool clearError = false,
    bool clearReviewSuccess = false,
  }) {
    return ActivityDetailsState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isSubmittingReview: isSubmittingReview ?? this.isSubmittingReview,
      activity: activity ?? this.activity,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      reviewSuccessMessage: clearReviewSuccess ? null : (reviewSuccessMessage ?? this.reviewSuccessMessage),
    );
  }
}

class ActivityDetailsNotifier extends StateNotifier<ActivityDetailsState> {
  final ActivityRepository _activityRepository;
  final int activityId;

  ActivityDetailsNotifier({
    required ActivityRepository activityRepository,
    required this.activityId,
  })  : _activityRepository = activityRepository,
        super(ActivityDetailsState()) {
    loadDetails();
  }

  Future<void> loadDetails({bool isRefresh = false}) async {
    if (isRefresh) {
      state = state.copyWith(isRefreshing: true, clearError: true);
    } else {
      state = state.copyWith(isLoading: true, clearError: true);
    }

    try {
      final details = await _activityRepository.getActivityDetails(activityId);
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        activity: details,
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

  Future<bool> submitReview({
    required int rating,
    required String comment,
  }) async {
    state = state.copyWith(isSubmittingReview: true, clearReviewSuccess: true, clearError: true);
    try {
      final newReview = await _activityRepository.submitReview(
        activityId: activityId,
        rating: rating,
        comment: comment,
      );

      // Refresh details or update local reviews list
      if (state.activity != null) {
        final updatedReviews = [newReview, ...state.activity!.reviews];
        final newRatingCount = state.activity!.reviewsCount + 1;
        final sum = updatedReviews.fold<int>(0, (sum, r) => sum + r.rating);
        final newAvg = sum / updatedReviews.length;

        final updatedActivity = ActivityDetailModel(
          id: state.activity!.id,
          ownerId: state.activity!.ownerId,
          nameAr: state.activity!.nameAr,
          nameEn: state.activity!.nameEn,
          slug: state.activity!.slug,
          descriptionAr: state.activity!.descriptionAr,
          descriptionEn: state.activity!.descriptionEn,
          categoryId: state.activity!.categoryId,
          categoryNameAr: state.activity!.categoryNameAr,
          categoryIcon: state.activity!.categoryIcon,
          governorateId: state.activity!.governorateId,
          governorateNameAr: state.activity!.governorateNameAr,
          cityId: state.activity!.cityId,
          cityNameAr: state.activity!.cityNameAr,
          neighborhoodId: state.activity!.neighborhoodId,
          neighborhoodNameAr: state.activity!.neighborhoodNameAr,
          sectionId: state.activity!.sectionId,
          sectionNameAr: state.activity!.sectionNameAr,
          addressAr: state.activity!.addressAr,
          phone: state.activity!.phone,
          whatsapp: state.activity!.whatsapp,
          email: state.activity!.email,
          website: state.activity!.website,
          googleMapsUrl: state.activity!.googleMapsUrl,
          latitude: state.activity!.latitude,
          longitude: state.activity!.longitude,
          status: state.activity!.status,
          isFeatured: state.activity!.isFeatured,
          isVerified: state.activity!.isVerified,
          hasDelivery: state.activity!.hasDelivery,
          deliveryFeeFrom: state.activity!.deliveryFeeFrom,
          deliveryFeeTo: state.activity!.deliveryFeeTo,
          deliveryEstimatedTime: state.activity!.deliveryEstimatedTime,
          deliveryNotes: state.activity!.deliveryNotes,
          whatsappOrdersEnabled: state.activity!.whatsappOrdersEnabled,
          ratingAvg: double.parse(newAvg.toStringAsFixed(1)),
          reviewsCount: newRatingCount,
          viewsCount: state.activity!.viewsCount,
          logoUrl: state.activity!.logoUrl,
          coverUrl: state.activity!.coverUrl,
          galleryUrls: state.activity!.galleryUrls,
          products: state.activity!.products,
          reviews: updatedReviews,
          workingHours: state.activity!.workingHours,
          createdAt: state.activity!.createdAt,
          updatedAt: state.activity!.updatedAt,
        );

        state = state.copyWith(
          isSubmittingReview: false,
          activity: updatedActivity,
          reviewSuccessMessage: 'شكراً لمشاركتك! تم إضافة تقييمك بنجاح.',
        );
      } else {
        state = state.copyWith(isSubmittingReview: false);
      }
      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmittingReview: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }
}

final activityRepositoryProvider = Provider<ActivityRepository>((ref) {
  return ActivityRepository();
});

final activityDetailsProvider = StateNotifierProvider.family<ActivityDetailsNotifier, ActivityDetailsState, int>(
  (ref, activityId) {
    final repo = ref.watch(activityRepositoryProvider);
    return ActivityDetailsNotifier(activityRepository: repo, activityId: activityId);
  },
);
