<?php

namespace Tests\Feature\Api;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_only_general_manager_can_create_new_roles(): void
    {
        $gmRole = Role::where('name', 'مدير_عام')->first();
        $gmUser = User::factory()->create(['role_id' => $gmRole->id]);

        $payload = [
            'name' => 'مشرف_منطقة_قناة_السويس',
            'display_name_ar' => 'مشرف منطقة قناة السويس',
            'requires_geo_scope' => true,
            'permissions' => ['view_activities', 'review_activities'],
        ];

        $response = $this->actingAs($gmUser, 'sanctum')->postJson('/api/v2/admin/roles', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'مشرف_منطقة_قناة_السويس');

        $this->assertDatabaseHas('roles', ['name' => 'مشرف_منطقة_قناة_السويس']);
    }

    public function test_non_manager_cannot_manage_roles(): void
    {
        $supportRole = Role::where('name', 'دعم_فني')->first();
        $supportUser = User::factory()->create(['role_id' => $supportRole->id]);

        $response = $this->actingAs($supportUser, 'sanctum')->postJson('/api/v2/admin/roles', [
            'name' => 'دور_غير_مصرح',
            'display_name_ar' => 'دور تجريبي',
            'permissions' => ['view_activities'],
        ]);

        $response->assertStatus(403);
    }
}
