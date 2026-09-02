# دليل الإيقاف الطارئ والإصلاحات العاجلة (Hotfix & Rollback Playbook)
## Daleel Ay Khidma • Emergency Response & Fast Patch Protocol

---

## 1. آلية الإيقاف الطارئ للإطلاق (Emergency Halting Procedures)

### أ. على منصة Google Play Console (أندرويد):
1. التوجه إلى: **Release** -> **Production**.
2. بجانب الإصدار الجاري نشره (Active Staged Rollout):
3. الضغط على زر **Halt rollout**.
4. تأكيد الإيقاف: يمنع هذا الإجراء وصول التحديث لأي مستخدمين جدد فورياً مع بقاء النسخة لدى الشريحة الحالية فقط.

### ب. على منصة App Store Connect (آبل):
1. الدخول إلى صفحة التطبيق في App Store Connect.
2. التوجه إلى الإصدار الحالي -> **Phased Release for Automatic Updates**.
3. الضغط على **Pause Phased Release**.
4. يمكن إيقاف التوزيع مؤقتاً لمدة تصل إلى 30 يوماً أثناء إعداد الإصلاح.

---

## 2. دورة حياة الإصلاح العاجل (Hotfix Lifecycle & Workflow)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        مسار التعامل مع الإصلاح العاجل                  │
└────────────────────────────────────────────────────────────────────────┘
  [1] رصد المشكلة وتصنيفها P0
          │
  [2] إيقاف الإطلاق المتدرج (Halt Rollout)
          │
  [3] إنشاء فرع إصلاح ساخن (git checkout -b hotfix/v1.0.1)
          │
  [4] تطبيق الإصلاح وإجراء الفحص على أجهزة حقيقية
          │
  [5] زيادة رقم الإصدار والبناء (Version: 1.0.1 / Code: 2)
          │
  [6] بناء الحزم الموقعة (AAB & IPA)
          │
  [7] الرفع وطلب مراجعة سريعة (Expedited Review Request)
```

---

## 3. قواعد زيادة أرقام الإصدارات للإصلاحات العاجلة (Versioning Rules)

| المنصة | الحقل | الإصدار السابق | إصدار الـ Hotfix الأول |
| :--- | :--- | :--- | :--- |
| **Android** | `versionName` | `1.0.0` | `1.0.1` |
| **Android** | `versionCode` | `1` | `2` *(إلزامي الزيادة بمقدار +1)* |
| **iOS** | `CFBundleShortVersionString` | `1.0.0` | `1.0.1` |
| **iOS** | `CFBundleVersion` (Build) | `1` | `2` *(إلزامي الزيادة بمقدار +1)* |

---

## 4. أوامر البناء السريع للإصلاحات العاجلة (Fast Build Commands)

### أ. بناء حزمة أندرويد الإنتاجية:
```bash
cd mobile/user_app
flutter build appbundle --release --obfuscate --split-debug-info=./build/app/outputs/symbols --build-name=1.0.1 --build-number=2

cd ../merchant_app
flutter build appbundle --release --obfuscate --split-debug-info=./build/app/outputs/symbols --build-name=1.0.1 --build-number=2
```

### ب. بناء أرشيف آبل للإنتاج:
```bash
cd mobile/user_app
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist --build-name=1.0.1 --build-number=2

cd ../merchant_app
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist --build-name=1.0.1 --build-number=2
```

---

## 5. طلب المراجعة العاجلة من المتاجر (Expedited Review Protocol)

### أ. لدى متجر آبل (Apple Expedited App Review):
- التوجه إلى نموذج: [Apple Expedited Review Request](https://developer.apple.com/contact/app-store/?topic=expedite).
- اختيار السبب: **Critical Bug Fix**.
- إدراج الوصف: توضيح أن التحديث يعالج عطلاً حرجاً (P0) يؤثر على استقرار التطبيق للمستخدمين.

### ب. لدى متجر جوجل بلاي (Google Play Fast-Track):
- التحديثات المرفوعة إلى مسار Production الموقوف يتم فحصها ومعالجتها كأولوية تلقائياً من نظام جوجل بلاي دون الحاجة لنموذج خارجي.
