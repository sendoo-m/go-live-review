# حسابات المراجعة والاختبار للمتاجر (Demo & Review Accounts)
## Daleel Ay Khidma • Store Reviewer Credentials & Test Instructions

---

## 1. حسابات المراجعة المخصصة لفريق مراجعة التطبيقات (App Review Accounts)

### أ. حساب التاجر المعتمد (Verified Merchant Demo Account)
*هذا الحساب مخصص لاختبار تطبيق بوابة التاجر (`daleel_merchant_app`) والتأكد من كافة وظائف إدارة النشاط والكتالوج والعروض والـ CRM.*

| الحقل | القيمة |
| :--- | :--- |
| **اسم المستخدم / البريد الإلكتروني** | `merchant.demo@aykhidma.com` |
| **كلمة المرور** | `Daleel@2026Secure` |
| **الدور (Role)** | `merchant` (تاجر معتمد) |
| **النشاط التجاري المرتبط** | **مطعم ومشويات السلطان** (Activity ID: `1`) |
| **الصلاحيات المفعلة** | إدارة النشاط، إضافة منتجات، رفع صور R2، نشر عروض، والرد على الاستفسارات |

---

### ب. حساب المستخدم العادي (Standard User Demo Account)
*هذا الحساب مخصص لاختبار تطبيق المستخدم العام (`daleel_user_app`) وتجربة إضافة المفضلة والتقييمات والملف الشخصي.*

| الحقل | القيمة |
| :--- | :--- |
| **البريد الإلكتروني** | `user.demo@aykhidma.com` |
| **كلمة المرور** | `Daleel@2026User` |
| **الدور (Role)** | `user` (مستخدم عام) |
| **الاسم المعروض** | أحمد محمود |
| **الموقع الافتراضي** | القاهرة، مصر (30.0444, 31.2357) |

---

## 2. ملاحظات موجهة لمراجعي آبل وجوجل (Notes for App Store & Google Play Reviewers)

### ملاحظات مراجع تطبيق المستخدم (`daleel_user_app`):
```text
Hello App Review Team,

Thank you for reviewing Daleel Ay Khidma.

1. Guest Mode:
The app supports immediate browsing of businesses, categories, and offers without requiring an account. Users only need to log in when saving favorites, submitting reviews, or managing their personal profile.

2. Location Access:
Location permission is optional. If granted, the app automatically sorts nearby businesses and centers the interactive map on the user's location. If denied, the app gracefully falls back to the default city center with full searching capabilities.

3. Demo Account:
To test authenticated features (Favorites, Profile, Review Submission):
- Email: user.demo@aykhidma.com
- Password: Daleel@2026User

If you have any questions or require additional details, please contact us at sendoo.m@gmail.com.
```

### ملاحظات مراجع تطبيق بوابة التاجر (`daleel_merchant_app`):
```text
Hello App Review Team,

This application is the dedicated Merchant Portal for Daleel Ay Khidma, used exclusively by registered business owners to manage their directory listing, digital catalogs, flash offers, and incoming customer inquiries.

Demo Credentials:
- Email: merchant.demo@aykhidma.com
- Password: Daleel@2026Secure

Key Review Flow:
1. Log in using the demo merchant credentials above.
2. The Dashboard displays live business insights (views, inquiries count).
3. The Catalog tab allows adding and editing products with image uploads (stored on Cloudflare R2).
4. The Offers tab allows creating time-limited discounts.
5. The Inquiries CRM tab displays incoming customer leads with direct reply actions.
6. The Media tab allows uploading high-resolution photos directly to the media vault.

For any inquiries, please contact our review team at sendoo.m@gmail.com.
```
