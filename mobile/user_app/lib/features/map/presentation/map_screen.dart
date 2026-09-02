import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../../search/providers/search_provider.dart';
import '../../favorites/presentation/widgets/favorite_button.dart';
import '../providers/map_provider.dart';
import 'widgets/osm_leaflet_map_view.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final TextEditingController _searchController = TextEditingController();
  int? _selectedCatId;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  void _onCategorySelected(int? catId) {
    setState(() {
      _selectedCatId = catId;
    });
    ref.read(mapNotifierProvider.notifier).loadMapItems(
          query: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
          categoryId: catId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final mapState = ref.watch(mapNotifierProvider);
    final mapNotifier = ref.read(mapNotifierProvider.notifier);
    final searchState = ref.watch(searchNotifierProvider);

    return Scaffold(
      body: Stack(
        children: [
          // 1. Full Screen OpenStreetMap Canvas
          OsmLeafletMapView(
            center: mapState.center,
            zoom: mapState.zoom,
            items: mapState.mapItems,
            selectedItem: mapState.selectedItem,
            userLocation: mapState.userLocation,
            onItemTap: (item) {
              mapNotifier.selectItem(item);
            },
            onCenterChanged: (point) {
              mapNotifier.setCenter(point.latitude, point.longitude);
            },
            onZoomChanged: (newZoom) {
              mapNotifier.setZoom(newZoom);
            },
          ),

          // 2. Top Search & Category Filter Overlay
          SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top Search Bar
                Container(
                  margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.12),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Back Button
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                        onPressed: () {
                          if (Navigator.canPop(context)) {
                            Navigator.pop(context);
                          } else {
                            context.go(AppRoutes.home);
                          }
                        },
                      ),
                      // Search Input
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          textInputAction: TextInputAction.search,
                          decoration: const InputDecoration(
                            hintText: 'ابحث على الخريطة...',
                            hintStyle: TextStyle(fontSize: 13, color: AppColors.textMuted),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(vertical: 12),
                          ),
                          onSubmitted: (query) {
                            mapNotifier.loadMapItems(
                              query: query.trim().isEmpty ? null : query.trim(),
                              categoryId: _selectedCatId,
                            );
                          },
                        ),
                      ),
                      if (_searchController.text.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.clear, size: 18, color: AppColors.textMuted),
                          onPressed: () {
                            _searchController.clear();
                            mapNotifier.loadMapItems(categoryId: _selectedCatId);
                            setState(() {});
                          },
                        ),
                      // Switch to List/Results Button
                      Container(
                        height: 28,
                        width: 1,
                        color: AppColors.border,
                      ),
                      IconButton(
                        icon: const Icon(Icons.list_alt, color: AppColors.primary),
                        tooltip: 'عرض كقائمة',
                        onPressed: () {
                          context.push(AppRoutes.searchResults);
                        },
                      ),
                    ],
                  ),
                ),

                // Category Filter Pills
                if (searchState.categories.isNotEmpty)
                  SizedBox(
                    height: 38,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: searchState.categories.length + 1,
                      itemBuilder: (context, index) {
                        if (index == 0) {
                          final isSelected = _selectedCatId == null;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: ChoiceChip(
                              label: const Text('الكل'),
                              selected: isSelected,
                              selectedColor: AppColors.primary,
                              backgroundColor: Colors.white,
                              labelStyle: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                color: isSelected ? Colors.white : AppColors.textPrimary,
                              ),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              onSelected: (_) => _onCategorySelected(null),
                            ),
                          );
                        }
                        final cat = searchState.categories[index - 1];
                        final isSelected = _selectedCatId == cat.id;
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ChoiceChip(
                            label: Text(cat.nameAr),
                            selected: isSelected,
                            selectedColor: AppColors.primary,
                            backgroundColor: Colors.white,
                            labelStyle: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              color: isSelected ? Colors.white : AppColors.textPrimary,
                            ),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            onSelected: (_) => _onCategorySelected(cat.id),
                          ),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),

          // 3. Loading Progress Indicator
          if (mapState.isLoading)
            Positioned(
              top: 140,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                      SizedBox(width: 8),
                      Text('جارٍ تحديث الأنشطة على الخريطة...', style: TextStyle(fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ),

          // 4. Bottom Activity Preview Card (When a marker is selected)
          if (mapState.selectedItem != null)
            Positioned(
              bottom: 42, // Above OpenStreetMap attribution
              left: 16,
              right: 16,
              child: _buildSelectedActivityCard(mapState.selectedItem!, mapNotifier),
            ),
        ],
      ),
    );
  }

  Widget _buildSelectedActivityCard(SearchResultItemModel item, MapNotifier mapNotifier) {
    final activityModelEquivalent = ActivityModel(
      id: item.targetActivityId,
      nameAr: item.isProduct ? (item.parentActivityNameAr ?? item.title) : item.title,
      categoryId: item.categoryId ?? 1,
      categoryNameAr: item.categoryNameAr,
      governorateId: item.governorateId ?? 1,
      governorateNameAr: item.governorateNameAr,
      cityNameAr: item.cityNameAr,
      addressAr: item.addressAr,
      coverUrl: item.coverImage,
      ratingAvg: item.ratingAvg,
      ratingCount: item.reviewsCount,
      hasDelivery: item.hasDelivery,
      phone: item.phone,
      whatsapp: item.whatsappNumber,
      latitude: item.latitude,
      longitude: item.longitude,
    );

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.18),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            context.push('/activity/${item.targetActivityId}');
          },
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Image, Info, Close & Favorite Button
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        item.coverImage ?? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200',
                        width: 70,
                        height: 70,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 70,
                          height: 70,
                          color: AppColors.primaryLight,
                          child: const Icon(Icons.storefront, color: AppColors.primary, size: 30),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Title & Badges
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  item.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    color: AppColors.textPrimary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              FavoriteButton(activity: activityModelEquivalent),
                              IconButton(
                                icon: const Icon(Icons.close, size: 18, color: AppColors.textMuted),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () => mapNotifier.selectItem(null),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),

                          // Category & Location
                          Row(
                            children: [
                              if (item.categoryNameAr != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryLight,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    item.categoryNameAr!,
                                    style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.primary),
                                  ),
                                ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  item.locationText,
                                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),

                          // Rating & Reviews
                          Row(
                            children: [
                              const Icon(Icons.star, size: 14, color: Colors.amber),
                              const SizedBox(width: 2),
                              Text(
                                '${item.ratingAvg}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                              Text(
                                ' (${item.reviewsCount} تقييم)',
                                style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                              ),
                              if (item.hasDelivery) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade50,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text('توصيل', style: TextStyle(fontSize: 9.5, color: Colors.green, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 10),
                const Divider(height: 1),
                const SizedBox(height: 10),

                // Bottom Action Buttons
                Row(
                  children: [
                    // View Details Button
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          context.push('/activity/${item.targetActivityId}');
                        },
                        icon: const Icon(Icons.visibility_outlined, size: 16),
                        label: const Text('عرض التفاصيل الكاملة', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Call Button
                    if (item.phone != null && item.phone!.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.phone, color: AppColors.primary, size: 20),
                        tooltip: 'اتصال',
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.primaryLight,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => _launchUrl('tel:${item.phone}'),
                      ),

                    // WhatsApp Button
                    if (item.whatsappNumber != null && item.whatsappNumber!.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      IconButton(
                        icon: const Icon(Icons.chat, color: Colors.green, size: 20),
                        tooltip: 'واتساب',
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.green.shade50,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          final num = item.whatsappNumber!.replaceAll(RegExp(r'[^0-9]'), '');
                          _launchUrl('https://wa.me/$num');
                        },
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
