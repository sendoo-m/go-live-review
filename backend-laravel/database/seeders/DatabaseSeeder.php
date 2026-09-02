<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Category;
use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. تشغيل Seeders الأساسية
        $this->call([
            RolesSeeder::class,
            LocationsSeeder::class,
            CategoriesSeeder::class,
        ]);

        $cairo = Location::where('code', 'EGY-CAI')->first();
        $asyut = Location::where('code', 'EGY-ASY')->first();
        $alex = Location::where('code', 'EGY-ALX')->first();

        $roleGeneralManager = Role::where('name', 'مدير_عام')->first();
        $roleOperations = Role::where('name', 'مدير_تشغيل')->first();
        $roleReviewer = Role::where('name', 'مراجع_أنشطة')->first();
        $roleContent = Role::where('name', 'مشرف_محتوى')->first();
        $roleSupport = Role::where('name', 'دعم_فني')->first();
        $roleAnalyst = Role::where('name', 'محلل_بيانات')->first();

        // 2. إنشاء مستخدمين نموذجيين لكل دور لاختبار الصلاحيات والنطاق الجغرافي
        $admin = User::firstOrCreate(
            ['email' => 'admin@daleel.test'],
            [
                'name' => 'م. طارق الخالدي (المدير العام)',
                'phone' => '+201000000001',
                'password' => Hash::make('password123'),
                'role_id' => $roleGeneralManager->id,
                'location_id' => null, // المدير العام يرى كل المحافظات
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                'is_active' => true,
            ]
        );

        $opsManager = User::firstOrCreate(
            ['email' => 'operations@daleel.test'],
            [
                'name' => 'أحمد سمير (مدير التشغيل)',
                'phone' => '+201000000002',
                'password' => Hash::make('password123'),
                'role_id' => $roleOperations->id,
                'location_id' => null,
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                'is_active' => true,
            ]
        );

        // مراجع مقيد بالقاهرة
        $reviewerCairo = User::firstOrCreate(
            ['email' => 'reviewer.cairo@daleel.test'],
            [
                'name' => 'خالد محمود (مراجع القاهرة)',
                'phone' => '+201000000003',
                'password' => Hash::make('password123'),
                'role_id' => $roleReviewer->id,
                'location_id' => $cairo->id,
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                'is_active' => true,
            ]
        );

        // مراجع مقيد بأسيوط (لا يمكنه رؤية أو اعتماد أنشطة القاهرة)
        $reviewerAsyut = User::firstOrCreate(
            ['email' => 'reviewer.asyut@daleel.test'],
            [
                'name' => 'عمر الصعيدي (مراجع أسيوط)',
                'phone' => '+201000000004',
                'password' => Hash::make('password123'),
                'role_id' => $roleReviewer->id,
                'location_id' => $asyut->id,
                'avatar_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                'is_active' => true,
            ]
        );

        $analyst = User::firstOrCreate(
            ['email' => 'analyst@daleel.test'],
            [
                'name' => 'منى الرفاعي (محللة البيانات)',
                'phone' => '+201000000005',
                'password' => Hash::make('password123'),
                'role_id' => $roleAnalyst->id,
                'location_id' => null,
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                'is_active' => true,
            ]
        );

        // 3. إنشاء أنشطة تجارية أولية موزعة جغرافياً
        $catFood = Category::where('slug', 'restaurants-cafes')->first();
        $catMedical = Category::where('slug', 'health-medical')->first();
        $catAuto = Category::where('slug', 'automotive-repairs')->first();
        $catTech = Category::where('slug', 'tech-electronics')->first();

        $sampleActivities = [
            [
                'name_ar' => 'مطعم واحة النيل للمأكولات الشرقية',
                'name_en' => 'Nile Oasis Restaurant',
                'slug' => 'nile-oasis-restaurant',
                'category_id' => $catFood->id,
                'location_id' => $cairo->id,
                'owner_id' => $admin->id,
                'description_ar' => 'تجربة طعام شرقية فاخرة على ضفاف النيل مباشرة مع إطلالة بانورامية وقائمة مشويات ومأكولات بحرية طازجة.',
                'address_ar' => 'كورنيش النيل، المعادي، القاهرة',
                'phone' => '+201011122233',
                'status' => 'verified',
                'verified_at' => now(),
                'verified_by' => $reviewerCairo->id,
                'rating_avg' => 4.8,
                'reviews_count' => 142,
                'views_count' => 3890,
                'is_featured' => true,
                'cover_image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
            ],
            [
                'name_ar' => 'مركز النخبة لصيانة وتلميع السيارات',
                'name_en' => 'Elite Auto Care',
                'slug' => 'elite-auto-care-asyut',
                'category_id' => $catAuto->id,
                'location_id' => $asyut->id,
                'owner_id' => $admin->id,
                'description_ar' => 'خدمات فحص كمبيوتر، ضبط زوايا، ميكانيكا متقدمة، وخدمات نانو سيراميك وحماية الهيكل.',
                'address_ar' => 'شارع الجمهورية الرئيسي، بالقرب من جامعة أسيوط',
                'phone' => '+201099887766',
                'status' => 'verified',
                'verified_at' => now(),
                'verified_by' => $reviewerAsyut->id,
                'rating_avg' => 4.7,
                'reviews_count' => 89,
                'views_count' => 1950,
                'is_featured' => true,
                'cover_image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600',
            ],
            [
                'name_ar' => 'مجمع الشفاء الطبي التخصصي',
                'name_en' => 'Al-Shifa Medical Center',
                'slug' => 'al-shifa-medical-cairo',
                'category_id' => $catMedical->id,
                'location_id' => $cairo->id,
                'owner_id' => $admin->id,
                'description_ar' => 'أكثر من 15 عيادة تخصصية بإشراف نخبة من أساتذة الطب وطاقم تمريض متمرس مع أحدث أجهزة التحاليل.',
                'address_ar' => 'مدينة نصر، شارع عباس العقاد، القاهرة',
                'phone' => '+201055443322',
                'status' => 'pending', // معلق بانتظار المراجعة
                'rating_avg' => 0.0,
                'reviews_count' => 0,
                'views_count' => 420,
                'is_featured' => false,
                'cover_image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600',
            ],
            [
                'name_ar' => 'مركز أسيوط لحلول التقنية والبرمجيات',
                'name_en' => 'Asyut Tech Solutions',
                'slug' => 'asyut-tech-solutions',
                'category_id' => $catTech->id,
                'location_id' => $asyut->id,
                'owner_id' => $admin->id,
                'description_ar' => 'صيانة الحواسيب المكتبية والمحمولة، شبكات المكاتب والشركات، وتوريد قطع الهاردوير الأصلية.',
                'address_ar' => 'شارع الهلالي، أمام مجمع المحاكم، أسيوط',
                'phone' => '+201088776655',
                'status' => 'pending', // بانتظار مراجع أسيوط
                'rating_avg' => 0.0,
                'reviews_count' => 0,
                'views_count' => 310,
                'is_featured' => false,
                'cover_image' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
            ],
            [
                'name_ar' => 'مقهى وكافيه لؤلؤة الإسكندرية',
                'name_en' => 'Alexandria Pearl Cafe',
                'slug' => 'alex-pearl-cafe',
                'category_id' => $catFood->id,
                'location_id' => $alex->id,
                'owner_id' => $admin->id,
                'description_ar' => 'جلسات ساحلية مميزة مع أجود حبوب القهوة الإيطالية والمشروبات المنعشة وحلويات أوروبية.',
                'address_ar' => 'محطة الرمل، كورنيش الإسكندرية',
                'phone' => '+201033221100',
                'status' => 'verified',
                'rating_avg' => 4.9,
                'reviews_count' => 210,
                'views_count' => 5400,
                'is_featured' => true,
                'cover_image' => 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
            ],
        ];

        foreach ($sampleActivities as $act) {
            Activity::firstOrCreate(['slug' => $act['slug']], $act);
        }
    }
}
