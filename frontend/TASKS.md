---

### 📂 Dokumen 3: `frontend/tasks.md`

Simpan dokumen berikut di folder `frontend/tasks.md`:

```markdown
# Tasks List for AI Agent - Frontend Implementation (React JS)

> **INTRUKSI UTAMA UNTUK AI AGENT:**
> - Gunakan React JS murni (`.jsx` / `.js`) TANPA TypeScript.
> - Terapkan Clean Code, pemisahan komponen modular, dan komentar penjelas yang rapi.
> - Pastikan semua halaman memakai tema Soft Dark Mode sesuai `DESIGN.md` (Slate Dark `#0F172A`, Card `#1E293B`, Text `#F8FAFC`, Accent `#6366F1`).
> - Terapkan Lucide React sebagai sumber ikon tunggal secara konsisten.

---

### Task 1: Setup Infrastructure & Axios Instance
- [ ] Install `react-router-dom`.
- [ ] Buat `src/api/axiosInstance.js` dengan konfigurasi Base URL dan Interceptor Token.
- [ ] Buat API Service Helpers di `src/api/`:
  - `authService.js` (login, logout, getUser)
  - `categoryService.js`, `productService.js`, `warehouseService.js`, `merchantService.js`
  - `transactionService.js` (checkout POS, list transaksi)

---

### Task 2: Auth Context & Protected Routing
- [ ] Buat `src/context/AuthContext.js` dan `src/hooks/useAuth.js`.
- [ ] Buat `src/providers/AuthProvider.jsx` untuk menangani persistent login & state user.
- [ ] Buat `src/routes/ProtectedRoute.jsx` untuk proteksi halaman berdasarkan login state & role (`manager` / `keeper`).
- [ ] Buat `src/routes/AppRoutes.jsx` untuk pendaftaran seluruh path route.

---

### Task 3: Base Layout & Reusable Components
- [ ] Buat `Sidebar.jsx` (Daftar menu navigasi sesuai role user dengan ikon Lucide React).
- [ ] Buat `Topbar.jsx` (Menampilkan nama user, badge role, dan tombol Logout).
- [ ] Buat `MainLayout.jsx` (Container yang menggabungkan Sidebar, Topbar, dan area konten utama dengan tema Slate Dark).
- [ ] Buat komponen Reusable UI: `Button.jsx`, `Input.jsx`, `Modal.jsx`, `Badge.jsx`, `Table.jsx`.

---

### Task 4: Implement Pages (Manager Workflows)
- [ ] `Login.jsx`: Form login dengan penanganan error validation.
- [ ] `Overview.jsx`: Dashboard Ringkasan (Stat cards revenue, total warehouse, total merchant, transaksi terakhir).
- [ ] CRUD Category Pages (`pages/categories/`): `CategoryList.jsx`, `AddCategory.jsx`, `EditCategory.jsx`.
- [ ] CRUD Product Pages (`pages/products/`).
- [ ] CRUD Warehouse Pages (`pages/warehouses/`) & assign product modal.
- [ ] CRUD Merchant Pages (`pages/merchants/`) & assign keeper modal.
- [ ] User & Role Management Pages (`pages/users/`, `pages/roles/`).

---

### Task 5: Implement Pages (Keeper Workflows)
- [ ] `OverviewMerchant.jsx`: Profil toko keeper (`/my-merchant`) beserta daftar stok produk toko.
- [ ] `POSTransaction.jsx`: 
  - Form Kasir (Input nama & No HP pembeli).
  - Pilihan produk toko & counter jumlah barang.
  - Kalkulasi total belanja real-time.
  - Submit transaksi ke backend & modal alert penanganan jika stok tidak mencukupi (Error 400).
- [ ] `TransactionList.jsx`: Riwayat transaksi toko.
- [ ] `Unauthorized.jsx`: Tampilan halaman jika akses ditolak.

---

### Task 6: Testing & Refactoring
- [ ] Pastikan tidak ada sintaks TypeScript / type annotation di file mana pun.
- [ ] Uji alur login sebagai Manager (`manager@monday.com`) dan Keeper (`keeper@monday.com`).
- [ ] Uji validasi stok POS saat kasir melakukan transaksi melampaui stok yang ada.