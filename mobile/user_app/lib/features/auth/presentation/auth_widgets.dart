import 'package:flutter/material.dart';
import 'package:daleel_core/daleel_core.dart';

// ──────────────────────────────────────────────────────────────────
// Shared helpers — used by login_screen.dart and register_screen.dart
// ──────────────────────────────────────────────────────────────────
InputDecoration authInputDeco({required String hint, required IconData icon}) {
  return InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
    prefixIcon: Padding(
      padding: const EdgeInsets.only(right: 12, left: 4),
      child: ShaderMask(
        shaderCallback: (b) => AppColors.brandGradient.createShader(b),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
    ),
    prefixIconConstraints:
        const BoxConstraints(minWidth: 44, minHeight: 44),
    filled: true,
    fillColor: AppColors.background,
    contentPadding:
        const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide:
          const BorderSide(color: AppColors.primary, width: 1.5),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: AppColors.error),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide:
          const BorderSide(color: AppColors.error, width: 1.5),
    ),
  );
}

class GradientLabel extends StatelessWidget {
  final String label;
  const GradientLabel({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (b) => AppColors.brandGradient.createShader(b),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
      ),
    );
  }
}

class GradientAuthButton extends StatelessWidget {
  final String label;
  final bool isLoading;
  final VoidCallback onTap;
  const GradientAuthButton({
    super.key,
    required this.label,
    required this.isLoading,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 52,
        decoration: BoxDecoration(
          gradient:
              isLoading ? null : AppColors.brandGradient,
          color: isLoading ? AppColors.border : null,
          borderRadius: BorderRadius.circular(16),
          boxShadow: isLoading ? [] : AppColors.primaryGlowShadow,
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: Colors.white,
                  ),
                )
              : Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
        ),
      ),
    );
  }
}
