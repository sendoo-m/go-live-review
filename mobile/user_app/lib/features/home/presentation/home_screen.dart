import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../../config/routes.dart';
import '../../../services/notification_service.dart';
import '../../auth/providers/auth_provider.dart';
import '../../favorites/presentation/widgets/favorite_button.dart';
import '../../notifications/providers/notifications_provider.dart';
import '../providers/home_provider.dart';

// ─────────────────────────────────────────────────────────────────
// Convenience aliases — single source of truth from AppColors
// ─────────────────────────────────────────────────────────────────
const _kBlue     = AppColors.primary;
const _kPurple   = AppColors.accent;
const _kGradient = AppColors.brandGradient;
const _kHero     = AppColors.heroGradient;

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _headerCollapsed = false;

  @override
  void initState() {
    super.initState();
    NotificationService().initialize();
    NotificationService().onForegroundNotification.listen((payload) {
      if (mounted) NotificationService().showForegroundBanner(context, payload);
    });
    _scrollController.addListener(() {
      final collapsed = _scrollController.offset > 80;
      if (collapsed != _headerCollapsed) {
        setState(() => _headerCollapsed = collapsed);
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _handleLogout() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تسجيل الخروج'),
        content: const Text('هل أنت متأكد من رغبتك في تسجيل الخروج؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('تسجيل الخروج'),
          ),
        ],
      ),
    );
    if (ok == true && mounted) {
      await ref.read(authNotifierProvider.notifier).logout();
      if (mounted) context.go(AppRoutes.login);
    }
  }

  Future<void> _launchUrlHelper(String url) async {
    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('تعذر فتح الرابط: $url')),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('تعذر تنفيذ الإجراء: $url')),
        );
      }
    }
  }

  // ─── Build ────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final authState    = ref.watch(authNotifierProvider);
    final homeState    = ref.watch(homeNotifierProvider);
    final homeNotifier = ref.read(homeNotifierProvider.notifier);

    final appName      = homeState.bootstrap?.appName ?? AppStrings.appName;
    final userName     = authState.user?.name ?? 'زائر';
    final governorates = homeState.bootstrap?.governorates ?? [];
    final sections     = homeState.bootstrap?.sections ?? [];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: NestedScrollView(
        controller: _scrollController,
        headerSliverBuilder: (context, innerBoxScrolled) => [
          SliverAppBar(
            expandedHeight: 170,
            floating: false,
            pinned: true,
            elevation: 0,
            backgroundColor: Colors.transparent,
            flexibleSpace: LayoutBuilder(
              builder: (context, constraints) {
                final isCollapsed = constraints.maxHeight <=
                    kToolbarHeight + MediaQuery.of(context).padding.top;
                return Container(
                  decoration: BoxDecoration(
                    gradient: isCollapsed ? AppColors.brandGradient : _kHero,
                  ),
                  child: isCollapsed
                      ? _CollapsedHeader(appName: appName)
                      : _ExpandedHeader(
                          appName: appName,
                          userName: userName,
                          isAuthenticated: authState.isAuthenticated,
                        ),
                );
              },
            ),
            actions: [
              // Notifications badge
              Consumer(
                builder: (ctx, ref, _) {
                  final notifState = ref.watch(notificationsNotifierProvider);
                  return Semantics(
                    label: 'الإشعارات${notifState.unreadCount > 0 ? "، ${notifState.unreadCount} غير مقروء" : ""}',
                    button: true,
                    child: IconButton(
                      icon: notifState.unreadCount > 0
                          ? Badge(
                              label: Text('${notifState.unreadCount}'),
                              child: const Icon(
                                Icons.notifications_outlined,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(
                              Icons.notifications_outlined,
                              color: Colors.white,
                            ),
                      tooltip: 'الإشعارات',
                      onPressed: () => context.push(AppRoutes.notifications),
                    ),
                  );
                },
              ),
              // Avatar / account
              Padding(
                padding: const EdgeInsets.only(left: 8, right: 4),
                child: Semantics(
                  label: 'الحساب الشخصي',
                  button: true,
                  child: GestureDetector(
                    onTap: () => _showAccountSheet(authState),
                    child: CircleAvatar(
                      radius: 17,
                      backgroundColor: Colors.white.withValues(alpha: 0.25),
                      child: authState.isAuthenticated
                          ? Text(
                              authState.user!.name.isNotEmpty
                                  ? authState.user!.name[0].toUpperCase()
                                  : 'U',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            )
                          : const Icon(
                              Icons.person_outline,
                              color: Colors.white,
                              size: 18,
                            ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
        // ── Scrollable body ────────────────────────────────────────────────
        body: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async => homeNotifier.loadHomeData(refresh: true),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // ── Search Bar ──────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: _GlassSearchBar(
                    onTap: () => context.push(AppRoutes.search),
                    onMapTap: () => context.push(AppRoutes.map),
                  ),
                ),
              ),

              // ── Governorate Chips ────────────────────────────────────────
              if (governorates.isNotEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 4, bottom: 8),
                    child: SizedBox(
                      height: 40,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemCount: governorates.length + 1,
                        itemBuilder: (context, i) {
                          if (i == 0) {
                            return _GovChip(
                              label: 'كافة المحافظات',
                              selected: homeState.selectedGovernorateId == null,
                              onTap: () => homeNotifier.filterByGovernorate(null),
                            );
                          }
                          final gov = governorates[i - 1];
                          return _GovChip(
                            label: gov.nameAr,
                            selected: homeState.selectedGovernorateId == gov.id,
                            onTap: () => homeNotifier.filterByGovernorate(gov.id),
                          );
                        },
                      ),
                    ),
                  ),
                ),

              // ── Sections Header ──────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
                  child: Row(
                    children: [
                      Container(
                        width: 4,
                        height: 20,
                        decoration: BoxDecoration(
                          gradient: AppColors.brandGradient,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'تصفح حسب القسم',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E1B4B),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Sections Carousel ────────────────────────────────────────
              if (sections.isNotEmpty)
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 108,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: sections.length,
                      itemBuilder: (ctx, i) {
                        final s = sections[i];
                        final selected = homeState.selectedSectionId == s.id;
                        return _SectionCard(
                          section: s,
                          selected: selected,
                          onTap: () => homeNotifier.filterBySection(s.id),
                        );
                      },
                    ),
                  ),
                ),

              // ── Activities Header ────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 4,
                            height: 20,
                            decoration: BoxDecoration(
                              gradient: AppColors.brandGradient,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            homeState.selectedSectionId != null
                                ? 'الأنشطة المتاحة'
                                : AppStrings.featuredActivities,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E1B4B),
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          gradient: AppColors.brandGradient,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${homeState.featuredActivities.length} نشاط',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Activities Content ────────────────────────────────────────
              if (homeState.isLoading)
                // ✨ Skeleton shimmer instead of plain spinner
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (_, __) => const _SkeletonCard(),
                      childCount: 4,
                    ),
                  ),
                )
              else if (homeState.errorMessage != null)
                SliverFillRemaining(
                  child: _ErrorState(
                    message: homeState.errorMessage!,
                    onRetry: () => homeNotifier.loadHomeData(refresh: true),
                  ),
                )
              else if (homeState.featuredActivities.isEmpty)
                SliverFillRemaining(child: _EmptyState())
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (ctx, i) => _ActivityCard(
                        activity: homeState.featuredActivities[i],
                        onTap: () => context.push(
                            '/activity/${homeState.featuredActivities[i].id}'),
                        onCall: (phone) => _launchUrlHelper('tel:$phone'),
                        onWhatsApp: (wa) {
                          final clean =
                              wa.replaceAll('+', '').replaceAll(' ', '');
                          _launchUrlHelper('https://wa.me/$clean');
                        },
                      ),
                      childCount: homeState.featuredActivities.length,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),

      // ── Bottom Navigation ─────────────────────────────────────────────────
      bottomNavigationBar: _GradientBottomNav(
        currentIndex: 0,
        onTap: (i) {
          if (i == 1) context.push(AppRoutes.search);
          else if (i == 2) context.push(AppRoutes.map);
          else if (i == 3) context.push(AppRoutes.favorites);
          else if (i == 4) context.push(AppRoutes.profile);
        },
      ),
    );
  }

  void _showAccountSheet(AuthState authState) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      backgroundColor: Colors.white,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                gradient: AppColors.brandGradient,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  authState.user?.name.isNotEmpty == true
                      ? authState.user!.name[0].toUpperCase()
                      : 'U',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              authState.user?.name ?? 'مستخدم زائر',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              authState.user?.email ??
                  authState.user?.phone ??
                  'غير مسجل الدخول',
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 24),
            const Divider(),
            if (authState.isAuthenticated)
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.error),
                title: const Text('تسجيل الخروج',
                    style: TextStyle(color: AppColors.error)),
                onTap: () {
                  Navigator.pop(ctx);
                  _handleLogout();
                },
              )
            else
              ListTile(
                leading:
                    const Icon(Icons.login, color: AppColors.primary),
                title: const Text('تسجيل الدخول / إنشاء حساب'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push(AppRoutes.login);
                },
              ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// Private Widgets
// ═══════════════════════════════════════════════════════════════════

// ── Expanded Hero Header ───────────────────────────────────────────
class _ExpandedHeader extends StatelessWidget {
  final String appName;
  final String userName;
  final bool isAuthenticated;
  const _ExpandedHeader({
    required this.appName,
    required this.userName,
    required this.isAuthenticated,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  appName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              isAuthenticated ? 'أهلاً، $userName 👋' : 'اكتشف الخدمات حولك',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isAuthenticated
                  ? 'إيه اللي تدور عليه النهارده؟'
                  : 'محلات · حرف · خدمات · معلمين · بلوجرز',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.75),
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Collapsed Header ───────────────────────────────────────────────
class _CollapsedHeader extends StatelessWidget {
  final String appName;
  const _CollapsedHeader({required this.appName});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Align(
          alignment: AlignmentDirectional.centerStart,
          child: Text(
            appName,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Glass Search Bar ───────────────────────────────────────────────
class _GlassSearchBar extends StatelessWidget {
  final VoidCallback onTap;
  final VoidCallback onMapTap;
  const _GlassSearchBar({required this.onTap, required this.onMapTap});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Semantics(
            label: 'البحث عن متجر أو خدمة',
            button: true,
            child: GestureDetector(
              onTap: onTap,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.glowBlue,
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.15),
                  ),
                ),
                child: Row(
                  children: [
                    ShaderMask(
                      shaderCallback: (b) => AppColors.brandGradient.createShader(b),
                      child: const Icon(Icons.search_rounded,
                          color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text(
                        'ابحث عن متجر، خدمة أو منتج...',
                        style: TextStyle(
                            fontSize: 13, color: AppColors.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Semantics(
          label: 'عرض الخريطة',
          button: true,
          child: GestureDetector(
            onTap: onMapTap,
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                gradient: AppColors.brandGradient,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.glowPurple,
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(Icons.map_outlined,
                  color: Colors.white, size: 22),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Governorate Chip ───────────────────────────────────────────────
class _GovChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _GovChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Semantics(
        label: label,
        selected: selected,
        button: true,
        child: GestureDetector(
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              gradient: selected ? AppColors.brandGradient : null,
              color: selected ? null : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: selected
                    ? Colors.transparent
                    : AppColors.border,
              ),
              boxShadow: selected
                  ? [
                      BoxShadow(
                        color: AppColors.glowPurple,
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      )
                    ]
                  : [],
            ),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight:
                    selected ? FontWeight.bold : FontWeight.w500,
                color: selected ? Colors.white : AppColors.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Section Card ───────────────────────────────────────────────────
class _SectionCard extends StatelessWidget {
  final dynamic section;
  final bool selected;
  final VoidCallback onTap;
  const _SectionCard({
    required this.section,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: section.nameAr,
      selected: selected,
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 90,
          margin: const EdgeInsets.symmetric(horizontal: 5),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            gradient: selected ? AppColors.brandGradient : null,
            color: selected ? null : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? Colors.transparent : AppColors.border,
            ),
            boxShadow: [
              BoxShadow(
                color: selected
                    ? AppColors.glowPurple
                    : Colors.black.withValues(alpha: 0.05),
                blurRadius: selected ? 12 : 6,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _sectionIcon(
                section.icon,
                selected ? Colors.white : AppColors.primary,
              ),
              const SizedBox(height: 6),
              Text(
                section.nameAr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: selected
                      ? Colors.white
                      : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionIcon(String iconName, Color color) {
    switch (iconName.toLowerCase()) {
      case 'store':
      case 'shopping-bag':
        return Icon(Icons.storefront_rounded, color: color, size: 26);
      case 'hammer':
      case 'wrench':
      case 'crafts':
        return Icon(Icons.build_circle_rounded, color: color, size: 26);
      case 'briefcase':
      case 'services':
        return Icon(Icons.business_center_rounded, color: color, size: 26);
      case 'graduationcap':
      case 'graduation-cap':
      case 'teachers':
        return Icon(Icons.school_rounded, color: color, size: 26);
      case 'sparkles':
      case 'bloggers':
        return Icon(Icons.auto_awesome_rounded, color: color, size: 26);
      default:
        return Icon(Icons.category_rounded, color: color, size: 26);
    }
  }
}

// ── Activity Card ──────────────────────────────────────────────────
class _ActivityCard extends StatelessWidget {
  final ActivityModel activity;
  final VoidCallback onTap;
  final Function(String) onCall;
  final Function(String) onWhatsApp;
  const _ActivityCard({
    required this.activity,
    required this.onTap,
    required this.onCall,
    required this.onWhatsApp,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '${activity.nameAr}، ${activity.categoryNameAr ?? "عام"}، ${activity.governorateNameAr ?? "مصر"}',
      button: true,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(20),
            splashColor: AppColors.primaryLight,
            highlightColor: AppColors.brandGradientSubtle.colors.first
                .withValues(alpha: 0.3),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Top row ────────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Logo
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(14),
                            gradient: AppColors.brandGradient,
                            image: (activity.coverUrl ?? '').isNotEmpty
                                ? DecorationImage(
                                    image:
                                        NetworkImage(activity.coverUrl!),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: (activity.coverUrl ?? '').isEmpty
                              ? const Icon(Icons.storefront_rounded,
                                  color: Colors.white, size: 28)
                              : null,
                        ),
                        const SizedBox(width: 12),

                        // Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      activity.nameAr,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 15,
                                        color: AppColors.textPrimary,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (activity.status == 'verified')
                                    ShaderMask(
                                      shaderCallback: (b) =>
                                          AppColors.brandGradient
                                              .createShader(b),
                                      child: const Icon(
                                          Icons.verified_rounded,
                                          size: 16,
                                          color: Colors.white),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${activity.categoryNameAr ?? "عام"} · ${activity.governorateNameAr ?? "مصر"}',
                                style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 12),
                              ),
                              if ((activity.addressAr ?? '').isNotEmpty) ...[
                                const SizedBox(height: 2),
                                Text(
                                  activity.addressAr!,
                                  style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 11),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),

                        // Rating + Favorite
                        Column(
                          children: [
                            FavoriteButton(activity: activity),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                gradient: AppColors.brandGradient,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.star_rounded,
                                      size: 13, color: Colors.white),
                                  const SizedBox(width: 3),
                                  Text(
                                    activity.ratingAvg.toStringAsFixed(1),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // ── Divider ────────────────────────────────────────
                  const Divider(
                      height: 1,
                      thickness: 1,
                      color: AppColors.surfaceElevated),

                  // ── Action Buttons ─────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
                    child: Row(
                      children: [
                        if ((activity.phone ?? '').isNotEmpty) ...[
                          Expanded(
                            child: _ActionButton(
                              icon: Icons.call_rounded,
                              label: 'اتصال',
                              gradient: null,
                              borderColor: AppColors.primary
                                  .withValues(alpha: 0.3),
                              textColor: AppColors.primary,
                              iconColor: AppColors.primary,
                              onTap: () => onCall(activity.phone!),
                            ),
                          ),
                          const SizedBox(width: 10),
                        ],
                        if ((activity.whatsapp ?? '').isNotEmpty)
                          Expanded(
                            child: _ActionButton(
                              icon: Icons.chat_bubble_rounded,
                              label: 'واتساب',
                              gradient: const LinearGradient(
                                colors: [
                                  AppColors.whatsapp,
                                  AppColors.whatsappDark,
                                ],
                              ),
                              borderColor: Colors.transparent,
                              textColor: Colors.white,
                              iconColor: Colors.white,
                              onTap: () => onWhatsApp(activity.whatsapp!),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Action Button ──────────────────────────────────────────────────
class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final LinearGradient? gradient;
  final Color borderColor;
  final Color textColor;
  final Color iconColor;
  final VoidCallback onTap;
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.gradient,
    required this.borderColor,
    required this.textColor,
    required this.iconColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: label,
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            gradient: gradient,
            color: gradient == null ? Colors.white : null,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: iconColor),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  color: textColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── ✨ Skeleton Card (shimmer loading) ─────────────────────────────
class _SkeletonCard extends StatefulWidget {
  const _SkeletonCard();

  @override
  State<_SkeletonCard> createState() => _SkeletonCardState();
}

class _SkeletonCardState extends State<_SkeletonCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) {
        final shimmer = Color.lerp(
          AppColors.surfaceElevated,
          AppColors.border,
          _anim.value,
        )!;
        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: AppColors.cardShadow,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo placeholder
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: shimmer,
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              const SizedBox(width: 12),
              // Text lines
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 14,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: shimmer,
                        borderRadius: BorderRadius.circular(7),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 12,
                      width: 140,
                      decoration: BoxDecoration(
                        color: shimmer,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 10,
                      width: 100,
                      decoration: BoxDecoration(
                        color: shimmer,
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                  ],
                ),
              ),
              // Rating placeholder
              Container(
                width: 44,
                height: 22,
                decoration: BoxDecoration(
                  color: shimmer,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── Gradient Bottom Nav ────────────────────────────────────────────
class _GradientBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  const _GradientBottomNav({
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.home_rounded, Icons.home_outlined, AppStrings.navHome),
      (Icons.search_rounded, Icons.search_outlined, AppStrings.navSearch),
      (Icons.map_rounded, Icons.map_outlined, AppStrings.navMap),
      (Icons.favorite_rounded, Icons.favorite_border_rounded, 'المفضلة'),
      (Icons.person_rounded, Icons.person_outline_rounded, AppStrings.navProfile),
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.glowPurple,
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (i) {
              final selected = i == currentIndex;
              return Semantics(
                label: items[i].$3,
                selected: selected,
                button: true,
                child: GestureDetector(
                  onTap: () => onTap(i),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 6),
                    decoration: selected
                        ? BoxDecoration(
                            gradient: AppColors.brandGradient,
                            borderRadius: BorderRadius.circular(20),
                          )
                        : null,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          selected ? items[i].$1 : items[i].$2,
                          color: selected
                              ? Colors.white
                              : AppColors.textMuted,
                          size: 22,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          items[i].$3,
                          style: TextStyle(
                            fontSize: 10,
                            color: selected
                                ? Colors.white
                                : AppColors.textMuted,
                            fontWeight: selected
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

// ── Error State ────────────────────────────────────────────────────
class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ShaderMask(
              shaderCallback: (b) =>
                  AppColors.brandGradient.createShader(b),
              child: const Icon(Icons.wifi_off_rounded,
                  size: 56, color: Colors.white),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: onRetry,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 28, vertical: 12),
                decoration: AppColors.brandBoxDecorationRounded(radius: 14),
                child: const Text(
                  AppStrings.retry,
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Empty State ────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ShaderMask(
            shaderCallback: (b) =>
                AppColors.brandGradient.createShader(b),
            child: const Icon(Icons.search_off_rounded,
                size: 56, color: Colors.white),
          ),
          const SizedBox(height: 16),
          const Text(
            AppStrings.noResults,
            style: TextStyle(
                fontSize: 14, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
