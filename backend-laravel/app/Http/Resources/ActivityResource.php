<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_ar' => $this->name_ar,
            'name_en' => $this->name_en,
            'slug' => $this->slug,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'location_id' => $this->location_id,
            'location' => new LocationResource($this->whenLoaded('location')),
            'owner_id' => $this->owner_id,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'description_ar' => $this->description_ar,
            'address_ar' => $this->address_ar,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'website' => $this->website,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status,
            'verified_at' => $this->verified_at?->toIso8601String(),
            'verified_by' => $this->verified_by,
            'verifier' => new UserResource($this->whenLoaded('verifier')),
            'verification_notes' => $this->verification_notes,
            'rating_avg' => round((float)$this->rating_avg, 2),
            'reviews_count' => (int)$this->reviews_count,
            'views_count' => (int)($this->views_count ?? $this->views_count_agg ?? 0),
            'views_count_counted' => $this->whenCounted('views'),
            'is_featured' => (bool)$this->is_featured,
            'cover_image' => $this->cover_image,
            'gallery' => $this->gallery ?? [],
            'working_hours' => $this->working_hours ?? [],
            'attributes' => $this->attributes ?? [],
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
