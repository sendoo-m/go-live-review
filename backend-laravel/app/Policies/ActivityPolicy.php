<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ActivityPolicy
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

    /**
     * عرض قائمة الأنشطة
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * عرض نشاط معين مع التحقق من النطاق الجغرافي
     */
    public function view(?User $user, Activity $activity): Response
    {
        if (!$user) {
            return $activity->status === 'verified'
                ? Response::allow()
                : Response::deny(__('messages.activity_not_verified'));
        }

        // إذا كان المستخدم مقيداً جغرافياً
        if ($user->requiresGeoScope() && $user->location_id && (int)$activity->location_id !== (int)$user->location_id) {
            return Response::deny(__('messages.geo_scope_unauthorized_access'));
        }

        return Response::allow();
    }

    /**
     * إنشاء نشاط جديد
     */
    public function create(User $user): Response
    {
        return $user->hasPermission('manage_activities')
            ? Response::allow()
            : Response::deny(__('messages.permission_denied', ['permissions' => 'manage_activities']));
    }

    /**
     * تعديل نشاط
     */
    public function update(User $user, Activity $activity): Response
    {
        if (!$user->hasPermission('manage_activities')) {
            return Response::deny(__('messages.permission_denied', ['permissions' => 'manage_activities']));
        }

        // التحقق من النطاق الجغرافي
        if ($user->requiresGeoScope() && $user->location_id && (int)$activity->location_id !== (int)$user->location_id) {
            return Response::deny(__('messages.geo_scope_unauthorized_modification'));
        }

        return Response::allow();
    }

    /**
     * حذف نشاط
     */
    public function delete(User $user, Activity $activity): Response
    {
        if (!$user->hasPermission('manage_activities')) {
            return Response::deny(__('messages.permission_denied', ['permissions' => 'manage_activities']));
        }

        if ($user->requiresGeoScope() && $user->location_id && (int)$activity->location_id !== (int)$user->location_id) {
            return Response::deny(__('messages.geo_scope_unauthorized_deletion'));
        }

        return Response::allow();
    }

    /**
     * اعتماد ومراجعة النشاط التجاري
     */
    public function verify(User $user, Activity $activity): Response
    {
        if (!$user->hasPermission('review_activities') && !$user->hasPermission('verify_activities')) {
            return Response::deny(__('messages.permission_denied', ['permissions' => 'review_activities / verify_activities']));
        }

        // تقييد المراجع بنطاقه الجغرافي
        if ($user->requiresGeoScope() && $user->location_id && (int)$activity->location_id !== (int)$user->location_id) {
            return Response::deny(__('messages.geo_scope_unauthorized_verification'));
        }

        return Response::allow();
    }
}
