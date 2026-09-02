<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * ينشئ الأدوار الستة الافتراضية مع الصلاحيات المخصصة لكل دور
     */
    public function run(): void
    {
        // 1. إنشاء كافة الصلاحيات المتاحة في النظام
        $permissions = [
            // أنشطة تجارية
            ['name' => 'view_activities', 'display_name_ar' => 'عرض الأنشطة التجارية', 'module' => 'activities'],
            ['name' => 'manage_activities', 'display_name_ar' => 'إدارة وإنشاء الأنشطة التجارية', 'module' => 'activities'],
            ['name' => 'review_activities', 'display_name_ar' => 'مراجعة طلبات الأنشطة التجارية', 'module' => 'activities'],
            ['name' => 'verify_activities', 'display_name_ar' => 'اعتماد وتوثيق الأنشطة التجارية', 'module' => 'activities'],
            ['name' => 'delete_activities', 'display_name_ar' => 'حذف الأنشطة التجارية', 'module' => 'activities'],

            // محتوى ومراجعات
            ['name' => 'manage_content', 'display_name_ar' => 'إدارة المحتوى والتصنيفات', 'module' => 'content'],
            ['name' => 'manage_reviews', 'display_name_ar' => 'إدارة واعتماد التقييمات', 'module' => 'reviews'],
            ['name' => 'manage_reported_content', 'display_name_ar' => 'معالجة البلاغات والمحتوى المخالف', 'module' => 'reviews'],

            // مستخدمين وفريق
            ['name' => 'view_users', 'display_name_ar' => 'عرض بيانات المستخدمين', 'module' => 'users'],
            ['name' => 'manage_team', 'display_name_ar' => 'إدارة فريق العمل والموظفين', 'module' => 'users'],
            ['name' => 'manage_roles', 'display_name_ar' => 'إدارة وتخصيص الأدوار والصلاحيات', 'module' => 'roles'],

            // تقارير وتحليلات
            ['name' => 'view_reports', 'display_name_ar' => 'عرض تقارير الأداء', 'module' => 'analytics'],
            ['name' => 'view_analytics', 'display_name_ar' => 'الوصول للتحليلات الإحصائية المتقدمة', 'module' => 'analytics'],
            ['name' => 'view_audit_logs', 'display_name_ar' => 'استعراض سجل العمليات (Audit Logs)', 'module' => 'audit'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }

        // 2. تعريف وتوليد الأدوار الستة الافتراضية
        $rolesData = [
            [
                'name' => 'مدير_عام',
                'display_name_ar' => 'مدير عام',
                'description_ar' => 'يمتلك كافة الصلاحيات الإدارية والفنية والوصول الشامل لجميع المناطق بدون أي قيود جغرافية.',
                'requires_geo_scope' => false,
                'is_system' => true,
                'permissions' => Permission::pluck('name')->toArray(), // جميع الصلاحيات
            ],
            [
                'name' => 'مدير_تشغيل',
                'display_name_ar' => 'مدير تشغيل',
                'description_ar' => 'إدارة العمليات التشغيلية، المحتوى، الأنشطة وفريق العمل.',
                'requires_geo_scope' => false,
                'is_system' => true,
                'permissions' => ['manage_content', 'manage_activities', 'manage_team', 'view_activities', 'view_users', 'view_reports'],
            ],
            [
                'name' => 'مراجع_أنشطة',
                'display_name_ar' => 'مراجع أنشطة',
                'description_ar' => 'مراجعة وتوثيق واعتماد الأنشطة التجارية الجديدة مقيداً بالنطاق الجغرافي المخصص له حصراً.',
                'requires_geo_scope' => true, // إلزامي نطاق جغرافي
                'is_system' => true,
                'permissions' => ['review_activities', 'verify_activities', 'view_activities'],
            ],
            [
                'name' => 'مشرف_محتوى',
                'display_name_ar' => 'مشرف محتوى',
                'description_ar' => 'متابعة تقييمات العملاء والتعامل مع البلاغات والمحتوى المخالف.',
                'requires_geo_scope' => false,
                'is_system' => true,
                'permissions' => ['manage_reviews', 'manage_reported_content', 'view_activities'],
            ],
            [
                'name' => 'دعم_فني',
                'display_name_ar' => 'دعم فني',
                'description_ar' => 'خدمة العملاء والاطلاع على بيانات المستخدمين والأنشطة لحل المشاكل التقنية.',
                'requires_geo_scope' => false,
                'is_system' => true,
                'permissions' => ['view_users', 'view_activities'],
            ],
            [
                'name' => 'محلل_بيانات',
                'display_name_ar' => 'محلل بيانات',
                'description_ar' => 'استخراج التقارير وتحليل المؤشرات الإحصائية ومعدلات نمو الأنشطة والمستخدمين.',
                'requires_geo_scope' => false,
                'is_system' => true,
                'permissions' => ['view_reports', 'view_analytics', 'view_audit_logs'],
            ],
        ];

        foreach ($rolesData as $data) {
            $permissionNames = $data['permissions'];
            unset($data['permissions']);

            $role = Role::firstOrCreate(['name' => $data['name']], $data);
            $permissionIds = Permission::whereIn('name', $permissionNames)->pluck('id');
            $role->permissions()->sync($permissionIds);
        }
    }
}
