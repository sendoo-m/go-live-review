<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * ينشئ المحافظات والمدن الرئيسية مع النطاقات الجغرافية
     */
    public function run(): void
    {
        $locations = [
            [
                'name_ar' => 'القاهرة',
                'name_en' => 'Cairo',
                'code' => 'EGY-CAI',
                'latitude' => 30.0444,
                'longitude' => 31.2357,
                'is_active' => true,
            ],
            [
                'name_ar' => 'الجيزة',
                'name_en' => 'Giza',
                'code' => 'EGY-GIZ',
                'latitude' => 30.0131,
                'longitude' => 31.2089,
                'is_active' => true,
            ],
            [
                'name_ar' => 'الإسكندرية',
                'name_en' => 'Alexandria',
                'code' => 'EGY-ALX',
                'latitude' => 31.2001,
                'longitude' => 29.9187,
                'is_active' => true,
            ],
            [
                'name_ar' => 'أسيوط',
                'name_en' => 'Asyut',
                'code' => 'EGY-ASY',
                'latitude' => 27.1809,
                'longitude' => 31.1837,
                'is_active' => true,
            ],
            [
                'name_ar' => 'المنصورة (الدقهلية)',
                'name_en' => 'Mansoura',
                'code' => 'EGY-DKH',
                'latitude' => 31.0409,
                'longitude' => 31.3785,
                'is_active' => true,
            ],
            [
                'name_ar' => 'الأقصر',
                'name_en' => 'Luxor',
                'code' => 'EGY-LUX',
                'latitude' => 25.6872,
                'longitude' => 32.6396,
                'is_active' => true,
            ],
            [
                'name_ar' => 'أسوان',
                'name_en' => 'Aswan',
                'code' => 'EGY-ASW',
                'latitude' => 24.0889,
                'longitude' => 32.8998,
                'is_active' => true,
            ],
            [
                'name_ar' => 'طنطا (الغربية)',
                'name_en' => 'Tanta',
                'code' => 'EGY-GHB',
                'latitude' => 30.7865,
                'longitude' => 31.0004,
                'is_active' => true,
            ],
        ];

        foreach ($locations as $loc) {
            Location::firstOrCreate(['code' => $loc['code']], $loc);
        }
    }
}
