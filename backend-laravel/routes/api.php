<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\V2\ActivityController;
use App\Http\Controllers\Api\V2\AnalyticsController;
use App\Http\Controllers\Api\V2\AuthController;
use App\Http\Controllers\Api\V2\CategoryController;
use App\Http\Controllers\Api\V2\LocationController;
use App\Http\Controllers\Api\V2\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات API الإصدار الثاني (V2) - دليل أي خدمة
|--------------------------------------------------------------------------
*/

Route::prefix('v2')->group(function () {

    /* -------------------------------------------------------------------------- */
    /*                                المصادقة (Auth)                             */
    /* -------------------------------------------------------------------------- */
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->name('api.v2.auth.login');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me'])->name('api.v2.auth.me');
            Route::post('/refresh', [AuthController::class, 'refresh'])->name('api.v2.auth.refresh');
            Route::post('/logout', [AuthController::class, 'logout'])->name('api.v2.auth.logout');
        });
    });

    /* -------------------------------------------------------------------------- */
    /*                              التصنيفات والمواقع                            */
    /* -------------------------------------------------------------------------- */
    Route::get('/categories', [CategoryController::class, 'index'])->name('api.v2.categories.index');
    Route::get('/locations', [LocationController::class, 'index'])->name('api.v2.locations.index');

    /* -------------------------------------------------------------------------- */
    /*                             الأنشطة (Activities)                          */
    /* -------------------------------------------------------------------------- */
    Route::get('/activities', [ActivityController::class, 'index'])->name('api.v2.activities.index');
    Route::get('/activities/{id}', [ActivityController::class, 'show'])->name('api.v2.activities.show');
    Route::get('/activities/{id}/reviews', [ActivityController::class, 'reviews'])->name('api.v2.activities.reviews');

    // مسارات الأنشطة المحمية
    Route::middleware(['auth:sanctum', 'arabic.locale'])->group(function () {
        Route::post('/activities', [ActivityController::class, 'store'])
            ->middleware(['permission:manage_activities', 'geo.scope'])
            ->name('api.v2.activities.store');

        Route::put('/activities/{activity}', [ActivityController::class, 'update'])
            ->middleware(['permission:manage_activities', 'geo.scope'])
            ->name('api.v2.activities.update');

        Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])
            ->middleware(['permission:manage_activities', 'geo.scope'])
            ->name('api.v2.activities.destroy');

        // اعتماد ومراجعة النشاط (يتطلب صلاحية مراجع + تقييد جغرافي إلزامي)
        Route::post('/activities/{activity}/verify', [ActivityController::class, 'verify'])
            ->middleware(['permission:review_activities,verify_activities', 'geo.scope'])
            ->name('api.v2.activities.verify');

        // إضافة تقييم
        Route::post('/activities/{id}/reviews', [ReviewController::class, 'store'])
            ->name('api.v2.reviews.store');
    });

    /* -------------------------------------------------------------------------- */
    /*                           التحليلات والمؤشرات (Analytics)                  */
    /* -------------------------------------------------------------------------- */
    Route::prefix('analytics')->middleware(['auth:sanctum', 'permission:view_reports,view_analytics'])->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'dashboard'])->name('api.v2.analytics.dashboard');
        Route::get('/activities', [AnalyticsController::class, 'activities'])->name('api.v2.analytics.activities');
        Route::get('/users', [AnalyticsController::class, 'users'])->name('api.v2.analytics.users');
    });

    /* -------------------------------------------------------------------------- */
    /*                              إدارة النظام (Admin)                          */
    /* -------------------------------------------------------------------------- */
    Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
        // إدارة الأدوار والصلاحيات (تتطلب مدير_عام)
        Route::apiResource('roles', RoleController::class)
            ->middleware('permission:manage_roles')
            ->names('api.v2.admin.roles');

        // إدارة المستخدمين وفريق العمل
        Route::get('/users', [UserController::class, 'index'])
            ->middleware('permission:view_users,manage_team')
            ->name('api.v2.admin.users.index');

        Route::put('/users/{user}/role', [UserController::class, 'updateRole'])
            ->middleware('permission:manage_team')
            ->name('api.v2.admin.users.update-role');

        // سجل العمليات الشامل (Audit Logs)
        Route::get('/audit-logs', [AuditLogController::class, 'index'])
            ->middleware('permission:view_audit_logs')
            ->name('api.v2.admin.audit-logs.index');
    });
});
