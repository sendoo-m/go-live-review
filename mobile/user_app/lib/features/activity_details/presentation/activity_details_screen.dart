import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../favorites/presentation/widgets/favorite_button.dart';
import '../providers/activity_details_provider.dart';

class ActivityDetailsScreen extends ConsumerStatefulWidget {
  final int activityId;

  const ActivityDetailsScreen({
    super.key,
    required this.activityId,
  });

  @override
  ConsumerState<ActivityDetailsScreen> createState() => _ActivityDetailsScreenState();
}

class _ActivityDetailsScreenState extends ConsumerState<ActivityDetailsScreen> {
  final TextEditingController _reviewCommentController = TextEditingController();
  int _selectedRating = 5;

  @override
  void dispose() {
    _reviewCommentController.dispose();
    super.dispose();
  }

  Future<void> _launchUrlHelper(String urlStr) async {
    final uri = Uri.parse(urlStr);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('تعذر فتح الرابط: $urlStr')),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('تعذر تنفيذ الإجراء: $urlStr')),
        );
      }
    }
  }

  Future<void> _shareActivity(ActivityDetailModel activity) async {
    // Generate web URL and fallback share text
    final appWebUrl = 'https://ais-dev-btvvpybazsg3thwohpcxuu-530193892223.europe-west2.run.app/activity/${activity.id}';
    final shareText = '''
📢 تعرف على: ${activity.nameAr}
📍 الموقع: ${activity.fullLocationText}
${activity.descriptionAr != null && activity.descriptionAr!.isNotEmpty ? "📝 " + activity.descriptionAr! : ""}
⭐ التقييم: ${activity.ratingAvg} / 5 (${activity.reviewsCount} تقييم)
🔗 تصفح كافة الخدمات والمنتجات عبر دليل أي خدمة:
$appWebUrl
''';

    try {
      await Share.share(
        shareText,
        subject: activity.nameAr,
      );
    } catch (e) {
      // Fallback: Copy to clipboard if Share API is restricted in iframe/web
      await Clipboard.setData(ClipboardData(text: shareText));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('تم نسخ بيانات النشاط ورابط المشاركة إلى الحافظة بنجاح!'),
            backgroundColor: AppColors.primary,
          ),
        );
      }
    }
  }

  void _openAddReviewSheet(BuildContext context, int activityId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              top: 20,
              left: 20,
              right: 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'أضف تقييمك وتجربتك للنشاط',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                const Text(
                  'رأيك يساعد آلاف المستخدمين في العثور على أفضل الخدمات الموثوقة.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 16),

                // Star Rating Picker
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    final starNumber = index + 1;
                    return IconButton(
                      icon: Icon(
                        starNumber <= _selectedRating ? Icons.star : Icons.star_border,
                        color: AppColors.secondary,
                        size: 32,
                      ),
                      onPressed: () {
                        setSheetState(() {
                          _selectedRating = starNumber;
                        });
                      },
                    );
                  }),
                ),
                const SizedBox(height: 12),

                // Comment input
                TextField(
                  controller: _reviewCommentController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'اكتب تعليقك وتفاصيل تجربتك هنا...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    filled: true,
                    fillColor: Colors.grey.shade50,
                  ),
                ),
                const SizedBox(height: 16),

                // Submit button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      final comment = _reviewCommentController.text.trim();
                      if (comment.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('يرجى كتابة تعليق على النشاط أولاً')),
                        );
                        return;
                      }

                      Navigator.pop(ctx);
                      final success = await ref
                          .read(activityDetailsProvider(activityId).notifier)
                          .submitReview(
                            rating: _selectedRating,
                            comment: comment,
                          );

                      if (success && mounted) {
                        _reviewCommentController.clear();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('شكراً لمشاركتك! تم إضافة تقييمك بنجاح.'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    },
                    child: const Text('إرسال التقييم', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(activityDetailsProvider(widget.activityId));
    final notifier = ref.read(activityDetailsProvider(widget.activityId).notifier);

    return Scaffold(
      body: state.isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('جارٍ جلب تفاصيل النشاط والمنتجات...', style: TextStyle(color: AppColors.textSecondary)),
                ],
              ),
            )
          : state.errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 54, color: AppColors.error),
                        const SizedBox(height: 16),
                        Text(
                          state.errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 15, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: () => notifier.loadDetails(isRefresh: true),
                          icon: const Icon(Icons.refresh),
                          label: const Text('إعادة المحاولة'),
                        ),
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: () => context.pop(),
                          child: const Text('العودة للخلف'),
                        ),
                      ],
                    ),
                  ),
                )
              : state.activity == null
                  ? const Center(child: Text('النشاط التجاري غير متوفر'))
                  : _buildDetailsContent(state.activity!, notifier),
    );
  }

  Widget _buildDetailsContent(ActivityDetailModel activity, ActivityDetailsNotifier notifier) {
    return RefreshIndicator(
      onRefresh: () => notifier.loadDetails(isRefresh: true),
      child: CustomScrollView(
        slivers: [
          // 1. Sliver App Bar with Cover Image & Action Buttons
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
              onPressed: () => context.pop(),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(left: 4),
                child: FavoriteButton(
                  activity: activity.toActivityModel(),
                  hasBackground: true,
                  size: 20,
                ),
              ),
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.share, color: Colors.white, size: 20),
                ),
                tooltip: 'مشاركة النشاط',
                onPressed: () => _shareActivity(activity),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    activity.coverUrl ?? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: AppColors.primaryLight,
                      child: const Icon(Icons.storefront, size: 64, color: AppColors.primary),
                    ),
                  ),
                  // Dark Gradient Overlay for legibility
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.black.withOpacity(0.7),
                          Colors.transparent,
                          Colors.black.withOpacity(0.5),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 2. Main Content Body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title + Verification Badge + Category
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    activity.nameAr,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                                if (activity.isVerified) ...[
                                  const SizedBox(width: 6),
                                  const Icon(Icons.verified, color: AppColors.primary, size: 20),
                                ],
                              ],
                            ),
                            if (activity.nameEn != null && activity.nameEn!.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(
                                activity.nameEn!,
                                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                            ],
                          ],
                        ),
                      ),
                      // Rating & Views Column
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: AppColors.secondaryLight,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.star, color: AppColors.secondary, size: 16),
                                const SizedBox(width: 4),
                                Text(
                                  activity.ratingAvg.toStringAsFixed(1),
                                  style: const TextStyle(
                                    color: AppColors.secondary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${activity.reviewsCount} تقييم • ${activity.viewsCount} مشاهدة',
                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Tags Row: Category, Section, Verification
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      if (activity.categoryNameAr != null)
                        Chip(
                          avatar: const Icon(Icons.category_outlined, size: 14, color: AppColors.primary),
                          label: Text(activity.categoryNameAr!),
                          backgroundColor: AppColors.primaryLight,
                          labelStyle: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      if (activity.sectionNameAr != null)
                        Chip(
                          avatar: const Icon(Icons.layers_outlined, size: 14, color: Colors.indigo),
                          label: Text(activity.sectionNameAr!),
                          backgroundColor: Colors.indigo.shade50,
                          labelStyle: const TextStyle(fontSize: 11, color: Colors.indigo, fontWeight: FontWeight.bold),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      if (activity.isVerified)
                        const Chip(
                          avatar: Icon(Icons.shield_outlined, size: 14, color: Colors.green),
                          label: Text('نشاط موثق ومعتمد'),
                          backgroundColor: Color(0xFFE8F5E9),
                          labelStyle: TextStyle(fontSize: 11, color: Colors.green, fontWeight: FontWeight.bold),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Location and Address card
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.location_on_outlined, color: AppColors.primary, size: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                activity.fullLocationText,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              if (activity.addressAr != null && activity.addressAr!.isNotEmpty) ...[
                                const SizedBox(height: 2),
                                Text(
                                  activity.addressAr!,
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                                ),
                              ],
                            ],
                          ),
                        ),
                        if (activity.latitude != null && activity.longitude != null)
                          TextButton.icon(
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            icon: const Icon(Icons.directions, size: 16, color: AppColors.primary),
                            label: const Text('الخريطة', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            onPressed: () {
                              final mapUrl = activity.googleMapsUrl ??
                                  'https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}';
                              _launchUrlHelper(mapUrl);
                            },
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Quick Action Buttons Row (Call, WhatsApp, Maps, Share)
                  Row(
                    children: [
                      // Call
                      if (activity.phone != null && activity.phone!.isNotEmpty)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _launchUrlHelper('tel:${activity.phone}'),
                            icon: const Icon(Icons.call, size: 18),
                            label: const Text('اتصال', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                      if (activity.phone != null && activity.phone!.isNotEmpty) const SizedBox(width: 8),

                      // WhatsApp
                      if (activity.whatsapp != null && activity.whatsapp!.isNotEmpty)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              final cleanPhone = activity.whatsapp!.replaceAll('+', '').replaceAll(' ', '');
                              _launchUrlHelper('https://wa.me/$cleanPhone?text=${Uri.encodeComponent('مرحباً، أود الاستفسار بخصوص خدمات نشاطكم: ${activity.nameAr}')}');
                            },
                            icon: const Icon(Icons.chat, size: 18),
                            label: const Text('واتساب', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF25D366),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                      if (activity.whatsapp != null && activity.whatsapp!.isNotEmpty) const SizedBox(width: 8),

                      // Share Button
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.share_outlined, color: AppColors.textPrimary, size: 20),
                          tooltip: 'مشاركة',
                          onPressed: () => _shareActivity(activity),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Working Hours & Delivery Info
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.access_time, size: 16, color: AppColors.primary),
                                  SizedBox(width: 6),
                                  Text('أوقات العمل', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                activity.workingHours ?? 'يومياً 9 ص - 11 م',
                                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    activity.hasDelivery ? Icons.delivery_dining : Icons.store,
                                    size: 16,
                                    color: activity.hasDelivery ? Colors.green : AppColors.textMuted,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    activity.hasDelivery ? 'خدمة التوصيل' : 'الطلب من الفرع',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                activity.hasDelivery
                                    ? (activity.deliveryEstimatedTime ?? 'متوفر توصيل سريع')
                                    : 'استلام مباشر',
                                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Description
                  if (activity.descriptionAr != null && activity.descriptionAr!.isNotEmpty) ...[
                    const Text(
                      'نبذة عن النشاط والخدمات',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        activity.descriptionAr!,
                        style: const TextStyle(fontSize: 13, height: 1.6, color: AppColors.textSecondary),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Gallery (if available)
                  if (activity.galleryUrls.isNotEmpty) ...[
                    const Text(
                      'معرض الصور',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 100,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: activity.galleryUrls.length,
                        itemBuilder: (context, index) {
                          final imgUrl = activity.galleryUrls[index];
                          return Container(
                            width: 130,
                            margin: const EdgeInsets.only(left: 8),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              image: DecorationImage(
                                image: NetworkImage(imgUrl),
                                fit: BoxFit.cover,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // 3. Products & Services Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'قائمة المنتجات والخدمات المتاحة',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      Text(
                        '${activity.products.length} منتج',
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  if (activity.products.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: const Center(
                        child: Text(
                          'لم يتم إضافة منتجات أو خدمات لهذا النشاط حتى الآن.',
                          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: activity.products.length,
                      itemBuilder: (context, index) {
                        final product = activity.products[index];
                        return _buildProductItem(product, activity);
                      },
                    ),
                  const SizedBox(height: 28),

                  // 4. Ratings and Customer Reviews Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'التقييمات وآراء العملاء',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      TextButton.icon(
                        onPressed: () => _openAddReviewSheet(context, activity.id),
                        icon: const Icon(Icons.rate_review_outlined, size: 16),
                        label: const Text('أضف تقييمك', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  if (activity.reviews.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.reviews_outlined, size: 36, color: AppColors.textMuted.withOpacity(0.5)),
                            const SizedBox(height: 8),
                            const Text(
                              'لا توجد تقييمات سابقة بعد. كن أول من يشارك تجربته!',
                              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: activity.reviews.length,
                      itemBuilder: (context, index) {
                        final review = activity.reviews[index];
                        return _buildReviewItem(review);
                      },
                    ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductItem(ProductModel product, ActivityDetailModel activity) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Cover
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(10),
                image: DecorationImage(
                  image: NetworkImage(product.coverImage),
                  fit: BoxFit.cover,
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
                          product.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (product.hasDiscount)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.errorLight,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'خصم ${product.discountPercent}%',
                            style: const TextStyle(color: AppColors.error, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                    ],
                  ),
                  if (product.shortDescription.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      product.shortDescription,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 6),

                  // Price & Action
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(
                            '${product.effectivePrice.toStringAsFixed(0)} ${product.currency}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: AppColors.primary,
                            ),
                          ),
                          if (product.hasDiscount) ...[
                            const SizedBox(width: 6),
                            Text(
                              '${product.price.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textMuted,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                        ],
                      ),
                      if (activity.whatsapp != null && activity.whatsapp!.isNotEmpty)
                        GestureDetector(
                          onTap: () {
                            final cleanPhone = activity.whatsapp!.replaceAll('+', '').replaceAll(' ', '');
                            _launchUrlHelper(
                              'https://wa.me/$cleanPhone?text=${Uri.encodeComponent('مرحباً، أود طلب المنتج: ${product.name} بسعر ${product.effectivePrice} ${product.currency}')}',
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8F5E9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.shopping_cart_outlined, size: 12, color: Color(0xFF2E7D32)),
                                SizedBox(width: 4),
                                Text(
                                  'طلب عبر واتساب',
                                  style: TextStyle(fontSize: 10, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewItem(ReviewModel review) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: AppColors.primaryLight,
                    child: Text(
                      review.user?.name.isNotEmpty == true ? review.user!.name[0] : 'U',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    review.user?.name ?? 'مستخدم معتمد',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ],
              ),
              Row(
                children: List.generate(
                  5,
                  (index) => Icon(
                    index < review.rating ? Icons.star : Icons.star_border,
                    size: 14,
                    color: AppColors.secondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            review.comment,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
          ),
        ],
      ),
    );
  }
}
