<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MerchantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:merchants,name,'.$this->route('merchant'),
            'address' => 'required|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:2048',
            // DB punya unique index di phone; tanpa rule ini user dapat 500 SQLSTATE
            // 23002/1062 alih-alih pesan validasi yang bisa ditampilkan form.
            'phone' => [
                'required',
                'string',
                'max:15',
                Rule::unique('merchants', 'phone')->ignore($this->route('merchant')),
            ],
            'keeper_id' => 'required|exists:users,id',
        ];
    }
}
