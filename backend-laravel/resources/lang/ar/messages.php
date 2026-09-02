<?php

return [
    /*
    |--------------------------------------------------------------------------
    | رسائل النظام العامة (Arabic System Messages)
    |--------------------------------------------------------------------------
    */
    'login_successful' => 'تم تسجيل الدخول بنجاح.',
    'token_refreshed' => 'تم تجديد رمز المصادقة (Token) بنجاح.',
    'activity_created' => 'تم إنشاء النشاط التجاري بنجاح وهو بانتظار المراجعة والاعتماد.',
    'activity_updated' => 'تم تحديث بيانات النشاط التجاري بنجاح.',
    'activity_deleted' => 'تم حذف النشاط التجاري بنجاح.',
    'activity_not_verified' => 'هذا النشاط قيد المراجعة ولم يتم اعتماده للنشر بعد.',
    'activity_verified_success' => 'تم توثيق واعتماد النشاط التجاري بنجاح ونشره في الدليل.',
    'activity_rejected_success' => 'تم رفض توثيق النشاط التجاري وإشعار المالك بالسبب.',
    'activity_suspended_success' => 'تم تعليق النشاط التجاري مؤقتاً.',
    'review_submitted_success' => 'شكراً لمشاركتك! تم إضافة تقييمك بنجاح.',
    'role_created_success' => 'تم إنشاء الدور الجديد وربط الصلاحيات بنجاح.',
    'role_updated_success' => 'تم تحديث الدور والصلاحيات المرتبطة بنجاح.',
    'role_deleted_success' => 'تم حذف الدور بنجاح.',
    'user_role_updated_success' => 'تم تحديث دور ونطاق المستخدم بنجاح.',

    // رسائل حماية النطاق الجغرافي (Geographic Scope)
    'geo_scope_violation' => 'غير مصرح: لا يمكنك طلب بيانات أو إنشاء سجلات خارج نطاقك الجغرافي المخصص (:user_location).',
    'geo_scope_unauthorized_access' => 'غير مصرح: ليس لديك صلاحية الوصول إلى بيانات تقع خارج نطاقك الجغرافي.',
    'geo_scope_unauthorized_modification' => 'غير مصرح: لا يمكنك تعديل نشاط تجاري يقع خارج محافظتك أو مدينتك المعتمدة.',
    'geo_scope_unauthorized_deletion' => 'غير مصرح: لا يمكنك حذف نشاط تجاري خارج نطاقك الجغرافي.',
    'geo_scope_unauthorized_verification' => 'غير مصرح: كمراجع محلي، يمكنك فقط اعتماد وتوثيق الأنشطة الواقعة داخل نطاقك الجغرافي.',

    // رسائل الصلاحيات
    'permission_denied' => 'غير مصرح: ليس لديك الصلاحية المطلوبة (:permissions) لتنفيذ هذه العملية.',
    'only_general_manager_can_create_roles' => 'عفواً، فقط المدير العام مخوّل بإنشاء أدوار جديدة في المنظومة.',
    'only_general_manager_update_roles' => 'عفواً، فقط المدير العام مخوّل بتعديل الأدوار والصلاحيات.',
    'only_general_manager_can_delete_roles' => 'عفواً، فقط المدير العام مخوّل بحذف الأدوار.',
    'cannot_delete_system_role' => 'لا يمكن حذف الأدوار النظامية الأساسية المبنية في النظام.',
    'cannot_delete_role_with_active_users' => 'لا يمكن حذف هذا الدور لوجود مستخدمين وموظفين مسندين إليه حالياً.',

    // حماية سجل العمليات (Append-Only Audit Log)
    'audit_log_immutable_update' => 'انتهاك أمني: سجل العمليات (Audit Log) غير قابل للتعديل نهائياً (Append-Only Immutable).',
    'audit_log_immutable_delete' => 'انتهاك أمني: سجل العمليات (Audit Log) غير قابل للحذف نهائياً (Append-Only Immutable).',
];
