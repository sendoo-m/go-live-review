import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final user      = authState.user;
    final initial   = (user?.name.isNotEmpty == true)
        ? user!.name[0].toUpperCase()
        : 'U';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // ── Hero ──────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  height: 200,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF1D4ED8), Color(0xFF6D28D9)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: SafeArea(
                    bottom: false,
                    child: Padding(
                      padding:
                          const EdgeInsets.fromLTRB(20, 12, 20, 0),
                      child: Row(
                        mainAxisAlignment:
                            MainAxisAlignment.spaceBetween,
                        children: [
                          GestureDetector(
                            onTap: () => context.pop(),
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color:
                                    Colors.white.withValues(alpha: 0.15),
                                borderRadius:
                                    BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                  Icons.arrow_forward_ios_rounded,
                                  color: Colors.white,
                                  size: 18),
                            ),
                          ),
                          const Text(
                            'الملف الشخصي',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold),
                          ),
                          GestureDetector(
                            onTap: () =>
                                context.push(AppRoutes.settings),
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color:
                                    Colors.white.withValues(alpha: 0.15),
                                borderRadius:
                                    BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                  Icons.settings_outlined,
                                  color: Colors.white,
                                  size: 20),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Avatar
                Positioned(
                  bottom: -50,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: AppColors.brandGradientDiagonal,
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: Colors.white, width: 4),
                        boxShadow: AppColors.primaryGlowShadow,
                      ),
                      child: Center(
                        child: Text(
                          initial,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 40,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // spacing for avatar
          const SliverToBoxAdapter(child: SizedBox(height: 60)),
          // ── Name & info ────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  Text(
                    user?.name ?? 'مستخدم زائر',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? user?.phone ?? 'غير مسجل الدخول',
                    style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  // Stats row
                  Row(
                    children: [
                      _StatBox(label: 'المفضلة', value: '0'),
                      const SizedBox(width: 12),
                      _StatBox(label: 'التقييمات', value: '0'),
                      const SizedBox(width: 12),
                      _StatBox(label: 'الأشهر', value: '1'),
                    ],
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
          // ── Menu items ─────────────────────────────────────────────
          SliverPadding(
            padding:
                const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _ProfileMenuItem(
                  icon: Icons.favorite_border_rounded,
                  label: 'المفضلة',
                  onTap: () => context.push(AppRoutes.favorites),
                ),
                _ProfileMenuItem(
                  icon: Icons.notifications_none_rounded,
                  label: 'الإشعارات',
                  onTap: () => context.push(AppRoutes.notifications),
                ),
                _ProfileMenuItem(
                  icon: Icons.settings_outlined,
                  label: 'الإعدادات',
                  onTap: () => context.push(AppRoutes.settings),
                ),
                const SizedBox(height: 8),
                const Divider(color: AppColors.border),
                const SizedBox(height: 8),
                if (authState.isAuthenticated)
                  _ProfileMenuItem(
                    icon: Icons.logout_rounded,
                    label: 'تسجيل الخروج',
                    iconColor: AppColors.error,
                    textColor: AppColors.error,
                    onTap: () async {
                      await ref
                          .read(authNotifierProvider.notifier)
                          .logout();
                      if (context.mounted)
                        context.go(AppRoutes.login);
                    },
                  )
                else
                  _ProfileMenuItem(
                    icon: Icons.login_rounded,
                    label: 'تسجيل الدخول',
                    onTap: () => context.push(AppRoutes.login),
                  ),
                const SizedBox(height: 32),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label, value;
  const _StatBox({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          gradient: AppColors.brandGradientSubtle,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            ShaderMask(
              shaderCallback: (b) =>
                  AppColors.brandGradient.createShader(b),
              child: Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(label,
                style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? iconColor;
  final Color? textColor;
  const _ProfileMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.iconColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppColors.cardShadow,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: iconColor != null
                    ? null
                    : AppColors.brandGradient,
                color: iconColor != null
                    ? iconColor!.withValues(alpha: 0.1)
                    : null,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: iconColor ?? Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: textColor ?? AppColors.textPrimary,
                ),
              ),
            ),
            Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 14,
              color: iconColor ?? AppColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}
