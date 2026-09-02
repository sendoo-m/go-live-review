# دليل البناء والتوقيع الرقمي للأجهزة والمتاجر (Build & Signing Guide)
## Daleel Ay Khidma • Mobile Production Build Instructions

---

## 1. المتطلبات المسبقة للبناء (Prerequisites)
- **Flutter SDK:** الإصدار `>= 3.19.0`
- **Dart SDK:** الإصدار `>= 3.0.0 < 4.0.0`
- **Android Studio / Java JDK:** JDK 17
- **Xcode (لـ iOS):** الإصدار `>= 15.0`
- **Cocoapods:** الإصدار `>= 1.13.0`

---

## 2. أوامر بناء أندرويد (Android Release Commands)

### أ. بناء حزم متجر جوجل بلاي (Android App Bundle - .aab)

#### لتطبيق المستخدم (`daleel_user_app`):
```bash
cd mobile/user_app

# 1. تثبيت الحزم
flutter pub get

# 2. بناء حزمة AAB للتوزيع الرسمي
flutter build appbundle --release --obfuscate --split-debug-info=./build/app/outputs/symbols
```
*المخرج النهائي:* `mobile/user_app/build/app/outputs/bundle/release/app-release.aab`

#### لتطبيق بوابة التاجر (`daleel_merchant_app`):
```bash
cd mobile/merchant_app

# 1. تثبيت الحزم
flutter pub get

# 2. بناء حزمة AAB
flutter build appbundle --release --obfuscate --split-debug-info=./build/app/outputs/symbols
```
*المخرج النهائي:* `mobile/merchant_app/build/app/outputs/bundle/release/app-release.aab`

---

### ب. بناء ملفات التثبيت المباشر على أجهزة أندرويد (Universal Release APKs)

```bash
# بناء APK للتجربة الميدانية المباشرة
cd mobile/user_app
flutter build apk --release --split-per-abi

cd ../merchant_app
flutter build apk --release --split-per-abi
```

---

## 3. أوامر بناء آبل (iOS / TestFlight / App Store Commands)

### أ. تجهيز Pods والـ Archive

#### لتطبيق المستخدم (`daleel_user_app`):
```bash
cd mobile/user_app/ios
pod install --repo-update
cd ..

# بناء أرشيف iOS للإنتاج
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist --obfuscate --split-debug-info=./build/ios/symbols
```
*المخرج النهائي:* `mobile/user_app/build/ios/ipa/daleel_user_app.ipa`

#### لتطبيق بوابة التاجر (`daleel_merchant_app`):
```bash
cd mobile/merchant_app/ios
pod install --repo-update
cd ..

# بناء أرشيف iOS
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist --obfuscate --split-debug-info=./build/ios/symbols
```
*المخرج النهائي:* `mobile/merchant_app/build/ios/ipa/daleel_merchant_app.ipa`

---

## 4. خطوات رفع الحزم إلى المتاجر (Upload to Stores)

### أ. الرفع إلى Google Play Console:
1. الدخول إلى [Google Play Console](https://play.google.com/console).
2. اختيار التطبيق (`دليل أي خدمة` أو `بوابة التاجر`).
3. التوجه إلى: **Testing** -> **Internal testing** (أو **Production**).
4. إنشاء إصدار جديد (Create new release).
5. رفع ملف الـ `.aab` المولد.
6. لصق نص **Release Notes** من ملف `docs/RELEASE_NOTES.md`.
7. مراجعة وحفظ الإصدار، ثم الضغط على **Start rollout to Internal testing**.

### ب. الرفع إلى Apple App Store / TestFlight:
1. استخدام أداة **Transporter** من آبل أو أمر سطر الأوامر:
```bash
xcrun altool --upload-app --type ios --file build/ios/ipa/daleel_user_app.ipa --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID
```
2. أو فتح المشروع في **Xcode** -> اختيار `Runner` -> **Product** -> **Archive** -> **Distribute App** -> **App Store Connect**.
3. بمجرد انتهاء معالجة الحزمة على App Store Connect، ستصبح متاحة في **TestFlight** للمختبرين الداخليين والخارجيين.
