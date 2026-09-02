<?php

namespace App\Models;

use App\Scopes\GeographicScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name_ar',
        'name_en',
        'slug',
        'category_id',
        'location_id',
        'owner_id',
        'description_ar',
        'address_ar',
        'phone',
        'whatsapp',
        'email',
        'website',
        'latitude',
        'longitude',
        'status',
        'verified_at',
        'verified_by',
        'verification_notes',
        'rating_avg',
        'reviews_count',
        'views_count',
        'is_featured',
        'cover_image',
        'gallery',
        'working_hours',
        'attributes',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating_avg' => 'float',
        'reviews_count' => 'integer',
        'views_count' => 'integer',
        'is_featured' => 'boolean',
        'gallery' => 'array',
        'working_hours' => 'array',
        'attributes' => 'array',
        'verified_at' => 'datetime',
    ];

    /**
     * تطبيق النطاق الجغرافي التلقائي كـ Global Scope
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new GeographicScope);
    }

    /* -------------------------------------------------------------------------- */
    /*                                Relationships                               */
    /* -------------------------------------------------------------------------- */

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(ActivityView::class);
    }

    public function auditLogs(): MorphMany
    {
        return $this->morphMany(AuditLog::class, 'auditable', 'model_type', 'model_id');
    }

    /* -------------------------------------------------------------------------- */
    /*                                Local Scopes                                */
    /* -------------------------------------------------------------------------- */

    /**
     * تقييد بالمنطقة الجغرافية يدوياً إذا لزم الأمر
     */
    public function scopeWithinGeoScope(Builder $query, ?int $locationId): Builder
    {
        if ($locationId) {
            return $query->where('location_id', $locationId);
        }

        return $query;
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('status', 'verified');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * فلاتر البحث والترتيب المتقدمة (حل مشكلة الترتيب بالمشاهدات بإضافة withCount)
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        // البحث بالنص
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('description_ar', 'like', "%{$search}%")
                  ->orWhere('address_ar', 'like', "%{$search}%");
            });
        }

        // التصنيف
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // الموقع الجغرافي
        if (!empty($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        }

        // الحالة
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // الأنشطة المميزة
        if (isset($filters['featured'])) {
            $query->where('is_featured', filter_var($filters['featured'], FILTER_VALIDATE_BOOLEAN));
        }

        // الترتيب - إضافة withCount لمنع أخطاء 500
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $direction = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'views' || $sortBy === 'views_count') {
            $query->withCount('views')->orderBy('views_count', $direction);
        } elseif ($sortBy === 'rating' || $sortBy === 'rating_avg') {
            $query->orderBy('rating_avg', $direction);
        } elseif ($sortBy === 'reviews' || $sortBy === 'reviews_count') {
            $query->orderBy('reviews_count', $direction);
        } elseif ($sortBy === 'name') {
            $query->orderBy('name_ar', $direction);
        } else {
            $query->orderBy('created_at', $direction);
        }

        return $query;
    }
}
