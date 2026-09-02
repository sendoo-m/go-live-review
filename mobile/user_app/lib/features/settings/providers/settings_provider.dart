import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository();
});

class SettingsNotifier extends StateNotifier<AsyncValue<AppSettingsModel>> {
  final SettingsRepository _repository;

  SettingsNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadSettings();
  }

  Future<void> loadSettings() async {
    state = const AsyncValue.loading();
    try {
      final settings = await _repository.loadSettings();
      state = AsyncValue.data(settings);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> setLanguage(String lang) async {
    final current = state.value ?? const AppSettingsModel();
    final updated = current.copyWith(language: lang);
    state = AsyncValue.data(updated);
    await _repository.saveSettings(updated);
  }

  Future<void> setDefaultGovernorate(int? id, String? name) async {
    final current = state.value ?? const AppSettingsModel();
    final updated = current.copyWith(
      defaultGovernorateId: id,
      defaultGovernorateName: name,
    );
    state = AsyncValue.data(updated);
    await _repository.saveSettings(updated);
  }

  Future<void> togglePushNotifications(bool enabled) async {
    final current = state.value ?? const AppSettingsModel();
    final updated = current.copyWith(pushNotificationsEnabled: enabled);
    state = AsyncValue.data(updated);
    await _repository.saveSettings(updated);
  }

  Future<void> toggleOfferNotifications(bool enabled) async {
    final current = state.value ?? const AppSettingsModel();
    final updated = current.copyWith(offerNotificationsEnabled: enabled);
    state = AsyncValue.data(updated);
    await _repository.saveSettings(updated);
  }

  Future<void> toggleSystemAlerts(bool enabled) async {
    final current = state.value ?? const AppSettingsModel();
    final updated = current.copyWith(systemAlertsEnabled: enabled);
    state = AsyncValue.data(updated);
    await _repository.saveSettings(updated);
  }

  Future<void> clearSearchHistory() async {
    await _repository.clearSearchHistory();
    final current = state.value ?? const AppSettingsModel();
    final updated = current.copyWith(searchHistory: []);
    state = AsyncValue.data(updated);
  }
}

final settingsNotifierProvider = StateNotifierProvider<SettingsNotifier, AsyncValue<AppSettingsModel>>((ref) {
  final repo = ref.watch(settingsRepositoryProvider);
  return SettingsNotifier(repo);
});
