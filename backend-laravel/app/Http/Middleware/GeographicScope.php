<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GeographicScope
{
    /**
     * Handle an incoming request.
     *
     * يقوم هذا الـ Middleware بحقن النطاق الجغرافي للمستخدم في كائن الطلب $request
     * والتحقق من عدم محاولة المراجع أو المستخدم الوصول لسجلات خارج مدينته / محافظته.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // حقن النطاق الجغرافي للمستخدم في الـ request
            $request->attributes->set('geo_scope', $user->location_id);

            // إذا كان المستخدم مقيداً بنطاق جغرافي وقام بتمرير location_id في الطلب مختلف عن نطاقه
            if ($user->requiresGeoScope() && $user->location_id) {
                if ($request->has('location_id') && (int)$request->input('location_id') !== (int)$user->location_id) {
                    return response()->json([
                        'success' => false,
                        'message' => __('messages.geo_scope_violation', [
                            'user_location' => optional($user->location)->name_ar ?? $user->location_id
                        ]),
                        'error_code' => 'GEO_SCOPE_UNAUTHORIZED'
                    ], Response::HTTP_FORBIDDEN);
                }
            }
        }

        return $next($request);
    }
}
