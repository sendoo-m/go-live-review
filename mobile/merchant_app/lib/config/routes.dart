import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/splash/presentation/splash_screen.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/dashboard/presentation/dashboard_screen.dart';
import '../features/profile/presentation/merchant_profile_screen.dart';
import '../features/catalog/presentation/merchant_catalog_screen.dart';
import '../features/offers/presentation/offers_screen.dart';
import '../features/media/presentation/media_gallery_screen.dart';
import '../features/inquiries/presentation/inquiries_inbox_screen.dart';
import '../features/inquiries/presentation/inquiry_details_screen.dart';

class MerchantRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String profile = '/profile';
  static const String activities = '/activities';
  static const String products = '/products';
  static const String offers = '/offers';
  static const String media = '/media';
  static const String inquiries = '/inquiries';
  static String inquiryDetails(int id) => '/inquiries/$id';
  static const String subscription = '/subscription';
}

final GoRouter merchantRouter = GoRouter(
  initialLocation: MerchantRoutes.splash,
  routes: [
    GoRoute(
      path: MerchantRoutes.splash,
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: MerchantRoutes.login,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: MerchantRoutes.dashboard,
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: MerchantRoutes.profile,
      builder: (context, state) => const MerchantProfileScreen(),
    ),
    GoRoute(
      path: MerchantRoutes.activities,
      builder: (context, state) => const MerchantProfileScreen(),
    ),
    GoRoute(
      path: MerchantRoutes.products,
      builder: (context, state) => const MerchantCatalogScreen(),
    ),
    GoRoute(
      path: MerchantRoutes.offers,
      builder: (context, state) => const OffersScreen(),
    ),
    GoRoute(
      path: MerchantRoutes.media,
      builder: (context, state) => const MediaGalleryScreen(),
    ),
    GoRoute(
      path: MerchantRoutes.inquiries,
      builder: (context, state) => const InquiriesInboxScreen(),
    ),
    GoRoute(
      path: '/inquiries/:id',
      builder: (context, state) {
        final id = int.tryParse(state.pathParameters['id'] ?? '0') ?? 0;
        return InquiryDetailsScreen(inquiryId: id);
      },
    ),
  ],
);
