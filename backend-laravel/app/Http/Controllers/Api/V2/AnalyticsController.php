<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * إحصائيات لوحة التحكم الشاملة (محسّنة بـ Eager Loading بدون استعلامات N+1)
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $locationId = ($user && $user->requiresGeoScope()) ? $user->location_id : $request->input('location_id');

        $stats = $this->analyticsService->getDashboardStats($locationId ? (int)$locationId : null);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * تحليلات أداء الأنشطة
     */
    public function activities(Request $request): JsonResponse
    {
        $user = $request->user();
        $locationId = ($user && $user->requiresGeoScope()) ? $user->location_id : $request->input('location_id');

        $analytics = $this->analyticsService->getActivitiesAnalytics(
            $locationId ? (int)$locationId : null,
            (int)$request->input('limit', 10)
        );

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * تحليلات توزيع المستخدمين والأدوار
     */
    public function users(Request $request): JsonResponse
    {
        $usersData = $this->analyticsService->getUsersAnalytics();

        return response()->json([
            'success' => true,
            'data' => $usersData,
        ]);
    }
}
