<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityView;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class ActivityService
{
    /**
     * جلب قائمة الأنشطة مع تطبيق Eager Loading وفلاتر البحث والترتيب
     */
    public function getPaginatedActivities(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return Activity::query()
            ->with(['category:id,name_ar,slug,icon', 'location:id,name_ar,code'])
            ->withCount('views')
            ->filter($filters)
            ->paginate($perPage);
    }

    /**
     * جلب نشاط فردي وتسجيل المشاهدة
     */
    public function getActivityDetails(int $id, ?User $user = null): Activity
    {
        $activity = Activity::with([
            'category',
            'location',
            'owner:id,name,phone,avatar_url',
            'verifier:id,name',
            'reviews' => fn($q) => $q->where('is_approved', true)->with('user:id,name,avatar_url')->latest()->take(10)
        ])
        ->withCount('views')
        ->findOrFail($id);

        // زيادة عداد المشاهدات وتسجيل المشاهدة
        $this->recordView($activity, $user);

        return $activity;
    }

    /**
     * تسجيل مشاهدة للنشاط
     */
    public function recordView(Activity $activity, ?User $user = null): void
    {
        ActivityView::create([
            'activity_id' => $activity->id,
            'user_id' => $user?->id,
            'ip_address' => Request::ip() ?? '127.0.0.1',
            'user_agent' => Request::userAgent() ?? 'API Client',
            'viewed_at' => now(),
        ]);

        $activity->increment('views_count');
    }

    /**
     * إنشاء نشاط جديد
     */
    public function createActivity(array $data, User $user): Activity
    {
        return DB::transaction(function () use ($data, $user) {
            $data['owner_id'] = $user->id;
            $data['status'] = $user->isGeneralManager() ? 'verified' : 'pending';

            if ($data['status'] === 'verified') {
                $data['verified_at'] = now();
                $data['verified_by'] = $user->id;
            }

            return Activity::create($data);
        });
    }

    /**
     * تحديث بيانات نشاط
     */
    public function updateActivity(Activity $activity, array $data): Activity
    {
        return DB::transaction(function () use ($activity, $data) {
            $activity->update($data);
            return $activity->fresh(['category', 'location', 'owner']);
        });
    }

    /**
     * اعتماد أو رفض أو تعليق النشاط التجاري
     */
    public function verifyActivity(Activity $activity, string $action, ?string $notes, ?string $rejectionReason, User $verifier): Activity
    {
        return DB::transaction(function () use ($activity, $action, $notes, $rejectionReason, $verifier) {
            $statusMap = [
                'verify' => 'verified',
                'reject' => 'rejected',
                'suspend' => 'suspended',
            ];

            $status = $statusMap[$action] ?? 'pending';

            $activity->update([
                'status' => $status,
                'verified_at' => $status === 'verified' ? now() : null,
                'verified_by' => $verifier->id,
                'verification_notes' => $notes,
            ]);

            return $activity->fresh(['category', 'location', 'verifier']);
        });
    }
}
