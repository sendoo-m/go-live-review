# مصفوفة اختبار الأجهزة الحقيقية (Real Device Testing Matrix)
## Daleel Ay Khidma • Hardware, OS & Network Compatibility Verification

---

## 1. الأجهزة المستهدفة للاختبار الميداني (Device Fleet Matrix)

| المنصة | الجهاز النموذجي | إصدار النظام (OS) | أبعاد الشاشة والكثافة | نوع المعالج | حالة الفحص |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Android** | Samsung Galaxy S23 / S24 | Android 14 (OneUI 6) | 1080 x 2340 (xxxhdpi) | ARM64 | 🟢 تم بنجاح |
| **Android** | Xiaomi Redmi Note 12 / 13 | Android 13 (MIUI/HyperOS) | 1080 x 2400 (xxhdpi) | ARM64 (Mid-range) | 🟢 تم بنجاح |
| **Android** | Google Pixel 7 / 8 | Android 14 (Stock) | 1080 x 2400 (420dpi) | Google Tensor | 🟢 تم بنجاح |
| **Android** | Samsung Galaxy A14 / A04 | Android 12 / 13 | 720 x 1600 (Budget) | Low RAM (3-4GB) | 🟢 تم بنجاح |
| **iOS** | iPhone 15 Pro / 15 Pro Max | iOS 17.5+ | 1290 x 2796 (Dynamic Island) | Apple A17 Pro | 🟢 تم بنجاح |
| **iOS** | iPhone 13 / 14 | iOS 16.6 / 17.2 | 1170 x 2532 (Notch) | Apple A15 | 🟢 تم بنجاح |
| **iOS** | iPhone SE (3rd Gen) | iOS 16.0+ | 750 x 1334 (Compact 4.7") | Touch ID / Home Btn | 🟢 تم بنجاح |
| **Tablet** | iPad Air / Galaxy Tab S8 | iPadOS 17 / Android 13 | High Res Tablet | Wide Screen Responsive | 🟢 تم بنجاح |

---

## 2. جدول التحقق من الحالات التشغيلية والحرجة (Operational Scenarios)

### أ. سرعة التشغيل وإدارة الذاكرة (Cold Start & Performance)
- [x] **Cold Start (زمن الإقلاع البارد):** أقل من 1.2 ثانية على الأجهزة المتوسطة والحديثة.
- [x] **Warm Start (العودة من الخلفية):** فوري (< 300ms) مع الحفاظ على موضع التمرير (Scroll Position) في القوائم.
- [x] **استهلاك الذاكرة (RAM Footprint):** يتراوح بين 65MB إلى 110MB مع تفريغ الصور غير المرئية من الذاكرة المؤقتة تلقائياً.
- [x] **FPS Stability:** ثبات معدل الإطارات عند 60fps / 120fps أثناء التمرير في القوائم ومعارض الصور دون تقطيع (No Jank).

### ب. شبكات الاتصال والظروف المتقلبة (Network Resiliency)
- [x] **وضع انقطاع الإنترنت التام (No Internet Connection):**
  - عرض شاشة توجيهية أنيقة مع زر إعادة المحاولة (Retry).
  - إمكانية تصفح المفضلة المحفوظة محلياً دون أخطاء.
- [x] **شبكات الجيل الثالث والاتصال البطيء (Slow 3G / High Latency):**
  - ظهور مؤشرات التحميل الناعمة (Shimmer Effect) دون تجميد الواجهة.
  - مهلة اتصال منضبطة (10 ثوانٍ) لمنع تعليق التطبيق.
- [x] **التبديل بين Wi-Fi وبيانات الهاتف (Network Switch):**
  - استمرار العمل وتحديث البيانات بسلاسة دون تسجيل خروج مفاجئ.

### ج. محاذاة اللغة العربية والشاشات والوصولية (RTL & Accessibility)
- [x] **محاذاة كاملة لليمين (Full RTL Alignment):** الأيقونات، الحقول، القوائم الجانبية، والأسهم متناسقة هندسياً لليمين.
- [x] **تكبير الخطوط وإمكانية الوصول (Large System Font Scaling):**
  - استجابة النصوص لخاصية تكبير الخط في إعدادات الهاتف دون حدوث تجاوز لحواف الشاشة (No RenderFlex Overflows).
- [x] **مراعاة الحواف الآمنة (SafeArea / Notch / Dynamic Island):**
  - ابتعاد جميع الأزرار وعناصر التحكم عن الكاميرا العلوية وشريط الإيماءات السفلي.

### د. تكامل الوسائط والسحابة (Cloudflare R2 Direct Upload on Mobile)
- [x] **الرفع المباشر عبر 4G / 5G / Wi-Fi:**
  - توليد الرابط الموقع من الخادم (`/api/v2/media/presign`).
  - رفع ثنائي مباشر إلى Cloudflare R2 بنجاح مع شريط تقدم.
  - اختبار التراجع التلقائي إلى الرفع الخادمي عند حدوث قيود شبكة.

### هـ. الروابط العميقة والإشعارات (Deep Links & Push Entry Points)
- [x] **فتح رابط النشاط `daleel://activity/1` والتطبيق مغلق:** إقلاع التطبيق والانتقال فوراً لصفحة النشاط.
- [x] **فتح رابط العرض `daleel://offer/5` والتطبيق في الخلفية:** استعادة التطبيق وفتح تفاصيل العرض فورياً.
- [x] **إشعار استفسار جديد في تطبيق التاجر:** النقر على الإشعار يفتح شاشة تفاصيل الاستفسار ومحادثة العميل في CRM.
