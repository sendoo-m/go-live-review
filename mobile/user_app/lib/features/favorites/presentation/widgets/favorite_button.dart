import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../providers/favorites_provider.dart';

class FavoriteButton extends ConsumerWidget {
  final ActivityModel activity;
  final double size;
  final bool hasBackground;
  final Color? iconColor;
  final Color? activeColor;
  final VoidCallback? onToggle;

  const FavoriteButton({
    super.key,
    required this.activity,
    this.size = 22,
    this.hasBackground = false,
    this.iconColor,
    this.activeColor,
    this.onToggle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesState = ref.watch(favoritesProvider);
    final isFav = favoritesState.isFavorite(activity.id);

    final resolvedActiveColor = activeColor ?? AppColors.error;
    final resolvedIconColor = iconColor ?? (hasBackground ? Colors.white : AppColors.textMuted);

    Widget iconWidget = Icon(
      isFav ? Icons.favorite : Icons.favorite_border,
      color: isFav ? resolvedActiveColor : resolvedIconColor,
      size: size,
    );

    if (hasBackground) {
      iconWidget = Container(
        padding: const EdgeInsets.all(7),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.45),
          shape: BoxShape.circle,
        ),
        child: iconWidget,
      );
    }

    return IconButton(
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints(),
      icon: iconWidget,
      tooltip: isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة',
      onPressed: () async {
        final nowFav = await ref.read(favoritesProvider.notifier).toggleFavorite(activity);
        onToggle?.call();
        if (context.mounted) {
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                nowFav
                    ? 'تمت إضافة "${activity.nameAr}" إلى المفضلة'
                    : 'تمت إزالة "${activity.nameAr}" من المفضلة',
              ),
              duration: const Duration(seconds: 2),
              backgroundColor: nowFav ? AppColors.primary : AppColors.textSecondary,
            ),
          );
        }
      },
    );
  }
}
