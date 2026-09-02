import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../config/routes.dart';

class ParsedDeepLink {
  final String routePath;
  final Map<String, String> queryParams;
  final bool requiresAuth;

  ParsedDeepLink({
    required this.routePath,
    this.queryParams = const {},
    this.requiresAuth = false,
  });

  @override
  String toString() => 'ParsedDeepLink(route: $routePath, params: $queryParams, requiresAuth: $requiresAuth)';
}

class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._internal();
  factory DeepLinkService() => _instance;
  DeepLinkService._internal();

  /// Supported custom schemes and domains
  static const List<String> supportedSchemes = ['daleel', 'daleelapp'];
  static const List<String> supportedHosts = [
    'dalilaykhidma.com',
    'www.dalilaykhidma.com',
    'daleelaykhidma.com',
    'www.daleelaykhidma.com',
    'aykhidma.com',
    'www.aykhidma.com',
    'example.com',
    'ais-dev-btvvpybazsg3thwohpcxuu-530193892223.europe-west2.run.app',
    'ais-pre-btvvpybazsg3thwohpcxuu-530193892223.europe-west2.run.app',
  ];

  /// Parse any incoming URI into a structured app route
  ParsedDeepLink? parseUri(Uri uri) {
    final scheme = uri.scheme.toLowerCase();
    final host = uri.host.toLowerCase();
    String path = uri.path;

    // Handle custom scheme: daleel://activity/123 or daleel://search?q=مطعم
    if (supportedSchemes.contains(scheme)) {
      // In custom schemes like daleel://activity/123, 'activity' is the host and '/123' is the path
      if (host.isNotEmpty) {
        path = '/$host$path';
      }
    } else if (scheme == 'http' || scheme == 'https') {
      // Universal link: https://daleelaykhidma.com/activity/123
      // path is already /activity/123
    } else {
      // Check if raw string without scheme was passed
      if (!path.startsWith('/')) {
        path = '/$path';
      }
    }

    // Clean multiple slashes
    path = path.replaceAll(RegExp(r'/+'), '/');

    // Route matching logic
    if (path == '/' || path == '/home' || path.isEmpty) {
      return ParsedDeepLink(routePath: AppRoutes.home);
    }

    // Activity Details: /activity/123 or /activities/123
    final activityMatch = RegExp(r'^/(?:activity|activities)/([0-9a-zA-Z\-_]+)$').firstMatch(path);
    if (activityMatch != null) {
      final idOrSlug = activityMatch.group(1)!;
      return ParsedDeepLink(
        routePath: '/activity/$idOrSlug',
        queryParams: uri.queryParameters,
      );
    }

    // Search: /search
    if (path.startsWith('/search')) {
      return ParsedDeepLink(
        routePath: AppRoutes.search,
        queryParams: uri.queryParameters,
      );
    }

    // Search Results / Filtered: /results
    if (path.startsWith('/results')) {
      return ParsedDeepLink(
        routePath: AppRoutes.searchResults,
        queryParams: uri.queryParameters,
      );
    }

    // Map: /map
    if (path.startsWith('/map')) {
      return ParsedDeepLink(
        routePath: AppRoutes.map,
        queryParams: uri.queryParameters,
      );
    }

    // Favorites: /favorites
    if (path.startsWith('/favorites')) {
      return ParsedDeepLink(
        routePath: AppRoutes.favorites,
        queryParams: uri.queryParameters,
      );
    }

    // Profile & Account: /profile or /account
    if (path.startsWith('/profile') || path.startsWith('/account')) {
      return ParsedDeepLink(
        routePath: AppRoutes.profile,
        queryParams: uri.queryParameters,
        requiresAuth: true,
      );
    }

    // Settings: /settings
    if (path.startsWith('/settings')) {
      return ParsedDeepLink(
        routePath: AppRoutes.settings,
        queryParams: uri.queryParameters,
      );
    }

    // Notifications Inbox: /notifications
    if (path.startsWith('/notifications')) {
      return ParsedDeepLink(
        routePath: AppRoutes.notifications,
        queryParams: uri.queryParameters,
      );
    }

    // Fallback to Home if path is unrecognized
    return ParsedDeepLink(routePath: AppRoutes.home);
  }

  /// Navigate immediately with GoRouter context
  bool navigateToDeepLink(BuildContext context, String rawUrl) {
    try {
      final uri = Uri.parse(rawUrl);
      final parsed = parseUri(uri);
      if (parsed != null) {
        context.push(parsed.routePath);
        return true;
      }
    } catch (_) {}
    return false;
  }
}
