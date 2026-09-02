import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../providers/merchant_profile_provider.dart';

class MerchantProfileScreen extends ConsumerStatefulWidget {
  const MerchantProfileScreen({super.key});

  @override
  ConsumerState<MerchantProfileScreen> createState() => _MerchantProfileScreenState();
}

class _MerchantProfileScreenState extends ConsumerState<MerchantProfileScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _openEditProfileDialog(ActivityModel activity) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _EditActivitySheet(activity: activity),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(merchantProfileNotifierProvider);
    final profileNotifier = ref.read(merchantProfileNotifierProvider.notifier);

    final activity = profileState.selectedActivity;

    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة الملف التجاري'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'تحديث',
            onPressed: () => profileNotifier.loadActivities(),
          ),
          if (activity != null)
            IconButton(
              icon: const Icon(Icons.edit_note, color: AppColors.primary),
              tooltip: 'تعديل البيانات',
              onPressed: () => _openEditProfileDialog(activity),
            ),
        ],
      ),
      body: profileState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : profileState.errorMessage != null && activity == null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.error, size: 48),
                        const SizedBox(height: 12),
                        Text(profileState.errorMessage!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => profileNotifier.loadActivities(),
                          child: const Text(AppStrings.retry),
                        ),
                      ],
                    ),
                  ),
                )
              : activity == null
                  ? const Center(child: Text('لم يتم العثور على أنشطة تجارية مسجلة.'))
                  : RefreshIndicator(
                      onRefresh: () async => profileNotifier.loadActivities(),
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // 1. Selector for multiple activities
                            if (profileState.activities.length > 1)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                color: AppColors.surface,
                                child: Row(
                                  children: [
                                    const Text('اختر النشاط:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: DropdownButtonHideUnderline(
                                        child: DropdownButton<int>(
                                          value: activity.id,
                                          isExpanded: true,
                                          items: profileState.activities.map((act) {
                                            return DropdownMenuItem<int>(
                                              value: act.id,
                                              child: Text(act.nameAr, overflow: TextOverflow.ellipsis),
                                            );
                                          }).toList(),
                                          onChanged: (val) {
                                            if (val != null) {
                                              final selected = profileState.activities.firstWhere((a) => a.id == val);
                                              profileNotifier.selectActivity(selected);
                                            }
                                          },
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                            // 2. Hero Header Card
                            _buildHeroHeader(activity),

                            // 3. Tab Bar
                            TabBar(
                              controller: _tabController,
                              labelColor: AppColors.primary,
                              unselectedLabelColor: AppColors.textMuted,
                              indicatorColor: AppColors.primary,
                              tabs: const [
                                Tab(icon: Icon(Icons.info_outline, size: 20), text: 'البيانات'),
                                Tab(icon: Icon(Icons.location_on_outlined, size: 20), text: 'الموقع'),
                                Tab(icon: Icon(Icons.contact_phone_outlined, size: 20), text: 'التواصل'),
                              ],
                            ),

                            // 4. Tab Views
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: _buildSelectedTabContent(activity),
                            ),
                          ],
                        ),
                      ),
                    ),
      bottomNavigationBar: activity != null
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -3)),
                ],
              ),
              child: ElevatedButton.icon(
                icon: const Icon(Icons.edit),
                label: const Text('تعديل وتحديث بيانات النشاط'),
                onPressed: () => _openEditProfileDialog(activity),
              ),
            )
          : null,
    );
  }

  Widget _buildHeroHeader(ActivityModel activity) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(14),
                  image: activity.logoUrl != null
                      ? DecorationImage(image: NetworkImage(activity.logoUrl!), fit: BoxFit.cover)
                      : null,
                ),
                child: activity.logoUrl == null
                    ? const Icon(Icons.store, color: AppColors.primary, size: 36)
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            activity.nameAr,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                          ),
                        ),
                        if (activity.isVerified)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.secondaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.verified, size: 13, color: AppColors.secondary),
                                SizedBox(width: 4),
                                Text('موثّق', style: TextStyle(color: AppColors.secondary, fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('قيد المراجعة', style: TextStyle(color: AppColors.primary, fontSize: 11)),
                          ),
                      ],
                    ),
                    if (activity.nameEn != null && activity.nameEn!.isNotEmpty)
                      Text(
                        activity.nameEn!,
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                    const SizedBox(height: 4),
                    Text(
                      '${activity.categoryNameAr ?? 'عام'} • ${activity.governorateNameAr ?? 'الكل'}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (activity.descriptionAr != null && activity.descriptionAr!.isNotEmpty)
            Text(
              activity.descriptionAr!,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
        ],
      ),
    );
  }

  Widget _buildSelectedTabContent(ActivityModel activity) {
    return AnimatedBuilder(
      animation: _tabController,
      builder: (context, _) {
        final index = _tabController.index;
        if (index == 0) return _buildGeneralInfoTab(activity);
        if (index == 1) return _buildLocationTab(activity);
        return _buildContactTab(activity);
      },
    );
  }

  Widget _buildGeneralInfoTab(ActivityModel activity) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoCard(
          title: 'معلومات النشاط الأساسية',
          items: [
            _InfoRow(label: 'الاسم بالعربية', value: activity.nameAr),
            _InfoRow(label: 'الاسم بالإنجليزية', value: activity.nameEn ?? 'غير محدد'),
            _InfoRow(label: 'التصنيف الرئيسي', value: activity.categoryNameAr ?? 'عام'),
            _InfoRow(label: 'عدد المنتجات بالكتالوج', value: '${activity.productsCount} منتج'),
            _InfoRow(label: 'إجمالي المشاهدات', value: '${activity.viewsCount} مشاهدة'),
            _InfoRow(label: 'متوسط التقييم', value: '★ ${activity.ratingAvg.toStringAsFixed(1)} (${activity.ratingCount} تقييم)'),
          ],
        ),
        const SizedBox(height: 14),
        _buildInfoCard(
          title: 'خدمات التوصيل والطلبات',
          items: [
            _InfoRow(label: 'خدمة التوصيل', value: activity.hasDelivery ? 'متوفرة ومفعّلة' : 'غير متوفرة'),
            _InfoRow(label: 'طلبات WhatsApp', value: 'مستقبلة ومفعلة'),
          ],
        ),
      ],
    );
  }

  Widget _buildLocationTab(ActivityModel activity) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoCard(
          title: 'العنوان والموقع الجغرافي',
          items: [
            _InfoRow(label: 'المحافظة', value: activity.governorateNameAr ?? 'غير محدد'),
            _InfoRow(label: 'المدينة / المركز', value: activity.cityNameAr ?? 'غير محدد'),
            _InfoRow(label: 'العنوان التفصيلي', value: activity.addressAr ?? 'لم يتم تحديد العنوان'),
            _InfoRow(label: 'الإحداثيات', value: activity.latitude != null ? '${activity.latitude}, ${activity.longitude}' : 'غير محددة'),
          ],
        ),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(14),
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
                  Icon(Icons.map, color: AppColors.primary, size: 20),
                  SizedBox(width: 8),
                  Text('الخريطة والتمركز', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'يظهر موقع نشاطك للعملاء على الخريطة التفاعلية في تطبيق المستخدم لتسهيل الوصول والتوجيه المباشر.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.explore_outlined, size: 18),
                label: const Text('عرض وتعديل الإحداثيات على الخريطة'),
                onPressed: () => _openEditProfileDialog(activity),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildContactTab(ActivityModel activity) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoCard(
          title: 'قنوات التواصل المباشر',
          items: [
            _InfoRow(label: 'رقم الهاتف الرئيسي', value: activity.phone ?? 'غير مسجل'),
            _InfoRow(label: 'رقم WhatsApp للطلبات', value: activity.whatsapp ?? 'غير مسجل'),
            _InfoRow(label: 'البريد الإلكتروني', value: activity.email ?? 'غير مسجل'),
            _InfoRow(label: 'الموقع الإلكتروني', value: activity.website ?? 'غير مسجل'),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoCard({required String title, required List<_InfoRow> items}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
          const Divider(height: 20),
          ...items.map((it) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 130,
                      child: Text(it.label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    ),
                    Expanded(
                      child: Text(
                        it.value,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textPrimary),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

class _InfoRow {
  final String label;
  final String value;
  _InfoRow({required this.label, required this.value});
}

class _EditActivitySheet extends ConsumerStatefulWidget {
  final ActivityModel activity;
  const _EditActivitySheet({required this.activity});

  @override
  ConsumerState<_EditActivitySheet> createState() => _EditActivitySheetState();
}

class _EditActivitySheetState extends ConsumerState<_EditActivitySheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameArController;
  late TextEditingController _nameEnController;
  late TextEditingController _descriptionController;
  late TextEditingController _phoneController;
  late TextEditingController _whatsappController;
  late TextEditingController _emailController;
  late TextEditingController _addressController;
  late TextEditingController _websiteController;
  late bool _hasDelivery;

  @override
  void initState() {
    super.initState();
    _nameArController = TextEditingController(text: widget.activity.nameAr);
    _nameEnController = TextEditingController(text: widget.activity.nameEn ?? '');
    _descriptionController = TextEditingController(text: widget.activity.descriptionAr ?? '');
    _phoneController = TextEditingController(text: widget.activity.phone ?? '');
    _whatsappController = TextEditingController(text: widget.activity.whatsapp ?? '');
    _emailController = TextEditingController(text: widget.activity.email ?? '');
    _addressController = TextEditingController(text: widget.activity.addressAr ?? '');
    _websiteController = TextEditingController(text: widget.activity.website ?? '');
    _hasDelivery = widget.activity.hasDelivery;
  }

  @override
  void dispose() {
    _nameArController.dispose();
    _nameEnController.dispose();
    _descriptionController.dispose();
    _phoneController.dispose();
    _whatsappController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final data = {
      'name_ar': _nameArController.text.trim(),
      'name_en': _nameEnController.text.trim().isNotEmpty ? _nameEnController.text.trim() : null,
      'description_ar': _descriptionController.text.trim(),
      'phone': _phoneController.text.trim(),
      'whatsapp_number': _whatsappController.text.trim(),
      'email': _emailController.text.trim(),
      'address_ar': _addressController.text.trim(),
      'website_url': _websiteController.text.trim(),
      'has_delivery': _hasDelivery,
    };

    final success = await ref.read(merchantProfileNotifierProvider.notifier).updateActivityDetails(
          activityId: widget.activity.id,
          data: data,
        );

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم حفظ وتحديث بيانات النشاط التجاري بنجاح!'),
          backgroundColor: AppColors.secondary,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(merchantProfileNotifierProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('تعديل بيانات النشاط التجاري', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
          ),

          // Scrollable Form
          Expanded(
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextFormField(
                      controller: _nameArController,
                      decoration: const InputDecoration(labelText: 'اسم النشاط بالعربية *', prefixIcon: Icon(Icons.storefront)),
                      validator: (val) => val == null || val.trim().isEmpty ? 'يرجى إدخال اسم النشاط' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _nameEnController,
                      decoration: const InputDecoration(labelText: 'اسم النشاط بالإنجليزية (اختياري)', prefixIcon: Icon(Icons.translate)),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _descriptionController,
                      maxLines: 3,
                      decoration: const InputDecoration(labelText: 'الوصف والنبذة التعريفية', prefixIcon: Icon(Icons.description_outlined)),
                    ),
                    const SizedBox(height: 16),
                    const Text('بيانات الاتصال والتواصل', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(labelText: 'رقم الهاتف الأساسي', prefixIcon: Icon(Icons.phone_outlined)),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _whatsappController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(labelText: 'رقم WhatsApp للطلبات', prefixIcon: Icon(Icons.chat_bubble_outline)),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: 'البريد الإلكتروني', prefixIcon: Icon(Icons.email_outlined)),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _websiteController,
                      keyboardType: TextInputType.url,
                      decoration: const InputDecoration(labelText: 'الموقع الإلكتروني', prefixIcon: Icon(Icons.language)),
                    ),
                    const SizedBox(height: 16),
                    const Text('العنوان والتوصيل', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(labelText: 'العنوان التفصيلي', prefixIcon: Icon(Icons.location_on_outlined)),
                    ),
                    const SizedBox(height: 12),
                    SwitchListTile(
                      title: const Text('تفعيل خدمة التوصيل للعملاء'),
                      subtitle: const Text('إظهار شارة التوصيل في نتائج البحث والخريطة'),
                      value: _hasDelivery,
                      onChanged: (val) => setState(() => _hasDelivery = val),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Footer Action
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: profileState.isSaving ? null : _handleSave,
                child: profileState.isSaving
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('حفظ التعديلات'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
