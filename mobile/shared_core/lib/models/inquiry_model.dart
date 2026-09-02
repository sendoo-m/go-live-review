class InquiryTimelineEvent {
  final String id;
  final String action;
  final String? note;
  final String timestamp;
  final String? actorName;

  InquiryTimelineEvent({
    required this.id,
    required this.action,
    this.note,
    required this.timestamp,
    this.actorName,
  });

  factory InquiryTimelineEvent.fromJson(Map<String, dynamic> json) {
    return InquiryTimelineEvent(
      id: json['id']?.toString() ?? '',
      action: json['action'] ?? '',
      note: json['note'],
      timestamp: json['timestamp'] ?? '',
      actorName: json['actor_name'] ?? json['actorName'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'action': action,
    'note': note,
    'timestamp': timestamp,
    'actor_name': actorName,
  };
}

class InquiryCountsModel {
  final int all;
  final int newCount;
  final int contacted;
  final int inProgress;
  final int closed;
  final int unread;

  InquiryCountsModel({
    this.all = 0,
    this.newCount = 0,
    this.contacted = 0,
    this.inProgress = 0,
    this.closed = 0,
    this.unread = 0,
  });

  factory InquiryCountsModel.fromJson(Map<String, dynamic> json) {
    return InquiryCountsModel(
      all: json['all'] ?? 0,
      newCount: json['new'] ?? json['new_count'] ?? 0,
      contacted: json['contacted'] ?? 0,
      inProgress: json['in_progress'] ?? json['inProgress'] ?? 0,
      closed: json['closed'] ?? 0,
      unread: json['unread'] ?? 0,
    );
  }
}

class InquiryModel {
  final int id;
  final int activityId;
  final String? activityName;
  final String? activityCoverImage;
  final int? productId;
  final String? productName;
  final double? productPrice;
  final String? productCoverImage;
  final int? offerId;
  final String? offerTitle;
  final double? offerDiscountPercentage;
  final String customerName;
  final String customerPhone;
  final String? customerEmail;
  final String message;
  final String type; // call | whatsapp | inquiry | lead | order_request
  final String status; // new | contacted | in_progress | closed | cancelled
  final String priority; // normal | high | urgent
  final bool isRead;
  final String? notes;
  final String? source; // app_activity | app_product | app_offer | direct_call
  final String createdAt;
  final String? updatedAt;
  final List<InquiryTimelineEvent> history;

  InquiryModel({
    required this.id,
    required this.activityId,
    this.activityName,
    this.activityCoverImage,
    this.productId,
    this.productName,
    this.productPrice,
    this.productCoverImage,
    this.offerId,
    this.offerTitle,
    this.offerDiscountPercentage,
    required this.customerName,
    required this.customerPhone,
    this.customerEmail,
    required this.message,
    this.type = 'inquiry',
    this.status = 'new',
    this.priority = 'normal',
    this.isRead = false,
    this.notes,
    this.source,
    required this.createdAt,
    this.updatedAt,
    this.history = const [],
  });

  factory InquiryModel.fromJson(Map<String, dynamic> json) {
    return InquiryModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      activityId: json['activity_id'] is int ? json['activity_id'] : int.tryParse(json['activity_id']?.toString() ?? '0') ?? 0,
      activityName: json['activity_name_ar'] ?? json['activity_name'] ?? json['activityName'],
      activityCoverImage: json['activity_cover_image'] ?? json['activityCoverImage'],
      productId: json['product_id'] != null ? (json['product_id'] is int ? json['product_id'] : int.tryParse(json['product_id'].toString())) : null,
      productName: json['product_name_ar'] ?? json['product_name'] ?? json['productName'],
      productPrice: json['product_price'] != null ? (json['product_price'] as num).toDouble() : null,
      productCoverImage: json['product_cover_image'] ?? json['productCoverImage'],
      offerId: json['offer_id'] != null ? (json['offer_id'] is int ? json['offer_id'] : int.tryParse(json['offer_id'].toString())) : null,
      offerTitle: json['offer_title_ar'] ?? json['offer_title'] ?? json['offerTitle'],
      offerDiscountPercentage: json['offer_discount_percentage'] != null ? (json['offer_discount_percentage'] as num).toDouble() : null,
      customerName: json['customer_name'] ?? json['sender_name'] ?? json['name'] ?? 'عميل مهتم',
      customerPhone: json['customer_phone'] ?? json['sender_phone'] ?? json['phone'] ?? '',
      customerEmail: json['customer_email'] ?? json['email'],
      message: json['message'] ?? '',
      type: json['type'] ?? 'inquiry',
      status: json['status'] ?? 'new',
      priority: json['priority'] ?? 'normal',
      isRead: json['is_read'] == true || json['is_read'] == 1,
      notes: json['notes'],
      source: json['source'],
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'],
      history: (json['history'] as List<dynamic>? ?? [])
          .map((e) => InquiryTimelineEvent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'activity_id': activityId,
    'activity_name': activityName,
    'product_id': productId,
    'product_name': productName,
    'offer_id': offerId,
    'offer_title': offerTitle,
    'customer_name': customerName,
    'customer_phone': customerPhone,
    'customer_email': customerEmail,
    'message': message,
    'type': type,
    'status': status,
    'priority': priority,
    'is_read': isRead,
    'notes': notes,
    'source': source,
    'created_at': createdAt,
    'updated_at': updatedAt,
    'history': history.map((e) => e.toJson()).toList(),
  };

  InquiryModel copyWith({
    int? id,
    int? activityId,
    String? activityName,
    String? activityCoverImage,
    int? productId,
    String? productName,
    double? productPrice,
    String? productCoverImage,
    int? offerId,
    String? offerTitle,
    double? offerDiscountPercentage,
    String? customerName,
    String? customerPhone,
    String? customerEmail,
    String? message,
    String? type,
    String? status,
    String? priority,
    bool? isRead,
    String? notes,
    String? source,
    String? createdAt,
    String? updatedAt,
    List<InquiryTimelineEvent>? history,
  }) {
    return InquiryModel(
      id: id ?? this.id,
      activityId: activityId ?? this.activityId,
      activityName: activityName ?? this.activityName,
      activityCoverImage: activityCoverImage ?? this.activityCoverImage,
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      productPrice: productPrice ?? this.productPrice,
      productCoverImage: productCoverImage ?? this.productCoverImage,
      offerId: offerId ?? this.offerId,
      offerTitle: offerTitle ?? this.offerTitle,
      offerDiscountPercentage: offerDiscountPercentage ?? this.offerDiscountPercentage,
      customerName: customerName ?? this.customerName,
      customerPhone: customerPhone ?? this.customerPhone,
      customerEmail: customerEmail ?? this.customerEmail,
      message: message ?? this.message,
      type: type ?? this.type,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      isRead: isRead ?? this.isRead,
      notes: notes ?? this.notes,
      source: source ?? this.source,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      history: history ?? this.history,
    );
  }

  // Helpers
  String get statusLabelAr {
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
        return 'غير محدد';
    }
  }

  String get typeLabelAr {
    switch (type) {
      case 'whatsapp':
        return 'واتساب';
      case 'call':
        return 'اتصال هاتفي';
      case 'lead':
        return 'فرصة مهتمة';
      case 'order_request':
        return 'طلب شراء';
      case 'inquiry':
      default:
        return 'استفسار عام';
    }
  }

  String get sourceLabelAr {
    switch (source) {
      case 'app_offer':
        return 'عرض ترويجي';
      case 'app_product':
        return 'صفحة منتج / خدمة';
      case 'app_activity':
        return 'الملف التجاري للنشاط';
      case 'direct_call':
        return 'اتصال مباشر';
      default:
        return 'تطبيق دليل بلدي';
    }
  }

  String get priorityLabelAr {
    switch (priority) {
      case 'urgent':
        return 'عاجل جداً';
      case 'high':
        return 'أولوية عالية';
      case 'normal':
      default:
        return 'عادي';
    }
  }

  bool get isNew => status == 'new';
  bool get isClosed => status == 'closed' || status == 'cancelled';
  bool get hasProduct => productId != null && productId! > 0;
  bool get hasOffer => offerId != null && offerId! > 0;
}
