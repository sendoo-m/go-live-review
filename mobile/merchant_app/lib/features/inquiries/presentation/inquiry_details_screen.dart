import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/models/inquiry_model.dart';
import 'package:daleel_core/theme/app_colors.dart';
import '../providers/merchant_inquiries_provider.dart';

class InquiryDetailsScreen extends ConsumerStatefulWidget {
  final int inquiryId;

  const InquiryDetailsScreen({
    super.key,
    required this.inquiryId,
  });

  @override
  ConsumerState<InquiryDetailsScreen> createState() => _InquiryDetailsScreenState();
}

class _InquiryDetailsScreenState extends ConsumerState<InquiryDetailsScreen> {
  final TextEditingController _notesController = TextEditingController();
  bool _isSavingNotes = false;
  String? _selectedTemplate;

  @override
  void initState() {
    super.initState();
    // Pre-populate notes from existing inquiry state
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final inquiry = ref.read(merchantInquiriesProvider.notifier).getInquiryById(widget.inquiryId);
      if (inquiry != null && inquiry.notes != null) {
        _notesController.text = inquiry.notes!;
      }
    });
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(merchantInquiriesProvider);
    final notifier = ref.read(merchantInquiriesProvider.notifier);
    final inquiry = notifier.getInquiryById(widget.inquiryId);

    if (inquiry == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('تفاصيل الاستفسار')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.search_off, size: 48, color: AppColors.textMuted),
              const SizedBox(height: 12),
              const Text('لم يتم العثور على طلب الاستفسار المطلوب'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('العودة للوارد'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'طلب #${inquiry.id} - ${inquiry.customerName}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              inquiry.sourceLabelAr,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(inquiry.isRead ? Icons.mark_email_read_outlined : Icons.mark_email_unread),
            tooltip: inquiry.isRead ? 'تعيين كغير مقروء' : 'تعيين كمقروء',
            onPressed: () => notifier.toggleRead(inquiry.id),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Pipeline Status Stepper Bar
            _buildPipelineStepper(inquiry, notifier),
            const SizedBox(height: 16),

            // 2. Customer Contact & Profile Card
            _buildCustomerCard(inquiry, notifier),
            const SizedBox(height: 16),

            // 3. Linked Item Card (Product / Offer / Activity)
            if (inquiry.hasProduct || inquiry.hasOffer || inquiry.activityName != null) ...[
              _buildLinkedItemCard(inquiry),
              const SizedBox(height: 16),
            ],

            // 4. Inquiry Message Card
            _buildMessageCard(inquiry),
            const SizedBox(height: 16),

            // 5. Quick Response Templates Suite
            _buildQuickResponseTemplates(inquiry, notifier),
            const SizedBox(height: 16),

            // 6. Internal Merchant Notes
            _buildPrivateNotesCard(inquiry, notifier),
            const SizedBox(height: 16),

            // 7. Timeline & Activity History Log
            _buildTimelineCard(inquiry),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // --- 1. Pipeline Stepper ---
  Widget _buildPipelineStepper(InquiryModel inquiry, MerchantInquiriesNotifier notifier) {
    final stages = [
      {'key': 'new', 'title': 'جديد', 'icon': Icons.fiber_new},
      {'key': 'contacted', 'title': 'تم التواصل', 'icon': Icons.phone_in_talk},
      {'key': 'in_progress', 'title': 'قيد المتابعة', 'icon': Icons.hourglass_bottom},
      {'key': 'closed', 'title': 'مغلق', 'icon': Icons.check_circle},
    ];

    int currentIndex = stages.indexWhere((s) => s['key'] == inquiry.status);
    if (currentIndex == -1) currentIndex = 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'مرحلة المتابعة والتشغيل (Pipeline)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
              ),
              Text(
                'اضغط لتغيير المرحلة',
                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: List.generate(stages.length, (index) {
              final stage = stages[index];
              final isCurrent = index == currentIndex;
              final isPassed = index <= currentIndex;

              Color stageColor;
              if (isCurrent) {
                stageColor = AppColors.primary;
              } else if (isPassed) {
                stageColor = Colors.green;
              } else {
                stageColor = Colors.grey.shade400;
              }

              return Expanded(
                child: InkWell(
                  onTap: () => _promptStatusChange(inquiry, stage['key'] as String, stage['title'] as String, notifier),
                  child: Column(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: isCurrent ? stageColor : (isPassed ? stageColor.withOpacity(0.15) : Colors.grey.shade100),
                          shape: BoxShape.circle,
                          border: Border.all(color: stageColor, width: isCurrent ? 2 : 1),
                        ),
                        child: Icon(
                          stage['icon'] as IconData,
                          size: 18,
                          color: isCurrent ? Colors.white : stageColor,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        stage['title'] as String,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                          color: isCurrent ? AppColors.primary : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // --- 2. Customer Profile Card ---
  Widget _buildCustomerCard(InquiryModel inquiry, MerchantInquiriesNotifier notifier) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'بيانات العميل والتواصل',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: inquiry.priority == 'urgent'
                      ? Colors.red.shade50
                      : (inquiry.priority == 'high' ? Colors.amber.shade50 : Colors.blue.shade50),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'أولوية: ${inquiry.priorityLabelAr}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: inquiry.priority == 'urgent'
                        ? Colors.red.shade800
                        : (inquiry.priority == 'high' ? Colors.amber.shade900 : Colors.blue.shade800),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Name row
          Row(
            children: [
              const CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primaryLight,
                child: Icon(Icons.person, color: AppColors.primary, size: 20),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    inquiry.customerName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  Text(
                    'تاريخ الطلب: ${inquiry.createdAt.split("T").first}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 12),

          // Contact Actions Bar
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.call, size: 18),
                  label: const Text('اتصال مباشر'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade700,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: inquiry.customerPhone));
                    notifier.recordAction(
                      inquiry.id,
                      actionType: 'call',
                      note: 'تم نسخ الرقم (${inquiry.customerPhone}) لبدء المكالمة',
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('تم نسخ الرقم: ${inquiry.customerPhone} (جاهز للمكالمة)')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.chat, size: 18),
                  label: const Text('واتساب'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    final defaultMsg = _selectedTemplate ??
                        'أهلاً بك يا ${inquiry.customerName}، يسعدنا تواصلك مع ${inquiry.activityName ?? "النشاط"} عبر دليل بلدي.';
                    Clipboard.setData(ClipboardData(text: defaultMsg));
                    notifier.recordAction(
                      inquiry.id,
                      actionType: 'whatsapp',
                      templateText: defaultMsg,
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('تم نسخ رسالة الرد ورقم الواتساب (${inquiry.customerPhone})')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.copy, size: 20, color: AppColors.textSecondary),
                tooltip: 'نسخ رقم الهاتف',
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: inquiry.customerPhone));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تم نسخ رقم الهاتف')),
                  );
                },
              ),
            ],
          ),
          if (inquiry.customerEmail != null && inquiry.customerEmail!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.email_outlined, size: 16, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Text(inquiry.customerEmail!, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: inquiry.customerEmail!));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('تم نسخ البريد الإلكتروني')),
                    );
                  },
                  child: const Text('نسخ البريد', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // --- 3. Linked Item Card ---
  Widget _buildLinkedItemCard(InquiryModel inquiry) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                inquiry.hasOffer
                    ? Icons.local_offer
                    : (inquiry.hasProduct ? Icons.inventory_2 : Icons.store),
                size: 16,
                color: AppColors.primary,
              ),
              const SizedBox(width: 6),
              Text(
                inquiry.hasOffer
                    ? 'العرض الترويجي المرتبط'
                    : (inquiry.hasProduct ? 'المنتج / الخدمة المرتبطة' : 'النشاط التجاري'),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              if (inquiry.productCoverImage != null || inquiry.activityCoverImage != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    inquiry.productCoverImage ?? inquiry.activityCoverImage!,
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 50,
                      height: 50,
                      color: AppColors.surface,
                      child: const Icon(Icons.image, color: AppColors.textMuted),
                    ),
                  ),
                ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      inquiry.offerTitle ?? inquiry.productName ?? inquiry.activityName ?? '',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 2),
                    if (inquiry.productPrice != null)
                      Text(
                        'السعر: ${inquiry.productPrice} ج.م',
                        style: const TextStyle(fontSize: 12, color: AppColors.secondary, fontWeight: FontWeight.bold),
                      )
                    else if (inquiry.offerDiscountPercentage != null)
                      Text(
                        'نسبة الخصم: ${inquiry.offerDiscountPercentage!.toInt()}%',
                        style: const TextStyle(fontSize: 12, color: Colors.orange, fontWeight: FontWeight.bold),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- 4. Message Card ---
  Widget _buildMessageCard(InquiryModel inquiry) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.chat_bubble_outline, size: 16, color: AppColors.primary),
                  SizedBox(width: 6),
                  Text(
                    'نص الاستفسار / رسالة العميل',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.copy, size: 18, color: AppColors.textSecondary),
                tooltip: 'نسخ نص الرسالة',
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: inquiry.message));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تم نسخ نص الاستفسار')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border.withOpacity(0.6)),
            ),
            child: Text(
              inquiry.message,
              style: const TextStyle(fontSize: 14, height: 1.5, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }

  // --- 5. Quick Response Templates ---
  Widget _buildQuickResponseTemplates(InquiryModel inquiry, MerchantInquiriesNotifier notifier) {
    final templates = [
      'أهلاً بك يا ${inquiry.customerName}، تم استلام استفسارك بخصوص (${inquiry.productName ?? inquiry.offerTitle ?? "خدماتنا"}) وسنقوم بالتجهيز والمتابعة معك فوراً.',
      'شكراً لتواصلك مع ${inquiry.activityName ?? "إدارتنا"}! يسعدنا خدمتك، يرجى تزويدنا بالميعاد والكمية المناسبة لتأكيد حجزك.',
      'العرض الترويجي (${inquiry.offerTitle ?? "الخاص"}) ما زال متاحاً! يمكنك زيارة فرعنا أو تأكيد الطلب مباشرة الآن.',
      'تم اعتماد وتأكيد طلبك بنجاح، فريق العمل بانتظار تشريفك.',
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.quickreply_outlined, size: 18, color: AppColors.secondary),
              SizedBox(width: 8),
              Text(
                'نماذج الرد السريع الجاهزة (Quick Templates)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'اختر نموذجاً للرد الفوري ونسخه أو إرساله عبر واتساب بضغطة زر واحدة:',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: templates.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final tpl = templates[index];
              final isSelected = _selectedTemplate == tpl;

              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedTemplate = tpl;
                  });
                },
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary.withOpacity(0.06) : AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                        size: 18,
                        color: isSelected ? AppColors.primary : AppColors.textMuted,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          tpl,
                          style: TextStyle(
                            fontSize: 12.5,
                            height: 1.4,
                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 16, color: AppColors.textSecondary),
                        tooltip: 'نسخ النموذج',
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: tpl));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('تم نسخ نموذج الرد')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // --- 6. Private Notes Card ---
  Widget _buildPrivateNotesCard(InquiryModel inquiry, MerchantInquiriesNotifier notifier) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.edit_note, size: 20, color: Colors.amber),
              SizedBox(width: 8),
              Text(
                'ملاحظات المتابعة الخاصة بالتاجر',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'ملاحظاتك الداخلية فقط (لا تظهر للعميل) لتدوين تفاصيل الاتفاق أو حالة العميل.',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _notesController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'اكتب ملاحظاتك هنا (مثل: تم الاتفاق على موعد الجمعة، طلب خصم...)',
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerLeft,
            child: ElevatedButton.icon(
              icon: _isSavingNotes
                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.save, size: 16),
              label: const Text('حفظ الملاحظات'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: _isSavingNotes
                  ? null
                  : () async {
                      setState(() => _isSavingNotes = true);
                      final success = await notifier.saveNotes(inquiry.id, _notesController.text.trim());
                      setState(() => _isSavingNotes = false);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(success ? 'تم حفظ الملاحظات بنجاح' : 'تعذر حفظ الملاحظات'),
                            backgroundColor: success ? Colors.green : AppColors.error,
                          ),
                        );
                      }
                    },
            ),
          ),
        ],
      ),
    );
  }

  // --- 7. Timeline History Card ---
  Widget _buildTimelineCard(InquiryModel inquiry) {
    final history = inquiry.history;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.history, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'سجل العمليات والمتابعة (Activity Timeline)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (history.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Center(
                child: Text('لا توجد سجلات سابقة', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: history.length,
              separatorBuilder: (context, index) => const Divider(height: 16, color: AppColors.border),
              itemBuilder: (context, index) {
                final event = history[index];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                event.action,
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                              ),
                              Text(
                                event.timestamp.split("T").first,
                                style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                              ),
                            ],
                          ),
                          if (event.note != null && event.note!.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              event.note!,
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                          if (event.actorName != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              'بواسطة: ${event.actorName}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
        ],
      ),
    );
  }

  void _promptStatusChange(
    InquiryModel inquiry,
    String targetStatus,
    String targetTitle,
    MerchantInquiriesNotifier notifier,
  ) {
    if (inquiry.status == targetStatus) return;

    final noteController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('تغيير الحالة إلى ($targetTitle)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'هل تريد نقل الطلب إلى مرحلة "$targetTitle"؟ يمكنك إضافة ملاحظة إضافية لسجل المتابعة:',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: noteController,
              decoration: const InputDecoration(
                hintText: 'ملاحظة التغيير (اختياري)...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await notifier.updateStatus(
                inquiry.id,
                targetStatus,
                note: noteController.text.trim().isNotEmpty ? noteController.text.trim() : null,
              );
              if (mounted && success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('تم تحديث المرحلة إلى "$targetTitle" بنجاح')),
                );
              }
            },
            child: const Text('تأكيد التغيير'),
          ),
        ],
      ),
    );
  }
}
