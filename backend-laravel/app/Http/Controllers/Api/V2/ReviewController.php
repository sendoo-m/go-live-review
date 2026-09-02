<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Activity;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ReviewController extends Controller
{
    /**
     * إضافة تقييم ومراجعة جديدة لنشاط تجاري
     */
    public function store(StoreReviewRequest $request, int $activityId): JsonResponse
    {
        $activity = Activity::findOrFail($activityId);
        $user = $request->user();

        // إنشاء التقييم
        $review = DB::transaction(function () use ($request, $activity, $user) {
            $created = Review::create([
                'activity_id' => $activity->id,
                'user_id' => $user->id,
                'rating' => $request->input('rating'),
                'comment' => $request->input('comment'),
                'is_approved' => true,
            ]);

            // تحديث متوسط التقييم وعدد التقييمات في النشاط
            $avgRating = Review::where('activity_id', $activity->id)->where('is_approved', true)->avg('rating');
            $reviewsCount = Review::where('activity_id', $activity->id)->where('is_approved', true)->count();

            $activity->update([
                'rating_avg' => round($avgRating, 2),
                'reviews_count' => $reviewsCount,
            ]);

            return $created;
        });

        return response()->json([
            'success' => true,
            'message' => __('messages.review_submitted_success'),
            'data' => new ReviewResource($review->load('user')),
        ], Response::HTTP_CREATED);
    }
}
