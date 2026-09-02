import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../providers/search_provider.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  late final TextEditingController _searchController;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    final currentQuery = ref.read(searchNotifierProvider).params.query;
    _searchController = TextEditingController(text: currentQuery);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onSearchSubmit(String query) {
    if (query.trim().isEmpty) return;
    ref.read(searchNotifierProvider.notifier).executeSearch(overrideQuery: query.trim());
    context.push(AppRoutes.searchResults);
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchNotifierProvider);
    final searchNotifier = ref.read(searchNotifierProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Container(
          height: 46,
          margin: const EdgeInsets.only(left: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: TextField(
            controller: _searchController,
            focusNode: _focusNode,
            autofocus: searchState.params.query.isEmpty,
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              hintText: 'ابحث عن محل، خدمة، منتج أو تصنيف...',
              hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
              prefixIcon: const Icon(Icons.search, color: AppColors.primary, size: 22),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18, color: AppColors.textMuted),
                      onPressed: () {
                        _searchController.clear();
                        searchNotifier.onQueryChanged('');
                        setState(() {});
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
            onChanged: (val) {
              setState(() {});
              searchNotifier.onQueryChanged(val);
            },
            onSubmitted: _onSearchSubmit,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.map_outlined),
            tooltip: 'عرض على الخريطة',
            onPressed: () {
              context.push(AppRoutes.map);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Type Switcher Chips (All, Shops, Services, Products)
            _buildTypeFilterRow(searchState, searchNotifier),
            const SizedBox(height: 16),

            // 2. Location Governorates Quick Bar
            if (searchState.governorates.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text(
                      'المحافظة والمنطقة',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 38,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: searchState.governorates.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      final isSelected = searchState.params.governorateId == null;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: FilterChip(
                          label: const Text('كافة المحافظات'),
                          selected: isSelected,
                          selectedColor: AppColors.primaryLight,
                          checkmarkColor: AppColors.primary,
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                          ),
                          onSelected: (_) => searchNotifier.setGovernorate(null),
                        ),
                      );
                    }
                    final gov = searchState.governorates[index - 1];
                    final isSelected = searchState.params.governorateId == gov.id;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: FilterChip(
                        label: Text(gov.nameAr),
                        selected: isSelected,
                        selectedColor: AppColors.primaryLight,
                        checkmarkColor: AppColors.primary,
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? AppColors.primary : AppColors.textPrimary,
                        ),
                        onSelected: (_) => searchNotifier.setGovernorate(gov.id),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 3. Recent Searches Section
            if (searchState.recentSearches.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'عمليات البحث الأخيرة',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                    ),
                    TextButton(
                      onPressed: () => searchNotifier.clearRecentSearches(),
                      child: const Text('مسح السجل', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: searchState.recentSearches.map((term) {
                    return ActionChip(
                      avatar: const Icon(Icons.history, size: 16, color: AppColors.textMuted),
                      label: Text(term),
                      onPressed: () {
                        _searchController.text = term;
                        _onSearchSubmit(term);
                      },
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 4. Categories Quick Discovery Grid
            if (searchState.categories.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: const Text(
                  'تصفح حسب التصنيف',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                ),
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 2.6,
                  ),
                  itemCount: searchState.categories.length,
                  itemBuilder: (context, index) {
                    final cat = searchState.categories[index];
                    final isSelected = searchState.params.categoryId == cat.id;

                    return InkWell(
                      onTap: () {
                        searchNotifier.setCategory(isSelected ? null : cat.id);
                        context.push(AppRoutes.searchResults);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primaryLight : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.border,
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.primary : AppColors.primaryLight,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                _getCategoryIcon(cat.icon),
                                size: 16,
                                color: isSelected ? Colors.white : AppColors.primary,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                cat.nameAr,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
            ],

            // 5. Direct Action Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    _onSearchSubmit(_searchController.text);
                  },
                  icon: const Icon(Icons.search),
                  label: const Text('عرض كافة نتائج البحث', style: TextStyle(fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeFilterRow(SearchState state, SearchNotifier notifier) {
    final types = [
      {'key': 'all', 'label': 'الكل', 'icon': Icons.apps},
      {'key': 'shop', 'label': 'المتاجر والمحلات', 'icon': Icons.storefront},
      {'key': 'service', 'label': 'الخدمات والصيانة', 'icon': Icons.build_outlined},
      {'key': 'product', 'label': 'المنتجات والأسعار', 'icon': Icons.inventory_2_outlined},
    ];

    final currentType = state.params.type ?? 'all';

    return SizedBox(
      height: 42,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: types.length,
        itemBuilder: (context, index) {
          final t = types[index];
          final isSelected = currentType == t['key'];

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              avatar: Icon(
                t['icon'] as IconData,
                size: 16,
                color: isSelected ? Colors.white : AppColors.primary,
              ),
              label: Text(t['label'] as String),
              selected: isSelected,
              selectedColor: AppColors.primary,
              backgroundColor: Colors.white,
              labelStyle: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Colors.white : AppColors.textPrimary,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
              ),
              onSelected: (_) => notifier.setType(t['key'] as String),
            ),
          );
        },
      ),
    );
  }

  IconData _getCategoryIcon(String? iconName) {
    switch (iconName?.toLowerCase()) {
      case 'utensils':
      case 'restaurant':
        return Icons.restaurant;
      case 'heart-pulse':
      case 'hospital':
        return Icons.local_hospital_outlined;
      case 'car':
        return Icons.directions_car_outlined;
      case 'laptop':
      case 'smartphone':
        return Icons.devices_outlined;
      case 'wrench':
      case 'hammer':
        return Icons.handyman_outlined;
      case 'shopping-bag':
      case 'store':
        return Icons.shopping_bag_outlined;
      default:
        return Icons.category_outlined;
    }
  }
}
