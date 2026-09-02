import 'package:flutter/material.dart';
import 'app_color_scheme.dart';
import 'app_colors.dart';

class AppTheme {
  // ── Factory: بنبني ThemeData بناءً على اللون والوضع ──────────────────────────

  static ThemeData build({
    required AppColorScheme scheme,
    required Brightness brightness,
  }) {
    final isDark = brightness == Brightness.dark;

    final scaffold  = isDark ? const Color(0xFF0F0F1A) : const Color(0xFFF5F5FF);
    final surface   = isDark ? const Color(0xFF16162A) : Colors.white;
    final surface2  = isDark ? const Color(0xFF1E1E35) : const Color(0xFFEEF0FF);
    final border    = isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.08);
    final textPri   = isDark ? const Color(0xFFF1F1F1) : const Color(0xFF1E1B4B);
    final textSec   = isDark ? const Color(0xFF94A3B8) : const Color(0xFF6B7280);
    final textMuted = isDark ? const Color(0xFF64748B) : const Color(0xFF9CA3AF);

    return ThemeData(
      useMaterial3:            true,
      brightness:              brightness,
      fontFamily:              'Cairo',
      scaffoldBackgroundColor: scaffold,

      colorScheme: ColorScheme(
        brightness:            brightness,
        primary:               scheme.primary,
        onPrimary:             Colors.white,
        primaryContainer:      scheme.primaryLight,
        onPrimaryContainer:    scheme.primaryDark,
        secondary:             scheme.secondary,
        onSecondary:           Colors.white,
        secondaryContainer:    scheme.surfaceAccent,
        onSecondaryContainer:  scheme.primary,
        surface:               surface,
        onSurface:             textPri,
        error:                 AppColors.error,
        onError:               Colors.white,
      ),

      // ── AppBar ──────────────────────────────────────────────────────────────
      appBarTheme: AppBarTheme(
        backgroundColor:        surface,
        foregroundColor:        textPri,
        elevation:              0,
        centerTitle:            true,
        scrolledUnderElevation: 1,
        surfaceTintColor:       Colors.transparent,
        shadowColor:            border,
        titleTextStyle: TextStyle(
          fontFamily: 'Cairo', fontSize: 18,
          fontWeight: FontWeight.bold, color: textPri,
        ),
        iconTheme:        IconThemeData(color: textSec),
        actionsIconTheme: IconThemeData(color: textSec),
      ),

      // ── Card ────────────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        color:     surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: BorderSide(color: border, width: 1),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      ),

      // ── Elevated Button ─────────────────────────────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: scheme.primary,
          foregroundColor: Colors.white,
          minimumSize:     const Size.fromHeight(50),
          elevation:       0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Cairo', fontSize: 15, fontWeight: FontWeight.w700,
          ),
        ),
      ),

      // ── Outlined Button ─────────────────────────────────────────────────────
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: scheme.primary,
          minimumSize:     const Size.fromHeight(50),
          side:            BorderSide(color: scheme.primary, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Cairo', fontSize: 15, fontWeight: FontWeight.w700,
          ),
        ),
      ),

      // ── Text Button ─────────────────────────────────────────────────────────
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: scheme.primary,
          textStyle: const TextStyle(
            fontFamily: 'Cairo', fontSize: 14, fontWeight: FontWeight.w700,
          ),
        ),
      ),

      // ── Input ───────────────────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled:         true,
        fillColor:      surface2,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: scheme.primary, width: 2),
        ),
        hintStyle: TextStyle(
          fontFamily: 'Cairo', fontSize: 14, color: textMuted,
        ),
      ),

      // ── Chip ────────────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        backgroundColor:  surface2,
        selectedColor:    scheme.surfaceAccent,
        checkmarkColor:   scheme.primary,
        labelStyle: TextStyle(
          fontFamily: 'Cairo', fontSize: 12, color: textSec,
        ),
        side:  BorderSide(color: border),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(100),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 4),
      ),

      // ── Bottom Navigation ───────────────────────────────────────────────────
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor:          surface,
        selectedItemColor:        scheme.primary,
        unselectedItemColor:      textMuted,
        selectedLabelStyle: const TextStyle(
          fontFamily: 'Cairo', fontSize: 11, fontWeight: FontWeight.w700,
        ),
        unselectedLabelStyle: const TextStyle(
          fontFamily: 'Cairo', fontSize: 11,
        ),
        type:                 BottomNavigationBarType.fixed,
        elevation:            0,
        showSelectedLabels:   true,
        showUnselectedLabels: true,
      ),

      // ── Divider ─────────────────────────────────────────────────────────────
      dividerTheme: DividerThemeData(color: border, thickness: 1, space: 1),

      // ── Dialog ──────────────────────────────────────────────────────────────
      dialogTheme: DialogThemeData(
        backgroundColor:  surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        titleTextStyle: TextStyle(
          fontFamily: 'Cairo', fontSize: 18,
          fontWeight: FontWeight.bold, color: textPri,
        ),
        contentTextStyle: TextStyle(
          fontFamily: 'Cairo', fontSize: 14, color: textSec,
        ),
      ),

      // ── SnackBar ────────────────────────────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        backgroundColor:  surface2,
        contentTextStyle: TextStyle(fontFamily: 'Cairo', color: textPri),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),

      // ── Icon ────────────────────────────────────────────────────────────────
      iconTheme: IconThemeData(color: textSec, size: 22),

      // ── Text ────────────────────────────────────────────────────────────────
      textTheme: TextTheme(
        displayLarge:   TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w900),
        displayMedium:  TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w800),
        displaySmall:   TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w700),
        headlineLarge:  TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w800),
        headlineMedium: TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w700),
        headlineSmall:  TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w700),
        titleLarge:     TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w700),
        titleMedium:    TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w600),
        titleSmall:     TextStyle(fontFamily: 'Cairo', color: textSec, fontWeight: FontWeight.w600),
        bodyLarge:      TextStyle(fontFamily: 'Cairo', color: textPri, fontSize: 15),
        bodyMedium:     TextStyle(fontFamily: 'Cairo', color: textPri, fontSize: 14),
        bodySmall:      TextStyle(fontFamily: 'Cairo', color: textSec, fontSize: 12),
        labelLarge:     TextStyle(fontFamily: 'Cairo', color: textPri, fontWeight: FontWeight.w700, fontSize: 14),
        labelMedium:    TextStyle(fontFamily: 'Cairo', color: textSec, fontSize: 12),
        labelSmall:     TextStyle(fontFamily: 'Cairo', color: textMuted, fontSize: 11),
      ),
    );
  }

  // ── Shortcuts للـ backward compatibility ────────────────────────────────────
  static ThemeData get lightTheme => build(
        scheme: AppColorSchemes.of(AppAccentColor.bluePurple),
        brightness: Brightness.light,
      );

  static ThemeData get darkTheme => build(
        scheme: AppColorSchemes.of(AppAccentColor.bluePurple),
        brightness: Brightness.dark,
      );
}
