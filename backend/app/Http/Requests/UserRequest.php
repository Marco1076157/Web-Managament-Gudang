<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Pada route update, parameter URL bernama `user`. unique() diabaikan
        // untuk record yang sedang diedit supaya email tidak bentrok dengan
        // dirinya sendiri.
        $userId = $this->route('user');

        // Deteksi apakah request multipart (file upload)
        $isMultipart = $this->isMethod('post') || $this->isMethod('put') || $this->isMethod('patch');

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],

            // `confirmed` otomatis Shine membandingkan dengan password_confirmation,
            // field itu tidak perlu dideklarasikan sendiri.
            'password' => $this->isMethod('post')
                ? ['required', 'string', 'min:8', 'confirmed']
                : ['nullable', 'string', 'min:8', 'confirmed'],

            // Kolom ini nullable di DB (lihat migration 2026_10_05_120000).
            'phone' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore($userId),
            ],
            'photo' => $isMultipart
                ? ['nullable', 'file', 'image', 'max:2048'] // 2MB max
                : ['nullable', 'string', 'max:255'],

            // Frontend mengirim role_id sebagai string hasil <select value={role.id}>.
            // Diterima juga `role` (nama) supaya payload dari AssignRole tetap jalan.
            'role_id' => ['nullable', 'integer', Rule::exists('roles', 'id')],
            'role' => ['nullable', 'string', Rule::exists('roles', 'name')],
        ];
    }

    /**
     * Buang nilai kosong sebelum divalidasi.
     *
     * Tanpa ini `role_id: ""` dari <select> yang belum dipilih akan gagal
     * aturan integer, dan `phone: ""` dianggap tidak unique.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        foreach (['role_id', 'phone', 'photo', 'role'] as $field) {
            if ($this->has($field) && $this->input($field) === '') {
                $merge[$field] = null;
            }
        }

        if ($merge) {
            $this->merge($merge);
        }
    }
}
