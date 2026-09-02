<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name_ar' => 'مطاعم ومقاهي',
                'name_en' => 'Restaurants & Cafes',
                'slug' => 'restaurants-cafes',
                'icon' => 'UtensilsCrossed',
                'description_ar' => 'أفضل المطاعم، المقاهي الشعبية والعصرية، ومحلات المأكولات والمشروبات السريعة.',
                'sort_order' => 1,
            ],
            [
                'name_ar' => 'مراكز طبية وصحة',
                'name_en' => 'Health & Medical',
                'slug' => 'health-medical',
                'icon' => 'Stethoscope',
                'description_ar' => 'عيادات تخصصية، مستشفيات، مراكز أشعة وتحاليل، وصيدليات كبرى.',
                'sort_order' => 2,
            ],
            [
                'name_ar' => 'صيانة وسيارات',
                'name_en' => 'Automotive & Repairs',
                'slug' => 'automotive-repairs',
                'icon' => 'CarFront',
                'description_ar' => 'مراكز خدمة وصيانة السيارات، قطع الغيار، ومحطات الفحص الفني.',
                'sort_order' => 3,
            ],
            [
                'name_ar' => 'تقنية وإلكترونيات',
                'name_en' => 'Tech & Electronics',
                'slug' => 'tech-electronics',
                'icon' => 'Laptop',
                'description_ar' => 'متاجر الحواسيب، الهواتف الذكية، الأجهزة المنزلية وخدمات الدعم البرمجي.',
                'sort_order' => 4,
            ],
            [
                'name_ar' => 'خدمات منزلية وتشطيبات',
                'name_en' => 'Home Services',
                'slug' => 'home-services',
                'icon' => 'Wrench',
                'description_ar' => 'فنيو صيانة كهرباء، سباكة، تكييف، مقاولات عامة وتشطيبات ديكور.',
                'sort_order' => 5,
            ],
            [
                'name_ar' => 'تسوق وتجارة تجزئة',
                'name_en' => 'Shopping & Retail',
                'slug' => 'shopping-retail',
                'icon' => 'ShoppingBag',
                'description_ar' => 'المراكز التجارية والمولات، محلات الملابس، العطور والمستلزمات الشخصية.',
                'sort_order' => 6,
            ],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
