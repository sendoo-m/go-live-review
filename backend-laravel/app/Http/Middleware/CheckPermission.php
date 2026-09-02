<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * يتحقق من صلاحية المستخدم للـ route المحدد.
     * يدعم التحقق من صلاحية واحدة أو عدة صلاحيات.
     * يتم إعفاء "المدير العام" تلقائياً.
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => __('auth.unauthenticated'),
                'error_code' => 'UNAUTHENTICATED'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // المدير العام يملك صلاحيات كاملة دائماً
        if ($user->isGeneralManager()) {
            return $next($request);
        }

        // التحقق من وجود إحدى الصلاحيات المطلوبة على الأقل
        $hasAnyPermission = false;
        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                $hasAnyPermission = true;
                break;
            }
        }

        if (!$hasAnyPermission) {
            return response()->json([
                'success' => false,
                'message' => __('messages.permission_denied', [
                    'permissions' => implode(', ', $permissions)
                ]),
                'required_permissions' => $permissions,
                'error_code' => 'FORBIDDEN_PERMISSION_REQUIRED'
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
