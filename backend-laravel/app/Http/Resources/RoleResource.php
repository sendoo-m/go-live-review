<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name_ar' => $this->display_name_ar,
            'description_ar' => $this->description_ar,
            'requires_geo_scope' => $this->requires_geo_scope,
            'is_system' => $this->is_system,
            'users_count' => $this->whenCounted('users'),
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
            'permissions_list' => $this->permissions ? $this->permissions->pluck('name') : [],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
