import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/theme/app_theme.dart';
import 'package:daleel_core/theme/theme_provider.dart';
import 'config/routes.dart';

class DaleelUserApp extends ConsumerWidget {
  const DaleelUserApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeState = ref.watch(themeNotifierProvider);
    final scheme     = themeState.scheme;

    return MaterialApp.router(
      title:                      'دليل أي خدمة',
      debugShowCheckedModeBanner: false,

      // ── Dynamic themes ──────────────────────────────────────────────────────
      themeMode: themeState.themeMode,
      theme: AppTheme.build(
        scheme:     scheme,
        brightness: Brightness.light,
      ),
      darkTheme: AppTheme.build(
        scheme:     scheme,
        brightness: Brightness.dark,
      ),

      routerConfig: appRouter,

      // ── Localisation ────────────────────────────────────────────────────────
      locale: const Locale('ar', 'EG'),
      supportedLocales: const [
        Locale('ar', 'EG'),
        Locale('en', 'US'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}
