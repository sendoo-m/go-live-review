import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:daleel_core/daleel_core.dart';
import '../../providers/map_provider.dart';

class OsmLeafletMapView extends StatefulWidget {
  final MapLocationPoint center;
  final double zoom;
  final List<SearchResultItemModel> items;
  final SearchResultItemModel? selectedItem;
  final MapLocationPoint? userLocation;
  final ValueChanged<SearchResultItemModel> onItemTap;
  final ValueChanged<MapLocationPoint>? onCenterChanged;
  final ValueChanged<double>? onZoomChanged;

  const OsmLeafletMapView({
    super.key,
    required this.center,
    required this.zoom,
    required this.items,
    this.selectedItem,
    this.userLocation,
    required this.onItemTap,
    this.onCenterChanged,
    this.onZoomChanged,
  });

  @override
  State<OsmLeafletMapView> createState() => _OsmLeafletMapViewState();
}

class _OsmLeafletMapViewState extends State<OsmLeafletMapView> with SingleTickerProviderStateMixin {
  late double _currentLat;
  late double _currentLng;
  late double _currentZoom;

  Offset _dragStart = Offset.zero;
  double _startLat = 0;
  double _startLng = 0;

  late AnimationController _pulseController;

  // Category Color Map (Identical to Web Leaflet)
  static const Map<int, Color> categoryColors = {
    1: Color(0xFFF97316), // Food & Restaurants - Orange
    2: Color(0xFFEF4444), // Medical - Red
    3: Color(0xFF0284C7), // Automotive - Sky
    4: Color(0xFF8B5CF6), // Electronics - Violet
    5: Color(0xFF10B981), // Home Services & Crafts - Emerald
    6: Color(0xFFEC4899), // Retail & Shopping - Pink
  };

  @override
  void initState() {
    super.initState();
    _currentLat = widget.center.latitude;
    _currentLng = widget.center.longitude;
    _currentZoom = widget.zoom;

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void didUpdateWidget(covariant OsmLeafletMapView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.center.latitude != widget.center.latitude ||
        oldWidget.center.longitude != widget.center.longitude) {
      setState(() {
        _currentLat = widget.center.latitude;
        _currentLng = widget.center.longitude;
      });
    }
    if (oldWidget.zoom != widget.zoom) {
      setState(() {
        _currentZoom = widget.zoom;
      });
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  // Web Mercator coordinate calculations
  Point<double> _latLngToPoint(double lat, double lng, double zoom) {
    final scale = 256.0 * math.pow(2, zoom);
    final x = (lng + 180.0) / 360.0 * scale;
    final latRad = lat * math.pi / 180.0;
    final y = (1.0 - math.log(math.tan(latRad) + 1.0 / math.cos(latRad)) / math.pi) / 2.0 * scale;
    return Point(x, y);
  }

  void _zoomIn() {
    final nextZoom = (_currentZoom + 1.0).clamp(3.0, 18.0);
    setState(() {
      _currentZoom = nextZoom;
    });
    widget.onZoomChanged?.call(nextZoom);
  }

  void _zoomOut() {
    final nextZoom = (_currentZoom - 1.0).clamp(3.0, 18.0);
    setState(() {
      _currentZoom = nextZoom;
    });
    widget.onZoomChanged?.call(nextZoom);
  }

  void _fitAllMarkers() {
    if (widget.items.isEmpty) return;
    double minLat = 90.0, maxLat = -90.0;
    double minLng = 180.0, maxLng = -180.0;

    int validCount = 0;
    for (final item in widget.items) {
      if (item.latitude != null && item.longitude != null) {
        minLat = math.min(minLat, item.latitude!);
        maxLat = math.max(maxLat, item.latitude!);
        minLng = math.min(minLng, item.longitude!);
        maxLng = math.max(maxLng, item.longitude!);
        validCount++;
      }
    }

    if (validCount > 0) {
      final centerLat = (minLat + maxLat) / 2.0;
      final centerLng = (minLng + maxLng) / 2.0;
      setState(() {
        _currentLat = centerLat;
        _currentLng = centerLng;
        _currentZoom = 13.0;
      });
      widget.onCenterChanged?.call(MapLocationPoint(centerLat, centerLng));
      widget.onZoomChanged?.call(13.0);
    }
  }

  Future<void> _launchAttribution() async {
    final uri = Uri.parse('https://www.openstreetmap.org/copyright');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final height = constraints.maxHeight;

        final centerPoint = _latLngToPoint(_currentLat, _currentLng, _currentZoom);
        final int tileZoom = _currentZoom.floor();
        final double tileScale = math.pow(2, _currentZoom - tileZoom).toDouble();

        // Calculate tile range to cover the viewport
        final halfW = width / 2.0;
        final halfH = height / 2.0;

        final numTiles = math.pow(2, tileZoom).toInt();
        final tileSize = 256.0 * tileScale;

        final startTileX = ((centerPoint.x - halfW) / (256.0 * math.pow(2, _currentZoom - tileZoom))).floor();
        final endTileX = ((centerPoint.x + halfW) / (256.0 * math.pow(2, _currentZoom - tileZoom))).ceil();

        final startTileY = ((centerPoint.y - halfH) / (256.0 * math.pow(2, _currentZoom - tileZoom))).floor();
        final endTileY = ((centerPoint.y + halfH) / (256.0 * math.pow(2, _currentZoom - tileZoom))).ceil();

        return Stack(
          children: [
            // 1. Gesture Detector for Panning and Pinching
            GestureDetector(
              onScaleStart: (details) {
                _dragStart = details.focalPoint;
                _startLat = _currentLat;
                _startLng = _currentLng;
              },
              onScaleUpdate: (details) {
                final delta = details.focalPoint - _dragStart;
                final scale = 256.0 * math.pow(2, _currentZoom);
                final dLng = -(delta.dx / scale) * 360.0;
                final dLat = (delta.dy / scale) * 180.0;

                setState(() {
                  _currentLng = (_startLng + dLng).clamp(-180.0, 180.0);
                  _currentLat = (_startLat + dLat).clamp(-85.0, 85.0);
                });
              },
              onScaleEnd: (_) {
                widget.onCenterChanged?.call(MapLocationPoint(_currentLat, _currentLng));
              },
              child: Container(
                width: width,
                height: height,
                color: const Color(0xFFE5E7EB), // OSM Tile placeholder color
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // Render OpenStreetMap Raster Tiles
                    for (int x = startTileX; x <= endTileX; x++)
                      for (int y = startTileY; y <= endTileY; y++)
                        if (x >= 0 && x < numTiles && y >= 0 && y < numTiles)
                          Positioned(
                            left: halfW + (x * 256.0 * math.pow(2, _currentZoom - tileZoom)) - centerPoint.x,
                            top: halfH + (y * 256.0 * math.pow(2, _currentZoom - tileZoom)) - centerPoint.y,
                            width: tileSize,
                            height: tileSize,
                            child: Image.network(
                              'https://tile.openstreetmap.org/$tileZoom/$x/$y.png',
                              fit: BoxFit.cover,
                              headers: const {
                                'User-Agent': 'DaleelAyKhidmaApp/1.0 (contact@daleel.test)',
                              },
                              errorBuilder: (_, __, ___) => Container(
                                color: const Color(0xFFF3F4F6),
                                child: const Center(
                                  child: Icon(Icons.map_outlined, size: 20, color: Colors.grey),
                                ),
                              ),
                            ),
                          ),

                    // User Location Marker (Pulse Dot)
                    if (widget.userLocation != null)
                      _buildUserLocationMarker(
                        halfW,
                        halfH,
                        centerPoint,
                        widget.userLocation!.latitude,
                        widget.userLocation!.longitude,
                      ),

                    // Leaflet-style Activity Markers
                    for (final item in widget.items)
                      if (item.latitude != null && item.longitude != null)
                        _buildLeafletPinMarker(
                          halfW,
                          halfH,
                          centerPoint,
                          item,
                          isSelected: widget.selectedItem?.id == item.id,
                        ),
                  ],
                ),
              ),
            ),

            // 2. Floating Map Action Buttons (Zoom +, Zoom -, Fit Markers, Center on User)
            Positioned(
              top: 16,
              left: 16,
              child: Column(
                children: [
                  _buildControlBtn(
                    icon: Icons.add,
                    tooltip: 'تكبير الخريطة',
                    onTap: _zoomIn,
                  ),
                  const SizedBox(height: 6),
                  _buildControlBtn(
                    icon: Icons.remove,
                    tooltip: 'تصغير الخريطة',
                    onTap: _zoomOut,
                  ),
                  const SizedBox(height: 10),
                  _buildControlBtn(
                    icon: Icons.fullscreen,
                    tooltip: 'ملاءمة كافة الأنشطة',
                    onTap: _fitAllMarkers,
                  ),
                  if (widget.userLocation != null) ...[
                    const SizedBox(height: 6),
                    _buildControlBtn(
                      icon: Icons.my_location,
                      iconColor: AppColors.primary,
                      tooltip: 'موقعي الحالي',
                      onTap: () {
                        setState(() {
                          _currentLat = widget.userLocation!.latitude;
                          _currentLng = widget.userLocation!.longitude;
                          _currentZoom = 14.5;
                        });
                        widget.onCenterChanged?.call(widget.userLocation!);
                        widget.onZoomChanged?.call(14.5);
                      },
                    ),
                  ],
                ],
              ),
            ),

            // 3. OpenStreetMap Attribution (MANDATORY & HIGHLY VISIBLE)
            Positioned(
              bottom: 8,
              left: 8,
              child: InkWell(
                onTap: _launchAttribution,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.85),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.black12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.info_outline, size: 12, color: AppColors.textMuted),
                      SizedBox(width: 4),
                      Text(
                        '© OpenStreetMap contributors',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildControlBtn({
    required IconData icon,
    required VoidCallback onTap,
    String? tooltip,
    Color iconColor = AppColors.textPrimary,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(icon, size: 20, color: iconColor),
        tooltip: tooltip,
        padding: const EdgeInsets.all(8),
        constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        onPressed: onTap,
      ),
    );
  }

  Widget _buildUserLocationMarker(
    double halfW,
    double halfH,
    Point<double> centerPoint,
    double lat,
    double lng,
  ) {
    final pt = _latLngToPoint(lat, lng, _currentZoom);
    final posX = halfW + pt.x - centerPoint.x;
    final posY = halfH + pt.y - centerPoint.y;

    return Positioned(
      left: posX - 20,
      top: posY - 20,
      width: 40,
      height: 40,
      child: AnimatedBuilder(
        animation: _pulseController,
        builder: (context, child) {
          final scale = 1.0 + (_pulseController.value * 0.6);
          final opacity = (1.0 - _pulseController.value).clamp(0.0, 1.0);

          return Stack(
            alignment: Alignment.center,
            children: [
              // Pulse Circle
              Transform.scale(
                scale: scale,
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withOpacity(opacity * 0.4),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              // User Center Pin
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2.5),
                  boxShadow: const [
                    BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildLeafletPinMarker(
    double halfW,
    double halfH,
    Point<double> centerPoint,
    SearchResultItemModel item, {
    required bool isSelected,
  }) {
    final pt = _latLngToPoint(item.latitude!, item.longitude!, _currentZoom);
    final posX = halfW + pt.x - centerPoint.x;
    final posY = halfH + pt.y - centerPoint.y;

    final Color pinColor = item.categoryId != null
        ? (categoryColors[item.categoryId!] ?? (item.isService ? const Color(0xFF10B981) : const Color(0xFFF97316)))
        : (item.isService ? const Color(0xFF10B981) : const Color(0xFFF97316));

    final double pinSize = isSelected ? 46.0 : 36.0;

    return Positioned(
      left: posX - (pinSize / 2),
      top: posY - pinSize,
      width: pinSize,
      height: pinSize + 8,
      child: GestureDetector(
        onTap: () => widget.onItemTap(item),
        child: Stack(
          alignment: Alignment.topCenter,
          clipBehavior: Clip.none,
          children: [
            // Selected Outer Glow
            if (isSelected)
              Positioned(
                top: -4,
                child: Container(
                  width: pinSize + 8,
                  height: pinSize + 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: pinColor.withOpacity(0.6),
                        blurRadius: 12,
                        spreadRadius: 3,
                      ),
                    ],
                  ),
                ),
              ),

            // Leaflet Styled Teardrop Pin
            Container(
              width: pinSize,
              height: pinSize,
              decoration: BoxDecoration(
                color: pinColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.zero,
                ),
                border: Border.all(color: Colors.white, width: isSelected ? 3.0 : 2.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 6,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              transform: Matrix4.rotationZ(-math.pi / 4),
              transformAlignment: Alignment.center,
              child: Center(
                child: Transform.rotate(
                  angle: math.pi / 4,
                  child: Icon(
                    item.isService
                        ? Icons.handyman_outlined
                        : item.isProduct
                            ? Icons.inventory_2_outlined
                            : Icons.storefront,
                    color: Colors.white,
                    size: isSelected ? 20 : 16,
                  ),
                ),
              ),
            ),

            // Featured Star Badge
            if (item.isFeatured)
              Positioned(
                top: -2,
                right: -2,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 1.5),
                  ),
                  child: const Center(
                    child: Text(
                      '★',
                      style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
