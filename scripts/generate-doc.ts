import fs from "fs";
import path from "path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";

async function generateDocx() {
  console.log("Generating Daleel Ay Khidma Official System Documentation DOCX...");

  const borderNone = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
  };

  const createHeading1 = (text: string) =>
    new Paragraph({
      text,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 180 },
    });

  const createHeading2 = (text: string) =>
    new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 260, after: 120 },
    });

  const createParagraph = (text: string, bold = false) =>
    new Paragraph({
      children: [
        new TextRun({
          text,
          bold,
          font: "Arial",
          size: 22,
        }),
      ],
      spacing: { before: 100, after: 100 },
    });

  const createBullet = (text: string, boldPrefix = "") =>
    new Paragraph({
      children: [
        new TextRun({ text: boldPrefix ? `• ${boldPrefix} ` : "• ", bold: true, font: "Arial", size: 22 }),
        new TextRun({ text, font: "Arial", size: 22 }),
      ],
      spacing: { before: 60, after: 60 },
    });

  const createHeaderCell = (text: string, widthPercent: number) =>
    new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: { fill: "374151", type: ShadingType.SOLID, color: "374151" },
      borders: borderNone,
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    });

  const createDataCell = (text: string, widthPercent: number, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.RIGHT) =>
    new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      borders: borderNone,
      children: [
        new Paragraph({
          children: [new TextRun({ text, font: "Arial", size: 20 })],
          alignment: align,
        }),
      ],
    });

  // Table 1: Gaps & Cleanup Items
  const tableCleanup = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("العنصر / الأصل المؤقت", 22),
          createHeaderCell("الموقع في الكود", 22),
          createHeaderCell("سبب اعتباره مؤقتاً / غير معتمد", 26),
          createHeaderCell("الإجراء المطلوب للتأهيل والاعتماد", 30),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("رمز التحقق المؤقت (Demo OTP)", 22),
          createDataCell("AuthModal.tsx & server.ts", 22),
          createDataCell("إرجاع رمز ثابت 4829 للاختبار فقط", 26),
          createDataCell("ربط مزود رسائل SMS حقيقي (Twilio / VictoryLink)", 30),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("روابط الصور التجريبية (Unsplash)", 22),
          createDataCell("server.ts / Mock Arrays", 22),
          createDataCell("استخدام صور عامة عبر الإنترنت بدلاً من التخزين السحابي", 26),
          createDataCell("تجهيز خدمة تخزين S3 / Cloud Storage ورفع ملفات حقيقية", 30),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("الدفع الإلكتروني للاشتراكات", 22),
          createDataCell("/api/v2/merchant/subscribe", 22),
          createDataCell("تفعيل الباقات يسجل مرجع وهمي فورياً بدون خصم مالي", 26),
          createDataCell("ربط بوابة دفع إلكترونية مصرية (Paymob / Fawry)", 30),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("مفاتيح الخرائط للموبايل", 22),
          createDataCell("InteractiveMap & Flutter Config", 22),
          createDataCell("الويب يستخدم Leaflet OSM، بينما الموبايل يتطلب Google Maps SDK", 26),
          createDataCell("استخراج Google Maps API Keys لنظامي Android و iOS", 30),
        ],
      }),
    ],
  });

  // Table 2: Feature Matrix
  const tableFeatureMatrix = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("الوظيفة / الميزة", 28),
          createHeaderCell("الزائر", 18),
          createHeaderCell("التاجر", 18),
          createHeaderCell("الإدارة", 18),
          createHeaderCell("تطبيق Flutter", 18),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("استكشاف الأنشطة والتصنيفات", 28),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("مقارنة أسعار المنتجات والبحث الموحد", 28),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("إدارة المحلات ورفع المنتجات", 28),
          createDataCell("غير متاح ✖", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔ (تطبيق التاجر)", 18, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("استيراد وتصدير كتالوجات CSV", 28),
          createDataCell("غير متاح ✖", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("خاص بالويب ✖", 18, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createDataCell("اعتماد وتوثيق الأنشطة وضبط الإعدادات", 28),
          createDataCell("غير متاح ✖", 18, AlignmentType.CENTER),
          createDataCell("غير متاح ✖", 18, AlignmentType.CENTER),
          createDataCell("متاح ✔", 18, AlignmentType.CENTER),
          createDataCell("خاص بلوحة الإدارة ✖", 18, AlignmentType.CENTER),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "الوثيقة المعمارية والهندسية الرسمية لمنظومة «دليل أي خدمة»",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "Daleel Ay Khidma • System Architecture, API Specs, Mobile Readiness & Official Handoff Blueprint",
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Paragraph({
            text: "الإصدار: 2.4.0-Production-Ready | التاريخ: سبتمبر 2026 | الحالة: معتمد كمرجع لتطوير تطبيقات Flutter",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          createHeading1("1. الملخص التنفيذي والنظرة العامة (Executive Overview)"),
          createParagraph("منظومة «دليل أي خدمة» (Daleel Ay Khidma) هي منصة تجارية وخدمية متطورة ومخصصة للسوق المصري، تجمع بين محرك بحث جغرافي للمحلات والخدمات، كتالوجات منتجات ومقارنة أسعار، بوابة تجار لإدارة الأنشطة واستيراد المنتجات بـ CSV، ولوحة تحكم مركزية للإدارة والتوثيق، ومصدر موحد للإعدادات العامة والهوية البصرية."),
          createBullet("المستخدم النهائي: استكشاف المتاجر، البحث الجغرافي، مقارنة الأسعار، والتواصل عبر واتساب والاتصال."),
          createBullet("التاجر: إدارة النشاط التجاري، رفع وتعديل المنتجات، استيراد وتصدير CSV، نشر العروض، واستقبال الاستفسارات."),
          createBullet("الإدارة: إدارة الهيكل الجغرافي، التصنيفات، اعتماد وتوثيق الأنشطة، ضبط إعدادات المنصة، وسجلات التتبع."),

          createHeading1("2. المعمارية العامة ومصدر الحقيقة الموحد (System Architecture)"),
          createParagraph("تم بناء المنصة وفق معمارية معيارية مفصولة الطبقات، حيث يشترك الويب وتطبيقات الموبايل المستقبلية في نفس الواجهات البرمجية REST API v2 ونفس مصدر الإعدادات (Single Source of Truth) المتاح عبر نقطة /api/v2/settings وسياق SettingsProvider."),
          createBullet("البوابات الأمامية: User Web App, Merchant Web Portal, Admin Operations System."),
          createBullet("الحزم المشتركة (/src/packages): settings, auth, i18n, api-client, types, ui."),
          createBullet("طبقة الخادم: خادم Express/Node مهيأ ومعماريته مطابقة تماماً لإطار عمل Laravel 11 مع Sanctum Auth."),

          createHeading1("3. توثيق الـ API وجاهزية تطبيقات الموبايل (REST API v2)"),
          createParagraph("تعتمد المنصة على معيار RESTful JSON موحد مع توكنات Bearer Tokens وحقول استجابة قياسية (status, data, message, meta):"),
          createBullet("المصادقة: POST /api/v2/auth/login, POST /api/v2/auth/register, POST /api/v2/auth/forgot-password."),
          createBullet("الإعدادات وإقلاع الموبايل: GET /api/v2/settings, GET /api/v2/app/bootstrap."),
          createBullet("الاستكشاف والبحث: GET /api/v2/activities, GET /api/v2/search/unified, GET /api/v2/map/items."),
          createBullet("المنتجات والأسعار: GET /api/v2/products/compare, GET /api/v2/offers, GET /api/v2/plans."),
          createBullet("عمليات التاجر: GET/POST /api/v2/merchant/activities, POST /api/v2/merchant/products/import-csv, GET /export-csv."),
          createBullet("عمليات الإدارة: GET /api/v2/admin/stats, POST /api/v2/admin/activities/:id/verify, GET /audit-logs."),

          createHeading1("4. قسم تأهيل النظام وتنظيف الأصول المؤقتة (System Qualification)"),
          createParagraph("يوثق هذا الجدول كافة العناصر المؤقتة والبيانات التجريبية الحالية وخطة تأهيلها للاعتماد النهائي:"),
          tableCleanup,

          createHeading1("5. مصفوفة الميزات التفصيلية (Feature Matrix)"),
          tableFeatureMatrix,

          createHeading1("6. خارطة طريق التنفيذ بدون مدد زمنية (Roadmap Without Timeline)"),
          createParagraph("المرحلة 1: تثبيت قاعدة البيانات الدائمة (PostgreSQL / MySQL) وهجرة الجداول عبر Laravel 11."),
          createParagraph("المرحلة 2: ربط مزود الرسائل النصية الحقيقي (SMS OTP) وبوابة الدفع الإلكتروني (Paymob / Fawry)."),
          createParagraph("المرحلة 3: إعداد خدمة التخزين السحابي لرفع الصور والملفات (AWS S3 / Google Cloud Storage)."),
          createParagraph("المرحلة 4: تأسيس نواة مشروع Flutter الموحد مع Clean Architecture و BLoC و Dio."),
          createParagraph("المرحلة 5: بناء تطبيق المستخدم Flutter (Android & iOS) مع خرائط Google Maps والبحث الموحد."),
          createParagraph("المرحلة 6: بناء تطبيق التاجر Flutter (Android & iOS) لإدارة المحل، المنتجات، والعروض والاستفسارات."),
          createParagraph("المرحلة 7: تفعيل الإشعارات اللحظية (FCM) والروابط العميقة (Deep Linking daleel://)."),
          createParagraph("المرحلة 8: الاختبارات الشاملة وتجهيز حسابات المتاجر وتوليد الشهادات ونشر التطبيقات."),

          createHeading1("7. قائمة التحقق النهائية (Launch Readiness Checklist)"),
          createBullet("توحيد مصدر بيانات إعدادات الموقع بالكامل وانعكاسها على الهيدر والفوتر والصفحة الرئيسية: [مكتمل ✔]"),
          createBullet("توفير نقطة البداية لتطبيقات الموبايل GET /api/v2/app/bootstrap: [مكتمل ✔]"),
          createBullet("محرك استيراد وتصدير كتالوجات المنتجات CSV للتاجر: [مكتمل ✔]"),
          createBullet("ربط بوابة SMS الحقيقية والدفع الإلكتروني: [قيد التنفيذ في المرحلة التالية]"),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(process.cwd(), "public", "Daleel_Ay_Khidma_Technical_Documentation.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Successfully created Word DOCX at:", outPath);
}

generateDocx().catch((err) => {
  console.error("Error generating DOCX:", err);
  process.exit(1);
});
