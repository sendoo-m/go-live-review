# الوثيقة الهندسية الشاملة والمعمارية الرسمية لمنظومة «دليل أي خدمة»
### Daleel Ay Khidma System Architecture, API Specifications, Mobile Readiness & Official Handoff Blueprint
**الإصدار:** `2.4.0-Production-Ready` | **تاريخ التوثيق:** سبتمبر 2026 | **الحالة:** معتمد كمرجع تشغيلي وهندسي لتطوير تطبيقات Flutter

---

## 1. الملخص التنفيذي (Executive Overview)
منظومة **«دليل أي خدمة» (Daleel Ay Khidma)** هي منصة رقمية متكاملة مصممة خصيصاً للسوق المصري لربط المستهلكين بالمحلات التجارية، مقدمي الخدمات المهنية، العيادات والمراكز الطبية، الحرفيين، وكتالوجات المنتجات ومقارنة الأسعار مع تحديد دقيق للمواقع الجغرافية عبر الخرائط التفاعلية، وتوفير بوابة تجار مخصصة (Merchant Portal) ونظام إدارة ومراقبة شامل (Admin Operations).

تهدف هذه الوثيقة إلى تقديم **توصيف هندسي دقيق 100% مبني على فحص الكود المصدري الفعلي للمشروع**، مع حصر ما تم تنفيذه بالكامل، ما هو مؤقت أو تجريبي، الفجوات التشغيلية الحالية، وخارطة طريق بدون مدد زمنية للتحويل إلى تطبيقات Flutter لكل من Android و iOS.

---

## 2. نظرة عامة على النظام (System Overview)

### 2.1 الكيانات والمستخدمون الأساسيون
1. **المستخدم النهائي / الزائر (Public User / Guest):**
   - استكشاف المحلات والخدمات حسب المحافظة والمدينة والحي.
   - البحث الموحد في المنتجات، الخدمات، والمحلات.
   - استعراض كتالوجات المنتجات ومقارنة الأسعار بين المتاجر المحلية.
   - التواصل المباشر مع الأنشطة عبر الاتصال أو واتساب ومشاركة الأنشطة.
   - تقييم الأنشطة وإضافة المراجعات.
2. **التاجر ومقدم الخدمة (Merchant / Service Provider):**
   - إدارة هوية النشاط، الفروع، وساعات العمل والإحداثيات الجغرافية.
   - إدارة كتالوج المنتجات وتعديل الأسعار وإجراء استيراد وتصدير جماعي بملفات CSV.
   - إنشاء وإدارة العروض الترويجية والخصومات المحددة بالوقت.
   - استلام استفسارات العملاء والرد عليها.
   - الاشتراك في الباقات وترقية العضوية.
3. **الإدارة والمشرفون (Admin Operations):**
   - إدارة المستخدمين والتجار والصلاحيات.
   - إدارة الهيكل الجغرافي الشامل (محافظات ← مدن ← أحياء).
   - إدارة شجرة القطاعات والتصنيفات.
   - مراجعة واعتماد الأنشطة ومنح شارة التوثيق الرسمية.
   - التحكم المركزي بإعدادات المنصة والهوية البصرية وتطبيقات الموبايل عبر `Single Source of Truth`.
   - مراقبة العمليات عبر سجلات التتبع (Audit Logs).

---

## 3. المعمارية الحالية للنظام (Current Architecture)

### 3.1 هيكل الطبقات (Layered Architecture)
* **طبقة العرض (Client Tier):**
  - بوابة المستخدم العامة: `/src/apps/user-web`
  - بوابة التاجر: `/src/apps/merchant-web`
  - بوابة الإدارة: `/src/apps/admin-web`
* **طبقة الحزم المشتركة (Shared Core Packages):**
  - `/src/packages/settings`: موزع الإعدادات المركزي ومزامنة الرأس (Meta/Title/Favicon).
  - `/src/packages/i18n`: محرك اللغات والتعريب والاتجاه (RTL/LTR).
  - `/src/packages/auth`: إدارة الحسابات، التوكنات، وسياق الأمان.
  - `/src/packages/api-client`: عميل HTTP الموحد (`api`) للتواصل مع الخادم.
  - `/src/packages/types`: عقود ونماذج البيانات (DTOs) المحددة الأنواع.
  - `/src/packages/ui`: مكونات الواجهة التفاعلية (Modals, Rating, Skeleton).
* **طبقة الخادم والمنطق البرمجي (Backend Service Tier):**
  - خادم Node.js / Express الموحد في `server.ts` ومجلد `/backend-laravel` المنظم وفق معمارية **Laravel 11**.
* **طبقة الواجهات البرمجية (REST API Layer):**
  - إصدار REST API v2 (`/api/v2/*`) مع مصادقة Sanctum Bearer Tokens.

---

## 4. توثيق الـ Backend بالتفصيل (Backend Engineering)

### 4.1 التقنيات والنسخ المستخدمة
* **Runtime:** Node.js (TypeScript) / Express v4.21.
* **Target Production Framework:** Laravel 11 (PHP 8.2+) مع حزمة Laravel Sanctum للتوكنات.
* **النمط المعماري:** Controller-Service-Repository مع توحيد كائنات الاستجابة (ApiResponse DTOs).

### 4.2 الوحدات البرمجية المنفذة في الخادم
1. **وحدة المصادقة (Auth Module):** التسجيل، تسجيل الدخول، استعادة كلمة المرور عبر OTP، والتحقق من التوكنات.
2. **وحدة الأنشطة (Activities Module):** الفلترة، الحالات (`active`, `pending`, `suspended`)، وإحصائيات المشاهدات.
3. **وحدة المنتجات والـ CSV (Products & CSV Engine):** دعم تسعير الخصم، كود الصنف، وتوليد وقراءة ملفات CSV بترميز UTF-8.
4. **وحدة الهيكل الجغرافي (Locations Hierarchy):** المحافظات، المدن، والأحياء.
5. **وحدة التصنيفات (Categories Hierarchy):** القطاعات الرئيسية والتصنيفات الفرعية.
6. **وحدة الإعدادات الشاملة (Platform Settings Engine):** تخزين واسترجاع وتحديث كافة معاملات الموقع والموبايل.
7. **وحدة سجلات التتبع (Audit Logs Engine):** تسجيل العمليات مع IP والمستخدم والـ Payload.

---

## 5. قاعدة البيانات وهيكلية الجداول (Database Schema)

### 5.1 الجداول والعلاقات الأساسية
| الجدول | الوصف | الحقول الأساسية | العلاقات |
| :--- | :--- | :--- | :--- |
| `site_settings` | إعدادات المنصة | `site_name_ar, site_name_en, logo_url, support_whatsapp, maintenance_mode, mobile_api_version` | Singleton Entity |
| `users` | المستخدمون والمدراء | `id, name, email, phone, role, is_active, password_hash` | `hasMany(activities), hasMany(reviews)` |
| `governorates` | المحافظات | `id, name_ar, name_en, code, is_active, lat, lng` | `hasMany(cities)` |
| `cities` | المدن والمراكز | `id, governorate_id, name_ar, name_en, is_active` | `belongsTo(governorates), hasMany(neighborhoods)` |
| `neighborhoods` | الأحياء | `id, city_id, name_ar, name_en, postal_code` | `belongsTo(cities), hasMany(activities)` |
| `categories` | التصنيفات | `id, parent_id, name_ar, name_en, icon, sector_type` | `belongsTo(parent), hasMany(children)` |
| `activities` | الأنشطة والمحلات | `id, user_id, category_id, city_id, name_ar, lat, lng, is_verified, rating_avg` | `belongsTo(users), belongsTo(categories), hasMany(products)` |
| `products` | كتالوج الأسعار | `id, activity_id, name_ar, price, discount_price, sku, unit, is_available` | `belongsTo(activities)` |
| `offers` | الخصومات | `id, activity_id, product_id, title, discount_percentage, start_date, end_date` | `belongsTo(activities)` |
| `plans` | باقات التجار | `id, name_ar, price, duration_days, max_products, max_branches` | `hasMany(subscriptions)` |
| `subscriptions` | اشتراكات التجار | `id, user_id, activity_id, plan_id, status, end_date` | `belongsTo(users), belongsTo(plans)` |
| `inquiries` | استفسارات العملاء | `id, activity_id, customer_name, customer_phone, message, status` | `belongsTo(activities)` |
| `reviews` | التقييمات | `id, activity_id, user_id, rating, comment, is_approved` | `belongsTo(activities), belongsTo(users)` |
| `audit_logs` | سجل العمليات | `id, user_id, action, entity_type, entity_id, ip_address` | `belongsTo(users)` |

---

## 6. توثيق الـ API ومجموعات الـ Endpoints (REST API v2)

* **Base Endpoint:** `/api/v2`
* **المصادقة:** Bearer Token Header (`Authorization: Bearer <TOKEN>`).

### 6.1 جدول نقاط النهاية الرئيسية
| النطاق (Domain) | الميثود والمسار | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST /api/v2/auth/login` | Public | تسجيل الدخول واستلام التوكن |
| **Auth** | `POST /api/v2/auth/register` | Public | إنشاء حساب جديد |
| **Auth** | `POST /api/v2/auth/forgot-password` | Public | إرسال كود OTP للاستعادة |
| **Settings** | `GET /api/v2/settings` | Public | جلب الإعدادات العامة والهوية |
| **Settings** | `PUT /api/v2/settings` | Admin | تحديث الإعدادات الشاملة |
| **Mobile Bootstrap**| `GET /api/v2/app/bootstrap` | Public / Flutter | تزويد التطبيق بالبيانات الأولية عند الإقلاع |
| **Activities** | `GET /api/v2/activities` | Public | تصفح الأنشطة مع الفلترة |
| **Search & Map** | `GET /api/v2/search/unified` | Public | محرك البحث الموحد |
| **Search & Map** | `GET /api/v2/map/items` | Public | إحداثيات الخريطة التفاعلية |
| **Products** | `GET /api/v2/products/compare` | Public | محرك مقارنة الأسعار |
| **Merchant** | `GET /api/v2/merchant/activities` | Merchant | أنشطة التاجر الحالي |
| **Merchant** | `POST /api/v2/merchant/products/import-csv` | Merchant | استيراد كتالوج المنتجات |
| **Merchant** | `GET /api/v2/merchant/products/export-csv` | Merchant | تصدير الكتالوج CSV |
| **Admin** | `GET /api/v2/admin/stats` | Admin | مؤشرات أداء المنصة |
| **Admin** | `POST /api/v2/admin/activities/:id/verify` | Admin | توثيق واعتماد النشاط التجاري |

---

## 7. توثيق الـ Frontend (Web Client Architecture)
* **المكتبات المستخدمة:** React 18, Vite, Tailwind CSS v4, Lucide React, Leaflet, React-Leaflet.
* **إدارة الحالة:** Context Providers مخصصة (`SettingsProvider`, `AuthProvider`, `I18nProvider`) مع ربط مباشر بـ `localStorage` لمنع وميض البيانات.
* **الصفحات العامة المنفذة:**
  1. الرئيسية (`HomePage`): البانر الديناميكي، التصنيفات السريعة، الأنشطة المميزة، وأحدث العروض.
  2. استكشاف الأنشطة (`ActivitiesPage`): الفلترة متعددة المعايير (المحافظة، المدينة، القطاع).
  3. صفحة النشاط (`ActivityDetailPage`): تفاصيل المتجر، المنتجات، خريطة الموقع، التقييمات، وأزرار الاتصال وواتساب.
  4. الخريطة التفاعلية (`InteractiveMapPage`): تصفح جغرافي للمحلات والمنتجات.
  5. العروض والخصومات (`OffersPage`): أحدث التخفيضات والكوبونات.
  6. إضافة نشاط جديد (`AddActivityPage`): نموذج تسجيل متجر جديد.

---

## 8. تفاصيل لوحة تحكم التاجر (Merchant Portal)
* **المسار:** `/src/apps/merchant-web/MerchantWebApp.tsx`
* **الميزات المنفذة بالكامل:**
  - إدارة الملف التجاري وتعديل بيانات الاتصال وساعات العمل.
  - إدارة الكتالوج وإضافة وتعديل وحذف المنتجات.
  - استيراد وتصدير المنتجات بصيغة CSV مع تدقيق الحقول.
  - إنشاء وإدارة العروض الترويجية والخصومات.
  - صندوق استفسارات العملاء والرد المباشر بواتساب.
  - عرض تفاصيل باقة الاشتراك وطلب الترقية.

---

## 9. تفاصيل لوحة تحكم الإدارة (Admin Operations System)
* **المسار:** `/src/apps/admin-web/AdminWebApp.tsx`
* **الميزات المنفذة بالكامل:**
  - لوحة المؤشرات العامة والإحصائيات اللحظية.
  - إدارة الأنشطة التجارية واعتماد وتوثيق المتاجر.
  - إدارة الهيكل الجغرافي (محافظات ومدن وأحياء).
  - إدارة شجرة القطاعات والتصنيفات.
  - إدارة إعدادات المنصة والهوية البصرية الشاملة (`Site Settings`).
  - صفحة توثيق ومخططات Flutter API للمطورين.
  - سجل التتبع ومراقبة العمليات (Audit Logs).

---

## 10. الأمان وحماية البيانات (Security & Permissions)
* **التحكم بالوصول (RBAC):** عزل تام بين صلاحيات الإدارة، التاجر، والمستخدم.
* **حماية التوكنات:** توكنات قابلة للإلغاء وتخزين آمن عبر Secure Storage في الموبايل.
* **التحقق من المدخلات:** تدقيق الحقول والـ Sanitization لملفات CSV والبيانات النصية لمنع هجمات XSS و Injection.
* **سجل العمليات الحساسة:** تدوين تغييرات الأسعار، اعتماد الأنشطة، وتعديل الإعدادات في `audit_logs`.

---

## 11. المكتبات والتبعيات (Dependencies & Packages)
* **التبعيات الفعلية الحالية:** `react`, `react-dom`, `react-router-dom`, `lucide-react`, `leaflet`, `react-leaflet`, `clsx`, `tailwind-merge`, `express`, `docx`.
* **التبعيات المقترحة لمرحلة الإنتاج:**
  - Backend: `laravel/sanctum`, `maatwebsite/excel`, `spatie/laravel-permission`, `spatie/laravel-activitylog`, `league/flysystem-aws-s3-v3`.
  - Flutter: `dio`, `flutter_bloc`, `flutter_secure_storage`, `google_maps_flutter`, `geolocator`, `firebase_messaging`, `share_plus`, `url_launcher`.

---

## 12. التحويل إلى تطبيقات Flutter (Mobile Readiness & Handoff)

### 12.1 التطبيقات المستهدفة
1. **تطبيق المستخدم (Daleel User App):** إصدار Android (Google Play) وإصدار iOS (App Store).
2. **تطبيق التاجر (Daleel Merchant App):** إصدار Android (Google Play) وإصدار iOS (App Store).

### 12.2 متطلبات الجاهزية للـ Mobile
* **نقطة الإقلاع الموحدة:** `GET /api/v2/app/bootstrap` تزود التطبيق فور فتحه بالإعدادات، التصنيفات، المحافظات، وحالة الصيانة.
* **الروابط العميقة (Deep Linking):** دعم مخطط `daleel://activity/:id` و `daleel://offer/:id`.
* **الإشعارات اللحظية (Push Notifications):** تجهيز تكامل Firebase Cloud Messaging (FCM) وتخزين FCM Device Tokens لكل مستخدم.
* **رفع الصور والوسائط:** توفير نقطة رفع `POST /api/v2/media/upload` للصور المتعددة من الكاميرا والاستوديو.

---

## 13. قسم تأهيل النظام وتنظيف الأصول المؤقتة (System Qualification & Cleanup Items)

| العنصر | موقعه في المشروع | الحالة الحالية وسبب اعتباره مؤقتاً | الإجراء المطلوب للتأهيل والاعتماد | التأثير على إطلاق الموبايل |
| :--- | :--- | :--- | :--- | :--- |
| **محاكاة كود OTP** | `/src/packages/auth/AuthModal.tsx` و `server.ts` | يتم إرجاع رمز ثابت `demo_otp: "4829"` لغرض الاختبار | ربط بوابة SMS حقيقية (مثل VictoryLink أو Twilio) | لا يمنع البدء بـ Flutter لكن يتطلب الإكمال قبل النشر |
| **صور وبيانات وهمية** | `server.ts` ومصفوفات Unsplash | صور الأنشطة والمنتجات تستخدم روابط Unsplash تجريبية | استبدالها بخدمة تخزين سحابية S3 / Cloud Storage ورفع صور حقيقية | لا يمنع تطوير واجهات الموبايل |
| **بوابة الدفع الإلكتروني** | `/api/v2/merchant/subscribe` | تفعيل الباقات يتم فورياً بتسجيل مرجع تجريبي | ربط بوابة دفع مصرية معتمدة (Paymob أو Fawry) | يمنع تفعيل الدفع الآلي داخل التطبيقات |
| **مفاتيح الخرائط** | الويب يستخدم OpenStreetMap Leaflet | الموبايل يتطلب Google Maps SDK | استخراج Google Maps API Keys لنظامي Android و iOS | إلزامي لتشغيل خريطة تطبيق الموبايل |
| **تخزين البيانات في الذاكرة** | `server.ts` (State Array Fallback) | الـ API الحالي يعمل بذاكرة الخادم والـ Storage المحلي | تشغيل قاعدة بيانات PostgreSQL / MySQL المعتمدة في Laravel | إلزامي للإنتاج الحقيقي |

---

## 14. خارطة طريق التنفيذ بدون مدد زمنية (Roadmap Without Timeline)

```
المرحلة 1: تثبيت أساسيات البنية التحتية وقاعدة البيانات الدائمة
├── إطلاق قاعدة بيانات PostgreSQL / MySQL وهجرة الجداول (Migrations).
└── تفعيل Laravel 11 Backend API مع Sanctum Authentication.

المرحلة 2: استكمال بوابات الدفع والرسائل النصية (SMS & Payments)
├── ربط بوابة SMS معتمدة لإرسال رموز التحقق الحقيقية (OTP).
└── ربط بوابة Paymob / Fawry لسداد اشتراكات باقات التجار.

المرحلة 3: إعداد بيئة تخزين الوسائط السحابية (Media CDN)
├── إعداد Amazon S3 / Google Cloud Storage لرفع صور المتاجر والمنتجات.
└── إتاحة نقطة رفع موحدة وآمنة `POST /api/v2/media/upload`.

المرحلة 4: بناء وتأسيس مشروع Flutter الموحد (Shared Mobile Core)
├── إعداد معمارية Clean Architecture مع BLoC و Dio و Secure Storage.
└── بناء محرك مزامنة الإعدادات `GET /api/v2/app/bootstrap` واللغات (AR/EN).

المرحلة 5: بناء تطبيق المستخدم (Daleel User Mobile App)
├── شاشات الاستكشاف، البحث الموحد، والخريطة التفاعلية عبر Google Maps.
├── كتالوجات المنتجات ومقارنة الأسعار وسلة الاستفسارات وواتساب.
└── نظام التقييمات، المفضلة، وحفظ عمليات البحث السابقة.

المرحلة 6: بناء تطبيق التاجر (Daleel Merchant Mobile App)
├── شاشات إدارة المحل، ساعات العمل، وتحديث الإحداثيات الجغرافية.
├── إدارة المنتجات، التقاط الصور من الكاميرا، واستيراد CSV.
└── إدارة العروض، متابعة استفسارات العملاء اللحظية، والاشتراكات.

المرحلة 7: تكامل الإشعارات والروابط العميقة (FCM & Deep Links)
├── إعداد Firebase Cloud Messaging لإرسال إشعارات العروض والاستفسارات.
└── تهيئة Universal Links و App Links لمشاركة الروابط.

المرحلة 8: الاختبارات الشاملة وتجهيز النشر على المتاجر (Store Deployment)
├── اختبارات الأداء، الأمان، والتوافق مع أحجام الشاشات المختلفة.
└── إعداد حسابات Google Play Console و Apple Developer وتوليد الشهادات والنشر.
```

---

## 15. مصفوفة الميزات التفصيلية (Feature Matrix)

| الميزة / الوظيفة | الزائر (Guest) | المستخدم (User) | التاجر (Merchant) | الإدارة (Admin) | تطبيق الموبايل (Flutter) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| استكشاف المتاجر والتصنيفات | ✔ | ✔ | ✔ | ✔ | ✔ |
| البحث الموحد في السلع والخدمات | ✔ | ✔ | ✔ | ✔ | ✔ |
| مقارنة أسعار المنتجات محلياً | ✔ | ✔ | ✔ | ✔ | ✔ |
| الخريطة التفاعلية بالـ GPS | ✔ | ✔ | ✔ | ✔ | ✔ (Google Maps) |
| التقييم وكتابة الآراء | ✖ | ✔ | ✔ | ✔ | ✔ |
| إدارة المحلات وإضافة المنتجات | ✖ | ✖ | ✔ | ✔ | ✔ |
| استيراد وتصدير كتالوجات CSV | ✖ | ✖ | ✔ | ✔ | ✖ (خاص بالويب) |
| إنشاء العروض والخصومات | ✖ | ✖ | ✔ | ✔ | ✔ |
| استقبال استفسارات العملاء | ✖ | ✖ | ✔ | ✔ | ✔ (Push Notifications) |
| اعتماد وتوثيق الأنشطة التجارية | ✖ | ✖ | ✖ | ✔ | ✖ (خاص بالإدارة) |
| ضبط إعدادات المنصة والهوية | ✖ | ✖ | ✖ | ✔ | ✖ (يستهلكها فقط) |
| سجلات التتبع والمراقبة Audit | ✖ | ✖ | ✖ | ✔ | ✖ (خاص بالإدارة) |

---

## 16. قائمة التحقق النهائية لجاهزية الإطلاق (Launch Readiness Checklist)
- [x] توحيد مصدر بيانات إعدادات الموقع بالكامل (Single Source of Truth).
- [x] ربط اسم الموقع واللوجو والفوتر والسوشيال برمجياً بالواجهات العامة.
- [x] دعم الوضع ثنائي اللغة الكامل (عربي / إنجليزي) مع دعم اتجاه RTL/LTR.
- [x] توفير نقطة البداية لتطبيقات الموبايل `GET /api/v2/app/bootstrap`.
- [x] جاهزية نموذج المنتجات لدعم مقارنة الأسعار والخصومات والـ SKU.
- [x] توثيق كامل للواجهات البرمجية ونماذج البيانات لتسليمها لفريق تطوير Flutter.
- [ ] ربط مزود الرسائل النصية الحقيقي SMS OTP (قيد التجهيز للمرحلة القادمة).
- [ ] ربط بوابة الدفع الإلكتروني لسداد الاشتراكات (قيد التجهيز للمرحلة القادمة).

---
**تم إعداد هذه الوثيقة وتدقيقها هندسياً لتكون المرجع الرسمي المعتمد لتسليم وتطوير منظومة «دليل أي خدمة».**
