import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:daleel_core/daleel_core.dart';
import '../providers/merchant_media_provider.dart';

class MediaGalleryScreen extends ConsumerStatefulWidget {
  const MediaGalleryScreen({super.key});

  @override
  ConsumerState<MediaGalleryScreen> createState() => _MediaGalleryScreenState();
}

class _MediaGalleryScreenState extends ConsumerState<MediaGalleryScreen> {
  final TextEditingController _urlController = TextEditingController();
  String _selectedFolder = 'activities';

  // Sample instant image presets for quick testing
  final List<String> _sampleImagePresets = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700', // Restaurant
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700', // Cafe
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700', // Spa & Clinic
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700', // Electronics
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700', // Fashion & Salon
  ];

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  void _openUploadSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _UploadMediaBottomSheet(
        selectedFolder: _selectedFolder,
        samplePresets: _sampleImagePresets,
      ),
    );
  }

  void _previewImage(MediaItemModel item) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                item.url,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(30),
                  child: const Text('تعذر تحميل الصورة'),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      item.fileName,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy, size: 20),
                    tooltip: 'نسخ الرابط',
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: item.url));
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('تم نسخ رابط الصورة إلى الحافظة')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mediaState = ref.watch(merchantMediaNotifierProvider);
    final mediaNotifier = ref.read(merchantMediaNotifierProvider.notifier);

    final items = mediaState.filteredItems;

    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة الوسائط ومعرض الصور'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'تحديث',
            onPressed: () => mediaNotifier.loadMedia(),
          ),
          IconButton(
            icon: const Icon(Icons.cloud_upload_outlined, color: AppColors.primary),
            tooltip: 'رفع صورة جديدة',
            onPressed: _openUploadSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Upload Progress Banner (If Active)
          if (mediaState.isUploading)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: AppColors.primaryLight,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                          SizedBox(width: 10),
                          Text('جارِ معالجة ورفع الصورة...', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      Text('${(mediaState.uploadProgress * 100).toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: mediaState.uploadProgress,
                    backgroundColor: Colors.white,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),

          // Error / Retry Banner
          if (mediaState.errorMessage != null)
            Container(
              padding: const EdgeInsets.all(12),
              color: AppColors.errorLight,
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(mediaState.errorMessage!, style: const TextStyle(color: AppColors.error, fontSize: 12)),
                  ),
                  if (mediaState.lastFailedPayload != null)
                    TextButton(
                      onPressed: () => mediaNotifier.retryLastUpload(_selectedFolder),
                      child: const Text('إعادة المحاولة', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
                    ),
                ],
              ),
            ),

          // Filter Folders
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.white,
            child: Row(
              children: [
                _buildFolderChip('الكل (${mediaState.items.length})', 'all', mediaState.filter, (f) => mediaNotifier.setFilter(f)),
                const SizedBox(width: 8),
                _buildFolderChip('النشاط', 'activities', mediaState.filter, (f) => mediaNotifier.setFilter(f)),
                const SizedBox(width: 8),
                _buildFolderChip('المنتجات', 'products', mediaState.filter, (f) => mediaNotifier.setFilter(f)),
                const SizedBox(width: 8),
                _buildFolderChip('العروض', 'offers', mediaState.filter, (f) => mediaNotifier.setFilter(f)),
              ],
            ),
          ),
          const Divider(height: 1),

          // Media Grid
          Expanded(
            child: mediaState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : items.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.photo_library_outlined, size: 56, color: AppColors.textMuted),
                              const SizedBox(height: 16),
                              const Text(
                                'لا توجد وسائط مرفوعة في هذا المجلد.',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'قم برفع صور النشاط أو المنتجات لإبراز هويتك التجارية للعملاء.',
                                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                              const SizedBox(height: 20),
                              ElevatedButton.icon(
                                icon: const Icon(Icons.upload),
                                label: const Text('رفع صورة جديدة'),
                                onPressed: _openUploadSheet,
                              ),
                            ],
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () async => mediaNotifier.loadMedia(),
                        child: GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 0.85,
                          ),
                          itemCount: items.length,
                          itemBuilder: (ctx, index) {
                            final item = items[index];
                            return _buildMediaGridCard(item);
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_photo_alternate),
        label: const Text('رفع صورة'),
        onPressed: _openUploadSheet,
      ),
    );
  }

  Widget _buildFolderChip(String label, String folderKey, String currentFilter, Function(String) onSelect) {
    final isSelected = currentFilter == folderKey;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => onSelect(folderKey),
      selectedColor: AppColors.primaryLight,
      labelStyle: TextStyle(
        color: isSelected ? AppColors.primary : AppColors.textSecondary,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 12,
      ),
    );
  }

  Widget _buildMediaGridCard(MediaItemModel item) {
    final mediaNotifier = ref.read(merchantMediaNotifierProvider.notifier);

    return InkWell(
      onTap: () => _previewImage(item),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 4, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      child: Image.network(
                        item.url,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: AppColors.surface,
                          child: const Icon(Icons.broken_image, color: AppColors.textMuted),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        item.folder == 'activities' ? 'نشاط' : (item.folder == 'products' ? 'منتج' : 'عرض'),
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      item.fileName,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  InkWell(
                    onTap: () => mediaNotifier.deleteMedia(item.id),
                    child: const Icon(Icons.delete_outline, size: 16, color: AppColors.error),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UploadMediaBottomSheet extends ConsumerStatefulWidget {
  final String selectedFolder;
  final List<String> samplePresets;

  const _UploadMediaBottomSheet({
    required this.selectedFolder,
    required this.samplePresets,
  });

  @override
  ConsumerState<_UploadMediaBottomSheet> createState() => _UploadMediaBottomSheetState();
}

class _UploadMediaBottomSheetState extends ConsumerState<_UploadMediaBottomSheet> {
  final _urlInputController = TextEditingController();
  final _fileNameController = TextEditingController();
  late String _folder;

  @override
  void initState() {
    super.initState();
    _folder = widget.selectedFolder == 'all' ? 'activities' : widget.selectedFolder;
  }

  @override
  void dispose() {
    _urlInputController.dispose();
    _fileNameController.dispose();
    super.dispose();
  }

  Future<void> _startUpload(String payloadUrl, String fileName) async {
    Navigator.pop(context);
    await ref.read(merchantMediaNotifierProvider.notifier).uploadMedia(
          imagePayload: payloadUrl,
          fileName: fileName,
          folder: _folder,
        );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('رفع صورة إلى مكتبة الوسائط', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 12),

            // Folder selector
            const Text('المجلد المستهدف:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 6),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'activities', label: Text('النشاط')),
                ButtonSegment(value: 'products', label: Text('المنتجات')),
                ButtonSegment(value: 'offers', label: Text('العروض')),
              ],
              selected: {_folder},
              onSelectionChanged: (val) => setState(() => _folder = val.first),
            ),
            const SizedBox(height: 16),

            // Method 1: Instant Presets / Gallery Simulator
            const Text('نماذج جاهزة للاختبار الفوري:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            SizedBox(
              height: 60,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: widget.samplePresets.length,
                itemBuilder: (ctx, i) {
                  final url = widget.samplePresets[i];
                  return GestureDetector(
                    onTap: () => _startUpload(url, 'preset_image_$i.jpg'),
                    child: Container(
                      margin: const EdgeInsets.only(left: 8),
                      width: 60,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.primary, width: 2),
                        image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            // Method 2: Custom URL or Base64
            const Text('أو أدخل رابط الصورة مباشرة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _urlInputController,
              decoration: const InputDecoration(
                labelText: 'رابط الصورة (Image URL / Data URI)',
                hintText: 'https://...',
                prefixIcon: Icon(Icons.link),
              ),
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: _fileNameController,
              decoration: const InputDecoration(
                labelText: 'اسم الصورة (اختياري)',
                hintText: 'مثال: صورة الواجهة الرئيسية',
                prefixIcon: Icon(Icons.title),
              ),
            ),
            const SizedBox(height: 16),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.cloud_upload),
                label: const Text('بدء الرفع والتخزين'),
                onPressed: () {
                  final url = _urlInputController.text.trim();
                  if (url.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('يرجى اختيار نموذج أو إدخال رابط صورة')),
                    );
                    return;
                  }
                  final name = _fileNameController.text.trim().isNotEmpty
                      ? _fileNameController.text.trim()
                      : 'upload_${DateTime.now().millisecondsSinceEpoch}.jpg';
                  _startUpload(url, name);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
