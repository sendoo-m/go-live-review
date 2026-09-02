import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../../auth/providers/merchant_auth_provider.dart';
import '../../offers/presentation/offer_edit_dialog.dart';
import '../providers/merchant_dashboard_provider.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentNavIndex = 0;

  Future<void> _handleLogout() async {
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تسجيل الخروج'),
        content: const Text('هل أنت متأكد من تسجيل الخروج من بوابة التاجر؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('تسجيل الخروج'),
          ),
        ],
      ),
    );

    if (shouldLogout == true && mounted) {
      await ref.read(merchantAuthNotifierProvider.notifier).logout();
      if (mounted) {
        context.go(MerchantRoutes.login);
      }
    }
  }

  void _openQuickCreateOffer() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const OfferEditDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(merchantAuthNotifierProvider);
    final dashboardState = ref.watch(merchantDashboardProvider);
    final dashboardNotifier = ref.read(merchantDashboardProvider.notifier);

    final merchantName = dashboardState.data?.merchant['name'] ?? authState.user?.name ?? 'التاجر';
    final stats = dashboardState.data?.stats;
    final activities = dashboardState.data?.activities ?? [];
    final inquiries = dashboardState.data?.recentInquiries ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            const Text(
              'بوابة التاجر • لوحة التحكم',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
            ),
            Text(
              'أهلاً بك، $merchantName',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'تحديث البيانات',
            onPressed: () => dashboardNotifier.fetchDashboardData(),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.error),
            tooltip: 'تسجيل الخروج',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await dashboardNotifier.fetchDashboardData();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Subscription / Plan Summary Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryDark],
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.25),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'باقة التاجر المتقدمة (Pro)',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.secondary,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('الاشتراك نشط', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'تتيح لك إدارة أنشطة متعددة، نشر العروض الترويجية، كتالوج منتجات غير محدود، ورفع الوسائط المباشرة.',
                      style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.3),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 2. Quick Operations Hub (الإجراءات السريعة)
              const Text(
                'إجراءات تشغيلية سريعة',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildQuickActionBtn(
                      icon: Icons.add_business,
                      label: 'الملف التجاري',
                      color: AppColors.primary,
                      onTap: () => context.push(MerchantRoutes.profile),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildQuickActionBtn(
                      icon: Icons.add_box_outlined,
                      label: 'إضافة منتج',
                      color: AppColors.secondary,
                      onTap: () => context.push(MerchantRoutes.products),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildQuickActionBtn(
                      icon: Icons.local_offer_outlined,
                      label: 'إنشاء عرض',
                      color: Colors.orange.shade700,
                      onTap: _openQuickCreateOffer,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildQuickActionBtn(
                      icon: Icons.cloud_upload_outlined,
                      label: 'رفع صورة',
                      color: Colors.teal,
                      onTap: () => context.push(MerchantRoutes.media),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // 3. Performance Stats Overview
              const Text(
                'نظرة عامة على الأداء والمؤشرات',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 12),

              if (dashboardState.isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 30),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (dashboardState.errorMessage != null)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Text(dashboardState.errorMessage!, style: const TextStyle(color: AppColors.error)),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: () => dashboardNotifier.fetchDashboardData(),
                        child: const Text(AppStrings.retry),
                      ),
                    ],
                  ),
                )
              else ...[
                // KPI 3x2 Grid
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => context.push(MerchantRoutes.profile),
                        child: _buildMetricCard(
                          'الأنشطة المفعّلة',
                          stats?.activitiesCount.toString() ?? '0',
                          Icons.storefront,
                          AppColors.primary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: () => context.push(MerchantRoutes.products),
                        child: _buildMetricCard(
                          'المنتجات بالكتالوج',
                          stats?.productsCount.toString() ?? '0',
                          Icons.inventory_2_outlined,
                          AppColors.secondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => context.push(MerchantRoutes.offers),
                        child: _buildMetricCard(
                          'العروض والخصومات',
                          stats?.offersCount.toString() ?? '0',
                          Icons.local_offer_outlined,
                          Colors.orange.shade700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: () => context.push(MerchantRoutes.media),
                        child: _buildMetricCard(
                          'الوسائط ومعرض الصور',
                          stats?.mediaCount.toString() ?? '0',
                          Icons.photo_library_outlined,
                          Colors.teal,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => context.push(MerchantRoutes.inquiries),
                        child: _buildMetricCard(
                          'الاستفسارات والطلبات',
                          stats?.inquiriesCount.toString() ?? '0',
                          Icons.chat_bubble_outline,
                          Colors.deepPurple,
                          badge: stats?.newInquiriesCount != null && stats!.newInquiriesCount > 0
                              ? '${stats.newInquiriesCount} جديد'
                              : null,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildMetricCard(
                        'إجمالي المشاهدات',
                        stats?.totalViews.toString() ?? '0',
                        Icons.visibility_outlined,
                        Colors.indigo,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // 4. Main Operational Sections Hub
                const Text(
                  'أقسام الإدارة والتشغيل',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 10),
                _buildSectionTile(
                  icon: Icons.mark_chat_unread_outlined,
                  title: 'صندوق الاستفسارات والطلبات (Leads CRM)',
                  subtitle: 'متابعة طلبات العملاء، خطة المتابعة، والرد السريع عبر واتساب',
                  color: Colors.deepPurple,
                  badge: stats?.newInquiriesCount != null && stats!.newInquiriesCount > 0
                      ? '${stats.newInquiriesCount} جديد'
                      : null,
                  onTap: () => context.push(MerchantRoutes.inquiries),
                ),
                _buildSectionTile(
                  icon: Icons.business,
                  title: 'إدارة الملف والنشاط التجاري',
                  subtitle: 'الاسم، العنوان، ساعات العمل، أرقام التواصل، والتوثيق',
                  color: AppColors.primary,
                  onTap: () => context.push(MerchantRoutes.profile),
                ),
                _buildSectionTile(
                  icon: Icons.inventory_2_outlined,
                  title: 'كتالوج المنتجات والخدمات',
                  subtitle: 'إضافة المنتجات، الأسعار، صور المنتجات، وحالة التوفر',
                  color: AppColors.secondary,
                  onTap: () => context.push(MerchantRoutes.products),
                ),
                _buildSectionTile(
                  icon: Icons.local_offer_outlined,
                  title: 'العروض والخصومات الترويجية',
                  subtitle: 'إنشاء وإدارة العروض الحصرية وجذب العملاء',
                  color: Colors.orange.shade700,
                  onTap: () => context.push(MerchantRoutes.offers),
                ),
                _buildSectionTile(
                  icon: Icons.photo_library_outlined,
                  title: 'مكتبة الوسائط ومعرض الصور',
                  subtitle: 'رفع صور الواجهة، المنتجات، والعروض الترويجية',
                  color: Colors.teal,
                  onTap: () => context.push(MerchantRoutes.media),
                ),
                const SizedBox(height: 20),

                // 5. My Activities List
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'أنشطتي التجارية المسجلة',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    TextButton(
                      onPressed: () => context.push(MerchantRoutes.profile),
                      child: const Text('إدارة الكل'),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                if (activities.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Center(
                      child: Text('لم تقم بإضافة أي نشاط بعد.', style: TextStyle(color: AppColors.textSecondary)),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: activities.length,
                    itemBuilder: (context, index) {
                      final act = activities[index];
                      return _buildMerchantActivityCard(act);
                    },
                  ),
                const SizedBox(height: 20),

                // 6. Recent Customer Inquiries
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'أحدث استفسارات وطلبات العملاء',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    TextButton(
                      onPressed: () => context.push(MerchantRoutes.inquiries),
                      child: const Text('عرض الكل'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                if (inquiries.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Center(
                      child: Text('لا توجد استفسارات جديدة واردة حتى الآن.', style: TextStyle(color: AppColors.textSecondary)),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: inquiries.length,
                    itemBuilder: (context, index) {
                      final inq = inquiries[index];
                      return _buildInquiryCard(inq);
                    },
                  ),
              ],
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentNavIndex,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          if (index == 1) {
            context.push(MerchantRoutes.profile);
          } else if (index == 2) {
            context.push(MerchantRoutes.products);
          } else if (index == 3) {
            context.push(MerchantRoutes.offers);
          } else if (index == 4) {
            context.push(MerchantRoutes.media);
          } else {
            setState(() {
              _currentNavIndex = index;
            });
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'الرئيسية'),
          BottomNavigationBarItem(icon: Icon(Icons.storefront_outlined), activeIcon: Icon(Icons.storefront), label: 'النشاط'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), activeIcon: Icon(Icons.inventory_2), label: 'الكتالوج'),
          BottomNavigationBarItem(icon: Icon(Icons.local_offer_outlined), activeIcon: Icon(Icons.local_offer), label: 'العروض'),
          BottomNavigationBarItem(icon: Icon(Icons.photo_library_outlined), activeIcon: Icon(Icons.photo_library), label: 'الوسائط'),
        ],
      ),
    );
  }

  Widget _buildQuickActionBtn({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color, {String? badge}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 22),
              if (badge != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.errorLight,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    badge,
                    style: const TextStyle(color: AppColors.error, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
      ),
    );
  }

  Widget _buildMerchantActivityCard(ActivityModel act) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        onTap: () => context.push(MerchantRoutes.profile),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(Icons.store, color: AppColors.primary, size: 24),
        ),
        title: Text(
          act.nameAr,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          '${act.categoryNameAr ?? 'عام'} • ${act.productsCount} منتج',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: act.status == 'verified' ? AppColors.secondaryLight : AppColors.primaryLight,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            act.status == 'verified' ? 'مفعل ومعتمد' : 'قيد المراجعة',
            style: TextStyle(
              color: act.status == 'verified' ? AppColors.secondary : AppColors.primary,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInquiryCard(MerchantInquiry inq) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: () => context.push('/inquiries/${inq.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: inq.status == 'new' ? Colors.blue : Colors.grey,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        inq.senderName,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      if (inq.senderPhone.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.phone, size: 18, color: AppColors.primary),
                          visualDensity: VisualDensity.compact,
                          onPressed: () => launchUrl(Uri.parse('tel:${inq.senderPhone}')),
                        ),
                      Text(
                        inq.senderPhone,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                inq.message,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
