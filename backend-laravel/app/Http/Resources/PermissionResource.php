<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name_ar' => $this->display_name_ar,
            'module' => $this->module,
            'description_ar' => $this->description_ar,
        ];
    }
}
