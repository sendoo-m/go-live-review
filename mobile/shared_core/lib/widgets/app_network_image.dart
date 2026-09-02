import 'package:flutter/material.dart';

enum ImageVariant {
  thumbnail,
  card,
  detail,
  cover,
  avatar,
  gallery,
  original,
}

class AppNetworkImage extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadiusGeometry? borderRadius;
  final ImageVariant variant;
  final Widget? placeholder;
  final Widget? errorWidget;
  final Color? backgroundColor;

  const AppNetworkImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.variant = ImageVariant.original,
    this.placeholder,
    this.errorWidget,
    this.backgroundColor,
  });

  /// Derives variant URL if custom CDN transforms are configured
  String _resolveUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    // Cloudflare R2 / Custom CDN URL optimization logic if enabled
    return url;
  }

  @override
  Widget build(BuildContext context) {
    final effectiveUrl = _resolveUrl(imageUrl);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final defaultBg = backgroundColor ?? (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9));

    Widget imageContent;

    if (effectiveUrl.isEmpty) {
      imageContent = errorWidget ?? _buildDefaultPlaceholder(isDark);
    } else {
      imageContent = Image.network(
        effectiveUrl,
        width: width,
        height: height,
        fit: fit,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return placeholder ??
              Container(
                width: width,
                height: height,
                color: defaultBg,
                child: Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      value: loadingProgress.expectedTotalBytes != null
                          ? loadingProgress.cumulativeBytesLoaded /
                              (loadingProgress.expectedTotalBytes ?? 1)
                          : null,
                      color: const Color(0xFF0F766E),
                    ),
                  ),
                ),
              );
        },
        errorBuilder: (context, error, stackTrace) {
          return errorWidget ?? _buildDefaultError(isDark);
        },
      );
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: Container(
          width: width,
          height: height,
          color: defaultBg,
          child: imageContent,
        ),
      );
    }

    return Container(
      width: width,
      height: height,
      color: defaultBg,
      child: imageContent,
    );
  }

  Widget _buildDefaultPlaceholder(bool isDark) {
    return Container(
      width: width,
      height: height,
      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
      child: Icon(
        Icons.image_outlined,
        color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8),
        size: 28,
      ),
    );
  }

  Widget _buildDefaultError(bool isDark) {
    return Container(
      width: width,
      height: height,
      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
      child: Icon(
        Icons.broken_image_outlined,
        color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8),
        size: 28,
      ),
    );
  }
}
