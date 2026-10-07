<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Endpoint legacy (POST /users/roles) mewajibkan user_id di body.
            // Endpoint RESTful (PUT /users/{user}/role) mengambil user dari route
            // parameter, jadi user_id di body jadi opsional.
            //
            // PENTING: jangan pakai `required_without:user`, karena route
            // parameter TIDAK ikut masuk ke $request->all() sehingga aturan itu
            // selalu dianggap field `user` tidak ada -> 422 terus-menerus.
            'user_id' => [
                'nullable',
                'exists:users,id',
                Rule::requiredIf($this->route('user') === null),
            ],
            'role_id' => ['required', 'exists:roles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User wajib diisi.',
            'user_id.exists' => 'User yang dipilih tidak ditemukan.',
            'role_id.required' => 'Role wajib dipilih.',
            'role_id.exists' => 'Role yang dipilih tidak ditemukan.',
        ];
    }
}
