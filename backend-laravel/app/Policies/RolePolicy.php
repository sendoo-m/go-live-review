<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class RolePolicy
{
    /**
     * قبل كل فحص: المدير العام يملك كافة الصلاحيات
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isGeneralManager()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('manage_team') || $user->isGeneralManager();
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermission('manage_team') || $user->isGeneralManager();
    }

    public function create(User $user): Response
    {
        return $user->isGeneralManager()
            ? Response::allow()
            : Response::deny(__('messages.only_general_manager_can_create_roles'));
    }

    public function update(User $user, Role $role): Response
    {
        if (!$user->isGeneralManager()) {
            return Response::deny(__('messages.only_general_manager_can_update_roles'));
        }

        if ($role->is_system) {
            // يمكن تعديل الصلاحيات المربوطة فقط وليس اسم الدور النظامي
            return Response::allow();
        }

        return Response::allow();
    }

    public function delete(User $user, Role $role): Response
    {
        if (!$user->isGeneralManager()) {
            return Response::deny(__('messages.only_general_manager_can_delete_roles'));
        }

        if ($role->is_system) {
            return Response::deny(__('messages.cannot_delete_system_role'));
        }

        if ($role->users()->count() > 0) {
            return Response::deny(__('messages.cannot_delete_role_with_active_users'));
        }

        return Response::allow();
    }
}
