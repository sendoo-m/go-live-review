<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * قائمة المستخدمين وفريق العمل
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['role', 'location']);

        if ($request->has('role_id')) {
            $query->where('role_id', $request->input('role_id'));
        }

        if ($request->has('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate((int)$request->input('per_page', 20));

        return response()->json([
            'count' => $users->total(),
            'next' => $users->nextPageUrl(),
            'previous' => $users->previousPageUrl(),
            'results' => UserResource::collection($users->items()),
        ]);
    }

    /**
     * تعديل دور ونطاق المستخدم
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
        ]);

        $user->update([
            'role_id' => $request->input('role_id'),
            'location_id' => $request->input('location_id'),
        ]);

        return response()->json([
            'success' => true,
            'message' => __('messages.user_role_updated_success'),
            'data' => new UserResource($user->fresh(['role', 'location'])),
        ]);
    }
}
