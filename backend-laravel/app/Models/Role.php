<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name_ar',
        'description_ar',
        'requires_geo_scope',
        'is_system',
    ];

    protected $casts = [
        'requires_geo_scope' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role')->withTimestamps();
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function hasPermission(string $permissionName): bool
    {
        // إذا كان الدور هو "مدير_عام"، فإنه يمتلك كافة الصلاحيات بدون استثناء
        if ($this->name === 'مدير_عام' || $this->name === 'general_manager') {
            return true;
        }

        return $this->permissions->contains('name', $permissionName);
    }
}
