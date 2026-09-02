import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../providers/favorites_provider.dart';
import 'widgets/favorite_button.dart';

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _filterQuery = '';

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

  @override
  Widget build(BuildContext context) {
    final favoritesState = ref.watch(favoritesProvider);
    final favoritesNotifier = ref.read(favoritesProvider.notifier);

    final allFavorites = favoritesState.favorites;
    final filteredFavorites = _filterQuery.isEmpty
        ? allFavorites
        : allFavorites.where((a) {
            final q = _filterQuery.toLowerCase();
            return a.nameAr.toLowerCase().contains(q) ||
                (a.categoryNameAr != null && a.categoryNameAr!.toLowerCase().contains(q)) ||
                (a.governorateNameAr != null && a.governorateNameAr!.toLowerCase().contains(q));
          }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('المفضلة', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'تحديث المفضلة',
            onPressed: () => favoritesNotifier.loadFavorites(isRefresh: true),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => favoritesNotifier.loadFavorites(isRefresh: true),
        child: Column(
          children: [
            // Search within favorites (if favorites exist)
            if (allFavorites.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'البحث في أنشطتك المفضلة...',
                    prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textMuted),
                    suffixIcon: _filterQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {
                                _filterQuery = '';
                              });
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                  ),
                  onChanged: (val) {
                    setState(() {
                      _filterQuery = val.trim();
                    });
                  },
                ),
              ),

            // Favorites count summary bar
            if (allFavorites.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${filteredFavorites.length} من إجمالي ${allFavorites.length} نشاط محفوظ',
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                    ),
                    if (_filterQuery.isNotEmpty)
                      TextButton(
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _filterQuery = '';
                          });
                        },
                        child: const Text('عرض الكل', style: TextStyle(fontSize: 12)),
                      ),
                  ],
                ),
              ),

            // Main List / Empty State
            Expanded(
              child: favoritesState.isLoading && allFavorites.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : allFavorites.isEmpty
                      ? _buildEmptyState()
                      : filteredFavorites.isEmpty
                          ? _buildNoFilterMatchState()
                          : ListView.builder(
                              padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                              itemCount: filteredFavorites.length,
                              itemBuilder: (context, index) {
                                final activity = filteredFavorites[index];
                                return _buildFavoriteCard(activity);
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: AppColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.favorite_border,
                size: 64,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'لا توجد أنشطة في المفضلة بعد',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'يمكنك حفظ متاجرك وخدماتك المفضلة للوصول إليها بسرعة في أي وقت بالضغط على أيقونة القلب.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.go(AppRoutes.home),
              icon: const Icon(Icons.explore_outlined),
              label: const Text('استكشف الأنشطة والخدمات'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoFilterMatchState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, size: 52, color: AppColors.textMuted),
            const SizedBox(height: 12),
            Text(
              'لا توجد نتائج مطابقة لـ "$_filterQuery"',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () {
                _searchController.clear();
                setState(() {
                  _filterQuery = '';
                });
              },
              child: const Text('مسح البحث'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFavoriteCard(ActivityModel activity) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: () => context.push('/activity/${activity.id}'),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Activity Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      activity.coverUrl ?? activity.logoUrl ?? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200',
                      width: 72,
                      height: 72,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 72,
                        height: 72,
                        color: AppColors.primaryLight,
                        child: const Icon(Icons.storefront, color: AppColors.primary, size: 32),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                activity.nameAr,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: AppColors.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            FavoriteButton(activity: activity),
                          ],
                        ),
                        const SizedBox(height: 4),

                        // Category & Governorate Badges
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            if (activity.categoryNameAr != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  activity.categoryNameAr!,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            if (activity.governorateNameAr != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textMuted),
                                    const SizedBox(width: 2),
                                    Text(
                                      activity.governorateNameAr!,
                                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                    ),
                                  ],
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

              // Bottom row: Rating, Delivery badge & Quick Contact
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.star, size: 16, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        '${activity.ratingAvg}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Text(
                        ' (${activity.ratingCount})',
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      ),
                      if (activity.hasDelivery) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            children: const [
                              Icon(Icons.delivery_dining, size: 12, color: Colors.green),
                              SizedBox(width: 2),
                              Text('توصيل', style: TextStyle(fontSize: 10, color: Colors.green, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),

                  // Actions
                  Row(
                    children: [
                      if (activity.phone != null && activity.phone!.isNotEmpty)
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(Icons.phone_outlined, size: 20, color: AppColors.primary),
                          tooltip: 'اتصال هاتفي',
                          onPressed: () => _launchUrl('tel:${activity.phone}'),
                        ),
                      if (activity.whatsapp != null && activity.whatsapp!.isNotEmpty) ...[
                        const SizedBox(width: 12),
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(Icons.chat_bubble_outline, size: 20, color: Colors.green),
                          tooltip: 'واتساب',
                          onPressed: () {
                            final num = activity.whatsapp!.replaceAll(RegExp(r'[^0-9]'), '');
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
