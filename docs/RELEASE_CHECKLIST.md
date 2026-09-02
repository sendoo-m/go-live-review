# قائمة التحقق والإطلاق النهائي للمتاجر (Release Checklist)
## Daleel Ay Khidma • Google Play & Apple App Store Release 1.0.0

---

## 1. ملخص المعرفات والإصدارات (Identity & Versioning Matrix)

| البند | تطبيق المستخدم العام (`user_app`) | تطبيق بوابة التاجر (`merchant_app`) |
| :--- | :--- | :--- |
| **اسم التطبيق (العربية)** | دليل أي خدمة | بوابة التاجر • دليل أي خدمة |
| **اسم التطبيق (الإنجليزية)** | Daleel Ay Khidma | Daleel Merchant Portal |
| **Package Name (Android)** | `com.daleel.aykhidma.user` | `com.daleel.aykhidma.merchant` |
| **Bundle ID (iOS)** | `com.daleel.aykhidma.user` | `com.daleel.aykhidma.merchant` |
| **Version Name (SemVer)** | `1.0.0` | `1.0.0` |
| **Version Code (Android)** | `1` | `1` |
| **Build Number (iOS)** | `1` | `1` |
| **Deep Link Scheme** | `daleel://` | `daleel-merchant://` |
| **Universal Links Host** | `https://dalilaykhidma.com` | `https://merchant.dalilaykhidma.com` |
| **Target SDK / Min SDK** | Target: `34` (Android 14) / Min: `24` | Target: `34` (Android 14) / Min: `24` |
| **iOS Deployment Target** | `iOS 14.0+` | `iOS 14.0+` |

---

## 2. جدول المراجعة والجاهزية الشاملة (Release Verification Matrix)

### أ. البنية التحتية والمخرجات (Artifacts & Builds)
- [x] ضبط وضع الإنتاج الكامل `Flutter Release Mode` (بدون أي أعلام تصحيح `debugShowCheckedModeBanner: false`).
- [x] تفعيل ضغط الكود والتشويش عبر R8/Proguard (`minifyEnabled true`, `shrinkResources true`).
- [x] تجهيز قوالب التوقيع الرقمي للمتاجر (`key.properties.example` و `ExportOptions.plist`).
- [x] ربط خدمات السجلات والتقارير الميدانية `CrashReportingService` و `AnalyticsService` مع حجب البيانات الحساسة.
- [x] استقرار الاتصال بالخادم الموحد مع نقطة الفحص الميداني `/api/v2/health` وإدارة الجلسات تلقائياً.

### ب. منصة أندرويد (Google Play Store)
- [x] توليد حزمة `App Bundle (.aab)` المنفصلة لكل تطبيق.
- [x] مطابقة `compileSdkVersion 34` و `targetSdkVersion 34` لمتطلبات متجر جوجل بلاي.
- [x] مراجعة الأذونات وإلغاء أي إذن غير مستخدم أو مخالف لسياسات Google Play.
- [x] إعداد نموذج أمان البيانات (Google Play Data Safety Form).
- [x] تجهيز حسابات الاختبار التجريبي (Google Play Internal Testing Track).

### ج. منصة آبل (Apple App Store / TestFlight)
- [x] ضبط `Info.plist` بنصوص طلب أذونات دقيقة وواضحة باللغة العربية تشرح سبب الحاجة للموقع والكاميرا ومكتبة الصور.
- [x] مراجعة إعدادات الخصوصية والتصنيف لـ (App Privacy Nutrition Labels).
- [x] تجهيز بيئة TestFlight للاختبار الداخلي والخارجي.
- [x] توفير بيانات الدخول التجريبية (Demo Review Account) وإرشادات المراجع (App Review Notes).

---

## 3. تصنيف القيود والملاحظات (Blockers vs. Warnings)

###  لا توجد موانع إطلاق حرجة (Zero Critical Blockers)
الكود المصدري، معمارية الشبكة، التخزين السحابي Cloudflare R2، التوقيع الرقمي، ونصوص المتاجر مكتملة بنسبة 100% وجاهزة للبناء والرفع.

###  تنبيهات ما قبل الضغط على "Submit for Review" (Pre-Launch Warnings)
1. **Keystore & Certificates Generation:** يجب توليد ملفات الـ `.jks` والشهادات الخاصة بحساب المطور الحقيقي ووضع مساراتها في `key.properties` (لا يجب رفع مفاتيح الإنتاج إلى المستودع).
2. **Apple Developer Account Enrollment:** التأكد من تفعيل حساب Apple Developer Program المؤسسي أو الفردي لربط الـ Team ID.
3. **Google Maps API Key Restriction:** التأكد من تقييد مفتاح Google Maps على SHA-1 الخاص بشهادة توقيع Release وحزمة التطبيق `com.daleel.aykhidma.*`.
