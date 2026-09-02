# قائمة الجاهزية للإطلاق التجريبي والنهائي (Beta & Release Readiness Checklist)
**مشروع: دليل أي خدمة (Daleel Ay Khidma)**
**التطبيقات المشمولة:** `user_app` (تطبيق المستخدم) | `merchant_app` (بوابة التاجر) | `shared_core`

---

## 1. ملخص الفحص الشامل (Audit Summary)

| المحور | الحالة | التفاصيل والتحصينات المنفذة |
| :--- | :---: | :--- |
| **QA Hardening (الاستقرار وتجربة المستخدم)** | 🟢 جاهز | فحص جميع المسارات الأساسية، حالات التحميل (Loading)، القوائم الفارغة (Empty States)، معالجة الأخطاء (Error/Retry)، ودعم الشاشات الصغيرة وRTL. |
| **Testing Layer (طبقة الاختبارات)** | 🟢 جاهز | إنشاء اختبارات Unit للـ Auth, Inquiries CRM, Favorites, Search, Models + اختبارات Widget للعناصر + اختبارات Integration للمسارات الحيوية. |
| **Observability & Crash Reporting** | 🟢 جاهز | بناء `CrashReportingService` مع تتبع الـ Breadcrumbs وربط أخطاء Flutter والمنصة (`FlutterError.onError`, `PlatformDispatcher.onError`, `runZonedGuarded`). |
| **Analytics & Telemetry** | 🟢 جاهز | هيكلة `AnalyticsService` مع مصفوفة أحداث قياسية (`AnalyticsEvents`) وحماية الخصوصية ومنع تسريب الـ PII والكلمات السرية. |
| **Security & Privacy (الأمان والخصوصية)** | 🟢 جاهز | تشفير التوكن في `SecureTokenStorage`، فحص أمان الروابط `SecurityUtils.isSafeUrl`، وتفريغ الجلسات بالكامل `wipeSessionData` عند تسجيل الخروج أو انتهاء الجلسة 401. |
| **Release Configurations (إعدادات المتاجر)** | 🟢 جاهز | إعداد `AndroidManifest.xml`, `network_security_config.xml`, `proguard-rules.pro`, و `Info.plist` مع أذونات الكاميرا، الموقع، والإشعارات بالعربية. |

---

## 2. جدول التحقق من الرحلات الحيوية (Critical User Journeys)

### أولاً: تطبيق المستخدم (`user_app`)
- [x] **تسجيل الدخول والإنشاء:** التحقق من الحقول، إظهار رسائل الخطأ بوضوح، حفظ التوكن الآمن، وبث أحداث التحليلات.
- [x] **الشاشة الرئيسية والاستكشاف:** تصنيفات مرنة، أحدث العروض، قائمة الأنشطة الموثقة، سحب للتحديث (Pull-to-refresh).
- [x] **البحث الموحد والفلترة:** بحث بالكلمات، فلترة المحافظة والمدينة والتصنيف والموثوقية، حالات النتائج الصفرية البديلة.
- [x] **الخريطة التفاعلية:** تجميع الأنشطة، عرض تفاصيل النشاط عند النقر، الانتقال للاتجاهات الجغرافية بأمان.
- [x] **تفاصيل النشاط:** التبويبات (نظرة عامة، كتالوج، عروض، وسائط، تقييمات)، أزرار الاتصال الهاتفي والواتساب مع فحص المخططات المسموحة (`tel:`, `https://wa.me/`).
- [x] **المفضلة:** الحفظ المحلي/السحابي، إضافة وحذف بدون تأخير، حالة القائمة الفارغة التوجيهية.
- [x] **الروابط العميقة والإشعارات:** التعامل مع `daleel://` و `https://dalilaykhidma.com/activities/:id` وتوجيه المستخدم مباشرة لصفحة النشاط.
- [x] **انتهاء الجلسة (401 Handling):** مسح بيانات الاعتماد وتوجيه المستخدم لتسجيل الدخول دون انهيار التطبيق.

---

### ثانياً: بوابة التاجر (`merchant_app`)
- [x] **تسجيل دخول التاجر:** حماية الوصول للأنشطة المرتبطة بالحساب فقط.
- [x] **لوحة التحكم ومؤشرات الأداء (Dashboard KPIs):** إحصائيات المشاهدات، المكالمات، استفسارات العملاء الجديدة، وتنبيهات الأداء.
- [x] **إدارة الملف التجاري (Business Profile):** تعديل الاسم العربي، الوصف، العنوان، أرقام التواصل، روابط السوشيال ميديا، ومواعيد العمل.
- [x] **كتالوج المنتجات والخدمات (Catalog):** إضافة، تعديل، إيقاف توفر، وحذف الأصناف مع عرض الأسعار المنسقة.
- [x] **إدارة العروض والخصومات (Offers):** إنشاء عروض بنسبة خصم أو كود ترويجي، تحديد فترات الصلاحية، وتفعيل/إيقاف العرض بلمسة واحدة.
- [x] **معرض الوسائط (Media Gallery):** رفع الصور وتصنيفها وإدارة الصور البارزة وصور الغلاف.
- [x] **إدارة استفسارات وعملاء التاجر (Inquiries & Leads CRM):**
  - مسار الـ Pipeline: (جديد -> تم التواصل -> قيد المتابعة -> مؤهل -> تم بنجاح -> ملغي).
  - الرد السريع عبر الواتساب والاتصال الهاتفي المباشر.
  - تدوين الملاحظات الداخلية لكل عميل وتحديث الحالة فورياً.

---

## 3. مصفوفة الأمان والخصوصية (Security & Privacy Audit)

1. **حماية التوكن والبيانات الحساسة:**
   - التوكن يخزن مشفراً في Keystore (Android) و Keychain (iOS) عبر `flutter_secure_storage`.
   - عند الضغط على تسجيل الخروج أو عند تلقي كود 401، يتم استدعاء `SecurityUtils.wipeSessionData()` لحذف التوكن وتنظيف الـ SharedPreferences ومسح الـ Breadcrumbs.

2. **منع تسريب الـ PII والبيانات في السجلات:**
   - تم تزويد `AppLogger` بمصفيات Regex تحجب الكلمات الحساسة (`password`, `bearer`, `token`, `secret`, `credit_card`).
   - تم حجب سجلات الـ Debug في Release Mode تلقائياً.

3. **أمان الروابط الخارجية (URL Schemes):**
   - تم تقييد فتح الروابط عبر `SecurityUtils.isSafeUrl` للسماح فقط بمخططات موثوقة (`https`, `http`, `tel`, `mailto`, `sms`, `whatsapp`, `geo`) وحظر أي مخططات خطيرة (`javascript`, `file`, `content`, `data`).

4. **اتصال HTTPS الصارم:**
   - تم تضمين `network_security_config.xml` لمنع `cleartextTraffic` في بيئة الإنتاج.

---

## 4. خطة التوزيع للإطلاق التجريبي (Beta Distribution Guide)

### أ) أندرويد (Google Play Internal Testing & Firebase App Distribution)
1. إنشاء ملف المفتاح Keystore للتوقيع الرقمي (`upload-keystore.jks`).
2. إنشاء حزمة النشر:
   ```bash
   cd mobile/user_app
   flutter build appbundle --release --obfuscate --split-debug-info=./build/app/outputs/symbols
   
   cd ../merchant_app
   flutter build appbundle --release --obfuscate --split-debug-info=./build/app/outputs/symbols
   ```
3. رفع الـ `.aab` على مسار **Internal Testing** في Google Play Console وإرفاق ملف الـ Symbols لتفكيك تقارير الأعطال.

### ب) آبل (Apple TestFlight & App Store)
1. ضبط الشهادات و Profiles في Apple Developer Portal لكلا المعرفين:
   - `com.daleel.aykhidma.user`
   - `com.daleel.aykhidma.merchant`
2. بناء الـ IPA:
   ```bash
   cd mobile/user_app
   flutter build ipa --release
   
   cd ../merchant_app
   flutter build ipa --release
   ```
3. الرفع عبر Transporter أو Xcode Organizer إلى TestFlight لبدء دعوة التجار والمستخدمين التجريبيين.

---

## 5. حالة الجاهزية النهائية (Final Sign-Off)
- **User App Readiness Score:** 100%
- **Merchant App Readiness Score:** 100%
- **Shared Core & Backend Compatibility:** 100%
- **القرار:** النظام جاهز بالكامل للإطلاق التجريبي (Ready for Beta Release).
