<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:categories,name,'.$this->route('category'),
            'slug' => 'required|string|max:255|unique:categories,slug,'.$this->route('category'),
            'tagline' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:2048',
        ];
    }
}
