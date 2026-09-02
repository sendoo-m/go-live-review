class MediaItemModel {
  final String id;
  final String url;
  final String fileName;
  final String folder; // 'activities', 'products', 'offers', 'banners'
  final int sizeBytes;
  final String mimeType;
  final String uploadedAt;
  final String? title;
  final int? relatedEntityId;

  MediaItemModel({
    required this.id,
    required this.url,
    required this.fileName,
    this.folder = 'activities',
    this.sizeBytes = 0,
    this.mimeType = 'image/jpeg',
    required this.uploadedAt,
    this.title,
    this.relatedEntityId,
  });

  factory MediaItemModel.fromJson(Map<String, dynamic> json) {
    return MediaItemModel(
      id: json['id']?.toString() ?? json['file_name'] ?? 'media_${DateTime.now().millisecondsSinceEpoch}',
      url: json['url'] ?? '',
      fileName: json['file_name'] ?? 'image.jpg',
      folder: json['folder'] ?? 'activities',
      sizeBytes: json['size_bytes'] ?? 0,
      mimeType: json['mime_type'] ?? 'image/jpeg',
      uploadedAt: json['uploaded_at'] ?? DateTime.now().toIso8601String(),
      title: json['title'],
      relatedEntityId: json['related_entity_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'url': url,
      'file_name': fileName,
      'folder': folder,
      'size_bytes': sizeBytes,
      'mime_type': mimeType,
      'uploaded_at': uploadedAt,
      'title': title,
      'related_entity_id': relatedEntityId,
    };
  }
}
