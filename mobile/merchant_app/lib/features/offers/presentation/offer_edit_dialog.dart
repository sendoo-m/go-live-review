import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../profile/providers/merchant_profile_provider.dart';
import '../providers/merchant_offers_provider.dart';

class OfferEditDialog extends ConsumerStatefulWidget {
  final OfferModel? offer;
  const OfferEditDialog({super.key, this.offer});

  @override
  ConsumerState<OfferEditDialog> createState() => _OfferEditDialogState();
}

class _OfferEditDialogState extends ConsumerState<OfferEditDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _descController;
  late TextEditingController _discountValController;
  late TextEditingController _origPriceController;
  late TextEditingController _offerPriceController;
  late TextEditingController _coverImgController;
  late TextEditingController _termsController;

  int? _selectedActivityId;
  String _offerType = 'percentage';
  DateTime _startsAt = DateTime.now();
  DateTime _endsAt = DateTime.now().add(const Duration(days: 14));
  bool _isActive = true;

  @override
  void initState() {
    super.initState();
    final off = widget.offer;
    _titleController = TextEditingController(text: off?.title ?? '');
    _descController = TextEditingController(text: off?.description ?? '');
    _discountValController = TextEditingController(
      text: off?.discountPercentage != null
          ? off!.discountPercentage.toString()
          : (off?.discountAmount != null ? off!.discountAmount.toString() : ''),
    );
    _origPriceController = TextEditingController(text: off?.originalPrice?.toString() ?? '');
    _offerPriceController = TextEditingController(text: off?.offerPrice?.toString() ?? '');
    _coverImgController = TextEditingController(text: off?.coverImage ?? '');
    _termsController = TextEditingController(text: off?.terms ?? '');

    _selectedActivityId = off?.activityId;
    _offerType = off?.offerType ?? 'percentage';
    _isActive = off?.isActive ?? true;

    if (off?.startsAt != null && off!.startsAt.isNotEmpty) {
      _startsAt = DateTime.tryParse(off.startsAt) ?? _startsAt;
    }
    if (off?.endsAt != null && off!.endsAt.isNotEmpty) {
      _endsAt = DateTime.tryParse(off.endsAt) ?? _endsAt;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _discountValController.dispose();
    _origPriceController.dispose();
    _offerPriceController.dispose();
    _coverImgController.dispose();
    _termsController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final profileState = ref.read(merchantProfileNotifierProvider);
    final activityId = _selectedActivityId ??
        (profileState.activities.isNotEmpty ? profileState.activities.first.id : 1);

    double? discountPercentage;
    double? discountAmount;

    if (_offerType == 'percentage') {
      discountPercentage = double.tryParse(_discountValController.text.trim());
    } else if (_offerType == 'fixed') {
      discountAmount = double.tryParse(_discountValController.text.trim());
    }

    final origPrice = double.tryParse(_origPriceController.text.trim());
    final offerPrice = double.tryParse(_offerPriceController.text.trim());

    if (widget.offer == null) {
      // Create new offer
      final success = await ref.read(merchantOffersNotifierProvider.notifier).createOffer(
            activityId: activityId,
            title: _titleController.text.trim(),
            description: _descController.text.trim(),
            offerType: _offerType,
            discountPercentage: discountPercentage,
            discountAmount: discountAmount,
            originalPrice: origPrice,
            offerPrice: offerPrice,
            startsAt: _startsAt.toIso8601String(),
            endsAt: _endsAt.toIso8601String(),
            isActive: _isActive,
            coverImage: _coverImgController.text.trim().isNotEmpty ? _coverImgController.text.trim() : null,
            terms: _termsController.text.trim().isNotEmpty ? _termsController.text.trim() : null,
          );

      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم إضافة العرض الترويجي بنجاح!'), backgroundColor: AppColors.secondary),
        );
      }
    } else {
      // Update existing offer
      final data = {
        'activity_id': activityId,
        'title': _titleController.text.trim(),
        'description': _descController.text.trim(),
        'offer_type': _offerType,
        'discount_percentage': discountPercentage,
        'discount_amount': discountAmount,
        'original_price': origPrice,
        'offer_price': offerPrice,
        'starts_at': _startsAt.toIso8601String(),
        'ends_at': _endsAt.toIso8601String(),
        'is_active': _isActive,
        'cover_image': _coverImgController.text.trim().isNotEmpty ? _coverImgController.text.trim() : null,
        'terms': _termsController.text.trim().isNotEmpty ? _termsController.text.trim() : null,
      };

      final success = await ref.read(merchantOffersNotifierProvider.notifier).updateOffer(
            offerId: widget.offer!.id,
            data: data,
          );

      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم تعديل العرض الترويجي بنجاح!'), backgroundColor: AppColors.secondary),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final offersState = ref.watch(merchantOffersNotifierProvider);
    final profileState = ref.watch(merchantProfileNotifierProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
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
                Text(
                  widget.offer == null ? 'إضافة عرض ترويجي جديد' : 'تعديل بيانات العرض',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
          ),

          // Form Body
          Expanded(
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Activity Selection
                    if (profileState.activities.isNotEmpty) ...[
                      const Text('النشاط التجاري التابع له العرض *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<int>(
                        value: _selectedActivityId ?? profileState.activities.first.id,
                        decoration: const InputDecoration(border: OutlineInputBorder()),
                        items: profileState.activities.map((a) {
                          return DropdownMenuItem<int>(
                            value: a.id,
                            child: Text(a.nameAr),
                          );
                        }).toList(),
                        onChanged: (val) => setState(() => _selectedActivityId = val),
                      ),
                      const SizedBox(height: 14),
                    ],

                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        labelText: 'عنوان العرض *',
                        hintText: 'مثال: خصم 20% بمناسبة الافتتاح',
                        prefixIcon: Icon(Icons.local_offer_outlined),
                      ),
                      validator: (val) => val == null || val.trim().isEmpty ? 'يرجى إدخال عنوان العرض' : null,
                    ),
                    const SizedBox(height: 12),

                    TextFormField(
                      controller: _descController,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: 'تفاصيل ووصف العرض *',
                        hintText: 'اشرح تفاصيل الخصم أو الباقة للعميل',
                        prefixIcon: Icon(Icons.description_outlined),
                      ),
                      validator: (val) => val == null || val.trim().isEmpty ? 'يرجى إدخال تفاصيل العرض' : null,
                    ),
                    const SizedBox(height: 16),

                    // Offer Type Selection
                    const Text('نوع الخصم أو العرض', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(value: 'percentage', label: Text('نسبة %')),
                        ButtonSegment(value: 'fixed', label: Text('مبلغ خصم')),
                        ButtonSegment(value: 'bundle', label: Text('باقة')),
                      ],
                      selected: {_offerType},
                      onSelectionChanged: (val) => setState(() => _offerType = val.first),
                    ),
                    const SizedBox(height: 14),

                    if (_offerType == 'percentage')
                      TextFormField(
                        controller: _discountValController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'نسبة الخصم المئوية %',
                          hintText: '20',
                          prefixIcon: Icon(Icons.percent),
                        ),
                      )
                    else if (_offerType == 'fixed')
                      TextFormField(
                        controller: _discountValController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'قيمة الخصم بالجنيه',
                          hintText: '50',
                          prefixIcon: Icon(Icons.money_off),
                        ),
                      ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _origPriceController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'السعر الأصلي (اختياري)'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _offerPriceController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'السعر بعد العرض'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Dates
                    const Text('فترة سريان العرض', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.calendar_today, size: 16),
                            label: Text('من: ${_startsAt.toString().substring(0, 10)}', style: const TextStyle(fontSize: 12)),
                            onPressed: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _startsAt,
                                firstDate: DateTime.now().subtract(const Duration(days: 30)),
                                lastDate: DateTime.now().add(const Duration(days: 365)),
                              );
                              if (picked != null) setState(() => _startsAt = picked);
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.event, size: 16),
                            label: Text('إلى: ${_endsAt.toString().substring(0, 10)}', style: const TextStyle(fontSize: 12)),
                            onPressed: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _endsAt,
                                firstDate: _startsAt,
                                lastDate: DateTime.now().add(const Duration(days: 365)),
                              );
                              if (picked != null) setState(() => _endsAt = picked);
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    TextFormField(
                      controller: _coverImgController,
                      decoration: const InputDecoration(
                        labelText: 'رابط صورة العرض (Banner URL)',
                        hintText: 'https://...',
                        prefixIcon: Icon(Icons.image_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),

                    TextFormField(
                      controller: _termsController,
                      decoration: const InputDecoration(
                        labelText: 'الشروط والأحكام الخاصة بالعرض',
                        hintText: 'مثال: يسري حتى نفاد الكمية',
                        prefixIcon: Icon(Icons.rule_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),

                    SwitchListTile(
                      title: const Text('العرض مفعّل ونشط حالياً'),
                      subtitle: const Text('إظهار العرض للمستخدمين في الصفحة الرئيسية والأنشطة'),
                      value: _isActive,
                      onChanged: (val) => setState(() => _isActive = val),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Footer Save Button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: offersState.isSaving ? null : _handleSave,
                child: offersState.isSaving
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(widget.offer == null ? 'نشر العرض الترويجي' : 'حفظ التعديلات'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
