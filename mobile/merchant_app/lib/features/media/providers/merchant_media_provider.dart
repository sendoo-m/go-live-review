import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../dashboard/providers/merchant_dashboard_provider.dart';

class MerchantMediaState {
  final List<MediaItemModel> items;
  final String filter; // 'all', 'activities', 'products', 'offers'
  final bool isLoading;
  final bool isUploading;
  final double uploadProgress;
  final String? lastFailedPayload;
  final String? errorMessage;
  final String? successMessage;

  MerchantMediaState({
    this.items = const [],
    this.filter = 'all',
    this.isLoading = false,
    this.isUploading = false,
    this.uploadProgress = 0.0,
    this.lastFailedPayload,
    this.errorMessage,
    this.successMessage,
  });

  List<MediaItemModel> get filteredItems {
    if (filter == 'all') return items;
    return items.where((it) => it.folder == filter).toList();
  }

  MerchantMediaState copyWith({
    List<MediaItemModel>? items,
    String? filter,
    bool? isLoading,
    bool? isUploading,
    double? uploadProgress,
    String? lastFailedPayload,
    String? errorMessage,
    String? successMessage,
    bool clearError = false,
    bool clearSuccess = false,
  }) {
    return MerchantMediaState(
      items: items ?? this.items,
      filter: filter ?? this.filter,
      isLoading: isLoading ?? this.isLoading,
      isUploading: isUploading ?? this.isUploading,
      uploadProgress: uploadProgress ?? this.uploadProgress,
      lastFailedPayload: lastFailedPayload ?? this.lastFailedPayload,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearSuccess ? null : (successMessage ?? this.successMessage),
    );
  }
}

class MerchantMediaNotifier extends StateNotifier<MerchantMediaState> {
  final MediaRepository _repository;
  final Ref _ref;

  MerchantMediaNotifier(this._repository, this._ref) : super(MerchantMediaState()) {
    loadMedia();
  }

  Future<void> loadMedia() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final list = await _repository.getMerchantMediaItems();
      state = state.copyWith(isLoading: false, items: list);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'فشل تحميل مكتبة الوسائط: ${e.toString()}',
      );
    }
  }

  void setFilter(String filter) {
    state = state.copyWith(filter: filter);
  }

  Future<MediaItemModel?> uploadMedia({
    required String imagePayload,
    String? fileName,
    String folder = 'activities',
  }) async {
    state = state.copyWith(
      isUploading: true,
      uploadProgress: 0.1,
      clearError: true,
      clearSuccess: true,
      lastFailedPayload: null,
    );

    try {
      final uploaded = await _repository.uploadMedia(
        imagePayload: imagePayload,
        fileName: fileName,
        folder: folder,
        onProgress: (prog) {
          state = state.copyWith(uploadProgress: prog);
        },
      );

      state = state.copyWith(
        isUploading: false,
        uploadProgress: 1.0,
        items: [uploaded, ...state.items],
        successMessage: 'تم رفع وحفظ الصورة بنجاح!',
      );

      _ref.read(merchantDashboardProvider.notifier).fetchDashboardData();
      return uploaded;
    } catch (e) {
      state = state.copyWith(
        isUploading: false,
        uploadProgress: 0.0,
        lastFailedPayload: imagePayload,
        errorMessage: 'فشل رفع الصورة: ${e.toString()}',
      );
      return null;
    }
  }

  Future<void> retryLastUpload(String folder) async {
    if (state.lastFailedPayload != null) {
      await uploadMedia(
        imagePayload: state.lastFailedPayload!,
        folder: folder,
      );
    }
  }

  void deleteMedia(String id) {
    final list = state.items.where((it) => it.id != id).toList();
    state = state.copyWith(items: list, successMessage: 'تم حذف الصورة من المعرض.');
  }
}

final mediaRepositoryProvider = Provider<MediaRepository>((ref) {
  return MediaRepository();
});

final merchantMediaNotifierProvider =
    StateNotifierProvider<MerchantMediaNotifier, MerchantMediaState>((ref) {
  final repo = ref.watch(mediaRepositoryProvider);
  return MerchantMediaNotifier(repo, ref);
});
