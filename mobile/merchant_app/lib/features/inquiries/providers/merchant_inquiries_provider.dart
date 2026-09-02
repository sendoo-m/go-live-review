import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/models/inquiry_model.dart';
import 'package:daleel_core/repositories/inquiries_repository.dart';

class InquiriesState {
  final List<InquiryModel> inquiries;
  final InquiryCountsModel counts;
  final bool isLoading;
  final String? errorMessage;
  final String statusFilter; // all, new, contacted, in_progress, closed
  final int? activityFilter; // null for all
  final String searchQuery;
  final String sortOption; // newest, oldest, priority

  InquiriesState({
    this.inquiries = const [],
    InquiryCountsModel? counts,
    this.isLoading = false,
    this.errorMessage,
    this.statusFilter = 'all',
    this.activityFilter,
    this.searchQuery = '',
    this.sortOption = 'newest',
  }) : counts = counts ?? InquiryCountsModel();

  InquiriesState copyWith({
    List<InquiryModel>? inquiries,
    InquiryCountsModel? counts,
    bool? isLoading,
    String? errorMessage,
    String? statusFilter,
    int? activityFilter,
    bool clearActivityFilter = false,
    String? searchQuery,
    String? sortOption,
  }) {
    return InquiriesState(
      inquiries: inquiries ?? this.inquiries,
      counts: counts ?? this.counts,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      statusFilter: statusFilter ?? this.statusFilter,
      activityFilter: clearActivityFilter ? null : (activityFilter ?? this.activityFilter),
      searchQuery: searchQuery ?? this.searchQuery,
      sortOption: sortOption ?? this.sortOption,
    );
  }

  List<InquiryModel> get filteredInquiries {
    var list = [...inquiries];

    // Filter by activity
    if (activityFilter != null) {
      list = list.where((i) => i.activityId == activityFilter).toList();
    }

    // Filter by status
    if (statusFilter != 'all') {
      if (statusFilter == 'unread') {
        list = list.where((i) => !i.isRead).toList();
      } else {
        list = list.where((i) => i.status == statusFilter).toList();
      }
    }

    // Search query
    if (searchQuery.trim().isNotEmpty) {
      final q = searchQuery.toLowerCase().trim();
      list = list.where((i) {
        return i.customerName.toLowerCase().contains(q) ||
            i.customerPhone.contains(q) ||
            i.message.toLowerCase().contains(q) ||
            (i.activityName != null && i.activityName!.toLowerCase().contains(q)) ||
            (i.productName != null && i.productName!.toLowerCase().contains(q)) ||
            (i.offerTitle != null && i.offerTitle!.toLowerCase().contains(q)) ||
            (i.notes != null && i.notes!.toLowerCase().contains(q));
      }).toList();
    }

    // Sort
    if (sortOption == 'oldest') {
      list.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    } else if (sortOption == 'priority') {
      int score(String p) => p == 'urgent' ? 3 : (p == 'high' ? 2 : 1);
      list.sort((a, b) => score(b.priority).compareTo(score(a.priority)));
    } else {
      // Newest first
      list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }

    return list;
  }
}

class MerchantInquiriesNotifier extends StateNotifier<InquiriesState> {
  final InquiriesRepository _repository;

  MerchantInquiriesNotifier(this._repository) : super(InquiriesState()) {
    fetchInquiries();
  }

  Future<void> fetchInquiries({bool silent = false}) async {
    if (!silent) {
      state = state.copyWith(isLoading: true, errorMessage: null);
    }
    try {
      final result = await _repository.getMerchantInquiries(
        activityId: state.activityFilter,
        status: state.statusFilter != 'all' ? state.statusFilter : null,
        search: state.searchQuery.isNotEmpty ? state.searchQuery : null,
        sort: state.sortOption,
      );

      state = state.copyWith(
        inquiries: result.inquiries,
        counts: result.counts,
        isLoading: false,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'تعذر تحميل استفسارات العملاء: $e',
      );
    }
  }

  void setStatusFilter(String status) {
    state = state.copyWith(statusFilter: status);
  }

  void setActivityFilter(int? activityId) {
    if (activityId == null) {
      state = state.copyWith(clearActivityFilter: true);
    } else {
      state = state.copyWith(activityFilter: activityId);
    }
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void setSortOption(String sort) {
    state = state.copyWith(sortOption: sort);
  }

  /// Update inquiry pipeline status with optimistic update and history tracking
  Future<bool> updateStatus(int id, String newStatus, {String? note}) async {
    // Find item
    final index = state.inquiries.indexWhere((i) => i.id == id);
    if (index == -1) return false;

    final oldInquiry = state.inquiries[index];
    final updatedHistory = [
      ...oldInquiry.history,
      InquiryTimelineEvent(
        id: 'evt_${DateTime.now().millisecondsSinceEpoch}',
        action: 'تم تغيير الحالة إلى (${_getStatusLabel(newStatus)})',
        note: note,
        timestamp: DateTime.now().toIso8601String(),
        actorName: 'التاجر',
      ),
    ];

    final updatedInquiry = oldInquiry.copyWith(
      status: newStatus,
      isRead: true,
      updatedAt: DateTime.now().toIso8601String(),
      history: updatedHistory,
    );

    // Optimistic update
    final updatedList = [...state.inquiries];
    updatedList[index] = updatedInquiry;
    state = state.copyWith(inquiries: updatedList);
    _recalculateCounts();

    try {
      final serverInquiry = await _repository.updateInquiryStatus(id, newStatus, note: note);
      // Sync back
      final confirmedList = [...state.inquiries];
      final confirmedIndex = confirmedList.indexWhere((i) => i.id == id);
      if (confirmedIndex != -1) {
        confirmedList[confirmedIndex] = serverInquiry;
        state = state.copyWith(inquiries: confirmedList);
        _recalculateCounts();
      }
      return true;
    } catch (e) {
      // Revert if error
      final revertedList = [...state.inquiries];
      final revertedIndex = revertedList.indexWhere((i) => i.id == id);
      if (revertedIndex != -1) {
        revertedList[revertedIndex] = oldInquiry;
        state = state.copyWith(inquiries: revertedList);
        _recalculateCounts();
      }
      return false;
    }
  }

  /// Save private notes for lead management
  Future<bool> saveNotes(int id, String notes) async {
    final index = state.inquiries.indexWhere((i) => i.id == id);
    if (index == -1) return false;

    final oldInquiry = state.inquiries[index];
    final updatedInquiry = oldInquiry.copyWith(
      notes: notes,
      updatedAt: DateTime.now().toIso8601String(),
    );

    final updatedList = [...state.inquiries];
    updatedList[index] = updatedInquiry;
    state = state.copyWith(inquiries: updatedList);

    try {
      final serverInquiry = await _repository.updateInquiryNotes(id, notes);
      final confirmedList = [...state.inquiries];
      final confirmedIndex = confirmedList.indexWhere((i) => i.id == id);
      if (confirmedIndex != -1) {
        confirmedList[confirmedIndex] = serverInquiry;
        state = state.copyWith(inquiries: confirmedList);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Toggle read/unread status
  Future<void> toggleRead(int id) async {
    final index = state.inquiries.indexWhere((i) => i.id == id);
    if (index == -1) return;

    final old = state.inquiries[index];
    final newRead = !old.isRead;
    final updated = old.copyWith(isRead: newRead);

    final updatedList = [...state.inquiries];
    updatedList[index] = updated;
    state = state.copyWith(inquiries: updatedList);
    _recalculateCounts();

    try {
      await _repository.toggleInquiryRead(id, newRead);
    } catch (_) {}
  }

  /// Record direct communication action (WhatsApp, Call, Quick Template)
  Future<void> recordAction(int id, {required String actionType, String? templateText, String? note}) async {
    final index = state.inquiries.indexWhere((i) => i.id == id);
    if (index != -1) {
      final inq = state.inquiries[index];
      // Auto move 'new' to 'contacted'
      final newStatus = (inq.status == 'new' && (actionType == 'whatsapp' || actionType == 'call'))
          ? 'contacted'
          : inq.status;

      final updated = inq.copyWith(
        status: newStatus,
        isRead: true,
        updatedAt: DateTime.now().toIso8601String(),
        history: [
          ...inq.history,
          InquiryTimelineEvent(
            id: 'evt_${DateTime.now().millisecondsSinceEpoch}',
            action: _getActionTitle(actionType),
            note: templateText ?? note,
            timestamp: DateTime.now().toIso8601String(),
            actorName: 'التاجر',
          ),
        ],
      );

      final updatedList = [...state.inquiries];
      updatedList[index] = updated;
      state = state.copyWith(inquiries: updatedList);
      _recalculateCounts();
    }

    try {
      final serverInquiry = await _repository.recordInquiryAction(
        id,
        actionType: actionType,
        templateText: templateText,
        note: note,
      );
      final confirmedList = [...state.inquiries];
      final confirmedIndex = confirmedList.indexWhere((i) => i.id == id);
      if (confirmedIndex != -1) {
        confirmedList[confirmedIndex] = serverInquiry;
        state = state.copyWith(inquiries: confirmedList);
        _recalculateCounts();
      }
    } catch (_) {}
  }

  InquiryModel? getInquiryById(int id) {
    try {
      return state.inquiries.firstWhere((i) => i.id == id);
    } catch (_) {
      return null;
    }
  }

  void _recalculateCounts() {
    final list = state.inquiries;
    final newCounts = InquiryCountsModel(
      all: list.length,
      newCount: list.where((i) => i.status == 'new').length,
      contacted: list.where((i) => i.status == 'contacted').length,
      inProgress: list.where((i) => i.status == 'in_progress').length,
      closed: list.where((i) => i.status == 'closed' || i.status == 'cancelled').length,
      unread: list.where((i) => !i.isRead).length,
    );
    state = state.copyWith(counts: newCounts);
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'new':
        return 'جديد';
      case 'contacted':
        return 'تم التواصل';
      case 'in_progress':
        return 'قيد المتابعة';
      case 'closed':
        return 'مغلق';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }

  String _getActionTitle(String actionType) {
    switch (actionType) {
      case 'whatsapp':
        return 'فتح محادثة واتساب مع العميل';
      case 'call':
        return 'إجراء مكالمة هاتفية مع العميل';
      case 'template_reply':
        return 'إرسال نموذج رد سريع عبر واتساب';
      case 'email':
        return 'إرسال بريد إلكتروني';
      default:
        return 'إجراء تواصل';
    }
  }
}

final inquiriesRepositoryProvider = Provider<InquiriesRepository>((ref) {
  return InquiriesRepository();
});

final merchantInquiriesProvider =
    StateNotifierProvider<MerchantInquiriesNotifier, InquiriesState>((ref) {
  final repository = ref.watch(inquiriesRepositoryProvider);
  return MerchantInquiriesNotifier(repository);
});
