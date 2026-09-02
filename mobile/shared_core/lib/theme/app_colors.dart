import 'package:flutter/material.dart';

/// ╔══════════════════════════════════════════════════════════════╗
/// ║           SENDOO BRAND COLORS — Blue × Purple               ║
/// ║           Updated: Sep 2026 — v2.0 Brand Identity           ║
/// ╚══════════════════════════════════════════════════════════════╝
class AppColors {
  AppColors._();

  // ─────────────────────────────────────────
  // 🔵 PRIMARY — Blue
  // ─────────────────────────────────────────
  static const Color primary         = Color(0xFF2563EB); // Blue 600
  static const Color primaryHover    = Color(0xFF1D4ED8); // Blue 700
  static const Color primaryLight    = Color(0xFFEFF6FF); // Blue 50
  static const Color primaryMid      = Color(0xFFBFDBFE); // Blue 200
  static const Color primaryDark     = Color(0xFF1E40AF); // Blue 800

  // ─────────────────────────────────────────
  // 🟣 ACCENT — Purple
  // ─────────────────────────────────────────
  static const Color accent          = Color(0xFF7C3AED); // Violet 600
  static const Color accentHover     = Color(0xFF6D28D9); // Violet 700
  static const Color accentLight     = Color(0xFFF5F3FF); // Violet 50
  static const Color accentMid       = Color(0xFFDDD6FE); // Violet 200
  static const Color accentDark      = Color(0xFF5B21B6); // Violet 800

  // ─────────────────────────────────────────
  // 🌈 BRAND GRADIENTS (Blue → Purple)
  // ─────────────────────────────────────────
  static const LinearGradient brandGradient = LinearGradient(
    colors: [primary, accent],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient brandGradientVertical = LinearGradient(
    colors: [primary, accent],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient brandGradientDiagonal = LinearGradient(
    colors: [primary, accent],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Subtle version for backgrounds / cards
  static const LinearGradient brandGradientSubtle = LinearGradient(
    colors: [Color(0xFFEFF6FF), Color(0xFFF5F3FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Dark hero gradient (used in SliverAppBar)
  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF1D4ED8), Color(0xFF6D28D9)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Mid-point mix for chips / badges
  static const Color brandMix        = Color(0xFF4F46E5); // Blue-Purple midpoint

  // ─────────────────────────────────────────
  // ✅ SEMANTIC
  // ─────────────────────────────────────────
  static const Color success         = Color(0xFF059669); // Emerald 600
  static const Color successLight    = Color(0xFFECFDF5); // Emerald 50
  static const Color warning         = Color(0xFFF59E0B); // Amber 500 — star rating
  static const Color warningLight    = Color(0xFFFFFBEB); // Amber 50
  static const Color error           = Color(0xFFDC2626); // Red 600
  static const Color errorLight      = Color(0xFFFEF2F2); // Red 50
  static const Color info            = Color(0xFF0EA5E9); // Sky 500
  static const Color infoLight       = Color(0xFFF0F9FF); // Sky 50

  // ─────────────────────────────────────────
  // ⚫ NEUTRALS — Light Mode (WCAG AA)
  // ─────────────────────────────────────────
  static const Color background      = Color(0xFFF8FAFC); // Slate 50
  static const Color surface         = Color(0xFFFFFFFF); // White
  static const Color surfaceElevated = Color(0xFFF1F5F9); // Slate 100
  static const Color border          = Color(0xFFE2E8F0); // Slate 200
  static const Color borderFocus     = Color(0xFF2563EB); // = primary
  static const Color divider         = Color(0xFFCBD5E1); // Slate 300

  static const Color textPrimary     = Color(0xFF0F172A); // Slate 950
  static const Color textSecondary   = Color(0xFF475569); // Slate 600
  static const Color textMuted       = Color(0xFF94A3B8); // Slate 400
  static const Color textDisabled    = Color(0xFFCBD5E1); // Slate 300
  static const Color textInverse     = Color(0xFFFFFFFF); // White

  // ─────────────────────────────────────────
  // 🌙 DARK MODE SURFACES
  // ─────────────────────────────────────────
  static const Color darkBackground  = Color(0xFF0F0F1A); // Deep navy-black
  static const Color darkSurface     = Color(0xFF1A1A2E); // Navy surface
  static const Color darkSurface2    = Color(0xFF16213E); // Elevated navy
  static const Color darkBorder      = Color(0xFF2D2D44); // Subtle border
  static const Color darkTextPrimary = Color(0xFFF1F5F9); // Slate 100
  static const Color darkTextMuted   = Color(0xFF94A3B8); // Slate 400

  // ─────────────────────────────────────────
  // 🔮 GLASS MORPHISM
  // ─────────────────────────────────────────
  static const Color glassWhite      = Color(0x1AFFFFFF); // White 10%
  static const Color glassWhiteMid   = Color(0x33FFFFFF); // White 20%
  static const Color glassDark       = Color(0x1A000000); // Black 10%
  static const Color glassBorder     = Color(0x33FFFFFF); // White border 20%

  // ─────────────────────────────────────────
  // ✨ GLOW / SHADOW COLORS
  // ─────────────────────────────────────────
  static const Color glowBlue        = Color(0x402563EB); // Blue glow 25%
  static const Color glowPurple      = Color(0x407C3AED); // Purple glow 25%
  static const Color glowBrand       = Color(0x334F46E5); // Brand mix glow 20%

  // ─────────────────────────────────────────
  // 🟢 WHATSAPP (keeps brand color)
  // ─────────────────────────────────────────
  static const Color whatsapp        = Color(0xFF25D366);
  static const Color whatsappDark    = Color(0xFF128C7E);

  // ─────────────────────────────────────────
  // 🛠 HELPERS
  // ─────────────────────────────────────────

  /// Returns brand gradient as a [BoxDecoration]
  static BoxDecoration get brandBoxDecoration => const BoxDecoration(
    gradient: brandGradient,
  );

  /// Returns brand gradient as a [BoxDecoration] with rounded corners
  static BoxDecoration brandBoxDecorationRounded({double radius = 12}) =>
      BoxDecoration(
        gradient: brandGradient,
        borderRadius: BorderRadius.circular(radius),
      );

  /// Glow shadow for primary buttons / FABs
  static List<BoxShadow> get primaryGlowShadow => [
        BoxShadow(
          color: glowBlue,
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
        BoxShadow(
          color: glowPurple,
          blurRadius: 40,
          offset: const Offset(0, 16),
        ),
      ];

  /// Subtle card shadow
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: const Color(0xFF0F172A).withOpacity(0.06),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];
}
