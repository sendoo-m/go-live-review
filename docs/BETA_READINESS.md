# وثيقة الجاهزية للإطلاق التجريبي وحلقة التقييم (Beta Readiness & Testing Framework)
## Daleel Ay Khidma • Google Play Internal Testing & Apple TestFlight Framework

---

## 1. أهداف مرحلة الإطلاق التجريبي (Beta Goals & Scope)
1. **التحقق على أجهزة حقيقية (Real Device Validation):** قياس زمن بدء التشغيل (Cold Start & Warm Start)، استهلاك الذاكرة والبطارية، وتوافق مقاسات الشاشات المختلفة.
2. **استقرار الرحلات الحيوية (Core Flows Stability):** التحقق من عمليات تسجيل الدخول، استعراض الأنشطة، الخريطة الحية، رفع الصور السحابية عبر Cloudflare R2، وإدارة CRM في تطبيق التاجر.
3. **حلقة جمع الملاحظات (Feedback Loop):** فتح قنوات مباشرة لجمع تقارير الأعطال وتجربة المستخدم من مختبري الميدان وتصنيفها فورياً.
4. **مراقبة الأعطال الحية والتحليلات (Crash & Telemetry Observability):** التأكد من التقاط السجلات والسياق (Breadcrumbs) وحجب أي بيانات حساسة.

---

## 2. مصفوفة تكوين مسارات الاختبار الداخلي (Internal Tracks Matrix)

| الإعداد | تطبيق المستخدم (`daleel_user_app`) | تطبيق بوابة التاجر (`daleel_merchant_app`) |
| :--- | :--- | :--- |
| **Package Name / Bundle ID** | `com.daleel.aykhidma.user` | `com.daleel.aykhidma.merchant` |
| **Version / Build** | `1.0.0 (1)` | `1.0.0 (1)` |
| **Google Play Track** | **Internal Testing** (فريق العمل + 50 مختبر موثوق) | **Internal Testing** (التجار المعتمدين + فريق العمل) |
| **Apple TestFlight Group** | **Internal & External Beta Groups** | **Merchant Alpha/Beta TestFlight Group** |
| **خادم الاتصال (API Endpoint)** | `https://api.dalilaykhidma.com/api/v2` | `https://api.dalilaykhidma.com/api/v2` |
| **تخزين وتسليم الوسائط** | `https://images.dalilaykhidma.com` (Cloudflare R2) | `https://images.dalilaykhidma.com` (Cloudflare R2) |
| **حسابات المراجعة المدمجة** | `user.demo@aykhidma.com` / `Daleel@2026User` | `merchant.demo@aykhidma.com` / `Daleel@2026Secure` |

---

## 3. محاور الفحص التشغيلي في النسخ التجريبية (Verification Pillars)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        محاور الفحص الميداني للبيتا                     │
└────────────────────────────────────────────────────────────────────────┘
          │                                           │
  ┌───────▼────────┐                         ┌────────▼────────┐
  │  تطبيق المستخدم  │                         │   تطبيق التاجر  │
  └───────┬────────┘                         └────────┬────────┘
          │                                           │
  • تصفح الأنشطة والتصنيفات                   • لوحة التحكم والإحصائيات
  • البحث الذكي والفلترة الجغرافية           • إدارة الملف وساعات العمل
  • الخريطة التفاعلية وتحديد المسافات         • كتالوج المنتجات والأسعار
  • تفاصيل النشاط وتصفح الكتالوج              • إطلاق وتعديل العروض
  • الاتصال والمراسلة المباشرة                • نظام CRM وإدارة الاستفسارات
  • حفظ المفضلة وكتابة التقييمات              • رفع الصور السحابية (R2 Direct)
  • الروابط العميقة (Deep Links)              • رمز الاستجابة السريعة (QR)
```

---

## 4. معايير اجتياز مرحلة البيتا (Beta Exit Criteria)
- [x] **معدل خلو من الأعطال (Crash-Free Sessions):** `>= 99.5%` لجميع الجلسات.
- [x] **زمن الاستجابة للواجهات:** عدم وجود أي تجميد (UI Jank) أو أخطاء تجاوز حواف الشاشة (No RenderFlex Overflow).
- [x] **عدم وجود أي أخطاء مانعة للإطلاق (Zero Blocker Issues).**
- [x] **استقرار معالجة انقطاع الإنترنت:** عرض شاشات المحاولة البديلة دون انهيار التطبيق.
- [x] **اكتمال التحقق من دورة رفع الصور السحابية الموقعة:** `PUT` مباشر إلى R2 مع التراجع التلقائي للباك إند.
