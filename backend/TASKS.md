---

### 📂 Dokumen 3: `tasks.md` (Daftar Tugas AI Agent Backend)

Silakan simpan file berikut dengan nama `tasks.md` dan berikan ke AI Agent kamu untuk menyelesaikan backend sampai **100% Siap**:

```markdown
# Tasks List for AI Agent - Backend Completion & Refactoring

> **PENTING UNTUK AI AGENT:**
> 1. Folder `app/Repositories` dan `app/Services` **BELUM ADA / BELUM DIBUAT** di dalam proyek. Kamu wajib membuat struktur folder dan file-file di dalamnya terlebih dahulu.
> 2. **Controller, Service, dan Repository saling berhubungan erat:**
>    - Controller **HANYA** memanggil Service.
>    - Service **HANYA** memanggil Repository.
>    - Repository **HANYA** berinteraksi dengan Eloquent Model.
>    - **DILARANG** melakukan query Eloquent langsung di Controller.
> 3. Jangan lupa daftarkan binding Repository Interface ke Implementation di `RepositoryServiceProvider` (atau `AppServiceProvider`).
> - Gunakan standar Clean Code, Type Hinting, dan Service-Repository Pattern.
> - HINDARI gaya penulisan acak-acakan (vibe-coding slop).
> - Pastikan semua file di bawah ini diimplementasikan dengan rapi dan gampang di-maintain.

---

### Task 0: Scaffolding Folder & Service-Repository Structure (PRIORITAS UTAMA)
- [ ] Buat folder `app/Repositories/Contracts` dan `app/Repositories/Eloquent`.
- [ ] Buat folder `app/Services`.
- [ ] Buat `RepositoryServiceProvider` menggunakan command `php artisan make:provider RepositoryServiceProvider` dan daftarkan ke `config/app.php` (atau `bootstrap/providers.php` pada Laravel 11/12).

---

### Task 1: Complete Repositories Layer (`app/Repositories`)
- [ ] Buat Interface & Implementation untuk `AuthRepository`:
  - Interface: `app/Repositories/Contracts/AuthRepositoryInterface.php`
  - Eloquent: `app/Repositories/Eloquent/AuthRepository.php`
- [ ] Buat Interface & Implementation untuk `MerchantRepository`:
  - Interface: `app/Repositories/Contracts/MerchantRepositoryInterface.php`
  - Eloquent: `app/Repositories/Eloquent/MerchantRepository.php`
- [ ] Buat Interface & Implementation untuk `TransactionRepository`:
  - Interface: `app/Repositories/Contracts/TransactionRepositoryInterface.php`
  - Eloquent: `app/Repositories/Eloquent/TransactionRepository.php`
- [ ] Buat Interface & Implementation untuk `ProductRepository` dan `WarehouseRepository`.
- [ ] Bind seluruh Interface ke Implementation di `RepositoryServiceProvider`.

---

### Task 2: Implement Services Layer (`app/Services`)
- [ ] Buat `AuthService.php`:
  - Inject `AuthRepositoryInterface` di `__construct`.
  - Tangani logika login, registrasi, pembuatan Sanctum Token, dan penanganan autentikasi gagal.
- [ ] Buat `TransactionService.php`:
  - Inject `TransactionRepositoryInterface` dan `MerchantRepositoryInterface` di `__construct`.
  - Bungkus logika transaksi POS dalam `DB::transaction()`.
  - Pengecekan ketersediaan stok merchant sebelum menyimpan transaksi.
  - Pengurangan stok otomatis jika transaksi berhasil.
- [ ] Buat `ProductService.php`, `WarehouseService.php`, dan `MerchantService.php`.

---

### Task 3: Refactor & Complete Controllers (`app/Http/Controllers`)
- [ ] Refactor `AuthController.php`: Inject `AuthService`, hapus query Eloquent langsung.
- [ ] Refactor `TransactionController.php`: Inject `TransactionService`, gunakan `TransactionRequest` untuk validasi input.
- [ ] Refactor `MerchantController.php`, `WarehouseController.php`, dan `ProductController.php` agar hanya memanggil Service masing-masing.

---
### Task 4: Routes, Middlewares, Seeders & Verification
- [ ] Selesaikan pembuatan Route API pada `routes/api.php` sesuai dengan spesifikasi di `PRD.md`.
- [ ] Buat FormRequest di `app/Http/Requests` dan API Resources di `app/Http/Resources`.
- [ ] Sempurnakan `UserRoleSeeder.php` dan jalankan `php artisan db:seed`.
- [ ] Verifikasi seluruh endpoint menggunakan Postman / HTTP client.

### Task 5: Seeders & Verification
- [ ] Sempurnakan `UserRoleSeeder.php` dengan penyiapan role `manager` dan `keeper` beserta dummy akun testing:
  - Manager: `manager@monday.com` / `password`
  - Keeper: `keeper@monday.com` / `password`
- [ ] Jalankan `php artisan db:seed` dan pastikan API diuji melalui Postman dengan status `200 OK` / `201 Created`.
