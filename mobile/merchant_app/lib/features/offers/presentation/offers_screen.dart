import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import '../providers/merchant_offers_provider.dart';
import 'offer_edit_dialog.dart';

class OffersScreen extends ConsumerWidget {
  const OffersScreen({super.key});

  void _openCreateDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const OfferEditDialog(),
    );
  }

  void _openEditDialog(BuildContext context, OfferModel offer) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => OfferEditDialog(offer: offer),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offersState = ref.watch(merchantOffersNotifierProvider);
    final offersNotifier = ref.read(merchantOffersNotifierProvider.notifier);

    final offers = offersState.filteredOffers;

    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة العروض الترويجية'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'تحديث',
            onPressed: () => offersNotifier.loadOffers(),
          ),
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppColors.primary),
            tooltip: 'إضافة عرض جديد',
            onPressed: () => _openCreateDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.white,
            child: Row(
              children: [
                _buildFilterChip('الكل (${offersState.offers.length})', 'all', offersState.filter, (val) => offersNotifier.setFilter(val)),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'النشطة (${offersState.offers.where((o) => o.isActive).length})',
                  'active',
                  offersState.filter,
                  (val) => offersNotifier.setFilter(val),
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'المتوقفة (${offersState.offers.where((o) => !o.isActive).length})',
                  'inactive',
                  offersState.filter,
                  (val) => offersNotifier.setFilter(val),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Content Body
          Expanded(
            child: offersState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : offersState.errorMessage != null && offers.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.error_outline, color: AppColors.error, size: 48),
                              const SizedBox(height: 12),
                              Text(offersState.errorMessage!, textAlign: TextAlign.center),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: () => offersNotifier.loadOffers(),
                                child: const Text(AppStrings.retry),
                              ),
                            ],
                          ),
                        ),
                      )
                    : offers.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.local_offer_outlined, color: AppColors.textMuted, size: 56),
                                  const SizedBox(height: 16),
                                  const Text(
                                    'لا توجد عروض ترويجية مسجلة حالياً.',
                                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'أنشئ عروضك الترويجية والخصومات لجذب المزيد من الزبائن وزيادة التفاعل.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                  ),
                                  const SizedBox(height: 20),
                                  ElevatedButton.icon(
                                    icon: const Icon(Icons.add),
                                    label: const Text('إضافة أول عرض الآن'),
                                    onPressed: () => _openCreateDialog(context),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () async => offersNotifier.loadOffers(),
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: offers.length,
                              itemBuilder: (ctx, index) {
                                final offer = offers[index];
                                return _buildOfferCard(context, ref, offer);
                              },
                            ),
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('إضافة عرض'),
        onPressed: () => _openCreateDialog(context),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, String currentVal, Function(String) onSelect) {
    final isSelected = currentVal == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => onSelect(value),
      selectedColor: AppColors.primaryLight,
      labelStyle: TextStyle(
        color: isSelected ? AppColors.primary : AppColors.textSecondary,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 12,
      ),
    );
  }

  Widget _buildOfferCard(BuildContext context, WidgetRef ref, OfferModel offer) {
    final offersNotifier = ref.read(merchantOffersNotifierProvider.notifier);

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Banner
          if (offer.coverImage != null && offer.coverImage!.isNotEmpty)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              child: Image.network(
                offer.coverImage!,
                height: 120,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badge for discount
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: offer.isActive ? AppColors.secondary : AppColors.textMuted,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        offer.discountPercentage != null
                            ? 'خصم ${offer.discountPercentage!.toInt()}%'
                            : (offer.discountAmount != null
                                ? 'وفر ${offer.discountAmount} ج.م'
                                : 'عرض خاص'),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            offer.title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary),
                          ),
                          if (offer.activityName != null)
                            Text(
                              offer.activityName!,
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                            ),
                        ],
                      ),
                    ),
                    Switch(
                      value: offer.isActive,
                      activeColor: AppColors.secondary,
                      onChanged: (_) => offersNotifier.toggleOfferStatus(offer.id),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                Text(
                  offer.description,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.3),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),

                // Prices & Dates
                Row(
                  children: [
                    if (offer.offerPrice != null) ...[
                      Text(
                        '${offer.offerPrice} ج.م',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.primary),
                      ),
                      if (offer.originalPrice != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          '${offer.originalPrice} ج.م',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                    const Spacer(),
                    Icon(Icons.access_time, size: 14, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      'حتى ${offer.endsAt.length >= 10 ? offer.endsAt.substring(0, 10) : offer.endsAt}',
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ],
                ),
                const Divider(height: 20),

                // Action buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 18),
                      label: const Text('حذف', style: TextStyle(color: AppColors.error, fontSize: 12)),
                      onPressed: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('تأكيد حذف العرض'),
                            content: Text('هل أنت متأكد من رغبتك في حذف "${offer.title}"؟'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
                                onPressed: () => Navigator.pop(ctx, true),
                                child: const Text('حذف'),
                              ),
                            ],
                          ),
                        );
                        if (confirm == true) {
                          offersNotifier.deleteOffer(offer.id);
                        }
                      },
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.edit, size: 16),
                      label: const Text('تعديل العرض', style: TextStyle(fontSize: 12)),
                      onPressed: () => _openEditDialog(context, offer),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
