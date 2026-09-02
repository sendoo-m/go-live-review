<?php

namespace Tests\Feature\Api;

use App\Models\Activity;
use App\Models\Category;
use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_can_list_activities_with_pagination_and_views_count_sorting(): void
    {
        $cairo = Location::create(['name_ar' => 'القاهرة', 'code' => 'CAI']);
        $cat = Category::create(['name_ar' => 'مطاعم', 'slug' => 'restaurants']);

        Activity::create([
            'name_ar' => 'مطعم النيل',
            'slug' => 'nile-restaurant',
            'category_id' => $cat->id,
            'location_id' => $cairo->id,
            'address_ar' => 'كورنيش النيل',
            'status' => 'verified',
            'views_count' => 150,
        ]);

        // اختبار الترتيب بالمشاهدات بدون حدوث خطأ 500 (الحل بإضافة withCount)
        $response = $this->getJson('/api/v2/activities?sort_by=views&sort_order=desc');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'count',
                'next',
                'previous',
                'results' => [
                    '*' => ['id', 'name_ar', 'status', 'views_count']
                ]
            ]);
    }

    public function test_activity_manager_can_create_activity(): void
    {
        $role = Role::where('name', 'مدير_تشغيل')->first();
        $user = User::factory()->create(['role_id' => $role->id]);

        $cairo = Location::create(['name_ar' => 'القاهرة', 'code' => 'CAI']);
        $cat = Category::create(['name_ar' => 'مطاعم', 'slug' => 'restaurants']);

        $payload = [
            'name_ar' => 'عيادة الشفاء الجديدة',
            'category_id' => $cat->id,
            'location_id' => $cairo->id,
            'address_ar' => 'شارع عباس العقاد، مدينة نصر',
            'phone' => '+201012345678',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v2/activities', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name_ar', 'عيادة الشفاء الجديدة');

        $this->assertDatabaseHas('activities', ['name_ar' => 'عيادة الشفاء الجديدة']);
    }
}
