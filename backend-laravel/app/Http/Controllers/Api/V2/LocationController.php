<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * قائمة المدن والمحافظات
     */
    public function index(Request $request): JsonResponse
    {
        $locations = Location::query()
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => fn($q) => $q->where('is_active', true)->withCount('activities')])
            ->withCount('activities')
            ->orderBy('name_ar')
            ->get();

        return response()->json([
            'success' => true,
            'data' => LocationResource::collection($locations),
        ]);
    }
}
