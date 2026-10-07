# Alur Sistem & Service-Repository Pattern Guide

## 1. Clean Code & Architecture Rules

### ⚠️ instruksi Khusus Pembuatan Folder & File (Repositories & Services)
Folder `app/Repositories` dan `app/Services` belum ada di struktur proyek awal. AI Agent wajib membuat folder dan struktur filenya dari nol sesuai ketentuan berikut:

1. **Keterhubungan Controller, Service, dan Repository:**
   - **Controller (`app/Http/Controllers`):** 
     - Menerima `FormRequest` untuk validasi.
     - **TIDAK BOLEH** langsung memanggil Eloquent Model (misal: `Product::all()` atau `Transaction::create()`).
     - Memanggil `Service` melalui Dependency Injection pada `__construct()`.
     - Mengembalikan `API Resource` atau JSON Response.
   - **Service Layer (`app/Services`):**
     - Berisi seluruh logika bisnis, kalkulasi harga, validasi stok, penanganan exception, dan penanganan `DB::transaction()`.
     - Memanggil `Repository` melalui Dependency Injection pada `__construct()`.
   - **Repository Layer (`app/Repositories`):**
     - Berisi query ORM Eloquent murni (`find`, `create`, `update`, `delete`, `where`).
     - Menggunakan arsitektur `Interface` & `Implementation` (contoh: `ProductRepositoryInterface` dan `ProductRepository`).

2. **Daftar Folder Baru yang Harus Dibuat AI:**
   - `app/Repositories/Contracts/` (Untuk menyimpan Interface)
   - `app/Repositories/Eloquent/` (Untuk menyimpan Implementasi Query Eloquent)
   - `app/Services/` (Untuk menyimpan Logic Service)
   - `app/Providers/RepositoryServiceProvider.php` (Untuk melakukan bind Interface ke Implementation di Service Provider)

3. **Prinsip SOLID & Clean Code:**
   - **Controller:** Hanya bertugas menerima HTTP Request, memanggil FormRequest untuk validasi, memanggil Service, dan mengembalikan Resource/JSON Response.
   - **Form Request:** Seluruh aturan validasi input diletakkan di `App\Http\Requests`.
   - **Service Layer (`App\Services`):** Tempat seluruh Business Logic (perhitungan total harga, potongan stok, penanganan exception, `DB::transaction`).
   - **Repository Layer (`App\Repositories`):** Tempat query ORM Eloquent murni (`find`, `create`, `update`, `delete`, `where`).
   - **API Resource (`App\Http\Resources`):** Mengubah format keluaran JSON agar konsisten dan rapi.
4. **Keterbacaan Kode:**
   - Hindari kodingan "vibe coder" atau "spaghetti code".
   - Tulis nama variabel secara eksplisit (contoh: `$merchantRepository`, bukan `$mRepo`).
   - Berikan Type Hinting di semua function argument dan return type.

## 2. Alur Transaksi POS (Keeper Workflow)
1. **Keeper Request:** POST `/api/transactions` dengan body `{ merchant_id, customer_name, customer_phone, items: [{ product_id, qty }] }`.
2. **Validation:** `TransactionRequest` mengecek kelengkapan data & format.
3. **TransactionService:**
   - Membuka `DB::beginTransaction()`.
   - Melakukan loop pada `items`.
   - Memanggil `MerchantRepository::checkStock($merchantId, $productId)`.
   - Jika stok kurang, lempar `ValidationException` / `HttpResponseException`.
   - Menghitung total harga & membuat record `Transaction`.
   - Membuat record `TransactionDetail` per barang.
   - Memanggil `MerchantRepository::decrementStock($merchantId, $productId, $qty)`.
   - `DB::commit()`.
4. **Response:** Mengembalikan `TransactionResource` dengan status HTTP `201 Created`.

## 3. Cara Menghubungkan Backend (Laravel API) ke Frontend (React TypeScript)
- **Base URL API:** `http://localhost:8000/api`
- **Autentikasi Header:**
  - Saat login berhasil, backend mengembalikan `token` Sanctum.
  - Simpan token di `localStorage` / `Cookies` frontend.
  - Kirim header pada setiap request:
    `Authorization: Bearer <token_sanctum>`
    `Accept: application/json`
- **Struktur Response Standar JSON Backend:**
  ```json
  {
    "success": true,
    "message": "Data retrieved successfully",
    "data": { ... }
  }
