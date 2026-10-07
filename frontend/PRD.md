# Product Requirement Document (PRD) - Monday Frontend (React JS)

## 1. Overview & Core Objective
Frontend aplikasi Monday berfungsi sebagai Single Page Application (SPA) berbasis React JS yang menghubungkan antarmuka pengguna (Manager & Keeper) dengan REST API Laravel Backend.

## 2. Technical Stack
- **Framework:** React JS (Vite / JSX)
- **Styling:** Tailwind CSS (Soft Dark Mode Theme)
- **HTTP Client:** Axios (dengan Interceptor Auth)
- **Icons:** Lucide React
- **Routing:** React Router DOM (v6+)

## 3. Key Features & User Experience
### A. Authentication & Protection
- Public Page: Login (`/login`).
- Auth State Management: `AuthProvider` menyimpan token Sanctum di `localStorage` dan profil user di state global.
- Protected Routes:
  - Role Manager: Akses full ke Overview, Categories, Products, Warehouses, Merchants, Users, Roles, dan All Transactions.
  - Role Keeper: Hanya punya akses ke My Merchant Profile, Transaction History Toko, dan Halaman POS (Kasir).
  - Unauthorized Page (`/unauthorized`): Dialihkan jika user mengakses route luar wewenang role-nya.

### B. Manager Workflows
- Management CRUD untuk Master Data (Categories, Products, Warehouses, Merchants, Users, Roles).
- Assigning Products ke Warehouse (`warehouse_products`) dan Merchant (`merchant_products`).
- Viewing Global Revenue & System Overview.

### C. Keeper Workflows
- Checkout POS System: Menginput nama/nomor HP customer, memilih produk toko, serta menghitung total harga secara real-time.
- Handling Error Stok: Jika stok kurang, sistem menampilkan modal alert pesan error dari response backend (HTTP 400).

## 4. Code Architecture Rules
- **Clean Code & Modular:** Pisahkan panggilan API ke folder `src/api/`, state global ke `src/providers/` & `src/context/`, serta komponen UI reusable ke `src/components/`.
- **Maintainability:** Hindari penulisan kode "spaghetti" dalam satu file besar. Gunakan Custom Hooks (`src/hooks/`) untuk pembagian logika async.