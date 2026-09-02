# دليل الجاهزية للنشر (Release Readiness Foundation)
## تطبيق المستخدم - Daleel Ay Khidma User App

---

### 1. إعدادات الروابط العميقة (Deep Linking & Universal Links)

يدعم التطبيق نمطين من الروابط العميقة:
1. **Custom Scheme**: `daleel://activity/{id}`, `daleel://search`, `daleel://favorites`, `daleel://profile`
2. **App Links / Universal Links**: `https://daleelaykhidma.com/activity/{id}`

#### إعداد Android (`android/app/src/main/AndroidManifest.xml`):
```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTop"
    android:theme="@style/LaunchTheme"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
    android:hardwareAccelerated="true"
    android:windowSoftInputMode="adjustResize"
    android:exported="true">

    <intent-filter>
        <action android:name="android.intent.action.MAIN"/>
        <category android:name="android.intent.category.LAUNCHER"/>
    </intent-filter>

    <!-- Custom Scheme: daleel:// -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="daleel" />
    </intent-filter>

    <!-- App Links: https://daleelaykhidma.com -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="daleelaykhidma.com"
            android:pathPrefix="/activity" />
    </intent-filter>
</activity>
```

#### إعداد iOS (`ios/Runner/Info.plist`):
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.daleel.aykhidma.user</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>daleel</string>
        </array>
    </dict>
</array>
```

---

### 2. جاهزية الإشعارات الفورية (Push Notifications)

- **تسجيل الجهاز**: يتم إنشاء وتسجيل رمز الجهاز (Device Token) تلقائياً مع خادم API عبر نقطة `/api/v2/notifications/register-device`.
- **استقبال التنبيهات**: 
  - في الوضع الأمامي (Foreground): يتم عرض شريط تنبيه تفاعلي فوري (In-App Banner) مع زر للانتقال للنشاط المعني.
  - في وضع الخلفية أو الإغلاق (Background/Terminated): يتم استقبال الحمولة وتحويلها فوراً عبر `DeepLinkService`.
- **صندوق الوارد (In-App Inbox)**: واجهة مستخدم كاملة في `NotificationsScreen` مع إمكانية تجربة الإرسال الحي (QA Test Send).

---

### 3. إعدادات الجلسات وإدارة الحساب (Session & Profile)

- **معالجة انتهاء الجلسة المركزية (401 Interceptor)**: تم بناء `StreamController` موحد في `ApiClient` يقوم بمسح الرموز من التخزين الآمن فور انتهاء الصلاحية وإعادة توجيه المستخدم بأمان.
- **تحديث الملف الشخصي**: شاشة `ProfileScreen` تدعم تعديل الاسم، البريد، الهاتف، والمحافظة مع حفظ فوري على السيرفر والكاش.
- **إعدادات التطبيق**: شاشة `SettingsScreen` متكاملة للتحكم في الإشعارات، اللغة، المحافظة الافتراضية، ومسح سجل البحث.

---

### 4. حزم ومعرفات النشر (App Identifiers)

- **Package / Application ID (Android)**: `com.daleel.aykhidma.user`
- **Bundle Identifier (iOS)**: `com.daleel.aykhidma.user`
- **App Version**: `1.0.0` (Build 1)
- **Min SDK (Android)**: `21` (Android 5.0 Lollipop)
- **Target SDK (Android)**: `34` (Android 14)
- **iOS Deployment Target**: `13.0`
