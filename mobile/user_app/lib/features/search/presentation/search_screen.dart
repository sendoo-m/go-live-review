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
  bool _fieldFocused = false;

  @override
  void initState() {
    super.initState();
    final currentQuery = ref.read(searchNotifierProvider).params.query;
    _searchController = TextEditingController(text: currentQuery);
    _focusNode.addListener(() {
      setState(() => _fieldFocused = _focusNode.hasFocus);
    });
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
    final searchState    = ref.watch(searchNotifierProvider);
    final searchNotifier = ref.read(searchNotifierProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        title: Semantics(
          label: 'حقل البحث',
          textField: true,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            height: 46,
            margin: const EdgeInsets.only(left: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _fieldFocused ? AppColors.primary : AppColors.border,
                width: _fieldFocused ? 1.5 : 1.0,
              ),
              boxShadow: _fieldFocused
                  ? [
                      BoxShadow(
                        color: AppColors.glowBlue,
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      )
                    ]
                  : [],
            ),
            child: TextField(
              controller: _searchController,
              focusNode: _focusNode,
              autofocus: searchState.params.query.isEmpty,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'ابحث عن محل، خدمة، منتج أو تصنيف...',
                hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                prefixIcon: ShaderMask(
                  shaderCallback: (b) => AppColors.brandGradient.createShader(b),
                  child: const Icon(Icons.search, color: Colors.white, size: 22),
                ),
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
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
              onChanged: (val) {
                setState(() {});
                searchNotifier.onQueryChanged(val);
              },
              onSubmitted: _onSearchSubmit,
            ),
          ),
        ),
        actions: [
          Semantics(
            label: 'عرض على الخريطة',
            button: true,
            child: IconButton(
              icon: ShaderMask(
                shaderCallback: (b) => AppColors.brandGradient.createShader(b),
                child: const Icon(Icons.map_outlined, color: Colors.white),
              ),
              tooltip: 'عرض على الخريطة',
              onPressed: () => context.push(AppRoutes.map),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── 1. Type Switcher ──────────────────────────────────────
            _buildTypeFilterRow(searchState, searchNotifier),
            const SizedBox(height: 16),

            // ── 2. Governorate Quick Bar ──────────────────────────────
            if (searchState.governorates.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: Row(
                  children: [
                    Container(
                      width: 4, height: 18,
                      decoration: BoxDecoration(
                        gradient: AppColors.brandGradient,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'المحافظة والمنطقة',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: AppColors.textPrimary),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 38,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: searchState.governorates.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      final sel = searchState.params.governorateId == null;
                      return _BrandChip(
                        label: 'كافة المحافظات',
                        selected: sel,
                        onTap: () => searchNotifier.setGovernorate(null),
                      );
                    }
                    final gov = searchState.governorates[index - 1];
                    final sel = searchState.params.governorateId == gov.id;
                    return _BrandChip(
                      label: gov.nameAr,
                      selected: sel,
                      onTap: () => searchNotifier.setGovernorate(gov.id),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
            ],

            // ── 3. Recent Searches ────────────────────────────────────
            if (searchState.recentSearches.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 4, height: 18,
                          decoration: BoxDecoration(
                            gradient: AppColors.brandGradient,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'عمليات البحث الأخيرة',
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    TextButton(
                      onPressed: () => searchNotifier.clearRecentSearches(),
                      child: const Text('مسح السجل',
                          style: TextStyle(
                              fontSize: 12, color: AppColors.textMuted)),
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
                    return Semantics(
                      label: 'بحث سابق: $term',
                      button: true,
                      child: ActionChip(
                        avatar: const Icon(Icons.history,
                            size: 16, color: AppColors.textMuted),
                        label: Text(term),
                        onPressed: () {
                          _searchController.text = term;
                          _onSearchSubmit(term);
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // ── 4. Categories Grid ────────────────────────────────────
            if (searchState.categories.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                child: Row(
                  children: [
                    Container(
                      width: 4, height: 18,
                      decoration: BoxDecoration(
                        gradient: AppColors.brandGradient,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'تصفح حسب التصنيف',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: AppColors.textPrimary),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 2.6,
                  ),
                  itemCount: searchState.categories.length,
                  itemBuilder: (context, index) {
                    final cat = searchState.categories[index];
                    final isSelected =
                        searchState.params.categoryId == cat.id;
                    return Semantics(
                      label: cat.nameAr,
                      selected: isSelected,
                      button: true,
                      child: InkWell(
                        onTap: () {
                          searchNotifier
                              .setCategory(isSelected ? null : cat.id);
                          context.push(AppRoutes.searchResults);
                        },
                        borderRadius: BorderRadius.circular(12),
                        splashColor: AppColors.primaryLight,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: isSelected
                                ? AppColors.brandGradientSubtle
                                : null,
                            color: isSelected ? null : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: AppColors.glowBlue,
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : [],
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  gradient: isSelected
                                      ? AppColors.brandGradient
                                      : null,
                                  color: isSelected
                                      ? null
                                      : AppColors.primaryLight,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  _getCategoryIcon(cat.icon),
                                  size: 16,
                                  color: isSelected
                                      ? Colors.white
                                      : AppColors.primary,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  cat.nameAr,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSelected
                                        ? FontWeight.bold
                                        : FontWeight.w500,
                                    color: isSelected
                                        ? AppColors.primaryDark
                                        : AppColors.textPrimary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
            ],

            // ── 5. Search Button ──────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Semantics(
                label: 'عرض كافة نتائج البحث',
                button: true,
                child: GestureDetector(
                  onTap: () => _onSearchSubmit(_searchController.text),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration:
                        AppColors.brandBoxDecorationRounded(radius: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.search, color: Colors.white, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'عرض كافة نتائج البحث',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // ── Type Filter Row ──────────────────────────────────────────────────
  Widget _buildTypeFilterRow(SearchState state, SearchNotifier notifier) {
    final types = [
      {'key': 'all',     'label': 'الكل',              'icon': Icons.apps},
      {'key': 'shop',    'label': 'المتاجر والمحلات',   'icon': Icons.storefront},
      {'key': 'service', 'label': 'الخدمات والصيانة',  'icon': Icons.build_outlined},
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
            child: Semantics(
              label: t['label'] as String,
              selected: isSelected,
              button: true,
              child: GestureDetector(
                onTap: () => notifier.setType(t['key'] as String),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppColors.brandGradient : null,
                    color: isSelected ? null : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? Colors.transparent
                          : AppColors.border,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.glowPurple,
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            )
                          ]
                        : [],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        t['icon'] as IconData,
                        size: 15,
                        color: isSelected
                            ? Colors.white
                            : AppColors.primary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        t['label'] as String,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: isSelected
                              ? Colors.white
                              : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
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

// ── Brand Chip ─────────────────────────────────────────────────────────
class _BrandChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _BrandChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Semantics(
        label: label,
        selected: selected,
        button: true,
        child: GestureDetector(
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              gradient: selected ? AppColors.brandGradient : null,
              color: selected ? null : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color:
                    selected ? Colors.transparent : AppColors.border,
              ),
              boxShadow: selected
                  ? [
                      BoxShadow(
                        color: AppColors.glowPurple,
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      )
                    ]
                  : [],
            ),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight:
                    selected ? FontWeight.bold : FontWeight.w500,
                color: selected
                    ? Colors.white
                    : AppColors.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
