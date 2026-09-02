<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Http\Requests\VerifyActivityRequest;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\ReviewResource;
use App\Models\Activity;
use App\Services\ActivityService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ActivityController extends Controller
{
    use AuthorizesRequests;

    protected ActivityService $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    /**
     * قائمة الأنشطة مع فلاتر وترتيب ودعم pagination metadata
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'category_id',
            'location_id',
            'status',
            'featured',
            'sort_by',
            'sort_order',
        ]);

        $perPage = min((int)$request->input('per_page', 15), 50);
        $paginator = $this->activityService->getPaginatedActivities($filters, $perPage);

        return response()->json([
            'count' => $paginator->total(),
            'next' => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'results' => ActivityResource::collection($paginator->items()),
        ]);
    }

    /**
     * إنشاء نشاط جديد (يتطلب manage_activities)
     */
    public function store(StoreActivityRequest $request): JsonResponse
    {
        $this->authorize('create', Activity::class);

        $activity = $this->activityService->createActivity(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => __('messages.activity_created'),
            'data' => new ActivityResource($activity->load(['category', 'location'])),
        ], Response::HTTP_CREATED);
    }

    /**
     * تفاصيل نشاط تجاري
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $activity = $this->activityService->getActivityDetails($id, $request->user());
        $this->authorize('view', $activity);

        return response()->json([
            'success' => true,
            'data' => new ActivityResource($activity),
        ]);
    }

    /**
     * تحديث بيانات نشاط
     */
    public function update(UpdateActivityRequest $request, Activity $activity): JsonResponse
    {
        $this->authorize('update', $activity);

        $updated = $this->activityService->updateActivity($activity, $request->validated());

        return response()->json([
            'success' => true,
            'message' => __('messages.activity_updated'),
            'data' => new ActivityResource($updated),
        ]);
    }

    /**
     * حذف نشاط (Soft Delete)
     */
    public function destroy(Activity $activity): JsonResponse
    {
        $this->authorize('delete', $activity);

        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.activity_deleted'),
        ]);
    }

    /**
     * قائمة تقييمات النشاط
     */
    public function reviews(int $id, Request $request): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $reviews = $activity->reviews()
            ->where('is_approved', true)
            ->with('user:id,name,avatar_url')
            ->latest()
            ->paginate((int)$request->input('per_page', 10));

        return response()->json([
            'count' => $reviews->total(),
            'next' => $reviews->nextPageUrl(),
            'previous' => $reviews->previousPageUrl(),
            'results' => ReviewResource::collection($reviews->items()),
        ]);
    }

    /**
     * مراجعة واعتماد النشاط (يتطلب review_activities + geo_scope)
     */
    public function verify(VerifyActivityRequest $request, Activity $activity): JsonResponse
    {
        $this->authorize('verify', $activity);

        $validated = $request->validated();
        $verifiedActivity = $this->activityService->verifyActivity(
            $activity,
            $validated['action'],
            $validated['notes'] ?? null,
            $validated['rejection_reason'] ?? null,
            $request->user()
        );

        $messageMap = [
            'verify' => __('messages.activity_verified_success'),
            'reject' => __('messages.activity_rejected_success'),
            'suspend' => __('messages.activity_suspended_success'),
        ];

        return response()->json([
            'success' => true,
            'message' => $messageMap[$validated['action']] ?? __('messages.activity_updated'),
            'data' => new ActivityResource($verifiedActivity),
        ]);
    }
}
