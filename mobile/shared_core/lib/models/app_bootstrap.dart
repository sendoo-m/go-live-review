class AppBootstrapData {
  final String appName;
  final String apiVersion;
  final String deepLinkScheme;
  final List<SectionModel> sections;
  final List<GovernorateModel> governorates;
  final Map<String, dynamic> settings;

  AppBootstrapData({
    required this.appName,
    required this.apiVersion,
    required this.deepLinkScheme,
    required this.sections,
    required this.governorates,
    required this.settings,
  });

  factory AppBootstrapData.fromJson(Map<String, dynamic> json) {
    return AppBootstrapData(
      appName: json['app_name'] ?? 'دليل أي خدمة',
      apiVersion: json['api_version'] ?? '2.4.0',
      deepLinkScheme: json['deep_link_scheme'] ?? 'daleel',
      sections: (json['sections'] as List<dynamic>? ?? [])
          .map((e) => SectionModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      governorates: (json['governorates'] as List<dynamic>? ?? [])
          .map((e) => GovernorateModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      settings: json['settings'] as Map<String, dynamic>? ?? {},
    );
  }
}

class SectionModel {
  final int id;
  final String slug;
  final String nameAr;
  final String nameEn;
  final String icon;
  final String color;
  final int categoriesCount;
  final int activitiesCount;

  SectionModel({
    required this.id,
    required this.slug,
    required this.nameAr,
    required this.nameEn,
    required this.icon,
    required this.color,
    required this.categoriesCount,
    required this.activitiesCount,
  });

  factory SectionModel.fromJson(Map<String, dynamic> json) {
    return SectionModel(
      id: json['id'] ?? 0,
      slug: json['slug'] ?? '',
      nameAr: json['name_ar'] ?? '',
      nameEn: json['name_en'] ?? '',
      icon: json['icon'] ?? 'Store',
      color: json['color'] ?? '#4f46e5',
      categoriesCount: json['categories_count'] ?? 0,
      activitiesCount: json['activities_count'] ?? 0,
    );
  }
}

class GovernorateModel {
  final int id;
  final String nameAr;
  final String nameEn;
  final String code;
  final double latitude;
  final double longitude;

  GovernorateModel({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.code,
    this.latitude = 0.0,
    this.longitude = 0.0,
  });

  factory GovernorateModel.fromJson(Map<String, dynamic> json) {
    return GovernorateModel(
      id: json['id'] ?? 0,
      nameAr: json['name_ar'] ?? '',
      nameEn: json['name_en'] ?? '',
      code: json['code'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name_ar': nameAr,
      'name_en': nameEn,
      'code': code,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
