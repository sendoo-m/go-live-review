<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $activityId = $this->route('activity') ? $this->route('activity')->id : $this->route('id');

        return [
            'name_ar' => ['sometimes', 'required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'unique:activities,slug,' . $activityId],
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'location_id' => ['sometimes', 'required', 'exists:locations,id'],
            'description_ar' => ['nullable', 'string'],
            'address_ar' => ['sometimes', 'required', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_featured' => ['nullable', 'boolean'],
            'cover_image' => ['nullable', 'string', 'max:1000'],
            'gallery' => ['nullable', 'array'],
            'working_hours' => ['nullable', 'array'],
            'attributes' => ['nullable', 'array'],
        ];
    }
}
