<?php

namespace Tests\Feature\Api;

use App\Models\Activity;
use App\Models\Category;
use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AnalyticsPerformanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_analytics_dashboard_executes_minimal_queries_without_n_plus_one(): void
    {
        $cairo = Location::create(['name_ar' => 'القاهرة', 'code' => 'CAI']);
        $cat = Category::create(['name_ar' => 'مطاعم', 'slug' => 'restaurants']);

        for ($i = 1; $i <= 10; $i++) {
            Activity::create([
                'name_ar' => "نشاط رقم {$i}",
                'slug' => "activity-{$i}",
                'category_id' => $cat->id,
                'location_id' => $cairo->id,
                'address_ar' => 'عنوان تجريبي',
                'status' => $i % 2 === 0 ? 'verified' : 'pending',
                'views_count' => $i * 50,
            ]);
        }

        $analystRole = Role::where('name', 'محلل_بيانات')->first();
        $analystUser = User::factory()->create(['role_id' => $analystRole->id]);

        DB::enableQueryLog();

        $response = $this->actingAs($analystUser, 'sanctum')->getJson('/api/v2/analytics/dashboard');

        $queryCount = count(DB::getQueryLog());

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'summary' => ['total_activities', 'verified_activities', 'total_views'],
                    'category_distribution',
                    'location_distribution',
                    'performance',
                ]
            ]);

        // التحقق من أن عدد الاستعلامات لا يتجاوز 6 استعلامات مهما زاد عدد السجلات
        $this->assertLessThanOrEqual(6, $queryCount);
    }
}
