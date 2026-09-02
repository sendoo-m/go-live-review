<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('role') ? $this->route('role')->id : $this->route('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100', 'unique:roles,name,' . $roleId],
            'display_name_ar' => ['sometimes', 'required', 'string', 'max:255'],
            'description_ar' => ['nullable', 'string'],
            'requires_geo_scope' => ['nullable', 'boolean'],
            'permissions' => ['sometimes', 'required', 'array'],
            'permissions.*' => ['exists:permissions,name'],
        ];
    }
}
