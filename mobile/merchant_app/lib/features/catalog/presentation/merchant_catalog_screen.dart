import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:daleel_core/daleel_core.dart';
import '../providers/merchant_catalog_provider.dart';

class MerchantCatalogScreen extends ConsumerStatefulWidget {
  const MerchantCatalogScreen({super.key});

  @override
  ConsumerState<MerchantCatalogScreen> createState() => _MerchantCatalogScreenState();
}

class _MerchantCatalogScreenState extends ConsumerState<MerchantCatalogScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ImagePicker _picker = ImagePicker();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openProductFormDialog({ProductModel? product}) {
    final isEditing = product != null;
    final nameController = TextEditingController(text: product?.name ?? '');
    final priceController = TextEditingController(text: product != null ? product.price.toStringAsFixed(0) : '');
    final salePriceController = TextEditingController(text: product?.salePrice != null ? product!.salePrice!.toStringAsFixed(0) : '');
    final shortDescController = TextEditingController(text: product?.shortDescription ?? '');
    final fullDescController = TextEditingController(text: product?.fullDescription ?? '');
    final skuController = TextEditingController(text: product?.sku ?? '');
    final stockController = TextEditingController(text: product?.stockQty != null ? product!.stockQty.toString() : '');
    final coverImageController = TextEditingController(
      text: product?.coverImage ?? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600',
    );
    bool isAvailable = product?.isAvailable ?? true;
    bool isFeatured = product?.isFeatured ?? false;
    bool isUploadingImage = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
            height: MediaQuery.of(context).size.height * 0.88,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              top: 16,
              left: 16,
              right: 16,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Modal Handle & Title
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isEditing ? 'تعديل بيانات المنتج' : 'إضافة منتج أو خدمة جديدة',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const Divider(),

                // Scrollable Form Fields
                Expanded(
                  child: ListView(
                    children: [
                      // Image Preview & Upload Button
                      Center(
                        child: Stack(
                          children: [
                            Container(
                              width: 110,
                              height: 110,
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: AppColors.border),
                                image: DecorationImage(
                                  image: NetworkImage(coverImageController.text),
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                            if (isUploadingImage)
                              Container(
                                width: 110,
                                height: 110,
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.5),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: const Center(
                                  child: CircularProgressIndicator(color: Colors.white),
                                ),
                              ),
                            Positioned(
                              bottom: 4,
                              left: 4,
                              child: InkWell(
                                onTap: () async {
                                  try {
                                    final picked = await _picker.pickImage(source: ImageSource.gallery);
                                    if (picked != null) {
                                      setModalState(() => isUploadingImage = true);
                                      final uploadedUrl = await ref
                                          .read(merchantCatalogProvider.notifier)
                                          .uploadMedia(picked.path, fileName: picked.name);
                                      setModalState(() {
                                        isUploadingImage = false;
                                        if (uploadedUrl != null && uploadedUrl.isNotEmpty) {
                                          coverImageController.text = uploadedUrl;
                                        }
                                      });
                                    }
                                  } catch (_) {
                                    setModalState(() => isUploadingImage = false);
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: const BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.camera_alt, color: Colors.white, size: 16),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: TextButton.icon(
                          onPressed: () {
                            // Prompt for image URL
                            showDialog(
                              context: context,
                              builder: (dCtx) {
                                final urlText = TextEditingController(text: coverImageController.text);
                                return AlertDialog(
                                  title: const Text('رابط الصورة المباشر', style: TextStyle(fontSize: 15)),
                                  content: TextField(
                                    controller: urlText,
                                    decoration: const InputDecoration(hintText: 'https://...'),
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(dCtx),
                                      child: const Text('إلغاء'),
                                    ),
                                    ElevatedButton(
                                      onPressed: () {
                                        if (urlText.text.trim().isNotEmpty) {
                                          setModalState(() {
                                            coverImageController.text = urlText.text.trim();
                                          });
                                        }
                                        Navigator.pop(dCtx);
                                      },
                                      child: const Text('حفظ'),
                                    ),
                                  ],
                                );
                              },
                            );
                          },
                          icon: const Icon(Icons.link, size: 16),
                          label: const Text('تغيير رابط الصورة', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Name Field
                      const Text('اسم المنتج / الخدمة *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: nameController,
                        decoration: InputDecoration(
                          hintText: 'مثال: بيتزا مارجريتا إيطالي',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Price and Sale Price in Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('السعر الأساسي (ج.م) *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: priceController,
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    hintText: '150',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    filled: true,
                                    fillColor: Colors.grey.shade50,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('سعر العرض / الخصم', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: salePriceController,
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    hintText: 'اختياري (مثال: 120)',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    filled: true,
                                    fillColor: Colors.grey.shade50,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Short Description
                      const Text('الوصف المختصر', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: shortDescController,
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: 'وصف سريع يظهر في قائمة المنتجات والبطاقات...',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // SKU & Stock
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('كود المنتج (SKU)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: skuController,
                                  decoration: InputDecoration(
                                    hintText: 'PRD-101',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    filled: true,
                                    fillColor: Colors.grey.shade50,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('الكمية في المخزن', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: stockController,
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    hintText: '50',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    filled: true,
                                    fillColor: Colors.grey.shade50,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Availability and Featured Switches
                      SwitchListTile(
                        title: const Text('المنتج متوفر للطلب المباشر', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: const Text('يمكن للعملاء رؤيته وطلبه فوراً', style: TextStyle(fontSize: 11)),
                        value: isAvailable,
                        activeColor: AppColors.primary,
                        onChanged: (val) => setModalState(() => isAvailable = val),
                      ),
                      SwitchListTile(
                        title: const Text('تمييز المنتج (عرض خاص)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: const Text('يظهر في أعلى قائمة النشاط ومقترحات البحث', style: TextStyle(fontSize: 11)),
                        value: isFeatured,
                        activeColor: AppColors.secondary,
                        onChanged: (val) => setModalState(() => isFeatured = val),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      final name = nameController.text.trim();
                      final price = double.tryParse(priceController.text.trim()) ?? 0.0;
                      final salePrice = double.tryParse(salePriceController.text.trim());
                      final shortDesc = shortDescController.text.trim();
                      final fullDesc = fullDescController.text.trim();
                      final sku = skuController.text.trim();
                      final stock = int.tryParse(stockController.text.trim());

                      if (name.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('يرجى إدخال اسم المنتج أولاً')),
                        );
                        return;
                      }

                      if (price <= 0) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('يرجى إدخال سعر صحيح للمنتج')),
                        );
                        return;
                      }

                      Navigator.pop(ctx);

                      final payload = {
                        'name': name,
                        'price': price,
                        if (salePrice != null && salePrice > 0) 'sale_price': salePrice,
                        'short_description': shortDesc,
                        'full_description': fullDesc.isNotEmpty ? fullDesc : shortDesc,
                        'sku': sku,
                        'stock_qty': stock,
                        'is_available': isAvailable,
                        'is_featured': isFeatured,
                        'cover_image': coverImageController.text.trim(),
                        'currency': 'ج.م',
                      };

                      bool success;
                      if (isEditing) {
                        success = await ref.read(merchantCatalogProvider.notifier).updateProduct(product.id, payload);
                      } else {
                        success = await ref.read(merchantCatalogProvider.notifier).createProduct(payload);
                      }

                      if (success && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(isEditing ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج إلى الكتالوج بنجاح!'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    },
                    child: Text(
                      isEditing ? 'حفظ التعديلات' : 'إضافة المنتج إلى الكتالوج',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _confirmDeleteProduct(BuildContext context, ProductModel product) {
    showDialog(
      context: context,
      builder: (dCtx) => AlertDialog(
        title: const Text('تأكيد حذف المنتج', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Text('هل أنت متأكد من رغبتك في حذف "${product.name}" نهائياً من الكتالوج؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dCtx),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(dCtx);
              final success = await ref.read(merchantCatalogProvider.notifier).deleteProduct(product.id);
              if (success && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('تم حذف المنتج بنجاح.'),
                    backgroundColor: Colors.green,
                  ),
                );
              }
            },
            child: const Text('حذف نهائي'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(merchantCatalogProvider);
    final notifier = ref.read(merchantCatalogProvider.notifier);

    // Calculate quick stats
    final totalCount = state.products.length;
    final availableCount = state.products.where((p) => p.isAvailable).length;
    final discountedCount = state.products.where((p) => p.hasDiscount).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة كتالوج المنتجات والخدمات'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'إضافة منتج جديد',
            onPressed: () => _openProductFormDialog(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('إضافة منتج', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: () => _openProductFormDialog(),
      ),
      body: RefreshIndicator(
        onRefresh: () => notifier.loadProducts(isRefresh: true),
        child: Column(
          children: [
            // 1. Search Bar & Filter Chips
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Column(
                children: [
                  // Search Input
                  TextField(
                    controller: _searchController,
                    onChanged: (val) => notifier.setSearchQuery(val),
                    decoration: InputDecoration(
                      hintText: 'البحث باسم المنتج أو الكود (SKU)...',
                      prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textMuted),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                notifier.setSearchQuery('');
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Filter Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('الكل ($totalCount)', 'all', state.filter, notifier),
                        const SizedBox(width: 8),
                        _buildFilterChip('متوفر للطلب ($availableCount)', 'available', state.filter, notifier),
                        const SizedBox(width: 8),
                        _buildFilterChip('غير متوفر (${totalCount - availableCount})', 'unavailable', state.filter, notifier),
                        const SizedBox(width: 8),
                        _buildFilterChip('عروض وخصومات ($discountedCount)', 'discounted', state.filter, notifier),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.border),

            // 2. Stats Summary Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: AppColors.primaryLight.withOpacity(0.5),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem('إجمالي الكتالوج', '$totalCount', Icons.inventory_2_outlined),
                  _buildStatItem('جاهز للبيع', '$availableCount', Icons.check_circle_outline, color: Colors.green),
                  _buildStatItem('عروض نشطة', '$discountedCount', Icons.local_offer_outlined, color: AppColors.secondary),
                ],
              ),
            ),

            // 3. Product List / Empty State / Loading State
            Expanded(
              child: state.isLoading
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text('جارٍ جلب وتحديث قائمة المنتجات...', style: TextStyle(color: AppColors.textSecondary)),
                        ],
                      ),
                    )
                  : state.errorMessage != null
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                                const SizedBox(height: 12),
                                Text(state.errorMessage!, textAlign: TextAlign.center),
                                const SizedBox(height: 16),
                                ElevatedButton(
                                  onPressed: () => notifier.loadProducts(isRefresh: true),
                                  child: const Text('إعادة المحاولة'),
                                ),
                              ],
                            ),
                          ),
                        )
                      : state.filteredProducts.isEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(24),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.inventory_2_outlined, size: 54, color: AppColors.textMuted.withOpacity(0.5)),
                                    const SizedBox(height: 16),
                                    const Text(
                                      'لا توجد منتجات مطابقة للبحث أو الفلتر',
                                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                    ),
                                    const SizedBox(height: 6),
                                    const Text(
                                      'أضف منتجات وخدمات نشاطك لتبدأ في تلقي طلبات العملاء المباشرة.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    ),
                                    const SizedBox(height: 20),
                                    ElevatedButton.icon(
                                      onPressed: () => _openProductFormDialog(),
                                      icon: const Icon(Icons.add),
                                      label: const Text('إضافة أول منتج الآن'),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: state.filteredProducts.length,
                              itemBuilder: (context, index) {
                                final product = state.filteredProducts[index];
                                return _buildProductCard(product, notifier);
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String key, String currentFilter, MerchantCatalogNotifier notifier) {
    final isSelected = currentFilter == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => notifier.setFilter(key),
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        color: isSelected ? Colors.white : AppColors.textPrimary,
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, {Color? color}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color ?? AppColors.primary),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: color ?? AppColors.textPrimary)),
            Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
          ],
        ),
      ],
    );
  }

  Widget _buildProductCard(ProductModel product, MerchantCatalogNotifier notifier) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Cover Image
                Container(
                  width: 74,
                  height: 74,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(10),
                    image: DecorationImage(
                      image: NetworkImage(product.coverImage),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Info Section
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              product.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (product.hasDiscount)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.errorLight,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'خصم ${product.discountPercent}%',
                                style: const TextStyle(color: AppColors.error, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                        ],
                      ),
                      if (product.sku != null && product.sku!.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          'كود: ${product.sku}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        ),
                      ],
                      if (product.activity != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          product.activity!.nameAr,
                          style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                      const SizedBox(height: 4),

                      // Price Display
                      Row(
                        children: [
                          Text(
                            '${product.effectivePrice.toStringAsFixed(0)} ${product.currency}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: AppColors.primary,
                            ),
                          ),
                          if (product.hasDiscount) ...[
                            const SizedBox(width: 6),
                            Text(
                              '${product.price.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textMuted,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                          if (product.stockQty != null) ...[
                            const SizedBox(width: 10),
                            Text(
                              'المخزون: ${product.stockQty}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Divider(height: 1, color: AppColors.border),
            const SizedBox(height: 8),

            // Bottom Actions Row: Toggle Availability & Edit/Delete Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Toggle Availability Switch
                Row(
                  children: [
                    Switch(
                      value: product.isAvailable,
                      activeColor: Colors.green,
                      onChanged: (val) {
                        notifier.toggleAvailability(product.id);
                      },
                    ),
                    Text(
                      product.isAvailable ? 'متوفر للطلب' : 'غير متوفر',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: product.isAvailable ? Colors.green : AppColors.textMuted,
                      ),
                    ),
                  ],
                ),

                // Edit & Delete Action Buttons
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 20, color: AppColors.primary),
                      tooltip: 'تعديل',
                      onPressed: () => _openProductFormDialog(product: product),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.error),
                      tooltip: 'حذف',
                      onPressed: () => _confirmDeleteProduct(context, product),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
