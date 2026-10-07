# Product Requirement Document (PRD) - Monday Warehouse & Merchant POS Management System

## 1. Overview & Goal
Monday adalah sistem manajemen gudang (Warehouse), toko (Merchant), dan Point of Sales (POS) multi-role yang dirancang untuk mengelola rantai pasok barang dari gudang utama hingga penjualan di toko eceran.

## 2. User Roles & Access Control
- **Manager (Super Admin):**
  - Mengelola data Users & User Roles (Assign Role).
  - Mengelola Master Categories & Master Products.
  - Mengelola Warehouses (Gudang) & assign stok produk ke gudang (`warehouse_products`).
  - Mengelola Merchants (Toko/Cabang) & assign penjaga toko (Keeper).
  - Mengunggah/Assign produk ke Merchant beserta alokasi stok.
  - Memantau laporan revenue & seluruh transaksi secara menyeluruh.

- **Keeper (Penjaga Toko):**
  - Hanya dapat mengakses profil merchant yang ditugaskan padanya (`my-merchant`).
  - Melihat stok produk yang tersedia di tokonya.
  - Melakukan transaksi POS (Kasir) untuk pembeli (Customer).
  - Memantau riwayat transaksi toko.

## 3. Database Schema & Architecture Overview
### Architectural Structure Notice for AI Agent
- Folder `app/Repositories` dan `app/Services` **saat ini belum dibuat secara fisik** di dalam direktori proyek.
- AI Agent wajib membuat folder dan file antarmuka (interface) serta implementasinya terlebih dahulu sebelum menulis logika pada Controller.
- Alur keterhubungan class wajib mengikuti pola:
  `HTTP Request` ➔ `Controller` ➔ `Service Layer` ➔ `Repository Layer` ➔ `Eloquent Model / DB`
### Entities & Relationships
1. `users`: ID, name, email, password, phone, photo, created_at, updated_at.
2. `roles`: ID, name (`manager`, `keeper`), display_name.
3. `user_roles`: user_id, role_id.
4. `categories`: ID, name, slug, icon, created_at, updated_at.
5. `products`: ID, name, slug, category_id, photo, price, description, created_at, updated_at.
6. `warehouses`: ID, name, address, phone, photo, created_at, updated_at.
7. `warehouse_products`: ID, warehouse_id, product_id, stock.
8. `merchants`: ID, name, address, phone, photo, keeper_id (FK to users), created_at, updated_at.
9. `merchant_products`: ID, merchant_id, product_id, stock.
10. `transactions`: ID, transaction_code, merchant_id, customer_name, customer_phone, total_amount, status (`pending`, `success`, `failed`), created_at, updated_at.
11. `transaction_details`: ID, transaction_id, product_id, qty, price, subtotal.

## 4. Key Business Logic Rules
1. **Validasi Stok Transaksi:** Ketika Keeper membuat transaksi, stok produk di `merchant_products` harus dicek. Jika `requested_qty > merchant_stock`, transaksi HARUS dibatalkan dengan error `400 Bad Request` ("Stok tidak mencukupi").
2. **Pengurangan Stok Otomatis:** Saat transaksi `success`, stok di `merchant_products` berkurang sejumlah `qty`.
3. **Database Transaction Integrity:** Semua proses pembuatan transaksi dan pembaruan stok WAJIB dibungkus dalam `DB::transaction()`.
4. **Keamanan Sanctum & Middleware Role:**
   - Semua endpoint publik dilindungi middleware `auth:sanctum`.
   - Endpoint khusus Manager dilindungi middleware `role:manager`.
   - Endpoint khusus Keeper menggunakan filter berdasarkan `auth()->id()`.
