# دليل إعداد وتشغيل بنية تخزين ورفع الوسائط عبر Cloudflare R2
## Daleel Ay Khidma - Media Storage, Direct Upload & Optimization Infrastructure

تم بناء وتحديث بنية تخزين وتسليم الوسائط (الصور، الشعارات، الأغلفة، المنتجات، العروض) بالاعتماد على **Cloudflare R2** مع ربطها بالدومين المخصص:
```
https://images.dalilaykhidma.com
```

---

## 1. مزايا البنية التحتية
1. **Zero Egress Fees:** لا توجد رسوم على استهلاك الباندويث أو نقل البيانات من R2 إلى الزوار.
2. **Signed Direct Upload (S3 Compatible):** رفع مباشر من العميل (الموبايل والويب) إلى Cloudflare R2 مباشرة عبر Pre-signed PUT URLs دون الضغط على خوادم التطبيق أو استهلاك الذاكرة والمعالج.
3. **Automatic Fallback:** في حال حدوث أي خطأ في الرفع المباشر، يتراجع النظام تلقائياً إلى الرفع عبر الـ Backend لضمان عدم فشل تجربة المستخدم.
4. **Non-destructive Image Variants:** يتم حفظ الروابط الأصلية النقية في قاعدة البيانات، وتوليد المقاسات المحسنة (Thumbnails, Cards, Covers) ديناميكياً عبر Cloudflare Image Resizing.
5. **Lifecycle & Cleanup Management:** حذف آلي للصور القديمة عند استبدال صورة المنتج أو النشاط أو العرض، مع نقطة نهاية دورية لتنظيف مجلد الرفع المؤقت `/temp/`.

---

## 2. هيكلية المجلدات والتسمية (Storage Hierarchy)

| المجلد | الاستخدام | نمط التسمية | مثال على الرابط النهائي |
| :--- | :--- | :--- | :--- |
| `/activities/` | أغلفة وشعارات ومعارض الأنشطة التجارية | `act_{id}_{timestamp}_{hash}.{ext}` | `https://images.dalilaykhidma.com/activities/act_10_1725289900000_a3b2c1d0.webp` |
| `/products/` | صور المنتجات والكتالوج | `prod_{id}_{timestamp}_{hash}.{ext}` | `https://images.dalilaykhidma.com/products/prod_105_1725289900000_f8e7d6c5.webp` |
| `/offers/` | بانرات العروض والخصومات والكوبونات | `off_{id}_{timestamp}_{hash}.{ext}` | `https://images.dalilaykhidma.com/offers/off_12_1725289900000_1a2b3c4d.webp` |
| `/profiles/` | الصور الرمزية والشخصية (Avatars) | `usr_{id}_{timestamp}_{hash}.{ext}` | `https://images.dalilaykhidma.com/profiles/usr_4_1725289900000_5e6f7a8b.jpg` |
| `/reviews/` | صور تجارب وتقييمات العملاء | `rev_{id}_{timestamp}_{hash}.{ext}` | `https://images.dalilaykhidma.com/reviews/rev_88_1725289900000_9c8b7a6d.jpg` |
| `/media/` | المكتبة الإعلامية العامة | `media_{timestamp}_{hash}.{ext}` | `https://images.dalilaykhidma.com/media/media_1725289900000_4d3c2b1a.jpg` |
| `/temp/` | المسودات والملفات المؤقتة | `temp_{timestamp}_{hash}.{ext}` | `https://images.dalilaykhidma.com/temp/temp_1725289900000_0f1e2d3c.jpg` |

---

## 3. مصفوفة مقاسات وتحسين الصور (Optimization Variants Matrix)

| المتغير (Variant) | الأبعاد المقترحة | الجودة | الاستخدام الرئيسي |
| :--- | :--- | :--- | :--- |
| `thumbnail` | 150x150 | 80% WebP | الصور المصغرة، القوائم المضغوطة |
| `card` | 400x300 | 82% WebP | بطاقات الأنشطة والمنتجات في الرئيسية والبحث |
| `detail` | 800x600 | 85% WebP | شاشة تفاصيل النشاط والمنتج |
| `cover` | 1200x600 | 85% WebP | غلاف النشاط التجاري والبانر الإعلاني |
| `avatar` | 200x200 | 80% WebP | الصور الشخصية والشعارات المربعة |
| `gallery` | 1000x800 | 85% WebP | معارض الصور والـ Lightbox |
| `original` | الأبعاد الأصلية | 100% | التنزيل والملف الأصلي |

---

## 4. نقاط نهاية الخادم (API Endpoints)

| المسار | الطريقة | الوظيفة |
| :--- | :--- | :--- |
| `POST /api/v2/media/presign` | `POST` | توليد رابط رفع مباشر موقع ومؤقت (Signed Direct Upload) |
| `POST /api/v2/media/upload` | `POST` | رفع خادمي بديل (Multipart أو Base64) |
| `POST /api/v2/media/delete` | `POST` | حذف صورة من R2 بأمان |
| `POST /api/v2/media/optimize-url` | `POST` | اشتقاق رابط صورة محسن وفق المقاس المطلوب |
| `POST /api/v2/media/cleanup-temp` | `POST` | تنظيف وحذف الملفات المؤقتة في `/temp/` الأقدم من N ساعة |
| `GET /api/v2/media/storage-stats` | `GET` | إحصائيات استهلاك الحاوية وحجم الملفات حسب المجلد |
| `GET /api/v2/media/r2-status` | `GET` | فحص وتشخيص الاتصال بحاوية Cloudflare R2 |

---

## 5. أمثلة على استدعاءات الـ API (cURL Examples)

### 1. طلب رابط رفع مباشر:
```bash
curl -X POST "https://dalilaykhidma.com/api/v2/media/presign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "folder": "products",
    "mime_type": "image/jpeg",
    "file_name": "shoe_front.jpg",
    "entity_id": 105
  }'
```
**الرد المتوقع:**
```json
{
  "success": true,
  "message": "تم توليد رابط الرفع المباشر بنجاح.",
  "data": {
    "upload_url": "https://...r2.cloudflarestorage.com/dalil-media/products/prod_105_1725289900000_a1b2c3d4.jpg?...",
    "public_url": "https://images.dalilaykhidma.com/products/prod_105_1725289900000_a1b2c3d4.jpg",
    "key": "products/prod_105_1725289900000_a1b2c3d4.jpg",
    "expires_in_seconds": 300
  }
}
```

### 2. الرفع المباشر الثنائي إلى Cloudflare R2:
```bash
curl -X PUT "<upload_url>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@my_image.jpg"
```

### 3. تنظيف المجلدات المؤقتة:
```bash
curl -X POST "https://dalilaykhidma.com/api/v2/media/cleanup-temp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"older_than_hours": 24}'
```

---

## 6. المتغيرات البيئية المطلوبة (`.env`)

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="dalil-media"
R2_PUBLIC_DOMAIN="https://images.dalilaykhidma.com"
ENABLE_CLOUDFLARE_IMAGE_TRANSFORM="false"
```
