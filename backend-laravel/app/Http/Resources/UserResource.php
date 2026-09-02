<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role_id' => $this->role_id,
            'role' => new RoleResource($this->whenLoaded('role')),
            'role_name' => $this->role ? $this->role->name : null,
            'role_display_name_ar' => $this->role ? $this->role->display_name_ar : null,
            'location_id' => $this->location_id,
            'location' => new LocationResource($this->whenLoaded('location')),
            'location_name_ar' => $this->location ? $this->location->name_ar : null,
            'avatar_url' => $this->avatar_url,
            'is_active' => $this->is_active,
            'requires_geo_scope' => $this->requiresGeoScope(),
            'permissions' => $this->role && $this->role->permissions ? $this->role->permissions->pluck('name') : [],
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
