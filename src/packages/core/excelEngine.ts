// ============================================================================
// Daleel Ay Khidma - Universal Excel Engine (XLSX & CSV Generation & Parsing)
// ============================================================================

import * as XLSX from "xlsx";

export interface ColumnDefinition {
  key: string;
  labelAr: string;
  labelEn: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "enum";
  enumValues?: string[];
  sampleValue?: string | number | boolean;
  descriptionAr?: string;
}

export interface ValidationResultRow {
  rowNumber: number;
  isValid: boolean;
  action: "create" | "update" | "skip";
  errors: string[];
  warnings: string[];
  data: Record<string, any>;
  matchedId?: number;
}

export interface ValidationSummary {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  willCreateCount: number;
  willUpdateCount: number;
  unknownColumns: string[];
  missingRequiredColumns: string[];
  rows: ValidationResultRow[];
}

// ============================================================================
// Resource Column Definitions
// ============================================================================

export const CATEGORIES_EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: "id", labelAr: "معرف التصنيف (اختياري للتحديث)", labelEn: "id", required: false, type: "number", sampleValue: 101, descriptionAr: "اتركه فارغاً لإنشاء تصنيف جديد، أو ضع المعرف للتحديث" },
  { key: "name_ar", labelAr: "اسم التصنيف بالعربية", labelEn: "name_ar", required: true, type: "string", sampleValue: "عيادات ومراكز طبية", descriptionAr: "الاسم الرسمي للتصنيف باللغة العربية" },
  { key: "name_en", labelAr: "اسم التصنيف بالإنجليزية", labelEn: "name_en", required: true, type: "string", sampleValue: "Medical Clinics & Centers", descriptionAr: "الاسم بالإنجليزية للروابط والترجمة" },
  { key: "slug", labelAr: "الاسم اللطيف (Slug)", labelEn: "slug", required: false, type: "string", sampleValue: "medical-clinics", descriptionAr: "اسم الرابط، يولد تلقائياً إن ترك فارغاً" },
  { key: "section_name", labelAr: "اسم القطاع الرئيسي", labelEn: "section_name", required: false, type: "string", sampleValue: "الخدمات", descriptionAr: "المحلات، الخدمات، الحرف، المعلمون، البلوجر" },
  { key: "section_slug", labelAr: "رمز القطاع (section_slug)", labelEn: "section_slug", required: false, type: "string", sampleValue: "services", descriptionAr: "shops, services, crafts, teachers, bloggers" },
  { key: "icon", labelAr: "اسم الأيقونة (Lucide)", labelEn: "icon", required: false, type: "string", sampleValue: "Stethoscope", descriptionAr: "رمز الأيقونة مثل UtensilsCrossed, Stethoscope, CarFront" },
  { key: "description_ar", labelAr: "الوصف بالعربية", labelEn: "description_ar", required: false, type: "string", sampleValue: "دليل العيادات والمستشفيات والمراكز المتخصصة", descriptionAr: "وصف موجز للتصنيف" },
  { key: "sort_order", labelAr: "الترتيب", labelEn: "sort_order", required: false, type: "number", sampleValue: 1, descriptionAr: "ترتيب الظهور في الواجهة" },
  { key: "is_active", labelAr: "الحالة (نشط: 1 / غير نشط: 0)", labelEn: "is_active", required: false, type: "boolean", sampleValue: 1, descriptionAr: "1 للتفعيل أو 0 للتعطيل" },
];

export const LOCATIONS_EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: "id", labelAr: "معرف السجل (اختياري)", labelEn: "id", required: false, type: "number", sampleValue: "", descriptionAr: "معرف اختياري للتحديث" },
  { key: "governorate_name_ar", labelAr: "اسم المحافظة بالعربية", labelEn: "governorate_name_ar", required: true, type: "string", sampleValue: "القاهرة", descriptionAr: "المحافظة التابع لها" },
  { key: "governorate_name_en", labelAr: "اسم المحافظة بالإنجليزية", labelEn: "governorate_name_en", required: false, type: "string", sampleValue: "Cairo", descriptionAr: "Cairo, Giza, Alexandria" },
  { key: "governorate_code", labelAr: "كود المحافظة", labelEn: "governorate_code", required: false, type: "string", sampleValue: "EGY-CAI", descriptionAr: "رمز فريد للمحافظة" },
  { key: "city_name_ar", labelAr: "اسم المدينة / المركز بالعربية", labelEn: "city_name_ar", required: false, type: "string", sampleValue: "مدينة نصر", descriptionAr: "اتركه فارغاً لإنشاء محافظة فقط" },
  { key: "city_name_en", labelAr: "اسم المدينة بالإنجليزية", labelEn: "city_name_en", required: false, type: "string", sampleValue: "Nasr City", descriptionAr: "Nasr City, New Cairo" },
  { key: "city_code", labelAr: "كود المدينة", labelEn: "city_code", required: false, type: "string", sampleValue: "CAI-NC", descriptionAr: "رمز فريد للمدينة" },
  { key: "neighborhood_name_ar", labelAr: "اسم الحي / المنطقة بالعربية", labelEn: "neighborhood_name_ar", required: false, type: "string", sampleValue: "مكرم عبيد", descriptionAr: "اتركه فارغاً لإنشاء مدينة فقط" },
  { key: "neighborhood_name_en", labelAr: "اسم الحي بالإنجليزية", labelEn: "neighborhood_name_en", required: false, type: "string", sampleValue: "Makram Ebeid", descriptionAr: "اسم الحي بالإنجليزية" },
  { key: "neighborhood_code", labelAr: "كود الحي / الرمز البريدي", labelEn: "neighborhood_code", required: false, type: "string", sampleValue: "11765", descriptionAr: "كود المنطقة أو الرمز البريدي" },
  { key: "latitude", labelAr: "خط العرض (Latitude)", labelEn: "latitude", required: false, type: "number", sampleValue: 30.0561, descriptionAr: "الإحداثيات الجغرافية" },
  { key: "longitude", labelAr: "خط الطول (Longitude)", labelEn: "longitude", required: false, type: "number", sampleValue: 31.3412, descriptionAr: "الإحداثيات الجغرافية" },
  { key: "is_active", labelAr: "الحالة (1/0)", labelEn: "is_active", required: false, type: "boolean", sampleValue: 1, descriptionAr: "1 للتفعيل أو 0 للتعطيل" },
  { key: "sort_order", labelAr: "الترتيب", labelEn: "sort_order", required: false, type: "number", sampleValue: 1, descriptionAr: "ترتيب الظهور" },
];

export const PRODUCTS_EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: "name", labelAr: "اسم المنتج", labelEn: "name", required: true, type: "string", sampleValue: "ساعة ذكية مقاومة للماء", descriptionAr: "اسم المنتج بالعربية" },
  { key: "sku", labelAr: "رمز الصنف (SKU)", labelEn: "sku", required: false, type: "string", sampleValue: "WATCH-SM-01", descriptionAr: "رمز فريد للمنتج للتحديث التلقائي" },
  { key: "price", labelAr: "السعر الأساسي", labelEn: "price", required: true, type: "number", sampleValue: 1250, descriptionAr: "السعر الأصلي" },
  { key: "sale_price", labelAr: "سعر التخفيض (اختياري)", labelEn: "sale_price", required: false, type: "number", sampleValue: 999, descriptionAr: "سعر العرض إن وجد" },
  { key: "currency", labelAr: "العملة", labelEn: "currency", required: false, type: "string", sampleValue: "ج.م", descriptionAr: "ج.م أو EGP" },
  { key: "stock_qty", labelAr: "الكمية المتوفرة", labelEn: "stock_qty", required: false, type: "number", sampleValue: 25, descriptionAr: "عدد القطع في المخزن" },
  { key: "short_description", labelAr: "وصف مختصر", labelEn: "short_description", required: false, type: "string", sampleValue: "شاشة AMOLED مع بطارية تدوم 7 أيام", descriptionAr: "موجز في بطاقة المنتج" },
  { key: "full_description", labelAr: "الوصف التفصيلي", labelEn: "full_description", required: false, type: "string", sampleValue: "مواصفات كاملة وضمان محلي لمدة عامين", descriptionAr: "شرح شامل ومواصفات" },
  { key: "availability_note", labelAr: "ملاحظة التوفر", labelEn: "availability_note", required: false, type: "string", sampleValue: "متوفر تسليم فوري", descriptionAr: "شحن سريع، متوفر بالطلب" },
  { key: "cover_image", labelAr: "رابط صورة الغلاف", labelEn: "cover_image", required: false, type: "string", sampleValue: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", descriptionAr: "رابط مباشر لصورة المنتج" },
];

export const ACTIVITIES_EXCEL_COLUMNS: ColumnDefinition[] = [
  { key: "id", labelAr: "معرف النشاط (اختياري)", labelEn: "id", required: false, type: "number", sampleValue: "", descriptionAr: "للتحديث إن وجد" },
  { key: "name_ar", labelAr: "اسم النشاط التجاري بالعربية", labelEn: "name_ar", required: true, type: "string", sampleValue: "مطعم البرنس للمشويات", descriptionAr: "الاسم التجاري الكامل" },
  { key: "name_en", labelAr: "اسم النشاط بالإنجليزية", labelEn: "name_en", required: false, type: "string", sampleValue: "El Prince Restaurant", descriptionAr: "الاسم الإنجليزي" },
  { key: "phone", labelAr: "رقم الهاتف الأساسي", labelEn: "phone", required: true, type: "string", sampleValue: "01012345678", descriptionAr: "رقم الاتصال المباشر" },
  { key: "whatsapp_number", labelAr: "رقم الواتساب للطلبات", labelEn: "whatsapp_number", required: false, type: "string", sampleValue: "01012345678", descriptionAr: "رقم استقبال رسائل الواتساب" },
  { key: "section_slug", labelAr: "رمز القطاع", labelEn: "section_slug", required: false, type: "string", sampleValue: "shops", descriptionAr: "shops, services, crafts, teachers, bloggers" },
  { key: "category_name_ar", labelAr: "اسم التصنيف", labelEn: "category_name_ar", required: true, type: "string", sampleValue: "مطاعم ومأكولات", descriptionAr: "التصنيف التابع له النشاط" },
  { key: "governorate_name_ar", labelAr: "اسم المحافظة", labelEn: "governorate_name_ar", required: true, type: "string", sampleValue: "القاهرة", descriptionAr: "المحافظة" },
  { key: "city_name_ar", labelAr: "اسم المدينة", labelEn: "city_name_ar", required: false, type: "string", sampleValue: "مدينة نصر", descriptionAr: "المدينة" },
  { key: "neighborhood_name_ar", labelAr: "اسم الحي", labelEn: "neighborhood_name_ar", required: false, type: "string", sampleValue: "مكرم عبيد", descriptionAr: "الحي / المنطقة" },
  { key: "address_ar", labelAr: "العنوان التفصيلي", labelEn: "address_ar", required: false, type: "string", sampleValue: "شارع مكرم عبيد بجوار السراج مول", descriptionAr: "العنوان الدقيق للفرع" },
  { key: "has_delivery", labelAr: "خدمة التوصيل (1/0)", labelEn: "has_delivery", required: false, type: "boolean", sampleValue: 1, descriptionAr: "1 يدعم توصيل / 0 استلام بالفرع فقط" },
  { key: "delivery_fee_from", labelAr: "رسوم التوصيل من", labelEn: "delivery_fee_from", required: false, type: "number", sampleValue: 15, descriptionAr: "أقل سعر توصيل" },
  { key: "delivery_fee_to", labelAr: "رسوم التوصيل إلى", labelEn: "delivery_fee_to", required: false, type: "number", sampleValue: 30, descriptionAr: "أعلى سعر توصيل" },
  { key: "delivery_estimated_time", labelAr: "مدة التوصيل التقريبية", labelEn: "delivery_estimated_time", required: false, type: "string", sampleValue: "30-45 دقيقة", descriptionAr: "الوقت المقدر للتوصيل" },
  { key: "status", labelAr: "حالة التوثيق (verified/pending)", labelEn: "status", required: false, type: "string", sampleValue: "verified", descriptionAr: "verified, pending, rejected, suspended" },
  { key: "is_featured", labelAr: "نشاط مميز (1/0)", labelEn: "is_featured", required: false, type: "boolean", sampleValue: 1, descriptionAr: "1 للتمييز في الواجهة" },
];

// ============================================================================
// File Exporting Functions
// ============================================================================

/**
 * Export data array to formatted XLSX file and trigger download
 */
export function exportToExcel(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  filename: string,
  sheetName = "البيانات"
) {
  // Map data to display labels
  const formattedRows = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      let val = item[col.key];
      if (val === undefined || val === null) val = "";
      else if (typeof val === "boolean") val = val ? "نعم (1)" : "لا (0)";
      row[col.label] = val;
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(formattedRows);

  // Auto column widths
  const colWidths = columns.map((col) => {
    const headerLen = col.label.length * 1.5;
    const maxValLen = Math.max(
      headerLen,
      ...data.map((d) => String(d[col.key] || "").length)
    );
    return { wch: Math.min(Math.max(maxValLen + 4, 12), 40) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/**
 * Export data array to CSV file and trigger download
 */
export function exportToCSV(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  filename: string
) {
  const formattedRows = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      let val = item[col.key];
      if (val === undefined || val === null) val = "";
      else if (typeof val === "boolean") val = val ? "1" : "0";
      row[col.label] = val;
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(formattedRows);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csvOutput], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Generate official ready-to-fill XLSX Template with guidelines sheet and sample data
 */
export function downloadExcelTemplate(
  resourceType: "categories" | "locations" | "products" | "activities",
  filenamePrefix = "template"
) {
  let columns: ColumnDefinition[] = [];
  let sampleRows: Record<string, any>[] = [];
  let resourceTitleAr = "";
  let instructions: string[][] = [];

  if (resourceType === "categories") {
    columns = CATEGORIES_EXCEL_COLUMNS;
    resourceTitleAr = "قالب استيراد القطاعات والتصنيفات التجارية";
    sampleRows = [
      {
        id: "",
        name_ar: "مطاعم ومأكولات سريعة",
        name_en: "Restaurants & Fast Food",
        slug: "restaurants-fast-food",
        section_name: "المحلات",
        section_slug: "shops",
        icon: "UtensilsCrossed",
        description_ar: "دليل مطاعم الوجبات السريعة والمأكولات الشرقية والغربية",
        sort_order: 1,
        is_active: 1,
      },
      {
        id: "",
        name_ar: "مراكز صيانة السيارات",
        name_en: "Auto Repair Centers",
        slug: "auto-repair",
        section_name: "الخدمات",
        section_slug: "services",
        icon: "CarFront",
        description_ar: "ورش الصيانة والميكانيكا وكهرباء السيارات وقطع الغيار",
        sort_order: 2,
        is_active: 1,
      },
      {
        id: "",
        name_ar: "معلمو الرياضيات والفيزياء",
        name_en: "Math & Physics Tutors",
        slug: "math-tutors",
        section_name: "المعلمون",
        section_slug: "teachers",
        icon: "Laptop",
        description_ar: "دروس خصوصية ومراجعات نهائية للمرحلة الثانوية والجامعية",
        sort_order: 3,
        is_active: 1,
      },
      {
        id: "",
        name_ar: "نجارة وديكورات خشبية",
        name_en: "Carpentry & Woodwork",
        slug: "carpentry",
        section_name: "الحرف",
        section_slug: "crafts",
        icon: "Wrench",
        description_ar: "تفصيل أثاث وصيانة مطابخ وأبواب وغرف نوم",
        sort_order: 4,
        is_active: 1,
      },
    ];
    instructions = [
      ["إرشادات استيراد التصنيفات والقطاعات", ""],
      ["1. الحقول الإجبارية", "اسم التصنيف بالعربية (name_ar) واسم التصنيف بالإنجليزية (name_en)"],
      ["2. ربط القطاع الرئيسي", "اكتب في (section_name) اسم القطاع مثل: المحلات، الخدمات، الحرف، المعلمون، البلوجر، أو الرمز (section_slug)"],
      ["3. التحديث التلقائي", "إذا كان التصنيف موجوداً بنفس الاسم أو الرابط (slug) أو الـ id، فسيتم تحديثه تلقائياً دون تكرار."],
      ["4. الأيقونات المدعومة", "UtensilsCrossed, Stethoscope, CarFront, Laptop, Wrench, ShoppingBag, Building2, Store, Sparkles"],
      ["5. التفعيل والتعطيل", "ضع 1 لتفعيل التصنيف أو 0 لجعله مسودة مخفية"],
    ];
  } else if (resourceType === "locations") {
    columns = LOCATIONS_EXCEL_COLUMNS;
    resourceTitleAr = "قالب استيراد المحافظات والمدن والأحياء الجغرافية";
    sampleRows = [
      {
        id: "",
        governorate_name_ar: "القاهرة",
        governorate_name_en: "Cairo",
        governorate_code: "EGY-CAI",
        city_name_ar: "مدينة نصر",
        city_name_en: "Nasr City",
        city_code: "CAI-NC",
        neighborhood_name_ar: "مكرم عبيد",
        neighborhood_name_en: "Makram Ebeid",
        neighborhood_code: "11765",
        latitude: 30.0561,
        longitude: 31.3412,
        is_active: 1,
        sort_order: 1,
      },
      {
        id: "",
        governorate_name_ar: "القاهرة",
        governorate_name_en: "Cairo",
        governorate_code: "EGY-CAI",
        city_name_ar: "مدينة نصر",
        city_name_en: "Nasr City",
        city_code: "CAI-NC",
        neighborhood_name_ar: "عباس العقاد",
        neighborhood_name_en: "Abbas El Akkad",
        neighborhood_code: "11766",
        latitude: 30.0578,
        longitude: 31.3456,
        is_active: 1,
        sort_order: 2,
      },
      {
        id: "",
        governorate_name_ar: "القاهرة",
        governorate_name_en: "Cairo",
        governorate_code: "EGY-CAI",
        city_name_ar: "التجمع الخامس",
        city_name_en: "Fifth Settlement",
        city_code: "CAI-5TH",
        neighborhood_name_ar: "شارع التسعين الشمالي",
        neighborhood_name_en: "North 90th St",
        neighborhood_code: "11835",
        latitude: 30.0245,
        longitude: 31.4721,
        is_active: 1,
        sort_order: 3,
      },
      {
        id: "",
        governorate_name_ar: "الجيزة",
        governorate_name_en: "Giza",
        governorate_code: "EGY-GIZ",
        city_name_ar: "الدقي",
        city_name_en: "Dokki",
        city_code: "GIZ-DOK",
        neighborhood_name_ar: "ميدان المساحة",
        neighborhood_name_en: "Mesaha Sq",
        neighborhood_code: "12311",
        latitude: 30.0381,
        longitude: 31.2119,
        is_active: 1,
        sort_order: 1,
      },
      {
        id: "",
        governorate_name_ar: "الإسكندرية",
        governorate_name_en: "Alexandria",
        governorate_code: "EGY-ALX",
        city_name_ar: "سموحة",
        city_name_en: "Smouha",
        city_code: "ALX-SMO",
        neighborhood_name_ar: "",
        neighborhood_name_en: "",
        neighborhood_code: "",
        latitude: 31.2156,
        longitude: 29.9553,
        is_active: 1,
        sort_order: 1,
      },
    ];
    instructions = [
      ["إرشادات استيراد الهيكل الجغرافي (محافظة ← مدينة ← حي)", ""],
      ["1. التسلسل الهرمي", "يتم إنشاء المحافظة أولاً ثم المدينة ثم الحي تلقائياً تحتها."],
      ["2. الحالات الممكنة في كل صف", "• صف به محافظة فقط → تُنشأ محافظة جديدة أو تُحدّث.\n• صف به محافظة + مدينة → تُنشأ المدينة تابعة للمحافظة.\n• صف به محافظة + مدينة + حي → يُنشأ الحي تابعاً للمدينة التابعة للمحافظة."],
      ["3. شروط السلامة", "يمنع إنشاء مدينة بدون محافظة، ويمنع إنشاء حي بدون مدينة."],
      ["4. الإحداثيات", "خطوط الطول والعرض اختيارية وتساعد في محاكي النطاق الجغرافي وحساب المسافة بدقة."],
    ];
  } else if (resourceType === "products") {
    columns = PRODUCTS_EXCEL_COLUMNS;
    resourceTitleAr = "قالب استيراد المنتجات وقائمة الأصناف";
    sampleRows = [
      {
        name: "طقم قهوة تركي سيراميك فاخر",
        sku: "COF-SET-01",
        price: 450,
        sale_price: 380,
        currency: "ج.م",
        stock_qty: 30,
        short_description: "طقم مكون من 6 فناجين مع الصينية",
        full_description: "صناعة يدوية عالية الجودة مقاومة للحرارة بتصميم عثماني أصيل",
        availability_note: "متوفر تسليم فوري",
        cover_image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
      },
      {
        name: "مصباح مكتبي LED ذكي",
        sku: "LED-DESK-09",
        price: 320,
        sale_price: "",
        currency: "ج.م",
        stock_qty: 50,
        short_description: "إضاءة قابلة لتعديل السطوع ودرجة اللون",
        full_description: "يعمل بمنفذ USB مع شاحن لاسلكي مدمج للهواتف",
        availability_note: "شحن سريع خلال 24 ساعة",
        cover_image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
      },
    ];
    instructions = [
      ["إرشادات استيراد المنتجات والكتالوج", ""],
      ["1. الحقول الإجبارية", "اسم المنتج (name) والسعر الأساسي (price)"],
      ["2. التحديث برمز الصنف SKU", "إذا تم إدخال SKU لمنتج موجود بالفعل بالنشاط، سيتم تحديث بياناته وسعره تلقائياً بدلاً من التكرار."],
      ["3. سعر التخفيض sale_price", "اختياري، ويجب أن يكون أقل من السعر الأساسي ليظهر كخصم."],
    ];
  } else if (resourceType === "activities") {
    columns = ACTIVITIES_EXCEL_COLUMNS;
    resourceTitleAr = "قالب استيراد الأنشطة والمحلات التجارية";
    sampleRows = [
      {
        id: "",
        name_ar: "مخبز وحلواني الشرق",
        name_en: "El Shark Bakery",
        phone: "01099887766",
        whatsapp_number: "01099887766",
        section_slug: "shops",
        category_name_ar: "مطاعم ومأكولات",
        governorate_name_ar: "القاهرة",
        city_name_ar: "مدينة نصر",
        neighborhood_name_ar: "مكرم عبيد",
        address_ar: "15 شارع مكرم عبيد",
        has_delivery: 1,
        delivery_fee_from: 15,
        delivery_fee_to: 25,
        delivery_estimated_time: "25-35 دقيقة",
        status: "verified",
        is_featured: 1,
      },
    ];
    instructions = [
      ["إرشادات استيراد الأنشطة والمحلات", ""],
      ["1. الحقول الإجبارية", "اسم النشاط، رقم الهاتف، التصنيف، المحافظة"],
      ["2. خدمة التوصيل", "ضع 1 في (has_delivery) لتفعيل التوصيل وتحديد الأسعار والمدة التقديرية"],
      ["3. حالة التوثيق", "verified (موثق رسمياً)، pending (قيد المراجعة)"],
    ];
  }

  // Create Workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template Data Ready to fill
  const templateHeader: Record<string, string> = {};
  columns.forEach((c) => {
    templateHeader[c.key] = c.labelAr;
  });

  const formattedSampleRows = sampleRows.map((row) => {
    const r: Record<string, any> = {};
    columns.forEach((c) => {
      r[c.labelAr] = row[c.key] !== undefined ? row[c.key] : (c.sampleValue || "");
    });
    return r;
  });

  const wsData = XLSX.utils.json_to_sheet(formattedSampleRows);
  const colWidths = columns.map((c) => ({
    wch: Math.max(c.labelAr.length * 1.6, 16),
  }));
  wsData["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(wb, wsData, "بيانات الاستيراد (عبي هنا)");

  // Sheet 2: Field Dictionary & Explanations
  const dictionaryRows = columns.map((c) => ({
    "اسم العمود في الملف": c.labelAr,
    "المفتاح البرمجي (Key)": c.key,
    "هل الحقل إجباري؟": c.required ? "نعم (إجباري)" : "اختياري",
    "نوع البيانات": c.type || "نص",
    "قيمة توضيحية": String(c.sampleValue || ""),
    "شرح الاستخدام": c.descriptionAr || "",
  }));
  const wsDict = XLSX.utils.json_to_sheet(dictionaryRows);
  wsDict["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsDict, "دليل الأعمدة والشروط");

  // Sheet 3: General Guidelines
  if (instructions.length > 0) {
    const wsInst = XLSX.utils.aoa_to_sheet(instructions);
    wsInst["!cols"] = [{ wch: 30 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsInst, "تعليمات هامة");
  }

  const filename = `${filenamePrefix}_${resourceType}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ============================================================================
// File Parsing & Normalization
// ============================================================================

/**
 * Read and parse an Excel or CSV file in the browser, matching headers to keys
 */
export async function parseExcelFile(
  file: File,
  knownColumns: ColumnDefinition[]
): Promise<{
  sheetName: string;
  rawRows: Record<string, any>[];
  normalizedRows: Record<string, any>[];
  headers: string[];
  unknownHeaders: string[];
  missingRequiredHeaders: string[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array" });

  const firstSheetName = wb.SheetNames[0] || "Sheet1";
  const ws = wb.Sheets[firstSheetName];

  // Convert to 2D array to inspect headers
  const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (!rawData || rawData.length === 0) {
    throw new Error("الملف المرفوع فارغ تماماً ولا يحتوي على أي بيانات.");
  }

  // Find header row (first non-empty row)
  let headerRowIndex = 0;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i].some((cell) => cell !== undefined && String(cell).trim() !== "")) {
      headerRowIndex = i;
      break;
    }
  }

  const headerRow = (rawData[headerRowIndex] || []).map((h) => String(h || "").trim());
  const dataRows = rawData.slice(headerRowIndex + 1).filter((r) => r.some((c) => c !== undefined && String(c).trim() !== ""));

  if (dataRows.length === 0) {
    throw new Error("الملف يحتوي على صف الأعمدة فقط بدون أي صفوف بيانات.");
  }

  // Build header mapping dictionary (support Arabic label, English label, and key)
  const headerMap: Record<number, string> = {};
  const unknownHeaders: string[] = [];

  headerRow.forEach((h, colIdx) => {
    if (!h) return;
    const cleanH = h.toLowerCase().replace(/[\s_\-\(\)\.]+/g, "");

    const matchedCol = knownColumns.find((c) => {
      const matchKey = c.key.toLowerCase().replace(/[\s_\-\(\)\.]+/g, "") === cleanH;
      const matchEn = c.labelEn.toLowerCase().replace(/[\s_\-\(\)\.]+/g, "") === cleanH;
      const matchAr = c.labelAr.replace(/[\s_\-\(\)\.]+/g, "") === h.replace(/[\s_\-\(\)\.]+/g, "");
      const partialAr = h.includes(c.labelAr.substring(0, 8)) || c.labelAr.includes(h);
      return matchKey || matchEn || matchAr || partialAr;
    });

    if (matchedCol) {
      headerMap[colIdx] = matchedCol.key;
    } else {
      unknownHeaders.push(h);
    }
  });

  // Check missing required columns
  const foundKeys = new Set(Object.values(headerMap));
  const missingRequiredHeaders = knownColumns
    .filter((c) => c.required && !foundKeys.has(c.key))
    .map((c) => c.labelAr);

  // Normalize data rows into objects
  const rawRows: Record<string, any>[] = [];
  const normalizedRows: Record<string, any>[] = [];

  dataRows.forEach((row) => {
    const rawObj: Record<string, any> = {};
    const normObj: Record<string, any> = {};

    row.forEach((cellVal: any, colIdx: number) => {
      const originalHeader = headerRow[colIdx] || `Col_${colIdx + 1}`;
      rawObj[originalHeader] = cellVal;

      const mappedKey = headerMap[colIdx];
      if (mappedKey) {
        let val = cellVal;
        if (typeof val === "string") val = val.trim();
        // Convert boolean strings like 'نعم', '1', 'true'
        if (val === "نعم" || val === "1" || val === 1 || val === "true" || val === true) val = 1;
        else if (val === "لا" || val === "0" || val === 0 || val === "false" || val === false) val = 0;
        normObj[mappedKey] = val;
      }
    });

    rawRows.push(rawObj);
    normalizedRows.push(normObj);
  });

  return {
    sheetName: firstSheetName,
    rawRows,
    normalizedRows,
    headers: headerRow,
    unknownHeaders,
    missingRequiredHeaders,
  };
}
