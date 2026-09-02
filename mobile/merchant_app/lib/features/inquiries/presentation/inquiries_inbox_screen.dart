import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_core/models/inquiry_model.dart';
import 'package:shared_core/theme/app_colors.dart';
import '../providers/merchant_inquiries_provider.dart';

class InquiriesInboxScreen extends ConsumerStatefulWidget {
  const InquiriesInboxScreen({super.key});

  @override
  ConsumerState<InquiriesInboxScreen> createState() => _InquiriesInboxScreenState();
}

class _InquiriesInboxScreenState extends ConsumerState<InquiriesInboxScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearchExpanded = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(merchantInquiriesProvider);
    final notifier = ref.read(merchantInquiriesProvider.notifier);
    final filteredList = state.filteredInquiries;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'استفسارات وطلبات العملاء',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            Text(
              '${state.counts.all} طلب وارد • ${state.counts.newCount} جديد بحاجة للرد',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(_isSearchExpanded ? Icons.search_off : Icons.search),
            tooltip: 'البحث في الطلبات',
            onPressed: () {
              setState(() {
                _isSearchExpanded = !_isSearchExpanded;
                if (!_isSearchExpanded) {
                  _searchController.clear();
                  notifier.setSearchQuery('');
                }
              });
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort),
            tooltip: 'ترتيب حسب',
            onSelected: (val) => notifier.setSortOption(val),
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'newest',
                child: Row(
                  children: [
                    Icon(Icons.arrow_downward, size: 18, color: AppColors.primary),
                    SizedBox(width: 8),
                    Text('الأحدث أولاً'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'oldest',
                child: Row(
                  children: [
                    Icon(Icons.arrow_upward, size: 18, color: AppColors.textSecondary),
                    SizedBox(width: 8),
                    Text('الأقدم أولاً'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'priority',
                child: Row(
                  children: [
                    Icon(Icons.priority_high, size: 18, color: Colors.red),
                    SizedBox(width: 8),
                    Text('الأولوية والأهمية'),
                  ],
                ),
              ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'تحديث',
            onPressed: () => notifier.fetchInquiries(),
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Search Bar (when expanded)
          if (_isSearchExpanded)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.white,
              child: TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'ابحث باسم العميل، الهاتف، محتوى الرسالة...',
                  prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            notifier.setSearchQuery('');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: AppColors.surface,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                ),
                onChanged: (val) => notifier.setSearchQuery(val),
              ),
            ),

          // 2. Status Filter Tabs Bar
          Container(
            height: 52,
            color: Colors.white,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: [
                _buildFilterChip(
                  label: 'الكل',
                  count: state.counts.all,
                  isSelected: state.statusFilter == 'all',
                  onTap: () => notifier.setStatusFilter('all'),
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'جديد',
                  count: state.counts.newCount,
                  isSelected: state.statusFilter == 'new',
                  highlightColor: Colors.blue.shade700,
                  onTap: () => notifier.setStatusFilter('new'),
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'تم التواصل',
                  count: state.counts.contacted,
                  isSelected: state.statusFilter == 'contacted',
                  highlightColor: Colors.orange.shade700,
                  onTap: () => notifier.setStatusFilter('contacted'),
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'قيد المتابعة',
                  count: state.counts.inProgress,
                  isSelected: state.statusFilter == 'in_progress',
                  highlightColor: Colors.purple.shade700,
                  onTap: () => notifier.setStatusFilter('in_progress'),
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'مغلق',
                  count: state.counts.closed,
                  isSelected: state.statusFilter == 'closed',
                  highlightColor: Colors.grey.shade700,
                  onTap: () => notifier.setStatusFilter('closed'),
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'غير مقروء',
                  count: state.counts.unread,
                  isSelected: state.statusFilter == 'unread',
                  highlightColor: Colors.teal.shade700,
                  onTap: () => notifier.setStatusFilter('unread'),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // 3. Main Content List
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.errorMessage != null
                    ? _buildErrorState(state.errorMessage!, notifier)
                    : filteredList.isEmpty
                        ? _buildEmptyState(state, notifier)
                        : RefreshIndicator(
                            onRefresh: () => notifier.fetchInquiries(),
                            child: ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: filteredList.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final inquiry = filteredList[index];
                                return _buildInquiryCard(context, inquiry, notifier);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required int count,
    required bool isSelected,
    required VoidCallback onTap,
    Color? highlightColor,
  }) {
    final activeColor = highlightColor ?? AppColors.primary;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? activeColor : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Colors.white : AppColors.textPrimary,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isSelected ? Colors.white.withOpacity(0.25) : Colors.grey.shade300,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                count.toString(),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInquiryCard(
    BuildContext context,
    InquiryModel inquiry,
    MerchantInquiriesNotifier notifier,
  ) {
    return Card(
      elevation: inquiry.isRead ? 0.5 : 2.0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: inquiry.isRead ? AppColors.border : AppColors.primary.withOpacity(0.5),
          width: inquiry.isRead ? 1 : 1.5,
        ),
      ),
      color: inquiry.isRead ? Colors.white : const Color(0xFFF9FBFF),
      child: InkWell(
        onTap: () {
          if (!inquiry.isRead) {
            notifier.toggleRead(inquiry.id);
          }
          context.push('/inquiries/${inquiry.id}');
        },
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Avatar, Name, Badges & Time
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Avatar with unread dot
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: _getAvatarBg(inquiry.status),
                        child: Text(
                          inquiry.customerName.isNotEmpty ? inquiry.customerName[0] : 'ع',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      if (!inquiry.isRead)
                        Positioned(
                          top: 0,
                          right: 0,
                          child: Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 1.5),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 10),
                  // Name and Contact Type
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                inquiry.customerName,
                                style: TextStyle(
                                  fontWeight: inquiry.isRead ? FontWeight.w600 : FontWeight.bold,
                                  fontSize: 15,
                                  color: AppColors.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (inquiry.priority == 'urgent' || inquiry.priority == 'high') ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: inquiry.priority == 'urgent' ? Colors.red.shade50 : Colors.amber.shade50,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: inquiry.priority == 'urgent' ? Colors.red : Colors.amber.shade800,
                                  ),
                                ),
                                child: Text(
                                  inquiry.priorityLabelAr,
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: inquiry.priority == 'urgent' ? Colors.red.shade800 : Colors.amber.shade900,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Icon(
                              _getTypeIcon(inquiry.type),
                              size: 13,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              inquiry.typeLabelAr,
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                            const Text(' • ', style: TextStyle(color: AppColors.textMuted)),
                            Text(
                              _formatTimeAgo(inquiry.createdAt),
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Pipeline Status Badge
                  _buildStatusBadge(inquiry.status),
                ],
              ),

              const SizedBox(height: 10),

              // Context / Origin Banner (Activity / Product / Offer)
              if (inquiry.activityName != null || inquiry.productName != null || inquiry.offerTitle != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.border.withOpacity(0.5)),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        inquiry.hasOffer
                            ? Icons.local_offer_outlined
                            : (inquiry.hasProduct ? Icons.inventory_2_outlined : Icons.storefront_outlined),
                        size: 14,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          inquiry.hasOffer
                              ? 'العرض: ${inquiry.offerTitle}'
                              : (inquiry.hasProduct
                                  ? 'المنتج: ${inquiry.productName}'
                                  : 'النشاط: ${inquiry.activityName}'),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),

              // Message Body
              Text(
                inquiry.message,
                style: TextStyle(
                  fontSize: 13,
                  height: 1.4,
                  color: inquiry.isRead ? AppColors.textSecondary : AppColors.textPrimary,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              // Private Notes indicator (if any)
              if (inquiry.notes != null && inquiry.notes!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.note_alt_outlined, size: 13, color: Colors.amber),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        'ملاحظة خاصة: ${inquiry.notes}',
                        style: TextStyle(fontSize: 11, color: Colors.amber.shade900),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 12),
              const Divider(height: 1, color: AppColors.border),
              const SizedBox(height: 8),

              // Bottom Quick Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Quick Outreach Buttons
                  Row(
                    children: [
                      // Direct Call
                      OutlinedButton.icon(
                        icon: const Icon(Icons.call, size: 15, color: Colors.green),
                        label: const Text('اتصال', style: TextStyle(fontSize: 12, color: Colors.green)),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          minimumSize: Size.zero,
                          side: const BorderSide(color: Colors.green),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => _handleCallCustomer(context, inquiry, notifier),
                      ),
                      const SizedBox(width: 8),
                      // WhatsApp
                      OutlinedButton.icon(
                        icon: const Icon(Icons.chat, size: 15, color: Color(0xFF25D366)),
                        label: const Text('واتساب', style: TextStyle(fontSize: 12, color: Color(0xFF25D366))),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          minimumSize: Size.zero,
                          side: const BorderSide(color: Color(0xFF25D366)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => _handleWhatsAppCustomer(context, inquiry, notifier),
                      ),
                    ],
                  ),

                  // Change Status Popup & Details Button
                  Row(
                    children: [
                      // Status switcher
                      PopupMenuButton<String>(
                        tooltip: 'تغيير حالة الطلب',
                        icon: const Icon(Icons.swap_horiz, size: 20, color: AppColors.textSecondary),
                        onSelected: (newStatus) async {
                          final success = await notifier.updateStatus(inquiry.id, newStatus);
                          if (context.mounted && success) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('تم تغيير حالة الطلب إلى (${_getStatusLabelAr(newStatus)})'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          }
                        },
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'new',
                            child: Row(
                              children: [
                                Icon(Icons.fiber_new, color: Colors.blue),
                                SizedBox(width: 8),
                                Text('جديد'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'contacted',
                            child: Row(
                              children: [
                                Icon(Icons.phone_forwarded, color: Colors.orange),
                                SizedBox(width: 8),
                                Text('تم التواصل'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'in_progress',
                            child: Row(
                              children: [
                                Icon(Icons.hourglass_top, color: Colors.purple),
                                SizedBox(width: 8),
                                Text('قيد المتابعة'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'closed',
                            child: Row(
                              children: [
                                Icon(Icons.check_circle_outline, color: Colors.green),
                                SizedBox(width: 8),
                                Text('مغلق / منجز'),
                              ],
                            ),
                          ),
                        ],
                      ),
                      // Details Arrow
                      IconButton(
                        icon: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
                        onPressed: () {
                          if (!inquiry.isRead) {
                            notifier.toggleRead(inquiry.id);
                          }
                          context.push('/inquiries/${inquiry.id}');
                        },
                      ),
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

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case 'new':
        bg = Colors.blue.shade50;
        fg = Colors.blue.shade800;
        label = 'جديد';
        break;
      case 'contacted':
        bg = Colors.orange.shade50;
        fg = Colors.orange.shade900;
        label = 'تم التواصل';
        break;
      case 'in_progress':
        bg = Colors.purple.shade50;
        fg = Colors.purple.shade800;
        label = 'قيد المتابعة';
        break;
      case 'closed':
        bg = Colors.green.shade50;
        fg = Colors.green.shade800;
        label = 'مغلق';
        break;
      case 'cancelled':
        bg = Colors.red.shade50;
        fg = Colors.red.shade800;
        label = 'ملغي';
        break;
      default:
        bg = Colors.grey.shade100;
        fg = Colors.grey.shade800;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: fg,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildEmptyState(InquiriesState state, MerchantInquiriesNotifier notifier) {
    final bool hasFilter = state.statusFilter != 'all' || state.searchQuery.isNotEmpty;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.inbox_outlined, size: 56, color: AppColors.primary),
            ),
            const SizedBox(height: 16),
            Text(
              hasFilter ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد استفسارات واردة حالياً',
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            Text(
              hasFilter
                  ? 'جرب تغيير شروط الفرز أو البحث باسم آخر.'
                  : 'ستظهر هنا طلبات واستفسارات العملاء القادمة من تطبيق دليل بلدي فور إرسالها.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            if (hasFilter) ...[
              const SizedBox(height: 16),
              ElevatedButton.icon(
                icon: const Icon(Icons.clear_all),
                label: const Text('إعادة ضبط الفلاتر'),
                onPressed: () {
                  _searchController.clear();
                  notifier.setSearchQuery('');
                  notifier.setStatusFilter('all');
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String error, MerchantInquiriesNotifier notifier) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            Text(error, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textPrimary)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => notifier.fetchInquiries(),
              child: const Text('إعادة المحاولة'),
            ),
          ],
        ),
      ),
    );
  }

  void _handleCallCustomer(BuildContext context, InquiryModel inquiry, MerchantInquiriesNotifier notifier) {
    Clipboard.setData(ClipboardData(text: inquiry.customerPhone));
    notifier.recordAction(
      inquiry.id,
      actionType: 'call',
      note: 'تم نسخ رقم الهاتف (${inquiry.customerPhone}) لإجراء الاتصال',
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('تم نسخ رقم العميل: ${inquiry.customerPhone} (جاهز للاتصال)'),
        backgroundColor: Colors.green.shade800,
        action: SnackBarAction(
          label: 'تم',
          textColor: Colors.white,
          onPressed: () {},
        ),
      ),
    );
  }

  void _handleWhatsAppCustomer(BuildContext context, InquiryModel inquiry, MerchantInquiriesNotifier notifier) {
    final defaultMsg = 'أهلاً بك يا ${inquiry.customerName}، معك إدارة ${inquiry.activityName ?? "النشاط"} عبر دليل بلدي بخصوص استفسارك.';
    Clipboard.setData(ClipboardData(text: defaultMsg));
    notifier.recordAction(
      inquiry.id,
      actionType: 'whatsapp',
      templateText: defaultMsg,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('تم نسخ رسالة الترحيب ورقم واتساب (${inquiry.customerPhone})'),
        backgroundColor: const Color(0xFF25D366),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Color _getAvatarBg(String status) {
    switch (status) {
      case 'new':
        return Colors.blue;
      case 'contacted':
        return Colors.orange;
      case 'in_progress':
        return Colors.purple;
      case 'closed':
        return Colors.teal;
      default:
        return AppColors.primary;
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'whatsapp':
        return Icons.chat_bubble_outline;
      case 'call':
        return Icons.phone_callback;
      case 'lead':
        return Icons.person_search;
      case 'order_request':
        return Icons.shopping_bag_outlined;
      default:
        return Icons.mail_outline;
    }
  }

  String _getStatusLabelAr(String status) {
    switch (status) {
      case 'new':
        return 'جديد';
      case 'contacted':
        return 'تم التواصل';
      case 'in_progress':
        return 'قيد المتابعة';
      case 'closed':
        return 'مغلق / منجز';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }

  String _formatTimeAgo(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inMinutes < 1) return 'الآن';
      if (diff.inMinutes < 60) return 'منذ ${diff.inMinutes} دقيقة';
      if (diff.inHours < 24) return 'منذ ${diff.inHours} ساعة';
      if (diff.inDays == 1) return 'أمس';
      if (diff.inDays < 7) return 'منذ ${diff.inDays} أيام';
      return '${date.year}/${date.month}/${date.day}';
    } catch (_) {
      return isoString;
    }
  }
}
