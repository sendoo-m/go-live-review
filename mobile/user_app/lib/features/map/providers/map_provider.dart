import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../search/providers/search_provider.dart';

class MapLocationPoint {
  final double latitude;
  final double longitude;

  const MapLocationPoint(this.latitude, this.longitude);
}

class MapState {
  final bool isLoading;
  final List<SearchResultItemModel> mapItems;
  final SearchResultItemModel? selectedItem;
  final MapLocationPoint center;
  final double zoom;
  final MapLocationPoint? userLocation;
  final bool hasLocationPermission;
  final String? selectedCategorySlug;
  final int? selectedGovernorateId;
  final String? errorMessage;

  const MapState({
    this.isLoading = false,
    this.mapItems = const [],
    this.selectedItem,
    this.center = const MapLocationPoint(30.0444, 31.2357), // Cairo Default
    this.zoom = 13.0,
    this.userLocation,
    this.hasLocationPermission = false,
    this.selectedCategorySlug,
    this.selectedGovernorateId,
    this.errorMessage,
  });

  MapState copyWith({
    bool? isLoading,
    List<SearchResultItemModel>? mapItems,
    SearchResultItemModel? selectedItem,
    bool clearSelectedItem = false,
    MapLocationPoint? center,
    double? zoom,
    MapLocationPoint? userLocation,
    bool? hasLocationPermission,
    String? selectedCategorySlug,
    int? selectedGovernorateId,
    String? errorMessage,
  }) {
    return MapState(
      isLoading: isLoading ?? this.isLoading,
      mapItems: mapItems ?? this.mapItems,
      selectedItem: clearSelectedItem ? null : (selectedItem ?? this.selectedItem),
      center: center ?? this.center,
      zoom: zoom ?? this.zoom,
      userLocation: userLocation ?? this.userLocation,
      hasLocationPermission: hasLocationPermission ?? this.hasLocationPermission,
      selectedCategorySlug: selectedCategorySlug ?? this.selectedCategorySlug,
      selectedGovernorateId: selectedGovernorateId ?? this.selectedGovernorateId,
      errorMessage: errorMessage,
    );
  }
}

class MapNotifier extends StateNotifier<MapState> {
  final SearchRepository _repository;

  MapNotifier(this._repository) : super(const MapState()) {
    loadMapItems();
    requestUserLocation();
  }

  Future<void> loadMapItems({
    String? query,
    int? governorateId,
    int? categoryId,
    String? sectionSlug,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final items = await _repository.getMapItems(
        query: query,
        governorateId: governorateId ?? state.selectedGovernorateId,
        categoryId: categoryId,
        sectionSlug: sectionSlug,
      );

      // If items exist, center camera on first item or bounding center
      MapLocationPoint newCenter = state.center;
      if (items.isNotEmpty && items.first.latitude != null && items.first.longitude != null) {
        newCenter = MapLocationPoint(items.first.latitude!, items.first.longitude!);
      }

      state = state.copyWith(
        isLoading: false,
        mapItems: items,
        center: newCenter,
        selectedItem: items.isNotEmpty ? items.first : null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'تعذر جلب مواقع الأنشطة على الخريطة.',
      );
    }
  }

  void selectItem(SearchResultItemModel? item) {
    if (item == null) {
      state = state.copyWith(clearSelectedItem: true);
      return;
    }
    state = state.copyWith(
      selectedItem: item,
      center: item.latitude != null && item.longitude != null
          ? MapLocationPoint(item.latitude!, item.longitude!)
          : state.center,
    );
  }

  void setCenter(double lat, double lng, {double? zoom}) {
    state = state.copyWith(
      center: MapLocationPoint(lat, lng),
      zoom: zoom ?? state.zoom,
    );
  }

  void setZoom(double newZoom) {
    final clamped = newZoom.clamp(3.0, 19.0);
    state = state.copyWith(zoom: clamped);
  }

  Future<void> requestUserLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.medium,
          timeLimit: const Duration(seconds: 5),
        );

        final userPt = MapLocationPoint(position.latitude, position.longitude);
        state = state.copyWith(
          hasLocationPermission: true,
          userLocation: userPt,
          center: userPt,
          zoom: 14.0,
        );
      }
    } catch (_) {
      // Permission denied or GPS unavailable: gracefully fallback to default center
    }
  }
}

final mapNotifierProvider = StateNotifierProvider<MapNotifier, MapState>((ref) {
  final repo = ref.watch(searchRepositoryProvider);
  return MapNotifier(repo);
});
