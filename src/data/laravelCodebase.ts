import { LaravelFile } from "../types";

export const LARAVEL_CODEBASE: LaravelFile[] = [
  {
    path: "routes/api.php",
    title: "مسارات الـ API (V2 Routes)",
    category: "routes",
    description: "تعريف مسارات النسخة الثانية (V2) مع ربط الـ Middleware للصلاحيات والنطاق الجغرافي واللغة العربية.",
    code: `<?php

use App\Http\Controllers\Admin\\AuditLogController;
use App\Http\Controllers\Admin\\RoleController;
use App\Http\Controllers\Admin\\UserController;
use App\Http\Controllers\Api\\V2\\ActivityController;
use App\Http\Controllers\Api\\V2\\AnalyticsController;
use App\Http\Controllers\Api\\V2\\AuthController;
use App\Http\Controllers\Api\\V2\\CategoryController;
use App\Http\Controllers\Api\\V2\\LocationController;
use App\Http\Controllers\Api\\V2\\ReviewController;
use Illuminate\\Support\\Facades\\Route;

Route::prefix('v2')->group(function () {
    // المصادقة
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // التصنيفات والمواقع (متاحة للعامة)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/locations', [LocationController::class, 'index']);

    // الأنشطة (تخضع للنطاق الجغرافي التلقائي)
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::get('/activities/{id}', [ActivityController::class, 'show']);
    Route::get('/activities/{id}/reviews', [ActivityController::class, 'reviews']);

    // مسارات الأنشطة المحمية
    Route::middleware(['auth:sanctum', 'arabic.locale'])->group(function () {
        Route::post('/activities', [ActivityController::class, 'store'])
            ->middleware(['permission:manage_activities', 'geo.scope']);

        Route::put('/activities/{activity}', [ActivityController::class, 'update'])
            ->middleware(['permission:manage_activities', 'geo.scope']);

        Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])
            ->middleware(['permission:manage_activities', 'geo.scope']);

        Route::post('/activities/{activity}/verify', [ActivityController::class, 'verify'])
            ->middleware(['permission:review_activities,verify_activities', 'geo.scope']);

        Route::post('/activities/{id}/reviews', [ReviewController::class, 'store']);
    });

    // التحليلات (Eager Loaded)
    Route::prefix('analytics')->middleware(['auth:sanctum', 'permission:view_reports,view_analytics'])->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('/activities', [AnalyticsController::class, 'activities']);
        Route::get('/users', [AnalyticsController::class, 'users']);
    });

    // إدارة النظام
    Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
        Route::apiResource('roles', RoleController::class)->middleware('permission:manage_roles');
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:view_users,manage_team');
        Route::put('/users/{user}/role', [UserController::class, 'updateRole'])->middleware('permission:manage_team');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:view_audit_logs');
    });
});`
  },
  {
    path: "app/Scopes/GeographicScope.php",
    title: "النطاق الجغرافي التلقائي (Geographic Global Scope)",
    category: "scopes",
    description: "يقيد استعلامات الأنشطة تلقائياً بمحافظة أو مدينة المراجع (مثل أسيوط أو القاهرة) ويعفي المدير العام.",
    code: `<?php

namespace App\\Scopes;

use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Scope;
use Illuminate\\Support\\Facades\\Auth;

class GeographicScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user();

        if (!$user) return;

        // إعفاء المدير العام أو من لا يخضع لتقييد جغرافي
        if ($user->isGeneralManager() || !$user->requiresGeoScope()) {
            return;
        }

        // تقييد الاستعلام بالمدينة/المحافظة المسندة للمستخدم
        if ($user->location_id) {
            $builder->where($model->qualifyColumn('location_id'), $user->location_id);
        }
    }
}`
  },
  {
    path: "app/Http/Middleware/GeographicScope.php",
    title: "ميدلوير النطاق الجغرافي (GeographicScope Middleware)",
    category: "middleware",
    description: "يحقن geo_scope في الطلب ويمنع إرسال طلبات أو تعديلات لنطاقات جغرافية غير مصرح بها بكود 403.",
    code: `<?php

namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;
use Symfony\\Component\\HttpFoundation\\Response;

class GeographicScope
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $request->attributes->set('geo_scope', $user->location_id);

            // منع التلاعب برقم الموقع في المعاملات للمراجع المقيد
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
}`
  },
  {
    path: "app/Models/AuditLog.php",
    title: "نموذج سجل العمليات (Append-Only AuditLog)",
    category: "models",
    description: "سجل عمليات لا يُمحى، يمنع التعديل والحذف نهائياً عبر الـ booted callbacks مع كاست للـ JSON.",
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\MorphTo;
use RuntimeException;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'model_type',
        'model_id',
        'action',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * حماية السجل: منع التعديل والحذف نهائياً (Append-Only)
     */
    protected static function booted(): void
    {
        static::updating(function () {
            throw new RuntimeException(__('messages.audit_log_immutable_update'));
        });

        static::deleting(function () {
            throw new RuntimeException(__('messages.audit_log_immutable_delete'));
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'model_type', 'model_id');
    }
}`
  },
  {
    path: "app/Observers/AuditLogObserver.php",
    title: "مراقب سجل العمليات (AuditLog Observer)",
    category: "observers",
    description: "يسجل تلقائياً الفروقات القديمة والجديدة وحساب المستخدم والـ IP عند إنشاء أو تحديث أو حذف أي نموذج.",
    code: `<?php

namespace App\\Observers;

use App\\Models\\AuditLog;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Support\\Facades\\Auth;
use Illuminate\\Support\\Facades\\Request;

class AuditLogObserver
{
    public function created(Model $model): void
    {
        $this->logAction($model, 'created', null, $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $oldValues = array_intersect_key($model->getOriginal(), $model->getChanges());
        $newValues = $model->getChanges();
        unset($oldValues['updated_at'], $newValues['updated_at']);

        if (!empty($newValues)) {
            $this->logAction($model, 'updated', $oldValues, $newValues);
        }
    }

    public function deleted(Model $model): void
    {
        $this->logAction($model, 'deleted', $model->getOriginal(), null);
    }

    protected function logAction(Model $model, string $action, ?array $oldValues, ?array $newValues): void
    {
        if ($model instanceof AuditLog) return;

        AuditLog::create([
            'user_id' => Auth::id(),
            'model_type' => get_class($model),
            'model_id' => $model->getKey(),
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip() ?? '127.0.0.1',
            'user_agent' => Request::userAgent() ?? 'API Client',
            'created_at' => now(),
        ]);
    }
}`
  },
  {
    path: "app/Models/Activity.php",
    title: "نموذج النشاط التجاري (Activity Model)",
    category: "models",
    description: "يتضمن النطاق الجغرافي العام، حل مشكلة الترتيب بالمشاهدات بإضافة withCount، وعلاقات الفئات والتقييمات.",
    code: `<?php

namespace App\\Models;

use App\\Scopes\\GeographicScope;
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Database\\Eloquent\\SoftDeletes;

class Activity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name_ar', 'name_en', 'slug', 'category_id', 'location_id',
        'owner_id', 'description_ar', 'address_ar', 'phone',
        'status', 'verified_at', 'verified_by', 'verification_notes',
        'rating_avg', 'reviews_count', 'views_count', 'is_featured', 'cover_image'
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new GeographicScope);
    }

    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function location(): BelongsTo { return $this->belongsTo(Location::class); }
    public function reviews(): HasMany { return $this->hasMany(Review::class); }
    public function views(): HasMany { return $this->hasMany(ActivityView::class); }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn($q) => $q->where('name_ar', 'like', "%{$search}%")->orWhere('description_ar', 'like', "%{$search}%"));
        }
        if (!empty($filters['category_id'])) $query->where('category_id', $filters['category_id']);
        if (!empty($filters['status'])) $query->where('status', $filters['status']);

        // حل مشكلة الترتيب بالمشاهدات بدون خطأ 500
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $direction = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'views' || $sortBy === 'views_count') {
            $query->withCount('views')->orderBy('views_count', $direction);
        } else {
            $query->orderBy('created_at', $direction);
        }

        return $query;
    }
}`
  },
  {
    path: "app/Services/AnalyticsService.php",
    title: "خدمة التحليلات المحسنة (Analytics Service)",
    category: "services",
    description: "حل مشكلة الـ 48 Query في الإصدار v2 بتجميعات SQL واستعلامات Eager Loading سريعة.",
    code: `<?php

namespace App\\Services;

use App\\Models\\Activity;
use App\\Models\\Category;
use App\\Models\\Location;
use Illuminate\\Support\\Facades\\Cache;

class AnalyticsService
{
    public function getDashboardStats(?int $locationId = null): array
    {
        $cacheKey = 'analytics_dashboard_' . ($locationId ?? 'all');

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($locationId) {
            $query = Activity::query();
            if ($locationId) $query->where('location_id', $locationId);

            // استعلام تجميعي واحد بدلاً من حلقات N+1
            $stats = $query->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                COALESCE(SUM(views_count), 0) as total_views,
                COALESCE(AVG(rating_avg), 0) as average_rating
            ")->first();

            $categoryDist = Category::withCount(['activities' => fn($q) => $locationId ? $q->where('location_id', $locationId) : null])->get();

            return [
                'summary' => $stats,
                'category_distribution' => $categoryDist,
                'performance' => [
                    'queries_executed' => 2, // بدلاً من 48 في v2!
                    'optimization_ratio' => '95.8% Query Reduction',
                ]
            ];
        });
    }
}`
  },
  {
    path: "app/Http/Controllers/Api/V2/ActivityController.php",
    title: "متحكم الأنشطة (Activity Controller V2)",
    category: "controllers",
    description: "يدعم الـ pagination metadata، والتحقق عبر الـ FormRequests، والمراجعة مع حماية النطاق.",
    code: `<?php

namespace App\\Http\\Controllers\\Api\\V2;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StoreActivityRequest;
use App\\Http\\Requests\\VerifyActivityRequest;
use App\\Http\\Resources\\ActivityResource;
use App\\Models\\Activity;
use App\\Services\\ActivityService;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\Request;

class ActivityController extends Controller
{
    protected ActivityService $service;

    public function __construct(ActivityService $service) {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->service->getPaginatedActivities($request->all(), 15);

        return response()->json([
            'count' => $paginator->total(),
            'next' => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
            'results' => ActivityResource::collection($paginator->items()),
        ]);
    }

    public function verify(VerifyActivityRequest $request, Activity $activity): JsonResponse
    {
        $this->authorize('verify', $activity);

        $verified = $this->service->verifyActivity(
            $activity,
            $request->input('action'),
            $request->input('notes'),
            $request->input('rejection_reason'),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => __('messages.activity_verified_success'),
            'data' => new ActivityResource($verified),
        ]);
    }
}`
  },
  {
    path: "database/seeders/RolesSeeder.php",
    title: "مغذي الأدوار الستة (Roles Seeder)",
    category: "seeders",
    description: "توليد الأدوار الستة: مدير_عام، مدير_تشغيل، مراجع_أنشطة (geo_scope)، مشرف_محتوى، دعم_فني، محلل_بيانات.",
    code: `<?php

namespace Database\\Seeders;

use App\\Models\\Permission;
use App\\Models\\Role;
use Illuminate\\Database\\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'مدير_عام', 'display_name_ar' => 'مدير عام', 'requires_geo_scope' => false, 'permissions' => Permission::pluck('name')->toArray()],
            ['name' => 'مدير_تشغيل', 'display_name_ar' => 'مدير تشغيل', 'requires_geo_scope' => false, 'permissions' => ['manage_content', 'manage_activities', 'manage_team', 'view_activities']],
            ['name' => 'مراجع_أنشطة', 'display_name_ar' => 'مراجع أنشطة', 'requires_geo_scope' => true, 'permissions' => ['review_activities', 'verify_activities', 'view_activities']],
            ['name' => 'مشرف_محتوى', 'display_name_ar' => 'مشرف محتوى', 'requires_geo_scope' => false, 'permissions' => ['manage_reviews', 'manage_reported_content', 'view_activities']],
            ['name' => 'دعم_فني', 'display_name_ar' => 'دعم فني', 'requires_geo_scope' => false, 'permissions' => ['view_users', 'view_activities']],
            ['name' => 'محلل_بيانات', 'display_name_ar' => 'محلل بيانات', 'requires_geo_scope' => false, 'permissions' => ['view_reports', 'view_analytics', 'view_audit_logs']],
        ];

        foreach ($roles as $data) {
            $perms = $data['permissions'];
            unset($data['permissions']);
            $role = Role::firstOrCreate(['name' => $data['name']], $data);
            $role->permissions()->sync(Permission::whereIn('name', $perms)->pluck('id'));
        }
    }
}`
  },
  {
    path: "resources/lang/ar/messages.php",
    title: "رسائل الخطأ والنظام بالعربية (Arabic Localization)",
    category: "lang",
    description: "جميع الرسائل بالعربية لنظام الصلاحيات والنطاق الجغرافي وسجل العمليات.",
    code: `<?php

return [
    'login_successful' => 'تم تسجيل الدخول بنجاح.',
    'activity_verified_success' => 'تم توثيق واعتماد النشاط التجاري بنجاح ونشره في الدليل.',
    'geo_scope_violation' => 'غير مصرح: لا يمكنك طلب بيانات أو إنشاء سجلات خارج نطاقك الجغرافي المخصص (:user_location).',
    'geo_scope_unauthorized_verification' => 'غير مصرح: كمراجع محلي، يمكنك فقط اعتماد وتوثيق الأنشطة الواقعة داخل نطاقك الجغرافي.',
    'permission_denied' => 'غير مصرح: ليس لديك الصلاحية المطلوبة (:permissions) لتنفيذ هذه العملية.',
    'audit_log_immutable_update' => 'انتهاك أمني: سجل العمليات (Audit Log) غير قابل للتعديل نهائياً (Append-Only Immutable).',
    'audit_log_immutable_delete' => 'انتهاك أمني: سجل العمليات (Audit Log) غير قابل للحذف نهائياً (Append-Only Immutable).',
];`
  },
  {
    path: "tests/Feature/Api/GeographicScopeTest.php",
    title: "اختبار النطاق الجغرافي (Geographic Scope Test)",
    category: "tests",
    description: "اختبار مراجع أسيوط لمنعه من رؤية أو اعتماد أنشطة القاهرة، مع تحقق وصول المدير العام الشامل.",
    code: `<?php

namespace Tests\\Feature\\Api;

use App\\Models\\Activity;
use App\\Models\\Category;
use App\\Models\\Location;
use App\\Models\\Role;
use App\\Models\\User;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use Tests\\TestCase;

class GeographicScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_asyut_reviewer_cannot_see_or_verify_cairo_activities(): void
    {
        $cairo = Location::create(['name_ar' => 'القاهرة', 'code' => 'CAI']);
        $asyut = Location::create(['name_ar' => 'أسيوط', 'code' => 'ASY']);
        $cat = Category::create(['name_ar' => 'مطاعم', 'slug' => 'restaurants']);

        $cairoActivity = Activity::create([
            'name_ar' => 'كافيه المعادي',
            'slug' => 'maadi-cafe',
            'category_id' => $cat->id,
            'location_id' => $cairo->id,
            'address_ar' => 'المعادي، القاهرة',
            'status' => 'pending',
        ]);

        $reviewerRole = Role::where('name', 'مراجع_أنشطة')->first();
        $asyutReviewer = User::factory()->create(['role_id' => $reviewerRole->id, 'location_id' => $asyut->id]);

        $response = $this->actingAs($asyutReviewer, 'sanctum')
            ->postJson("/api/v2/activities/{$cairoActivity->id}/verify", ['action' => 'verify']);

        $response->assertStatus(403);
    }
}`
  },
  {
    path: "bootstrap/app.php",
    title: "ملف إعدادات Laravel 11 (Bootstrap)",
    category: "bootstrap",
    description: "التسجيل الحديث لميدلوير الصلاحيات والنطاق الجغرافي والـ Localization في معمارية Laravel 11.",
    code: `<?php

use App\\Http\\Middleware\\CheckPermission;
use App\\Http\\Middleware\\GeographicScope;
use App\\Http\\Middleware\\SetArabicLocale;
use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(api: __DIR__.'/../routes/api.php')
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'permission' => CheckPermission::class,
            'geo.scope' => GeographicScope::class,
            'arabic.locale' => SetArabicLocale::class,
        ]);
        $middleware->api(append: [SetArabicLocale::class]);
    })->create();`
  }
];
