<?php

namespace Tests\Feature\Api;

use App\Models\Activity;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_audit_log_is_created_automatically_on_activity_changes(): void
    {
        $cairo = Location::create(['name_ar' => 'القاهرة', 'code' => 'CAI']);
        $cat = Category::create(['name_ar' => 'مطاعم', 'slug' => 'restaurants']);
        $gmRole = Role::where('name', 'مدير_عام')->first();
        $admin = User::factory()->create(['role_id' => $gmRole->id]);

        $this->actingAs($admin, 'sanctum')->postJson('/api/v2/activities', [
            'name_ar' => 'مطعم الأصالة',
            'category_id' => $cat->id,
            'location_id' => $cairo->id,
            'address_ar' => 'الدقي، الجيزة',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'created',
            'model_type' => Activity::class,
        ]);
    }

    public function test_audit_logs_are_immutable_and_cannot_be_deleted_or_updated(): void
    {
        $log = AuditLog::create([
            'user_id' => null,
            'model_type' => 'App\Models\Activity',
            'model_id' => 1,
            'action' => 'created',
            'old_values' => null,
            'new_values' => ['name_ar' => 'تجربة'],
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
        ]);

        $this->expectException(RuntimeException::class);
        $log->update(['action' => 'modified_unauthorized']);
    }
}
