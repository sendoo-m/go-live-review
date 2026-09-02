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
import '../../search/providers/search_provider.dart';
import '../providers/home_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _currentNavIndex = 0;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Initialize notifications and check for incoming notifications
    NotificationService().initialize();
    NotificationService().onForegroundNotification.listen((payload) {
      if (mounted) {
        NotificationService().showForegroundBanner(context, payload);
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _handleLogout() async {
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تسجيل الخروج'),
        content: const Text('هل أنت متأكد من رغبتك في تسجيل الخروج من التطبيق؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء'),
          ),
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

    if (shouldLogout == true && mounted) {
      await ref.read(authNotifierProvider.notifier).logout();
      if (mounted) {
        context.go(AppRoutes.login);
      }
    }
  }

  Future<void> _launchUrlHelper(String urlStr) async {
    final uri = Uri.parse(urlStr);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('تعذر فتح الرابط: $urlStr')),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('تعذر تنفيذ الإجراء: $urlStr')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final homeState = ref.watch(homeNotifierProvider);
    final homeNotifier = ref.read(homeNotifierProvider.notifier);

    final appName = homeState.bootstrap?.appName ?? AppStrings.appName;
    final userName = authState.user?.name ?? 'زائر كرام';
    final governorates = homeState.bootstrap?.governorates ?? [];
    final sections = homeState.bootstrap?.sections ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text(
              appName,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            if (authState.isAuthenticated)
              Text(
                'أهلاً بك، $userName',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              )
            else
              const Text(
                'تصفح واستكشف الخدمات في مصر',
                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: Consumer(
              builder: (context, ref, _) {
                final notifState = ref.watch(notificationsNotifierProvider);
                if (notifState.unreadCount > 0) {
                  return Badge(
                    label: Text('${notifState.unreadCount}'),
                    child: const Icon(Icons.notifications_outlined),
                  );
                }
                return const Icon(Icons.notifications_outlined);
              },
            ),
            tooltip: 'الإشعارات',
            onPressed: () => context.push(AppRoutes.notifications),
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'الإعدادات',
            onPressed: () => context.push(AppRoutes.settings),
          ),
          if (!authState.isAuthenticated)
            TextButton.icon(
              onPressed: () {
                context.push(AppRoutes.login);
              },
              icon: const Icon(Icons.login, size: 18),
              label: const Text('دخول'),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await homeNotifier.loadHomeData(refresh: true);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Search Bar & Location Filter Row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () {
                          context.push(AppRoutes.search);
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.04),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            children: const [
                              Icon(Icons.search, color: AppColors.primary, size: 22),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'ابحث عن متجر، خدمة، صيانة أو منتج...',
                                  style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.map_outlined, color: AppColors.primary),
                        tooltip: 'الخريطة التفاعلية',
                        onPressed: () => context.push(AppRoutes.map),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // 2. Location Filter Chips (Governorates)
              if (governorates.isNotEmpty) ...[
                SizedBox(
                  height: 38,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: governorates.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        final isSelected = homeState.selectedGovernorateId == null;
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: FilterChip(
                            label: const Text('كافة المحافظات'),
                            selected: isSelected,
                            selectedColor: AppColors.primaryLight,
                            checkmarkColor: AppColors.primary,
                            labelStyle: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              color: isSelected ? AppColors.primary : AppColors.textPrimary,
                            ),
                            onSelected: (_) {
                              homeNotifier.filterByGovernorate(null);
                            },
                          ),
                        );
                      }
                      final gov = governorates[index - 1];
                      final isSelected = homeState.selectedGovernorateId == gov.id;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: FilterChip(
                          label: Text(gov.nameAr),
                          selected: isSelected,
                          selectedColor: AppColors.primaryLight,
                          checkmarkColor: AppColors.primary,
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                          ),
                          onSelected: (_) {
                            homeNotifier.filterByGovernorate(gov.id);
                          },
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // 3. Sections Carousel
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  AppStrings.browseCategories,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(height: 10),

              if (sections.isNotEmpty)
                SizedBox(
                  height: 95,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: sections.length,
                    itemBuilder: (context, index) {
                      final section = sections[index];
                      final isSelected = homeState.selectedSectionId == section.id;

                      return GestureDetector(
                        onTap: () {
                          homeNotifier.filterBySection(section.id);
                        },
                        child: Container(
                          width: 105,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primaryLight : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _getSectionIcon(section.icon, isSelected ? AppColors.primary : AppColors.textSecondary),
                              const SizedBox(height: 6),
                              Text(
                                section.nameAr,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 24),

              // 4. Featured Activities Section Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      homeState.selectedSectionId != null
                          ? 'الأنشطة المتاحة في هذا القسم'
                          : AppStrings.featuredActivities,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${homeState.featuredActivities.length} نشاط',
                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),

              // 5. Activities Content: Loading, Error, Empty, or List
              if (homeState.isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (homeState.errorMessage != null)
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
                      const SizedBox(height: 12),
                      Text(
                        homeState.errorMessage!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => homeNotifier.loadHomeData(refresh: true),
                        icon: const Icon(Icons.refresh),
                        label: const Text(AppStrings.retry),
                      ),
                    ],
                  ),
                )
              else if (homeState.featuredActivities.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.search_off_rounded, size: 48, color: AppColors.textMuted.withOpacity(0.5)),
                        const SizedBox(height: 12),
                        const Text(
                          AppStrings.noResults,
                          style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: homeState.featuredActivities.length,
                  itemBuilder: (context, index) {
                    final activity = homeState.featuredActivities[index];
                    return _buildActivityCard(activity);
                  },
                ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentNavIndex,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() {
            _currentNavIndex = index;
          });
          if (index == 1) {
            context.push(AppRoutes.search);
          } else if (index == 2) {
            context.push(AppRoutes.map);
          } else if (index == 3) {
            context.push(AppRoutes.favorites);
          } else if (index == 4) {
            context.push(AppRoutes.profile);
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: AppStrings.navHome),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: AppStrings.navSearch),
          BottomNavigationBarItem(icon: Icon(Icons.map_outlined), label: AppStrings.navMap),
          BottomNavigationBarItem(icon: Icon(Icons.favorite_border), label: 'المفضلة'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: AppStrings.navProfile),
        ],
      ),
    );
  }

  Widget _buildActivityCard(ActivityModel activity) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          context.push('/activity/${activity.id}');
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo / Image
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(10),
                      image: activity.logoUrl != null && activity.logoUrl!.isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(activity.logoUrl!),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: activity.logoUrl == null || activity.logoUrl!.isEmpty
                        ? const Icon(Icons.storefront, color: AppColors.primary, size: 28)
                        : null,
                  ),
                  const SizedBox(width: 12),

                  // Main Info
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
                            if (activity.isVerified) ...[
                              const SizedBox(width: 4),
                              const Icon(Icons.verified, size: 16, color: AppColors.primary),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${activity.categoryNameAr ?? 'عام'} • ${activity.governorateNameAr ?? 'مصر'}',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                        if (activity.addressAr != null && activity.addressAr!.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            activity.addressAr!,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),

                  // Rating Badge & Favorite Button
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      FavoriteButton(activity: activity),
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.secondaryLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.star, size: 14, color: AppColors.secondary),
                            const SizedBox(width: 4),
                            Text(
                              activity.ratingAvg.toStringAsFixed(1),
                              style: const TextStyle(
                                color: AppColors.secondary,
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
              const SizedBox(height: 12),
              const Divider(height: 1, color: AppColors.border),
              const SizedBox(height: 10),

              // Action Buttons (Call / WhatsApp)
              Row(
                children: [
                  if (activity.phone != null && activity.phone!.isNotEmpty) ...[
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _launchUrlHelper('tel:${activity.phone}'),
                        icon: const Icon(Icons.call, size: 16, color: AppColors.primary),
                        label: const Text(
                          'اتصال',
                          style: TextStyle(fontSize: 12, color: AppColors.primary),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          side: const BorderSide(color: AppColors.border),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  if (activity.whatsapp != null && activity.whatsapp!.isNotEmpty) ...[
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          final cleanPhone = activity.whatsapp!.replaceAll('+', '').replaceAll(' ', '');
                          _launchUrlHelper('https://wa.me/$cleanPhone');
                        },
                        icon: const Icon(Icons.chat, size: 16, color: Colors.white),
                        label: const Text(
                          'واتساب',
                          style: TextStyle(fontSize: 12, color: Colors.white),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF25D366),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAccountSheet(AuthState authState) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
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
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.primaryLight,
                  child: Text(
                    authState.user?.name.isNotEmpty == true ? authState.user!.name[0] : 'U',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        authState.user?.name ?? 'مستخدم زائر',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        authState.user?.email ?? authState.user?.phone ?? 'غير مسجل الدخول',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Divider(),
            if (authState.isAuthenticated) ...[
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.error),
                title: const Text('تسجيل الخروج', style: TextStyle(color: AppColors.error)),
                onTap: () {
                  Navigator.pop(ctx);
                  _handleLogout();
                },
              ),
            ] else ...[
              ListTile(
                leading: const Icon(Icons.login, color: AppColors.primary),
                title: const Text('تسجيل الدخول / إنشاء حساب'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push(AppRoutes.login);
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _getSectionIcon(String iconName, Color color) {
    switch (iconName.toLowerCase()) {
      case 'shopping-bag':
      case 'store':
      case 'stores':
        return Icon(Icons.storefront, color: color, size: 26);
      case 'wrench':
      case 'crafts':
      case 'hammer':
        return Icon(Icons.build_circle, color: color, size: 26);
      case 'heart-pulse':
      case 'doctor':
      case 'health':
        return Icon(Icons.local_hospital, color: color, size: 26);
      case 'graduation-cap':
      case 'education':
      case 'school':
        return Icon(Icons.school, color: color, size: 26);
      case 'car':
      case 'truck':
        return Icon(Icons.directions_car, color: color, size: 26);
      default:
        return Icon(Icons.category, color: color, size: 26);
    }
  }
}
