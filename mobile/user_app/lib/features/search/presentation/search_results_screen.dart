import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../providers/search_provider.dart';
import '../../favorites/presentation/widgets/favorite_button.dart';

class SearchResultsScreen extends ConsumerStatefulWidget {
  const SearchResultsScreen({super.key});

  @override
  ConsumerState<SearchResultsScreen> createState() => _SearchResultsScreenState();
}

class _SearchResultsScreenState extends ConsumerState<SearchResultsScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final q = ref.read(searchNotifierProvider).params.query;
    _searchController.text = q;
  }

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

  void _showFilterSheet(SearchState state, SearchNotifier notifier) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final p = state.params;
            return Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'فلاتر البحث والتصنيف',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      TextButton(
                        onPressed: () {
                          notifier.clearAllFilters();
                          Navigator.pop(ctx);
                        },
                        child: const Text('مسح الفلاتر', style: TextStyle(color: AppColors.error)),
                      ),
                    ],
                  ),
                  const Divider(),
                  const SizedBox(height: 8),

                  Expanded(
                    child: ListView(
                      children: [
                        // Type
                        const Text('نوع العنصر', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: [
                            ChoiceChip(
                              label: const Text('الكل'),
                              selected: p.type == 'all' || p.type == null,
                              onSelected: (_) {
                                notifier.setType('all');
                                setModalState(() {});
                              },
                            ),
                            ChoiceChip(
                              label: const Text('متاجر ومحلات'),
                              selected: p.type == 'shop',
                              onSelected: (_) {
                                notifier.setType('shop');
                                setModalState(() {});
                              },
                            ),
                            ChoiceChip(
                              label: const Text('خدمات وصيانة'),
                              selected: p.type == 'service',
                              onSelected: (_) {
                                notifier.setType('service');
                                setModalState(() {});
                              },
                            ),
                            ChoiceChip(
                              label: const Text('منتجات'),
                              selected: p.type == 'product',
                              onSelected: (_) {
                                notifier.setType('product');
                                setModalState(() {});
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Governorate
                        const Text('المحافظة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            ChoiceChip(
                              label: const Text('كافة المحافظات'),
                              selected: p.governorateId == null,
                              onSelected: (_) {
                                notifier.setGovernorate(null);
                                setModalState(() {});
                              },
                            ),
                            ...state.governorates.map((gov) {
                              return ChoiceChip(
                                label: Text(gov.nameAr),
                                selected: p.governorateId == gov.id,
                                onSelected: (_) {
                                  notifier.setGovernorate(gov.id);
                                  setModalState(() {});
                                },
                              );
                            }),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Delivery Filter
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('يوفر خدمة التوصيل فقط', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                          value: p.hasDelivery == true,
                          activeColor: AppColors.primary,
                          onChanged: (val) {
                            notifier.setDeliveryFilter(val ? true : null);
                            setModalState(() {});
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('عرض النتائج (${state.totalResults})'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchNotifierProvider);
    final searchNotifier = ref.read(searchNotifierProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Container(
          height: 44,
          margin: const EdgeInsets.only(left: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: TextField(
            controller: _searchController,
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              hintText: 'ابحث بالاسم أو التصنيف أو الموقع...',
              hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
              prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.primary),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        searchNotifier.onQueryChanged('');
                        setState(() {});
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
            onChanged: (val) {
              setState(() {});
              searchNotifier.onQueryChanged(val);
            },
            onSubmitted: (val) {
              searchNotifier.executeSearch(overrideQuery: val.trim());
            },
          ),
        ),
        actions: [
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.filter_list),
                if (searchState.activeFiltersCount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.accent,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '${searchState.activeFiltersCount}',
                        style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
              ],
            ),
            tooltip: 'تصفية النتائج',
            onPressed: () => _showFilterSheet(searchState, searchNotifier),
          ),
          IconButton(
            icon: const Icon(Icons.map_outlined),
            tooltip: 'عرض على الخريطة',
            onPressed: () => context.push(AppRoutes.map),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await searchNotifier.executeSearch();
        },
        child: Column(
          children: [
            // Top Bar: Results Count + Sort Dropdown
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: AppColors.border, width: 0.8)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'النتائج (${searchState.totalResults})',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                  ),
                  DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: searchState.params.sortBy,
                      icon: const Icon(Icons.swap_vert, size: 18, color: AppColors.primary),
                      style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
                      items: const [
                        DropdownMenuItem(value: 'relevance', child: Text('الأكثر صلة')),
                        DropdownMenuItem(value: 'rating', child: Text('الأعلى تقييماً')),
                        DropdownMenuItem(value: 'newest', child: Text('الأحدث إضافة')),
                        DropdownMenuItem(value: 'price_asc', child: Text('الأقل سعراً')),
                        DropdownMenuItem(value: 'price_desc', child: Text('الأعلى سعراً')),
                      ],
                      onChanged: (val) {
                        if (val != null) searchNotifier.setSortBy(val);
                      },
                    ),
                  ),
                ],
              ),
            ),

            // Active Filters Chips (if any)
            if (searchState.activeFiltersCount > 0)
              Container(
                height: 38,
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  children: [
                    if (searchState.params.type != null && searchState.params.type != 'all')
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: InputChip(
                          label: Text(
                            searchState.params.type == 'shop'
                                ? 'متاجر'
                                : searchState.params.type == 'service'
                                    ? 'خدمات'
                                    : 'منتجات',
                            style: const TextStyle(fontSize: 11),
                          ),
                          onDeleted: () => searchNotifier.setType('all'),
                        ),
                      ),
                    if (searchState.params.governorateId != null)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: InputChip(
                          label: Text(
                            searchState.governorates
                                .firstWhere(
                                  (g) => g.id == searchState.params.governorateId,
                                  orElse: () => GovernorateModel(id: 0, nameAr: 'محافظة', nameEn: '', code: ''),
                                )
                                .nameAr,
                            style: const TextStyle(fontSize: 11),
                          ),
                          onDeleted: () => searchNotifier.setGovernorate(null),
                        ),
                      ),
                    if (searchState.params.categoryId != null)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: InputChip(
                          label: Text(
                            searchState.categories
                                .firstWhere(
                                  (c) => c.id == searchState.params.categoryId,
                                  orElse: () => CategoryModel(id: 0, sectionId: 0, nameAr: 'تصنيف', nameEn: '', icon: '', isFeatured: false, slug: ''),
                                )
                                .nameAr,
                            style: const TextStyle(fontSize: 11),
                          ),
                          onDeleted: () => searchNotifier.setCategory(null),
                        ),
                      ),
                    if (searchState.params.hasDelivery == true)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: InputChip(
                          label: const Text('توصيل متاح', style: TextStyle(fontSize: 11)),
                          onDeleted: () => searchNotifier.setDeliveryFilter(null),
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ActionChip(
                        label: const Text('مسح الكل', style: TextStyle(fontSize: 11, color: AppColors.error)),
                        onPressed: () => searchNotifier.clearAllFilters(),
                      ),
                    ),
                  ],
                ),
              ),

            // Results List / Loading / Empty State
            Expanded(
              child: searchState.isLoading && searchState.items.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : searchState.errorMessage != null
                      ? _buildErrorState(searchState.errorMessage!, searchNotifier)
                      : searchState.items.isEmpty
                          ? _buildEmptyResultsState(searchNotifier)
                          : ListView.builder(
                              padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
                              itemCount: searchState.items.length,
                              itemBuilder: (context, index) {
                                final item = searchState.items[index];
                                return _buildSearchResultCard(item);
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyResultsState(SearchNotifier notifier) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off_outlined, size: 64, color: AppColors.textMuted),
            const SizedBox(height: 16),
            const Text(
              'لم نجد أي نتائج مطابقة لبحثك',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            const Text(
              'جرّب كتابة كلمات بحث مختلفة، أو قم بمسح الفلاتر لعرض كافة الأنشطة والخدمات المتاحة.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                _searchController.clear();
                notifier.clearAllFilters();
              },
              icon: const Icon(Icons.filter_alt_off),
              label: const Text('مسح جميع الفلاتر'),
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String error, SearchNotifier notifier) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            Text(error, textAlign: TextAlign.center, style: const TextStyle(fontSize: 15, color: AppColors.textPrimary)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => notifier.executeSearch(),
              icon: const Icon(Icons.refresh),
              label: const Text('إعادة المحاولة'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchResultCard(SearchResultItemModel item) {
    Color typeColor = AppColors.primary;
    String typeLabel = 'متجر';
    IconData typeIcon = Icons.storefront;

    if (item.isService) {
      typeColor = const Color(0xFF10B981);
      typeLabel = 'خدمة وصيانة';
      typeIcon = Icons.handyman_outlined;
    } else if (item.isProduct) {
      typeColor = const Color(0xFF6366F1);
      typeLabel = 'منتج';
      typeIcon = Icons.inventory_2_outlined;
    }

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

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: () {
          context.push('/activity/${item.targetActivityId}');
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      item.coverImage ?? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200',
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 80,
                        height: 80,
                        color: AppColors.primaryLight,
                        child: Icon(typeIcon, color: typeColor, size: 36),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Type Badge & Favorite button
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: typeColor.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(typeIcon, size: 12, color: typeColor),
                                  const SizedBox(width: 3),
                                  Text(
                                    typeLabel,
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: typeColor),
                                  ),
                                ],
                              ),
                            ),
                            FavoriteButton(activity: activityModelEquivalent),
                          ],
                        ),
                        const SizedBox(height: 4),

                        // Title
                        Text(
                          item.title,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),

                        // If product, display parent shop
                        if (item.isProduct && item.parentActivityNameAr != null)
                          Text(
                            'المتجر: ${item.parentActivityNameAr}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),

                        // Location
                        if (item.locationText.isNotEmpty)
                          Row(
                            children: [
                              const Icon(Icons.location_on_outlined, size: 13, color: AppColors.textMuted),
                              const SizedBox(width: 3),
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
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),
              const Divider(height: 1, thickness: 0.8),
              const SizedBox(height: 8),

              // Bottom Row: Rating, Price, Delivery & Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.star, size: 15, color: Colors.amber),
                      const SizedBox(width: 3),
                      Text(
                        '${item.ratingAvg}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Text(
                        ' (${item.reviewsCount})',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      if (item.hasDelivery) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('توصيل', style: TextStyle(fontSize: 10, color: Colors.green, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ],
                  ),

                  // Price (if product) or Contact Buttons
                  if (item.isProduct && item.effectivePrice != null)
                    Row(
                      children: [
                        if (item.hasDiscount) ...[
                          Text(
                            '${item.price} ${item.currency}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textMuted,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                          const SizedBox(width: 6),
                        ],
                        Text(
                          '${item.effectivePrice} ${item.currency}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    )
                  else
                    Row(
                      children: [
                        if (item.phone != null && item.phone!.isNotEmpty)
                          IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            icon: const Icon(Icons.phone_outlined, size: 18, color: AppColors.primary),
                            onPressed: () => _launchUrl('tel:${item.phone}'),
                          ),
                        if (item.whatsappNumber != null && item.whatsappNumber!.isNotEmpty) ...[
                          const SizedBox(width: 12),
                          IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            icon: const Icon(Icons.chat_bubble_outline, size: 18, color: Colors.green),
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
            ],
          ),
        ),
      ),
    );
  }
}
