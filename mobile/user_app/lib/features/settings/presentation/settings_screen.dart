import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../../auth/providers/auth_provider.dart';
import '../../home/providers/home_provider.dart';
import '../providers/settings_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(settingsNotifierProvider);
    final homeState = ref.watch(homeNotifierProvider);
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('الإعدادات', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: settingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('حدث خطأ في تحميل الإعدادات: $err')),
        data: (settings) => SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // General Preferences Group
              _buildSectionTitle('التفضيلات العامة'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    // Language
                    ListTile(
                      leading: const Icon(Icons.language, color: AppColors.primary),
                      title: const Text('لغة التطبيق', style: TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text(settings.language == 'ar' ? 'العربية' : 'English'),
                      trailing: DropdownButton<String>(
                        value: settings.language,
                        underline: const SizedBox(),
                        items: const [
                          DropdownMenuItem(value: 'ar', child: Text('العربية')),
                          DropdownMenuItem(value: 'en', child: Text('English')),
                        ],
                        onChanged: (lang) {
                          if (lang != null) {
                            ref.read(settingsNotifierProvider.notifier).setLanguage(lang);
                          }
                        },
                      ),
                    ),
                    const Divider(height: 1),
                    // Default Governorate
                    ListTile(
                      leading: const Icon(Icons.location_on_outlined, color: AppColors.primary),
                      title: const Text('المحافظة الافتراضية', style: TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text(settings.defaultGovernorateName ?? 'كافة المحافظات'),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
                      onTap: () => _showGovernoratePicker(context, ref, homeState.governorates, settings),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Notifications Group
              _buildSectionTitle('إعدادات الإشعارات'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      secondary: const Icon(Icons.notifications_active_outlined, color: AppColors.primary),
                      title: const Text('الإشعارات الفورية (Push Notifications)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: const Text('استقبال تنبيهات الأنشطة والتحديثات الجديدة', style: TextStyle(fontSize: 12)),
                      value: settings.pushNotificationsEnabled,
                      activeColor: AppColors.primary,
                      onChanged: (val) {
                        ref.read(settingsNotifierProvider.notifier).togglePushNotifications(val);
                      },
                    ),
                    const Divider(height: 1),
                    SwitchListTile(
                      secondary: const Icon(Icons.local_offer_outlined, color: AppColors.secondary),
                      title: const Text('تنبيهات العروض والخصومات', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: const Text('إشعارات فورية عند توفر عروض جديدة في منطقتك', style: TextStyle(fontSize: 12)),
                      value: settings.offerNotificationsEnabled,
                      activeColor: AppColors.secondary,
                      onChanged: (val) {
                        ref.read(settingsNotifierProvider.notifier).toggleOfferNotifications(val);
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Storage & Cache
              _buildSectionTitle('البيانات والذاكرة المؤقتة'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.delete_outline, color: AppColors.error),
                      title: const Text('مسح سجل البحث', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: const Text('حذف جميع كلمات البحث المحفوظة محلياً', style: TextStyle(fontSize: 12)),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
                      onTap: () => _confirmClearSearch(context, ref),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // About & Legal
              _buildSectionTitle('حول التطبيق والشروط'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.info_outline, color: AppColors.primary),
                      title: const Text('عن دليل أي خدمة', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
                      onTap: () => _showAboutDialog(context),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.privacy_tip_outlined, color: AppColors.primary),
                      title: const Text('سياسة الخصوصية', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
                      onTap: () => _showPrivacyPolicyDialog(context),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.description_outlined, color: AppColors.primary),
                      title: const Text('الشروط والأحكام', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
                      onTap: () => _showTermsDialog(context),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Version & Build badge
              Center(
                child: Column(
                  children: [
                    Text(
                      'دليل أي خدمة - Daleel Ay Khidma',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey.shade600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'الإصدار 1.0.0 (Build 1) - Production Ready',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Logout if authenticated
              if (authState.isAuthenticated) ...[
                OutlinedButton.icon(
                  onPressed: () => _confirmLogout(context, ref),
                  icon: const Icon(Icons.logout, color: AppColors.error, size: 18),
                  label: const Text('تسجيل الخروج من الحساب', style: TextStyle(color: AppColors.error)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error),
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(right: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  void _showGovernoratePicker(
    BuildContext context,
    WidgetRef ref,
    List<dynamic> governorates,
    AppSettingsModel settings,
  ) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('اختر المحافظة الافتراضية', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ListTile(
              title: const Text('كافة المحافظات'),
              trailing: settings.defaultGovernorateId == null ? const Icon(Icons.check, color: AppColors.primary) : null,
              onTap: () {
                ref.read(settingsNotifierProvider.notifier).setDefaultGovernorate(null, null);
                Navigator.pop(ctx);
              },
            ),
            const Divider(),
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: governorates.length,
                itemBuilder: (c, idx) {
                  final gov = governorates[idx];
                  final isSelected = settings.defaultGovernorateId == gov.id;
                  return ListTile(
                    title: Text(gov.nameAr),
                    trailing: isSelected ? const Icon(Icons.check, color: AppColors.primary) : null,
                    onTap: () {
                      ref.read(settingsNotifierProvider.notifier).setDefaultGovernorate(gov.id, gov.nameAr);
                      Navigator.pop(ctx);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmClearSearch(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('مسح سجل البحث'),
        content: const Text('هل أنت متأكد من رغبتك في مسح كافة عمليات البحث المحفوظة؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () {
              ref.read(settingsNotifierProvider.notifier).clearSearchHistory();
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم مسح سجل البحث بنجاح.')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            child: const Text('مسح'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('عن دليل أي خدمة'),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'دليل أي خدمة هو المنصة الرقمية الأولى الشاملة للأعمال والخدمات والأنشطة التجارية في مصر والشرق الأوسط.',
                style: TextStyle(fontSize: 14, height: 1.5),
              ),
              SizedBox(height: 12),
              Text(
                'نساعد المستخدمين على العثور على أفضل المتاجر ومقدمي الخدمات الحرفية والطبية والصناعية ومقارنة الأسعار والعروض في جميع المحافظات.',
                style: TextStyle(fontSize: 13, height: 1.5, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إغلاق')),
        ],
      ),
    );
  }

  void _showPrivacyPolicyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('سياسة الخصوصية'),
        content: const SingleChildScrollView(
          child: Text(
            'نلتزم في منصة "دليل أي خدمة" بحماية خصوصية بيانات مستخدمينا وتأمينها وفق أعلى المعايير القياسية. لا يتم مشاركة بياناتك الشخصية أو موقعك الجغرافي مع أي طرف ثالث دون موافقتك الصريحة.',
            style: TextStyle(fontSize: 13, height: 1.6),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('حسناً')),
        ],
      ),
    );
  }

  void _showTermsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('الشروط والأحكام'),
        content: const SingleChildScrollView(
          child: Text(
            'باستخدامك لتطبيق دليل أي خدمة، فإنك توافق على الالتزام بالقوانين المعمول بها وشروط الاستخدام العادل للمنصة وتجنب أي إساءة استخدام أو تقييمات غير حقيقية.',
            style: TextStyle(fontSize: 13, height: 1.6),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('موافق')),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تسجيل الخروج'),
        content: const Text('هل أنت متأكد من تسجيل الخروج؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(authNotifierProvider.notifier).logout();
              context.go(AppRoutes.home);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            child: const Text('تسجيل الخروج'),
          ),
        ],
      ),
    );
  }
}
