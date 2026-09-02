<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\PermissionResource;
use App\Http\Resources\RoleResource;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RoleController extends Controller
{
    use AuthorizesRequests;

    /**
     * قائمة الأدوار والصلاحيات (يتطلب مدير_عام)
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::with('permissions')
            ->withCount('users')
            ->get();

        $allPermissions = Permission::all();

        return response()->json([
            'success' => true,
            'data' => [
                'roles' => RoleResource::collection($roles),
                'available_permissions' => PermissionResource::collection($allPermissions),
            ]
        ]);
    }

    /**
     * إنشاء دور جديد وربطه بالصلاحيات
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $this->authorize('create', Role::class);

        $role = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $permissionNames = $data['permissions'];
            unset($data['permissions']);

            $role = Role::create($data);

            $permissionIds = Permission::whereIn('name', $permissionNames)->pluck('id');
            $role->permissions()->sync($permissionIds);

            return $role->fresh('permissions');
        });

        return response()->json([
            'success' => true,
            'message' => __('messages.role_created_success'),
            'data' => new RoleResource($role),
        ], Response::HTTP_CREATED);
    }

    /**
     * تعديل دور وصلاحياته
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        $updatedRole = DB::transaction(function () use ($request, $role) {
            $data = $request->validated();

            if (isset($data['permissions'])) {
                $permissionNames = $data['permissions'];
                unset($data['permissions']);
                $permissionIds = Permission::whereIn('name', $permissionNames)->pluck('id');
                $role->permissions()->sync($permissionIds);
            }

            if (!$role->is_system && !empty($data)) {
                $role->update($data);
            }

            return $role->fresh('permissions');
        });

        return response()->json([
            'success' => true,
            'message' => __('messages.role_updated_success'),
            'data' => new RoleResource($updatedRole),
        ]);
    }

    /**
     * حذف دور (غير نظامي)
     */
    public function destroy(Role $role): JsonResponse
    {
        $this->authorize('delete', $role);

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.role_deleted_success'),
        ]);
    }
}
