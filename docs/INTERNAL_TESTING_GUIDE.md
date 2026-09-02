# دليل تشغيل الاختبار الداخلي للمتاجر (Internal Testing & TestFlight Playbook)
## Daleel Ay Khidma • Operational Guide for Google Play & Apple TestFlight

---

## 1. مسار Google Play Internal Testing

### أ. إنشاء وإعداد قائمة المختبرين الداخليين (Email List)
1. التوجه إلى [Google Play Console](https://play.google.com/console) -> اختيار التطبيق (`دليل أي خدمة` أو `بوابة التاجر`).
2. من القائمة الجانبية: **Testing** -> **Internal testing**.
3. التوجه لتبويب **Testers**:
   - إنشاء قائمة بريدية جديدة باسم `Daleel Internal Core Team`.
   - إضافة إيميلات فريق العمل والمختبرين المعتمدين (Google Accounts / Gmail).
   - تفعيل خيار: **Copy link** للحصول على رابط الانضمام الداخلي (Opt-in Link):
     ```
     https://play.google.com/apps/internaltest/...
     ```

### ب. رفع وبناء حزمة الإنتاج التجريبية (AAB Release)
1. بناء الحزمة الموقعة مع رموز تصحيح الأعطال:
   ```bash
   cd mobile/user_app
   flutter build appbundle --release --obfuscate --split-debug-info=./build/app/outputs/symbols
   ```
2. في لوحة Google Play Console -> **Create new release**:
   - رفع ملف `app-release.aab`.
   - رفع ملف الـ Symbols المضغوط `symbols.zip` لتحليل الـ Stack Traces تلقائياً في Play Console.
   - كتابة Release Notes من ملف `docs/RELEASE_NOTES.md`.
3. الضغط على **Review Release** ثم **Start rollout to Internal testing**.
4. التحديث يصبح متاحاً للمختبرين خلال دقائق قليلة دون انتظار مراجعة جوجل الطويلة.

---

## 2. مسار Apple TestFlight

### أ. إعداد المجموعات التجريبية (TestFlight Groups)
1. الدخول إلى [App Store Connect](https://appstoreconnect.apple.com) -> اختيار التطبيق.
2. التوجه لتبويب **TestFlight**:
   - **Internal Group:** (تصل التحديثات فورياً لفريق التطوير دون مراجعة آبل).
   - **External Beta Group:** باسم `Daleel Verified Merchants & Beta Users` (تتطلب مراجعة أولى سريعة من آبل، ثم تتيح إنشاء Public Link لدعوة حتى 10,000 مختبر).

### ب. رفع حزمة IPA إلى TestFlight
1. بناء الحزمة:
   ```bash
   cd mobile/user_app
   flutter build ipa --release --export-options-plist=ios/ExportOptions.plist
   ```
2. الرفع باستخدام **Transporter** أو سطر الأوامر:
   ```bash
   xcrun altool --upload-app --type ios --file build/ios/ipa/daleel_user_app.ipa --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID
   ```
3. بمجرد اكتمال المعالجة (Processing):
   - تعيين **Export Compliance Information:** اختيار `No` للتشفير القياسي (Standard HTTPS).
   - كتابة **What to Test (Arabic & English)** للمختبرين.
   - تفعيل إرسال الإشعارات للمختبرين لتثبيت الإصدار عبر تطبيق TestFlight على أجهزة iPhone / iPad.

---

## 3. تعليمات الانضمام والتثبيت للمختبرين (Tester Onboarding Instructions)

### لمستخدمي أندرويد (Android Testers):
1. فتح رابط الدعوة في المتصفح وتسجيل الدخول بحساب جوجل المعتمد.
2. الضغط على **"Accept Invitation"** ثم **"Download it on Google Play"**.
3. سيتم فتح صفحة التطبيق وتثبيته مباشرة مع تلقي التحديثات التلقائية.

### لمستخدمي آبل (iOS Testers):
1. تثبيت تطبيق **TestFlight** من متجر App Store.
2. فتح رابط الدعوة الموجه أو البريد الإلكتروني المرسل من TestFlight.
3. الضغط على **"Accept"** ثم **"Install"**.
4. يمكن للمختبر إرسال لقطة شاشة مع تعليق مباشرة عبر الضغط على زري الصوت والتشغيل داخل التطبيق واختيار **"Share Beta Feedback"**.

---

## 4. إرشادات التعامل مع تحديثات البيتا السريعة (Fast Hotfix Cycle)
- عند اكتشاف أي ملاحظة وإصلاحها:
  - يتم زيادة `versionCode` في أندرويد بمقدار `+1` (مثال: `versionCode: 2`).
  - يتم زيادة `build-number` في آبل بمقدار `+1` (مثال: `1.0.0+2`).
  - يتم إعادة بناء الحزم ورفعها للمسار نفسه دون الحاجة لإنشاء روابط جديدة للمختبرين.
