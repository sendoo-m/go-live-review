import 'package:flutter/material.dart';

/// معرّف لون الثيم — يُخزَّن في SharedPreferences
enum AppAccentColor {
  bluePurple,
  skyBlue,
  green,
  orange,
  red,
  pink,
}

/// بيانات لون واحد: اللون الأساسي، الثانوي، والـ gradient
class AppColorScheme {
  final Color primary;
  final Color primaryDark;
  final Color primaryLight;
  final Color secondary;
  final String label;

  const AppColorScheme({
    required this.primary,
    required this.primaryDark,
    required this.primaryLight,
    required this.secondary,
    required this.label,
  });

  /// لون خفيف للخلفيات والـ chips
  Color get surfaceAccent => primary.withOpacity(0.08);

  /// ألوان الـ gradient (من primary إلى secondary)
  List<Color> get gradientColors => [primary, secondary];
}

/// جميع ثيمات الألوان المتاحة
class AppColorSchemes {
  static const Map<AppAccentColor, AppColorScheme> all = {
    AppAccentColor.bluePurple: AppColorScheme(
      primary:      Color(0xFF2563EB),
      primaryDark:  Color(0xFF1D4ED8),
      primaryLight: Color(0xFFEFF6FF),
      secondary:    Color(0xFF7C3AED),
      label:        'أزرق × بنفسجي',
    ),
    AppAccentColor.skyBlue: AppColorScheme(
      primary:      Color(0xFF0369A1),
      primaryDark:  Color(0xFF075985),
      primaryLight: Color(0xFFE0F2FE),
      secondary:    Color(0xFF38BDF8),
      label:        'سماوي',
    ),
    AppAccentColor.green: AppColorScheme(
      primary:      Color(0xFF059669),
      primaryDark:  Color(0xFF047857),
      primaryLight: Color(0xFFECFDF5),
      secondary:    Color(0xFF10B981),
      label:        'أخضر',
    ),
    AppAccentColor.orange: AppColorScheme(
      primary:      Color(0xFFD97706),
      primaryDark:  Color(0xFFB45309),
      primaryLight: Color(0xFFFFFBEB),
      secondary:    Color(0xFFF59E0B),
      label:        'ذهبي',
    ),
    AppAccentColor.red: AppColorScheme(
      primary:      Color(0xFFDC2626),
      primaryDark:  Color(0xFFB91C1C),
      primaryLight: Color(0xFFFEF2F2),
      secondary:    Color(0xFFF97316),
      label:        'أحمر × برتقالي',
    ),
    AppAccentColor.pink: AppColorScheme(
      primary:      Color(0xFFBE185D),
      primaryDark:  Color(0xFF9D174D),
      primaryLight: Color(0xFFFDF2F8),
      secondary:    Color(0xFFEC4899),
      label:        'وردي',
    ),
  };

  static AppColorScheme of(AppAccentColor accent) =>
      all[accent] ?? all[AppAccentColor.bluePurple]!;
}
