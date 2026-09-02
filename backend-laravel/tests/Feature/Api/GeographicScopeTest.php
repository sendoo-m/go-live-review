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

class GeographicScopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_asyut_reviewer_cannot_see_or_verify_cairo_activities(): void
    {
        $cairo = Location::create(['name_ar' => 'القاهرة', 'code' => 'CAI']);
        $asyut = Location::create(['name_ar' => 'أسيوط', 'code' => 'ASY']);
        $cat = Category::create(['name_ar' => 'مطاعم', 'slug' => 'restaurants']);

        // نشاط في القاهرة
        $cairoActivity = Activity::create([
            'name_ar' => 'كافيه المعادي',
            'slug' => 'maadi-cafe',
            'category_id' => $cat->id,
            'location_id' => $cairo->id,
            'address_ar' => 'المعادي، القاهرة',
            'status' => 'pending',
        ]);

        // مراجع مخصص لأسيوط
        $reviewerRole = Role::where('name', 'مراجع_أنشطة')->first();
        $asyutReviewer = User::factory()->create([
            'role_id' => $reviewerRole->id,
            'location_id' => $asyut->id,
        ]);

        // محاولة اعتماد نشاط القاهرة من قبل مراجع أسيوط يجب أن تُرفض بكود 403
        $response = $this->actingAs($asyutReviewer, 'sanctum')
            ->postJson("/api/v2/activities/{$cairoActivity->id}/verify", [
                'action' => 'verify',
                'notes' => 'محاولة اعتماد خارج النطاق'
            ]);

        $response->assertStatus(403);
    }

    public function test_general_manager_has_unrestricted_global_access(): void
    {
        $cairo = Location::create(['name_ar' => 'القاهرة', 'code' => 'CAI']);
        $cat = Category::create(['name_ar' => 'مطاعم', 'slug' => 'restaurants']);

        $cairoActivity = Activity::create([
            'name_ar' => 'فندق النيل',
            'slug' => 'nile-hotel',
            'category_id' => $cat->id,
            'location_id' => $cairo->id,
            'address_ar' => 'وسط البلد، القاهرة',
            'status' => 'pending',
        ]);

        $gmRole = Role::where('name', 'مدير_عام')->first();
        $generalManager = User::factory()->create([
            'role_id' => $gmRole->id,
            'location_id' => null,
        ]);

        $response = $this->actingAs($generalManager, 'sanctum')
            ->postJson("/api/v2/activities/{$cairoActivity->id}/verify", [
                'action' => 'verify',
                'notes' => 'اعتماد من الإدارة العامة'
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'verified');
    }
}
