class UserModel {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final int roleId;
  final String? roleName;
  final String? roleDisplayNameAr;
  final int? locationId;
  final String? locationNameAr;
  final String? avatarUrl;
  final bool isActive;
  final List<String> permissions;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.roleId,
    this.roleName,
    this.roleDisplayNameAr,
    this.locationId,
    this.locationNameAr,
    this.avatarUrl,
    this.isActive = true,
    this.permissions = const [],
  });

  bool get isMerchant => roleName == 'تاجر' || roleName == 'merchant' || roleId == 7 || roleId == 6 || roleId == 1;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      roleId: json['role_id'] ?? 8,
      roleName: json['role_name'] ?? (json['role'] is Map ? json['role']['name'] : null),
      roleDisplayNameAr: json['role_display_name_ar'] ?? (json['role'] is Map ? json['role']['display_name_ar'] : null),
      locationId: json['location_id'] ?? json['governorate_id'],
      locationNameAr: json['location_name_ar'],
      avatarUrl: json['avatar_url'],
      isActive: json['is_active'] ?? true,
      permissions: (json['permissions'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role_id': roleId,
      'role_name': roleName,
      'role_display_name_ar': roleDisplayNameAr,
      'location_id': locationId,
      'location_name_ar': locationNameAr,
      'avatar_url': avatarUrl,
      'is_active': isActive,
      'permissions': permissions,
    };
  }
}

class AuthData {
  final String token;
  final String tokenType;
  final int expiresInDays;
  final UserModel user;

  AuthData({
    required this.token,
    this.tokenType = 'Bearer',
    this.expiresInDays = 7,
    required this.user,
  });

  factory AuthData.fromJson(Map<String, dynamic> json) {
    return AuthData(
      token: json['token'] ?? '',
      tokenType: json['token_type'] ?? 'Bearer',
      expiresInDays: json['expires_in_days'] ?? 7,
      user: UserModel.fromJson(json['user'] ?? {}),
    );
  }
}
