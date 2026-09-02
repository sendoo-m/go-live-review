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
  ConsumerState<ActivityDetailsScreen> createState() =>
      _ActivityDetailsScreenState();
}

class _ActivityDetailsScreenState
    extends ConsumerState<ActivityDetailsScreen> {
  final TextEditingController _reviewCommentController =
      TextEditingController();
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
    final appWebUrl =
        'https://ais-dev-btvvpybazsg3thwohpcxuu-530193892223.europe-west2.run.app/activity/${activity.id}';
    final shareText = '''
📢 تعرف على: ${activity.nameAr}
📍 الموقع: ${activity.fullLocationText}
${activity.descriptionAr != null && activity.descriptionAr!.isNotEmpty ? "📝 " + activity.descriptionAr! : ""}
⭐ التقييم: ${activity.ratingAvg} / 5 (${activity.reviewsCount} تقييم)
🔗 تصفح كافة الخدمات والمنتجات عبر دليل أي خدمة:
$appWebUrl
''';
    try {
      await Share.share(shareText, subject: activity.nameAr);
    } catch (e) {
      await Clipboard.setData(ClipboardData(text: shareText));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                'تم نسخ بيانات النشاط ورابط المشاركة إلى الحافظة بنجاح!'),
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
                // Drag handle
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
                  style: TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                const Text(
                  'رأيك يساعد آلاف المستخدمين في العثور على أفضل الخدمات الموثوقة.',
                  style: TextStyle(
                      color: AppColors.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 16),

                // ── Star Rating Picker ─────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    final starNum = index + 1;
                    return Semantics(
                      label: '$starNum نجوم',
                      button: true,
                      child: IconButton(
                        icon: Icon(
                          starNum <= _selectedRating
                              ? Icons.star_rounded
                              : Icons.star_border_rounded,
                          // ✅ warning = Amber — semantically correct for stars
                          color: starNum <= _selectedRating
                              ? AppColors.warning
                              : AppColors.textMuted,
                          size: 32,
                        ),
                        onPressed: () {
                          setSheetState(
                              () => _selectedRating = starNum);
                        },
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 12),

                // ── Comment Input ──────────────────────────────────
                TextField(
                  controller: _reviewCommentController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'اكتب تعليقك وتفاصيل تجربتك هنا...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          const BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                          color: AppColors.primary, width: 1.5),
                    ),
                    filled: true,
                    fillColor: AppColors.surfaceElevated,
                  ),
                ),
                const SizedBox(height: 16),

                // ── Submit — gradient button ───────────────────────
                Semantics(
                  label: 'إرسال التقييم',
                  button: true,
                  child: GestureDetector(
                    onTap: () async {
                      final comment =
                          _reviewCommentController.text.trim();
                      if (comment.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text(
                                  'يرجى كتابة تعليق على النشاط أولاً')),
                        );
                        return;
                      }
                      Navigator.pop(ctx);
                      final success = await ref
                          .read(activityDetailsProvider(activityId)
                              .notifier)
                          .submitReview(
                            rating: _selectedRating,
                            comment: comment,
                          );
                      if (success && mounted) {
                        _reviewCommentController.clear();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                                'شكراً لمشاركتك! تم إضافة تقييمك بنجاح.'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      padding:
                          const EdgeInsets.symmetric(vertical: 14),
                      decoration: AppColors.brandBoxDecorationRounded(
                          radius: 12),
                      child: const Center(
                        child: Text(
                          'إرسال التقييم',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          );
        },
      ),
    );
  }

  // ── Build ──────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final state =
        ref.watch(activityDetailsProvider(widget.activityId));
    final notifier =
        ref.read(activityDetailsProvider(widget.activityId).notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: state.isLoading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Brand-colored progress indicator
                  ShaderMask(
                    shaderCallback: (b) =>
                        AppColors.brandGradient.createShader(b),
                    child: const CircularProgressIndicator(
                        color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'جارٍ جلب تفاصيل النشاط والمنتجات...',
                    style:
                        TextStyle(color: AppColors.textSecondary),
                  ),
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
                        ShaderMask(
                          shaderCallback: (b) =>
                              AppColors.brandGradient.createShader(b),
                          child: const Icon(
                              Icons.error_outline,
                              size: 54,
                              color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          state.errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              fontSize: 15,
                              color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 20),
                        GestureDetector(
                          onTap: () =>
                              notifier.loadDetails(isRefresh: true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 12),
                            decoration:
                                AppColors.brandBoxDecorationRounded(
                                    radius: 12),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.refresh,
                                    color: Colors.white, size: 18),
                                SizedBox(width: 6),
                                Text('إعادة المحاولة',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
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
                  ? const Center(
                      child: Text('النشاط التجاري غير متوفر'))
                  : _buildDetailsContent(
                      state.activity!, notifier),
    );
  }

  Widget _buildDetailsContent(
      ActivityDetailModel activity, ActivityDetailsNotifier notifier) {
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () => notifier.loadDetails(isRefresh: true),
      child: CustomScrollView(
        slivers: [
          // ── 1. SliverAppBar ──────────────────────────────────────
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back,
                    color: Colors.white, size: 20),
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
              Semantics(
                label: 'مشاركة النشاط',
                button: true,
                child: IconButton(
                  icon: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.share,
                        color: Colors.white, size: 20),
                  ),
                  tooltip: 'مشاركة النشاط',
                  onPressed: () => _shareActivity(activity),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    activity.coverUrl ??
                        'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                        Container(
                      decoration: BoxDecoration(
                        gradient: AppColors.heroGradient,
                      ),
                      child: const Icon(Icons.storefront,
                          size: 64, color: Colors.white),
                    ),
                  ),
                  // ✅ AppColors.overlayGradient replaces hardcoded withOpacity
                  DecoratedBox(
                    decoration: const BoxDecoration(
                      gradient: AppColors.overlayGradient,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── 2. Main Content ──────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Title + Verification + Rating ────────────────
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
                                  ShaderMask(
                                    shaderCallback: (b) =>
                                        AppColors.brandGradient
                                            .createShader(b),
                                    child: const Icon(
                                        Icons.verified,
                                        size: 20,
                                        color: Colors.white),
                                  ),
                                ],
                              ],
                            ),
                            if (activity.nameEn != null &&
                                activity.nameEn!.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(
                                activity.nameEn!,
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary),
                              ),
                            ],
                          ],
                        ),
                      ),
                      // ✅ Rating badge with brandGradient
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              gradient: AppColors.brandGradient,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.star_rounded,
                                    color: Colors.white, size: 16),
                                const SizedBox(width: 4),
                                Text(
                                  activity.ratingAvg.toStringAsFixed(1),
                                  style: const TextStyle(
                                    color: Colors.white,
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
                            style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // ── Tags: Category, Section, Verified ────────────
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      if (activity.categoryNameAr != null)
                        Chip(
                          avatar: const Icon(
                              Icons.category_outlined,
                              size: 14,
                              color: AppColors.primary),
                          label: Text(activity.categoryNameAr!),
                          backgroundColor: AppColors.primaryLight,
                          labelStyle: const TextStyle(
                              fontSize: 11,
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                        ),
                      // ✅ Section chip: accent instead of hardcoded indigo
                      if (activity.sectionNameAr != null)
                        Chip(
                          avatar: Icon(Icons.layers_outlined,
                              size: 14, color: AppColors.accent),
                          label: Text(activity.sectionNameAr!),
                          backgroundColor: AppColors.accentLight,
                          labelStyle: TextStyle(
                              fontSize: 11,
                              color: AppColors.accent,
                              fontWeight: FontWeight.bold),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                        ),
                      if (activity.isVerified)
                        Chip(
                          avatar: const Icon(Icons.shield_outlined,
                              size: 14, color: AppColors.success),
                          label: const Text('نشاط موثق ومعتمد'),
                          backgroundColor: AppColors.successLight,
                          labelStyle: const TextStyle(
                              fontSize: 11,
                              color: AppColors.success,
                              fontWeight: FontWeight.bold),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // ── Location Card ─────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ShaderMask(
                          shaderCallback: (b) =>
                              AppColors.brandGradient.createShader(b),
                          child: const Icon(
                              Icons.location_on_outlined,
                              color: Colors.white,
                              size: 22),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                activity.fullLocationText,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13),
                              ),
                              if (activity.addressAr != null &&
                                  activity.addressAr!.isNotEmpty) ...[
                                const SizedBox(height: 2),
                                Text(
                                  activity.addressAr!,
                                  style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12),
                                ),
                              ],
                            ],
                          ),
                        ),
                        if (activity.latitude != null &&
                            activity.longitude != null)
                          TextButton.icon(
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8),
                              tapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                            ),
                            icon: const Icon(Icons.directions,
                                size: 16, color: AppColors.primary),
                            label: const Text('الخريطة',
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold)),
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

                  // ── Action Buttons: Call / WhatsApp / Share ───────
                  Row(
                    children: [
                      if (activity.phone != null &&
                          activity.phone!.isNotEmpty) ...[
                        Expanded(
                          child: _GradientButton(
                            icon: Icons.call_rounded,
                            label: 'اتصال',
                            gradient: AppColors.brandGradient,
                            onTap: () => _launchUrlHelper(
                                'tel:${activity.phone}'),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      if (activity.whatsapp != null &&
                          activity.whatsapp!.isNotEmpty) ...[
                        Expanded(
                          child: _GradientButton(
                            icon: Icons.chat_rounded,
                            label: 'واتساب',
                            gradient: const LinearGradient(
                              colors: [
                                AppColors.whatsapp,
                                AppColors.whatsappDark,
                              ],
                            ),
                            onTap: () {
                              final clean = activity.whatsapp!
                                  .replaceAll('+', '')
                                  .replaceAll(' ', '');
                              _launchUrlHelper(
                                'https://wa.me/$clean?text=${Uri.encodeComponent('مرحباً، أود الاستفسار بخصوص خدمات نشاطكم: ${activity.nameAr}')}',
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Semantics(
                        label: 'مشاركة',
                        button: true,
                        child: GestureDetector(
                          onTap: () => _shareActivity(activity),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border:
                                  Border.all(color: AppColors.border),
                              boxShadow: AppColors.cardShadow,
                            ),
                            child: const Icon(
                                Icons.share_outlined,
                                color: AppColors.textPrimary,
                                size: 20),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // ── Working Hours & Delivery ──────────────────────
                  Row(
                    children: [
                      Expanded(
                        child: _InfoCard(
                          icon: Icons.access_time_rounded,
                          title: 'أوقات العمل',
                          value: activity.workingHours ?? 'يومياً 9 ص - 11 م',
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _InfoCard(
                          icon: activity.hasDelivery
                              ? Icons.delivery_dining_rounded
                              : Icons.store_rounded,
                          title: activity.hasDelivery
                              ? 'خدمة التوصيل'
                              : 'الطلب من الفرع',
                          value: activity.hasDelivery
                              ? (activity.deliveryEstimatedTime ??
                                  'متوفر توصيل سريع')
                              : 'استلام مباشر',
                          iconColor: activity.hasDelivery
                              ? AppColors.success
                              : AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // ── Description ───────────────────────────────────
                  if (activity.descriptionAr != null &&
                      activity.descriptionAr!.isNotEmpty) ...[
                    _SectionHeader(title: 'نبذة عن النشاط والخدمات'),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                        boxShadow: AppColors.cardShadow,
                      ),
                      child: Text(
                        activity.descriptionAr!,
                        style: const TextStyle(
                            fontSize: 13,
                            height: 1.6,
                            color: AppColors.textSecondary),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // ── Gallery ───────────────────────────────────────
                  if (activity.galleryUrls.isNotEmpty) ...[
                    _SectionHeader(title: 'معرض الصور'),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 100,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: activity.galleryUrls.length,
                        itemBuilder: (context, index) {
                          return Container(
                            width: 130,
                            margin: const EdgeInsets.only(left: 8),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              image: DecorationImage(
                                image: NetworkImage(
                                    activity.galleryUrls[index]),
                                fit: BoxFit.cover,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // ── Products ──────────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _SectionHeader(
                          title: 'قائمة المنتجات والخدمات المتاحة'),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          gradient: AppColors.brandGradient,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${activity.products.length} منتج',
                          style: const TextStyle(
                              fontSize: 11,
                              color: Colors.white,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  if (activity.products.isEmpty)
                    _EmptySection(
                        message:
                            'لم يتم إضافة منتجات أو خدمات لهذا النشاط حتى الآن.')
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: activity.products.length,
                      itemBuilder: (context, index) =>
                          _buildProductItem(
                              activity.products[index], activity),
                    ),
                  const SizedBox(height: 28),

                  // ── Reviews ───────────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _SectionHeader(title: 'التقييمات وآراء العملاء'),
                      TextButton.icon(
                        onPressed: () =>
                            _openAddReviewSheet(context, activity.id),
                        icon: const Icon(
                            Icons.rate_review_outlined, size: 16),
                        label: const Text('أضف تقييمك',
                            style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  if (activity.reviews.isEmpty)
                    _EmptySection(
                        message:
                            'لا توجد تقييمات سابقة بعد. كن أول من يشارك تجربته!',
                        icon: Icons.reviews_outlined)
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: activity.reviews.length,
                      itemBuilder: (context, index) =>
                          _buildReviewItem(activity.reviews[index]),
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

  Widget _buildProductItem(
      ProductModel product, ActivityDetailModel activity) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12)),
      elevation: 0,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
          boxShadow: AppColors.cardShadow,
        ),
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
                  gradient: AppColors.brandGradientSubtle,
                  borderRadius: BorderRadius.circular(10),
                  image: DecorationImage(
                    image: NetworkImage(product.coverImage),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            product.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (product.hasDiscount)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.errorLight,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'خصم ${product.discountPercent}%',
                              style: const TextStyle(
                                  color: AppColors.error,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                    if (product.shortDescription.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        product.shortDescription,
                        style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 11),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            ShaderMask(
                              shaderCallback: (b) =>
                                  AppColors.brandGradient.createShader(b),
                              child: Text(
                                '${product.effectivePrice.toStringAsFixed(0)} ${product.currency}',
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Colors.white),
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
                        if (activity.whatsapp != null &&
                            activity.whatsapp!.isNotEmpty)
                          GestureDetector(
                            onTap: () {
                              final cleanPhone = activity.whatsapp!
                                  .replaceAll('+', '')
                                  .replaceAll(' ', '');
                              _launchUrlHelper(
                                'https://wa.me/$cleanPhone?text=${Uri.encodeComponent('مرحباً، أود طلب المنتج: ${product.name} بسعر ${product.effectivePrice} ${product.currency}')}',
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.successLight,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                      Icons.shopping_cart_outlined,
                                      size: 12,
                                      color: AppColors.success),
                                  const SizedBox(width: 4),
                                  const Text(
                                    'طلب عبر واتساب',
                                    style: TextStyle(
                                        fontSize: 10,
                                        color: AppColors.success,
                                        fontWeight: FontWeight.bold),
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
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      gradient: AppColors.brandGradient,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        review.user?.name.isNotEmpty == true
                            ? review.user!.name[0].toUpperCase()
                            : 'U',
                        style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    review.user?.name ?? 'مستخدم معتمد',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ],
              ),
              Row(
                children: List.generate(
                  5,
                  (index) => Icon(
                    index < review.rating
                        ? Icons.star_rounded
                        : Icons.star_border_rounded,
                    size: 14,
                    // ✅ warning = Amber — semantically correct for stars
                    color: index < review.rating
                        ? AppColors.warning
                        : AppColors.textMuted,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            review.comment,
            style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
                height: 1.4),
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════
// Private Widgets
// ══════════════════════════════════════════════════════════════════════

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 4, height: 20,
          decoration: BoxDecoration(
            gradient: AppColors.brandGradient,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary),
          ),
        ),
      ],
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color? iconColor;
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.value,
    this.iconColor,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon,
                  size: 16, color: iconColor ?? AppColors.primary),
              const SizedBox(width: 6),
              Text(title,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _GradientButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final LinearGradient gradient;
  final VoidCallback onTap;
  const _GradientButton({
    required this.icon,
    required this.label,
    required this.gradient,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: label,
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: AppColors.glowBrand,
                blurRadius: 8,
                offset: const Offset(0, 3),
              )
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: Colors.white),
              const SizedBox(width: 6),
              Text(label,
                  style: const TextStyle(
                      fontSize: 13,
                      color: Colors.white,
                      fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptySection extends StatelessWidget {
  final String message;
  final IconData icon;
  const _EmptySection({
    required this.message,
    this.icon = Icons.inbox_outlined,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          ShaderMask(
            shaderCallback: (b) =>
                AppColors.brandGradient.createShader(b),
            child: Icon(icon, size: 36, color: Colors.white),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: const TextStyle(
                fontSize: 13, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
