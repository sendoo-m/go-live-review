<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role_id',
        'location_id',
        'avatar_url',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'owner_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * التحقق مما إذا كان المستخدم يمتلك صلاحية معينة
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isGeneralManager()) {
            return true;
        }

        return $this->role ? $this->role->hasPermission($permission) : false;
    }

    /**
     * التحقق من الدور
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * هل المستخدم مدير عام؟
     */
    public function isGeneralManager(): bool
    {
        return $this->hasRole('مدير_عام') || $this->hasRole('general_manager');
    }

    /**
     * هل يخضع المستخدم لتقييد النطاق الجغرافي؟
     */
    public function requiresGeoScope(): bool
    {
        if ($this->isGeneralManager()) {
            return false;
        }

        return $this->role ? $this->role->requires_geo_scope : false;
    }

    /**
     * الحصول على معرف النطاق الجغرافي للمستخدم
     */
    public function getGeoScopeLocationId(): ?int
    {
        return $this->location_id;
    }
}
