import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_color_scheme.dart';

// ─── Keys ─────────────────────────────────────────────────────────────────────
const _kThemeMode   = 'pref_theme_mode';    // 'dark' | 'light' | 'system'
const _kAccentColor = 'pref_accent_color';  // index of AppAccentColor

// ─── State ────────────────────────────────────────────────────────────────────
class ThemeState {
  final ThemeMode themeMode;
  final AppAccentColor accentColor;

  const ThemeState({
    this.themeMode    = ThemeMode.dark,
    this.accentColor  = AppAccentColor.bluePurple,
  });

  AppColorScheme get scheme => AppColorSchemes.of(accentColor);

  ThemeState copyWith({ThemeMode? themeMode, AppAccentColor? accentColor}) =>
      ThemeState(
        themeMode:   themeMode   ?? this.themeMode,
        accentColor: accentColor ?? this.accentColor,
      );
}

// ─── Notifier ─────────────────────────────────────────────────────────────────
class ThemeNotifier extends Notifier<ThemeState> {
  @override
  ThemeState build() {
    _load();
    return const ThemeState();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = state.copyWith(themeMode: mode);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kThemeMode, mode.name);
  }

  Future<void> setAccentColor(AppAccentColor color) async {
    state = state.copyWith(accentColor: color);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kAccentColor, color.index);
  }

  void toggleThemeMode() {
    final next = state.themeMode == ThemeMode.dark
        ? ThemeMode.light
        : ThemeMode.dark;
    setThemeMode(next);
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();

    final modeStr = prefs.getString(_kThemeMode);
    final ThemeMode mode = switch (modeStr) {
      'light'  => ThemeMode.light,
      'system' => ThemeMode.system,
      _        => ThemeMode.dark,
    };

    final colorIdx = prefs.getInt(_kAccentColor) ?? 0;
    final accent = AppAccentColor.values[
      colorIdx.clamp(0, AppAccentColor.values.length - 1)
    ];

    state = ThemeState(themeMode: mode, accentColor: accent);
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
final themeNotifierProvider =
    NotifierProvider<ThemeNotifier, ThemeState>(ThemeNotifier.new);
