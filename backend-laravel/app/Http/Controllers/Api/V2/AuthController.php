<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuthLoginRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * تسجيل الدخول وإصدار توكن Sanctum
     */
    public function login(AuthLoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::with(['role.permissions', 'location'])->where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => __('auth.failed'),
                'error_code' => 'INVALID_CREDENTIALS',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => __('auth.account_suspended'),
                'error_code' => 'ACCOUNT_INACTIVE',
            ], Response::HTTP_FORBIDDEN);
        }

        // تحديث تاريخ آخر دخول
        $user->update(['last_login_at' => now()]);

        // إصدار توكن جديد
        $tokenName = $request->input('device_name', 'daleel_client');
        $token = $user->createToken($tokenName, ['*'], now()->addDays(7))->plainTextToken;

        // تسجيل العملية في AuditLog
        AuditLog::create([
            'user_id' => $user->id,
            'model_type' => User::class,
            'model_id' => $user->id,
            'action' => 'login',
            'old_values' => null,
            'new_values' => ['ip' => $request->ip(), 'user_agent' => $request->userAgent()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => __('messages.login_successful'),
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in_days' => 7,
                'user' => new UserResource($user),
                'permissions' => $user->role && $user->role->permissions ? $user->role->permissions->pluck('name') : [],
            ]
        ]);
    }

    /**
     * تجديد التوكن
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        $token = $user->createToken('daleel_refreshed_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => __('messages.token_refreshed'),
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in_days' => 7,
            ]
        ]);
    }

    /**
     * تسجيل الخروج وإبطال التوكن
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => __('auth.logged_out'),
        ]);
    }

    /**
     * بيانات المستخدم الحالي
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role.permissions', 'location']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }
}
