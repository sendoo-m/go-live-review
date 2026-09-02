import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../favorites/presentation/widgets/favorite_button.dart';

final _searchQueryProvider = StateProvider<String>((ref) => '');
final _selectedCatProvider = StateProvider<String?>((ref) => null);

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _ctrl = TextEditingController();
  final _focus = FocusNode();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focus.requestFocus();
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _focus.dispose();
    super.dispose();
  }

  static const _categories = [
    'الكل', 'محلات', 'حرف', 'خدمات', 'معلمين', 'بلوجرز',
  ];

  @override
  Widget build(BuildContext context) {
    final query    = ref.watch(_searchQueryProvider);
    final selCat   = ref.watch(_selectedCatProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // ── Header ──────────────────────────────────────────────────
          Container(
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
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                                Icons.arrow_forward_ios_rounded,
                                color: Colors.white,
                                size: 18),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            height: 46,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                  color:
                                      Colors.white.withValues(alpha: 0.3)),
                            ),
                            child: TextField(
                              controller: _ctrl,
                              focusNode: _focus,
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 14),
                              decoration: InputDecoration(
                                hintText: 'ابحث عن متجر أو خدمة...',
                                hintStyle: TextStyle(
                                    color:
                                        Colors.white.withValues(alpha: 0.6),
                                    fontSize: 13),
                                prefixIcon: const Icon(
                                    Icons.search_rounded,
                                    color: Colors.white,
                                    size: 20),
                                suffixIcon: query.isNotEmpty
                                    ? IconButton(
                                        icon: const Icon(
                                            Icons.clear_rounded,
                                            color: Colors.white,
                                            size: 18),
                                        onPressed: () {
                                          _ctrl.clear();
                                          ref
                                              .read(_searchQueryProvider
                                                  .notifier)
                                              .state = '';
                                        },
                                      )
                                    : null,
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(
                                    vertical: 13),
                              ),
                              onChanged: (v) {
                                ref
                                    .read(_searchQueryProvider.notifier)
                                    .state = v;
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Category chips
                    SizedBox(
                      height: 34,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _categories.length,
                        itemBuilder: (_, i) {
                          final cat = _categories[i];
                          final sel = (i == 0 && selCat == null) ||
                              selCat == cat;
                          return Padding(
                            padding:
                                const EdgeInsets.only(left: 8),
                            child: GestureDetector(
                              onTap: () {
                                ref
                                    .read(_selectedCatProvider.notifier)
                                    .state = i == 0 ? null : cat;
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 180),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 6),
                                decoration: BoxDecoration(
                                  gradient: sel
                                      ? AppColors.brandGradient
                                      : null,
                                  color: sel
                                      ? null
                                      : Colors.white
                                          .withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(20),
                                  border: sel
                                      ? null
                                      : Border.all(
                                          color: Colors.white
                                              .withValues(alpha: 0.3)),
                                ),
                                child: Text(
                                  cat,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── Results ─────────────────────────────────────────────────
          Expanded(
            child: query.isEmpty
                ? _SearchSuggestions()
                : _SearchResults(query: query, category: selCat),
          ),
        ],
      ),
    );
  }
}

class _SearchSuggestions extends StatelessWidget {
  static const _recent = [
    'سباك في الإسماعيلية',
    'محل ملابس',
    'معلم رياضيات',
    'كهربائي منازل',
  ];

  static const _popular = [
    'صيانة', 'تسليك', 'دروس خصوصية',
    'تصوير', 'ديكور', 'سباكة',
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Recent
        Row(
          children: [
            ShaderMask(
              shaderCallback: (b) => AppColors.brandGradient.createShader(b),
              child: const Icon(Icons.history_rounded,
                  color: Colors.white, size: 18),
            ),
            const SizedBox(width: 8),
            const Text('عمليات البحث الأخيرة',
                style:
                    TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          ],
        ),
        const SizedBox(height: 12),
        ..._recent.map((r) => ListTile(
              contentPadding: EdgeInsets.zero,
              leading: ShaderMask(
                shaderCallback: (b) =>
                    AppColors.brandGradient.createShader(b),
                child: const Icon(Icons.search_rounded,
                    color: Colors.white, size: 20),
              ),
              title: Text(r,
                  style: const TextStyle(
                      fontSize: 14, color: AppColors.textPrimary)),
              trailing: const Icon(Icons.north_west_rounded,
                  size: 16, color: AppColors.textMuted),
            )),
        const SizedBox(height: 20),
        const Divider(color: AppColors.border),
        const SizedBox(height: 16),
        // Popular
        Row(
          children: [
            ShaderMask(
              shaderCallback: (b) => AppColors.brandGradient.createShader(b),
              child: const Icon(Icons.local_fire_department_rounded,
                  color: Colors.white, size: 18),
            ),
            const SizedBox(width: 8),
            const Text('الأكثر بحثاً',
                style:
                    TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _popular
              .map((p) => GestureDetector(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: AppColors.brandGradientSubtle,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        p,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }
}

class _SearchResults extends ConsumerWidget {
  final String query;
  final String? category;
  const _SearchResults({required this.query, this.category});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Mock results — replace with actual provider
    final results = List.generate(
      5,
      (i) => _MockResult(
        name: '$query — نتيجة ${i + 1}',
        cat: category ?? 'خدمات',
        gov: 'الإسماعيلية',
        rating: 4.2 + i * 0.1,
      ),
    );

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: results.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _ResultTile(result: results[i]),
    );
  }
}

class _MockResult {
  final String name, cat, gov;
  final double rating;
  const _MockResult(
      {required this.name,
      required this.cat,
      required this.gov,
      required this.rating});
}

class _ResultTile extends StatelessWidget {
  final _MockResult result;
  const _ResultTile({required this.result});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.cardShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              gradient: AppColors.brandGradient,
              borderRadius: BorderRadius.circular(13),
            ),
            child: const Icon(Icons.storefront_rounded,
                color: Colors.white, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(result.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: AppColors.textPrimary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 3),
                Text(
                  '${result.cat} · ${result.gov}',
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              gradient: AppColors.brandGradient,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.star_rounded,
                    size: 12, color: Colors.white),
                const SizedBox(width: 3),
                Text(
                  result.rating.toStringAsFixed(1),
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
