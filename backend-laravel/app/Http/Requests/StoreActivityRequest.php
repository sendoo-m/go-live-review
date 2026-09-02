<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // يتم التحقق عبر Middleware و Policy
    }

    public function rules(): array
    {
        return [
            'name_ar' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'description_ar' => ['nullable', 'string'],
            'address_ar' => ['required', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_featured' => ['nullable', 'boolean'],
            'cover_image' => ['nullable', 'string', 'max:1000'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string', 'max:1000'],
            'working_hours' => ['nullable', 'array'],
            'attributes' => ['nullable', 'array'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name_ar') && !$this->has('slug')) {
            $this->merge([
                'slug' => Str::slug($this->input('name_ar') . '-' . Str::random(5))
            ]);
        }
    }
}
